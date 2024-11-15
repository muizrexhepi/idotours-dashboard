'use client'

import { deleteUserSession, getUserSessions, IUserSession } from '@/actions/user'
import { useUser } from '@/context/user'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Client, Account } from 'appwrite'

export default function UserSessions() {
  const { user } = useUser()
  const [sessions, setSessions] = useState<IUserSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getSessions = async () => {
      if (user) {
        try {
          setLoading(true)
          const userSessions = await getUserSessions(user.$id)
          console.log({sesijat: userSessions.sessions})
          setSessions(userSessions.sessions)
          setError(null)
        } catch (err) {
          setError('Failed to fetch user sessions. Please try again later.')
          console.error('Error fetching user sessions:', err)
        } finally {
          setLoading(false)
        }
      }
    }

    getSessions()
  }, [user])

  const handleLogout = async (sessionId: string) => {
    setLoading(true)
    const success = await deleteUserSession(user?.$id!, sessionId)
    if (success) {
      setSessions(prevSessions => prevSessions.filter(session => session.$id !== sessionId))
    } else {
      setError('Failed to logout session. Please try again.')
    }
    setLoading(false)
  }

  if (!user) {
    return <div>Please log in to view your sessions.</div>
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your user sessions</CardTitle>
          <CardDescription>View all your active sessions across devices</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions?.map((session) => (
                  <Card key={session.$id} className="overflow-hidden">
                    <CardHeader className="bg-muted">
                      <CardTitle className="text-lg flex justify-between items-center">
                        <span>{session.deviceName}</span>
                        <Badge variant={session.current === 'true' ? 'default' : 'secondary'}>
                          {session.current === 'true' ? 'Current' : 'Active'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{session.osName} {session.osVersion}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        <SessionDetail label="IP" value={session.ip} />
                        <SessionDetail label="Country" value={session.countryName} />
                        <SessionDetail label="Browser" value={`${session.clientEngine} ${session.clientEngineVersion}`} />
                        <SessionDetail label="Device Brand" value={session.deviceBrand} />
                        <SessionDetail label="Device Name" value={session.deviceName} />
                        <SessionDetail label="Client Name" value={session.clientName} />
                        <SessionDetail label="Client Type" value={session.clientType} />
                        <SessionDetail label="Created" value={new Date(session.$createdAt).toLocaleString()} />
                        <SessionDetail label="Provider" value={session.provider} />
                        <SessionDetail label="Provider Uid" value={session.providerUid} />
                      </dl>
                      <div className="mt-4">
                        <Button 
                          onClick={() => handleLogout(session.$id)} 
                          variant="destructive" 
                          size="sm" 
                          disabled={session.current === 'true' || loading}
                        >
                          {session.current === 'true' ? 'Current Session' : 'Logout'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SessionDetail({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="font-medium">{label}:</dt>
      <dd className="truncate">{value}</dd>
    </>
  )
}

