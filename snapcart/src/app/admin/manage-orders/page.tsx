"use client"
import OrderCart from '@/components/OrderCart'
import AdminCurrentOrderCard from '@/components/AdminCurrentOrderCard'
import { getSocket } from '@/lib/socket'
import axios from 'axios'
import { ArrowLeft, PackageSearch } from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const ManageOrders = () => {
    const router = useRouter();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getOrders = async () => {
            try {
                const response = await axios.get("/api/admin/get-orders");
                const data = response.data;
                console.log("All Orders:", data);
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setLoading(false);
            }
        }
        getOrders();
    }, []);


    useEffect(()=>{
       const socket=getSocket();
         socket.on("new-order",(newOrder)=>{
            console.log("Received new order via socket:", newOrder);
            setOrders((prev)=>[newOrder,...prev]); 
         });

        socket.on("oreder-assigned",({orderId,assignedDeliveryBoy})=>{
            setOrders(prevOrders=>prevOrders?.map(order=>{
                if(order._id === orderId){
                    return {...order, assignedDeliveryBoy}
                }
                return order;
            }))
        });

         return ()=>{
            socket.off("new-order");
            socket.off("order-assigned");
         } 
    },[]);

    const handleStatusChange = async (orderId: string, status: string) => {
        try {
            const res = await axios.post(`/api/admin/update-order-status/${orderId}`, {
                status,
            });

            if (res.status === 200) {
                const { availableBoys, assignment, message } = res.data;
                console.log("Available delivery boys:", availableBoys);
                console.log("Assignment id:", assignment);
                if (message) console.log(message);

                setOrders((prev) =>
                    prev.map((o) => (o._id === orderId ? { ...o, status } : o))
                );
            }
        } catch (error) {
            console.error("Failed to update order status", error);
        }
    };

    const currentOrder = orders.find((o) => o.status === "out-for-delivery") || null;
    const otherOrders = currentOrder
        ? orders.filter((o) => o._id !== currentOrder._id)
        : orders;

    if (loading) {
        return (
            <div className='bg-linear-to-b from-white to-blue-600 min-h-screen w-full flex items-center justify-center'>
                <div className='text-gray-800 text-lg font-medium'>Loading...</div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className='bg-linear-to-b from-white to-blue-600 min-h-screen w-full flex items-center justify-center flex-col gap-3'>
                <PackageSearch size={70} className='text-blue-600 mb-4' />
                <h2 className='text-gray-800 text-lg font-medium'>No orders found.</h2>
                <p className='text-gray-600'>There are no orders to manage.</p>
            </div>
        )
    }

    return (
        <div className='bg-linear-to-b from-white/10 via-blue-50 to-blue-100 min-h-screen w-full'>
            <div className='max-w-3xl mx-auto py-5 px-4 relative'>
                <div className='fixed top-0 left-0 w-full bg-white/10 shadow-md border-b border-gray-400 z-50 flex items-center gap-4 px-4 py-3 backdrop-blur-sm'>
                    <button
                        onClick={() => router.push("/admin/add-grocery")}
                        className='p-2 bg-gray-100 flex items-center justify-center gap-2 rounded-full px-4 hover:bg-gray-200 active:scale-95 transition'
                    >
                        <ArrowLeft className='w-5 h-5 text-gray-800' />
                        Back
                    </button>
                    <h1 className='text-2xl font-bold text-gray-900 text-center py-4 flex-1'>Manage Orders</h1>
                </div>
            </div>

            <div className='max-w-3xl mx-auto py-5 px-4 flex flex-col gap-4'>
                {currentOrder && (
                    <motion.div
                        key={currentOrder._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AdminCurrentOrderCard
                            order={currentOrder}
                            onStatusChange={handleStatusChange}
                        />
                    </motion.div>
                )}
                {otherOrders.map((order, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <OrderCart
                            key={order._id}
                            order={order}
                            editableStatus
                            onStatusChange={handleStatusChange}
                            showTrackButton={false}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default ManageOrders
