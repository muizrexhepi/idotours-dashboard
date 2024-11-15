'use client'

// import { useState, useEffect } from 'react'
// import { useUser } from '@/context/user'
// import { API_URL } from '@/environment'
// import axios from 'axios'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { toast } from "@/components/ui/use-toast"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Loader2 } from 'lucide-react'
// import { Driver } from '@/models/driver'

// interface RouteOption {
//   value: string;
//   label: string;
// }



export default function CreateEmployee() {
//   const [drivers, setDrivers] = useState<Driver[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const { user } = useUser()

//   useEffect(() => {
//     if (user) {
//       fetchDrivers()
//     }
//   }, [user])

//   const fetchDrivers = async () => {
//     setIsLoading(true)
//     try {
//       const response = await axios.get(`${API_URL}/driver/operator/${user?.$id}`)
//       const data: Driver[] = response.data.data
//       setDrivers(data)
//     } catch (error) {
//       console.error('Error fetching drivers:', error)
//       toast({
//         title: "Error",
//         description: "Failed to fetch drivers. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

  return (
    <div>3</div>
    // <Card className="w-full">
    //   <CardHeader>
    //     <CardTitle>Drivers</CardTitle>
    //   </CardHeader>
    //   <CardContent>
    //     {isLoading ? (
    //       <div className="flex justify-center items-center h-64">
    //         <Loader2 className="h-8 w-8 animate-spin" />
    //       </div>
    //     ) : drivers?.length > 0 ? (
    //       <Table>
    //         <TableHeader>
    //           <TableRow>
    //             <TableHead className="w-[200px]">Name</TableHead>
    //             <TableHead>Email</TableHead>
    //             <TableHead>Assigned Routes</TableHead>
    //             <TableHead>Scanned Bookings</TableHead>
    //           </TableRow>
    //         </TableHeader>
    //         <TableBody>
    //           {drivers?.map((driver) => (
    //             <TableRow key={driver._id}>
    //               <TableCell className="font-medium">{driver.name}</TableCell>
    //               <TableCell>{driver.email}</TableCell>
    //               <TableCell>{driver.assigned_routes.join(", ").split(", ").map((route, index) => (
    //                 <span key={index}>{route}<br /></span>
    //               ))}</TableCell>
    //               <TableCell>{driver.scanned_bookings.length}</TableCell>
    //             </TableRow>
    //           ))}
    //         </TableBody>
    //       </Table>
    //     ) : (
    //       <div className="text-center py-4">No drivers found.</div>
    //     )}
    //   </CardContent>
    // </Card>
  )
}