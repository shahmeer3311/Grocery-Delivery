"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DeliveryEarningRange = "today" | "sevenDays" | "total";

export type DeliveryEarningSummary = {
  today: number;
  sevenDays: number;
  total: number;
};

export type DeliveryChartPoint = {
  date: string;
  revenue: number;
};

type DeliveryEarningsChartProps = {
  earning?: DeliveryEarningSummary;
  chartData?: DeliveryChartPoint[];
  completedToday?: number;
};

const DeliveryEarningsChart = ({
  earning = { today: 0, sevenDays: 0, total: 0 },
  chartData = [],
  completedToday = 0,
}: DeliveryEarningsChartProps) => {
  const [range, setRange] = React.useState<DeliveryEarningRange>("sevenDays");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const currentRevenue = earning[range] || 0;

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl bg-white p-5 text-white shadow-lg lg:col-span-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-green-500">
              Earnings {range === "today" ? "Today" : range === "sevenDays" ? "Last 7 days" : "Total"}
            </p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {formatCurrency(currentRevenue)}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-lg">
            ₹
          </div>
        </div>
        <p className="mt-3 text-xs text-green-500">
          Track what you earned from completed deliveries.
        </p>
        <div className="mt-4">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as DeliveryEarningRange)}
            className="w-full rounded-xl border border-green-500 bg-white px-4 py-2 text-sm text-green-500 outline-none transition focus:border-white/40"
          >
            <option value="today" className="text-slate-900">
              Today
            </option>
            <option value="sevenDays" className="text-slate-900">
              Last 7 days
            </option>
            <option value="total" className="text-slate-900">
              Total
            </option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm backdrop-blur lg:col-span-2">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">
              Earnings last 7 days
            </h2>
            <p className="text-xs text-gray-400">
              Each bar represents one day of completed delivery income.
            </p>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Today: {completedToday} deliveries
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="deliveryRevenueGradient" x1="0" y1="0" x2="0" y2="1">
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
                  formatCurrency(typeof value === "number" ? value : Number(value ?? 0)),
                  "Earnings",
                ]}
              />
              <Bar
                dataKey="revenue"
                fill="url(#deliveryRevenueGradient)"
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default DeliveryEarningsChart;
