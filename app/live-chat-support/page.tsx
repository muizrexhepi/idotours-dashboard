'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import socket from '@/utils/socket'
import { useUser } from '@/context/user'
import { API_URL, GOBUSLY_SUPPORT_USER_ID } from '@/environment'

interface Message {
  _id: string
  sender: string
  receiver: string
  content: string
  timestamp: string
}

interface CeoOperator {
  _id: string;
  name: string;
}

interface TypingInfo {
  sender: string;
  isTyping: boolean;
}

export default function AdminChat() {
  const [operators, setOperators] = useState<CeoOperator[]>([])
  const [selectedOperator, setSelectedOperator] = useState<Partial<CeoOperator> | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const { user } = useUser()

  useEffect(() => {
    fetchOperators()
    setupSocketListeners()

    return () => {
      socket.off('receiveMessage')
      socket.off('typing')
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (selectedOperator) {
      fetchMessages()
    }
  }, [selectedOperator])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchOperators = async () => {
    try {
      setIsLoading(true)
      setOperators([
        {
          _id: GOBUSLY_SUPPORT_USER_ID,
          name: "Go Busly support"
        }
      ])
    } catch (error) {
      console.error('Failed to fetch operators', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupSocketListeners = () => {
    if (!user?.$id) return;
    
    socket.emit('joinRoom', user.$id)

    socket.on('receiveMessage', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('typing', (typingInfo: TypingInfo) => {
      console.log('Received typing event:', typingInfo)
      if (typingInfo.sender !== user.$id) {
        setIsTyping(typingInfo.isTyping)
        if (typingInfo.isTyping) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false)
          }, 3000)
        }
      }
    })
  }

  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/operator/messages/${GOBUSLY_SUPPORT_USER_ID}?sender=${user?.$id}`)
      const data = await response.json()
      setMessages(data.data)
    } catch (error) {
      console.error('Failed to fetch messages', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = () => {
    if (!selectedOperator || !newMessage.trim() || !user?.$id) return

    const message: Partial<Message> = {
      sender: user.$id,
      receiver: selectedOperator._id,
      content: newMessage,
      timestamp: new Date().toISOString()
    }

    socket.emit('sendMessage', message)
    setMessages(prev => [...prev, message as Message])
    setNewMessage('')
  }

  const handleTyping = () => {
    if (!selectedOperator?._id || !user?.$id) return;
    
    socket.emit('typing', {
      sender: user.$id,
      receiver: selectedOperator._id,
      isTyping: true
    })
  }


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex h-[93vh] bg-background">
      <div className="w-1/4 bg-card p-4 border-r border-border">
        <h2 className="text-2xl font-bold mb-4">Operators</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {operators.map((op) => (
              <Button
                key={op._id}
                variant={selectedOperator?._id === op._id ? "secondary" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={() => setSelectedOperator(op)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2">
                    {op.name[0]}
                  </div>
                  {op.name}
                </div>
              </Button>
            ))}
          </ScrollArea>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-card p-4 shadow">
          <h2 className="text-2xl font-bold">
            {selectedOperator ? `Chat with ${selectedOperator.name}` : 'Select a chat'}
          </h2>
        </div>
        <ScrollArea className="flex-1 p-4">
          {messages?.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 ${
                msg.sender === user?.$id ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-2 rounded-lg ${
                  msg.sender === user?.$id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.content}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="text-muted-foreground italic">Operator is typing...</div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
        <div className="bg-card p-4 border-t border-border">
          <div className="flex items-center">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleTyping}
              onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 mr-2"
            />
            <Button
              onClick={sendMessage}
              disabled={!selectedOperator || !newMessage.trim()}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

