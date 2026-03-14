"use client";

import React from "react";
import { MapPin, CreditCard, Truck, UserCheck } from "lucide-react";

interface AdminCurrentOrderCardProps {
  order: any;
  onStatusChange?: (orderId: string, status: string) => void;
}

const AdminCurrentOrderCard: React.FC<AdminCurrentOrderCardProps> = ({
  order,
  onStatusChange,
}) => {
  const createdAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "";

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onStatusChange) return;
    onStatusChange(order._id.toString(), e.target.value);
  };

  return (
    <div className="border border-blue-300 rounded-2xl px-4 py-5 shadow-md bg-white/95 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            Current Order
          </p>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Order ID
          </p>
          <p className="text-sm font-semibold text-gray-900 break-all">
            {order._id}
          </p>
          {createdAt && (
            <p className="text-xs text-gray-500">Placed on {createdAt}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-300">
            {order.status?.toUpperCase() || "STATUS N/A"}
          </span>
          {onStatusChange && (
            <select
              defaultValue={order.status}
              onChange={handleStatusChange}
              className="text-xs border border-gray-300 rounded-full px-3 py-1 bg-white text-gray-800 shadow-sm"
            >
              <option value="pending">Pending</option>
              <option value="out-for-delivery">Out for Delivery</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-700">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <p className="font-medium">Payment</p>
          <p className="text-xs text-gray-500 capitalize">
            {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
          </p>
        </div>
      </div>

      {order.assignedDeliveryBoy && (
        <div className="mt-2 flex items-center justify-between gap-2 text-sm text-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex flex-col">
              <p className="font-medium">Assigned to</p>
              <p className="text-xs text-gray-500 capitalize">
                {order.assignedDeliveryBoy.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                
                
                📞 {order.assignedDeliveryBoy.mobile}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 text-sm text-gray-700">
        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mt-0.5">
          <MapPin className="w-4 h-4 text-purple-500" />
        </div>
        <div>
          <p className="font-medium">Delivery address</p>
          <p className="text-xs text-gray-500">
            {order.address?.fullName} • {order.address?.phone}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {order.address?.fullAddress}, {order.address?.city}, {" "}
            {order.address?.state} - {order.address?.pincode}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-700 pt-2 border-t border-gray-200 mt-2">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">
            {order.status
              ? `Delivery: ${order.status
                  .charAt(0)
                  .toUpperCase()}${order.status.slice(1)}`
              : "Delivery status not available"}
          </span>
        </div>
        <div className="font-medium text-gray-900">
          Total: <span className="text-green-700">₹{order.totalAmount}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminCurrentOrderCard;
