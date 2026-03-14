"use client"

import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type TimeRange = "today" | "sevenDays" | "total";

type Props = {
    earning: {
        today: number;
        sevenDays: number;
        total: number;
    };
    stats: {
        totalOrders: number;
        totalUsers: number;
        totalGroceries: number;
        pendingDeliveries: number;
        todayRevenue: number;
    };
    chartData: {
        date: string;
        revenue: number;
    }[];
};

const AdminDashboardClient = ({ earning, stats, chartData }: Props) => {
    const [range, setRange] = useState<TimeRange>("sevenDays");

    const currentRevenue = earning[range] || 0;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value || 0);

    return (
        <div className="pt-20 w-[90%] md:w-[80%] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 text-center sm:text-left">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-bold text-emerald-700 tracking-tight"
                >
                    Welcome back, Admin
                    <span className="text-emerald-500">.</span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="flex items-center justify-center gap-3"
                >
                    <span className="hidden sm:inline text-xs text-gray-500 uppercase tracking-wide">
                        Revenue Range
                    </span>
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value as TimeRange)}
                        className="border border-gray-200 bg-white/80 backdrop-blur rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition shadow-sm"
                    >
                        <option value="today">Today</option>
                        <option value="sevenDays">Last 7 days</option>
                        <option value="total">Total</option>
                    </select>
                </motion.div>
            </div>

            {/* Top metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white p-5 shadow-lg"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-emerald-100">
                                Revenue ({range === "today" ? "Today" : range === "sevenDays" ? "Last 7 days" : "Total"})
                            </p>
                            <p className="mt-1 text-2xl font-semibold">
                                {formatCurrency(currentRevenue)}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center text-lg">
                            ₹
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-emerald-100">
                        Track how much your store is earning in real-time.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="rounded-2xl bg-white/80 backdrop-blur border border-gray-100 p-5 shadow-sm flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Today&apos;s performance
                        </p>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            LIVE
                        </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(stats.todayRevenue)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Revenue generated so far today.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="rounded-2xl bg-white/80 backdrop-blur border border-gray-100 p-5 shadow-sm flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Pending deliveries
                        </p>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">
                        {stats.pendingDeliveries}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Orders waiting to be delivered.</p>
                </motion.div>
            </div>

            {/* Overview + revenue chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Overview cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="rounded-2xl bg-white/80 backdrop-blur border border-gray-100 p-5 shadow-sm flex flex-col gap-4"
                >
                    <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Store overview
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Total orders</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {stats.totalOrders}
                                </p>
                            </div>
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                ORD
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Active customers</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {stats.totalUsers}
                                </p>
                            </div>
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                USERS
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Grocery items</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {stats.totalGroceries}
                                </p>
                            </div>
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-700 text-xs font-semibold">
                                SKU
                            </span>
                        </div>
                    </div>
                </motion.div>
                {/* Daily revenue chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="lg:col-span-2 rounded-2xl bg-white/80 backdrop-blur border border-gray-100 p-5 shadow-sm flex flex-col"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-700">
                            Revenue last 7 days
                        </h2>
                        <p className="text-xs text-gray-400">
                            Each point represents a day&apos;s total revenue
                        </p>
                    </div>

                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 11, fill: "#6b7280" }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 11, fill: "#6b7280" }}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(16,185,129,0.08)" }}
                                    formatter={(value) => [
                                        formatCurrency(
                                            typeof value === "number"
                                                ? value
                                                : Number(value ?? 0)
                                        ),
                                        "Revenue",
                                    ]}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="url(#revenueGradient)"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboardClient;
