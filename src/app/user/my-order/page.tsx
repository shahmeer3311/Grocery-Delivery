"use client"
import OrderCart from '@/components/OrderCart'
import { getSocket } from '@/lib/socket'
import axios from 'axios'
import { ArrowLeft, ArrowRight, PackageSearch } from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const MyOrderPage = () => {
      const router=useRouter();

    const [orders, setOrders]=useState<any[]>([]);  
    const [loading, setLoading]=useState(true);

   useEffect(()=>{
      const getMyPrders=async()=>{
         try {
            const response=await axios.get("/api/user/my-orders");
            const data=response.data;
            console.log("Fetched orders:", data);
            setOrders (data);
            setLoading(false);
         } catch (error) {
            console.error("Error fetching orders:", error);
         }
      }
      getMyPrders();
   },[]);

   useEffect(()=>{
     const socket=getSocket();
       socket.on("order-updated",({orderId,assignedDeliveryBoy})=>{
         setOrders(prevOrders=>prevOrders?.map(order=>{
            if(order._id === orderId){
                return {...order, assignedDeliveryBoy}
            }
            return order;
         }))
       })
   },[]);

   if(loading){
    return (
        <div className='bg-linear-to-b from-white to-green-600 min-h-screen w-full flex items-center justify-center'> 
           <div className='text-gray-800 text-lg font-medium'>Loading...</div>
        </div>
      )
   }

   if(orders.length === 0){
    return (
        <div className='bg-linear-to-b from-white to-green-600 min-h-screen w-full flex items-center justify-center flex-col gap-3'> 
        <PackageSearch size={70} className='text-green-600 mb-4'  />
           <h2 className='text-gray-800 text-lg font-medium'>No orders found.</h2>
           <p className='text-gray-600'>You haven't placed any orders yet.</p>
        </div>
      )
   }

  return (
    <div className='bg-linear-to-b from-white/10 via-green-50 to-green-100 min-h-screen w-full'> 
       <div className='max-w-3xl mx-auto py-5 px-4 relative'>
          <div className='fixed top-0 left-0 w-full bg-white/10 shadow-md border-b border-gray-400 z-50 flex items-center gap-4 px-4 py-3 backdrop-blur-sm'>
          <button 
          onClick={()=>router.push("/")}
          className='p-2 bg-gray-100 flex items-center justify-center gap-5 rounded-full px-4 hover:bg-gray-200 active:scale-95 transition'>
             <ArrowLeft className='w-5 h-5 text-gray-800' />   Back
          </button>
          <h1 className='text-2xl font-bold text-gray-900 text-center py-4'>My Orders</h1>
          </div>
       </div>

         <div className='max-w-3xl mx-auto py-5 px-4 flex flex-col gap-4'>
         {orders.map((order,index)=>(
           <motion.div
           key={index}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.3 }}
           >
             <OrderCart key={order._id} order={order} />
           </motion.div>
         ))}
         </div>
    </div>
  )
}

export default MyOrderPage