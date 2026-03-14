import React from 'react'
import { auth } from '@/auth';
import connectDB from '@/lib/db'
import OrderModel from '@/models/order.model';
import UserModel from '@/models/user.model';
import DeliveryDashboard from './DeliveryDashboard'

const DeliveryBoy = async() => {
 console.log("[DELIVERYBOY] ========== DELIVERYBOY SERVER COMPONENT RENDERING ==========");

 await connectDB();
 const session=await auth();
 console.log("[DELIVERYBOY] Session:", JSON.stringify(session?.user, null, 2));
 
 // Fallback: if session doesn't have role, fetch from DB
 let userRole = session?.user?.role;
 let deliverBoyId = session?.user?.id;
 console.log("[DELIVERYBOY] Initial - userRole:", userRole, "deliverBoyId:", deliverBoyId);
 
 if (session?.user?.id && !userRole) {
   console.log("[DELIVERYBOY] Role not in session, fetching from DB...");
   const dbUser = await UserModel.findById(session.user.id);
   userRole = dbUser?.role;
   console.log("[DELIVERYBOY] DB user role:", userRole);
 }
 
 console.log("[DeliveryBoy Server] Session check:", { 
   hasSession: Boolean(session), 
   sessionRole: session?.user?.role,
   resolvedRole: userRole,
   userId: deliverBoyId 
 });
 
 console.log("[DELIVERYBOY] Auth check - session exists:", Boolean(session), "userRole:", userRole);
 
 if(!session || userRole !== "deliveryBoy") { 
  console.log("[DELIVERYBOY] ❌ UNAUTHORIZED - returning unauthorized view");
  return  (
    <div className='flex h-screen items-center justify-center bg-red-50'>
      <div className="text-center">
        <h1 className='text-2xl font-semibold text-red-600'>Unauthorized</h1>
        <p className="mt-2 text-sm text-red-500">
          Session role: {session?.user?.role || "none"} | Resolved: {userRole || "none"}
        </p>
      </div>
    </div>
  ) 
}
 console.log("[DELIVERYBOY] ✅ AUTHORIZED - proceeding to fetch orders");
 // At this point session and user are guaranteed to exist
 const orders=await OrderModel.find({
  assignedDeliveryBoy: deliverBoyId,
  deliveryOtpVerified: true
 }).sort({ deliveryTime: -1 });

 const today = new Date();
 const todayStart = new Date(today);
 todayStart.setHours(0, 0, 0, 0);

 const sevenDaysStart = new Date(today);
 sevenDaysStart.setDate(today.getDate() - 6);
 sevenDaysStart.setHours(0, 0, 0, 0);

 const perDeliveryEarning = 40;

 const todayCompletedOrders = orders.filter((order) => {
  const deliveryDate = new Date(order.deliveryTime);
  return deliveryDate >= todayStart;
 });

 const sevenDaysOrders = orders.filter((order) => {
  const deliveryDate = new Date(order.deliveryTime);
  return deliveryDate >= sevenDaysStart;
 });

 const chartData: { date: string; revenue: number }[] = [];

 for (let i = 6; i >= 0; i -= 1) {
  const day = new Date(today);
  day.setDate(today.getDate() - i);

  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  const dailyCompletedOrders = orders.filter((order) => {
   const deliveryDate = new Date(order.deliveryTime);
   return deliveryDate >= dayStart && deliveryDate <= dayEnd;
  });

  chartData.push({
   date: day.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
   revenue: dailyCompletedOrders.length * perDeliveryEarning,
  });
 }

 const earning = {
  today: todayCompletedOrders.length * perDeliveryEarning,
  sevenDays: sevenDaysOrders.length * perDeliveryEarning,
  total: orders.length * perDeliveryEarning,
 };

 console.log("[DELIVERYBOY] ✅ Rendering DeliveryDashboard with:", { earning, chartDataLength: chartData.length, completedToday: todayCompletedOrders.length });

  return (
    <>
    <DeliveryDashboard
      earning={earning}
      chartData={chartData}
      completedToday={todayCompletedOrders.length}
    />
    </>
  )
}

export default DeliveryBoy
