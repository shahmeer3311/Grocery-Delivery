import React from 'react'
import AdminDashboardClient from './AdminDashboardClient'
import connectDB from '@/lib/db'
import OrderModel from '@/models/order.model';
import UserModel from '@/models/user.model';
import Grocery from '@/models/grocery.model';

const AdminDashboard = async () => {
  await connectDB();
  const order=await OrderModel.find({});
  const users=await UserModel.find({role: "user"});
  const groceries=await Grocery.find({});

  const totalOrders = order.length;
  const totalUsers = users.length;
  const totalGroceries = groceries.length;
  const pendingDeliveries = order.filter((o) => o.status === "pending").length;
  const totalRevenue = order.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

                           //new Date(year, monthIndex, day) 
const today = new Date();

const startOfToday = new Date(today);
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date(today);
endOfToday.setHours(23, 59, 59, 999);

const sevenDaysAgo = new Date(today);
sevenDaysAgo.setDate(today.getDate() - 7);

const todayOrders = order.filter(
  (o) =>
    new Date(o.createdAt) >= startOfToday &&
    new Date(o.createdAt) <= endOfToday
);
const todayRevenue = todayOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

const sevenDaysOrders = order.filter(
  (o) => new Date(o.createdAt) >= sevenDaysAgo
);
const sevenDaysRevenue = sevenDaysOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

const chartData: { date: string; revenue: number }[] = [];

for(let i=6;i>=0;i--){
  const day = new Date(today);
  day.setDate(today.getDate() - i);
  const dayStart = new Date(day);
  dayStart.setHours(0,0,0,0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23,59,59,999);

  const dailyOrders = order.filter(
    (o) =>
      new Date(o.createdAt) >= dayStart &&
      new Date(o.createdAt) <= dayEnd
  );
  const dailyRevenue = dailyOrders.reduce((acc,o) => acc + (o.totalAmount || 0),0);
  chartData.push({
    date: day.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    revenue: dailyRevenue,
  });
}

  return (
    <>
      <AdminDashboardClient
      earning={{
        today: todayRevenue,
        sevenDays: sevenDaysRevenue,
        total: totalRevenue,
      }}
      stats={{
        totalOrders,
        totalUsers,
        totalGroceries,
        pendingDeliveries,
        todayRevenue,
      }}
      chartData={chartData}
      />
    </>
  )
}

export default AdminDashboard
