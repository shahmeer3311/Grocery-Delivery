"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, MapPin, CreditCard, Truck, UserCheck } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "cancelled":
      return "bg-rose-100 text-rose-700 border-rose-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const OrderCart = ({
  order,
  editableStatus = false,
  onStatusChange,
  showTrackButton = true,
}: {
  order: any;
  editableStatus?: boolean;
  onStatusChange?: (orderId: string, status: string) => void;
  showTrackButton?: boolean;
}) => {
  console.log("Rendering OrderCart with order:", order);
  const router=useRouter();
  const [open, setOpen] = useState(false);

  const [localStatus, setLocalStatus] = useState<string>("pending");
  const [status, setStatus] = useState<string>(order.status);

  const createdAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "";

  const statusClass = getStatusColor(localStatus);

  const toggleOpen = () => setOpen((prev) => !prev);

  const updateStatus = (orderId: string, status: string) => {
    setLocalStatus(status);
    if (onStatusChange) {
      onStatusChange(orderId, status);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    const handler = (data: { orderId: string; status: string }) => {
      if (data.orderId.toString() === order._id.toString()) {
        console.log("Received order status update via socket:", data);
        setStatus(data.status);
        setLocalStatus(data.status);
      }
    };

    socket.on("order-status-updated", handler);

    return () => {
      socket.off("order-status-updated", handler);
    };
  }, [order._id]);

  useEffect(()=>{
    setStatus(order.status);
  },[order])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="border border-gray-200 rounded-2xl px-4 py-6 shadow-sm bg-white space-y-3 mt-15"
    >
      {/* Header: ID, date, status */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
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
      {status !== "completed" && <>
       <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusClass}`}
        >
          {status?.toUpperCase() || "STATUS N/A"}
        </span>
      </>} 
      </div>

      {editableStatus && (
        <div className="mt-2 flex justify-end">
          <select
            value={localStatus}
            onChange={(e) => updateStatus(order._id.toString(), e.target.value )}
            className="text-xs border border-gray-300 rounded-full px-3 py-1 bg-white text-gray-800 shadow-sm"
          >
            <option value="pending">Pending</option>
            <option value="out-for-delivery">Out for Delivery</option>
          </select>
        </div>
      )}

      {/* Payment method */}
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

      {status === "completed" && (<>
           {order.assignedDeliveryBoy && (
        <div className="mt-2 flex items-center justify-between gap-2 text-sm text-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-green-500" />
          </div>
          <p className="font-medium">Assigned to</p>
          <p className="text-xs text-gray-500 capitalize">
            {order.assignedDeliveryBoy.name}
          </p>
          </div>
         <div className="flex flex-col items-center gap-4">
           <p className="text-xs text-gray-500 capitalize">
            📞 {order.assignedDeliveryBoy.mobile}
          </p>

          {showTrackButton && (
            <div 
            onClick={()=> router.push(`/user/track-order/${order._id}`)}
            className="ml-2 text-xs px-2 py-3 rounded-md cursor-pointer bg-blue-500 hover:scale-105 transition text-white flex items-center gap-1 "
            style={{ backgroundColor: "green", color: "white" }}
            >
              <Truck className="w-4 h-4 inline-block mr-3" />
              Track your Order</div>
          )}
         </div>
        </div>
      )}
      </>)}

     

      {/* Address */}
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
            {order.address?.fullAddress}, {order.address?.city},
            {" "}
            {order.address?.state} - {order.address?.pincode}
          </p>
        </div>
      </div>

      {/* Toggle products */}
      <motion.button
        layout
        onClick={toggleOpen}
        className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-white">
            {order.items?.length || 0}
          </span>
          <span className="font-medium">
            {open ? "Hide products" : "Show products"}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        )}
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="items"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border border-gray-100 rounded-xl bg-white/90"
          >
            <div className="divide-y divide-gray-100">
              {order.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-3 py-2 text-sm"
                >
                  <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.unit}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-emerald-600">
                        ₹{item.price}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-4 border-t pt-5 border-gray-200 flex items-center justify-between text-xs text-gray-400 mt-3">
      <div className="flex items-center gap-3">
        <Truck className="w-4 h-4 text-gray-400" />
        <span className="font-medium text-gray-900 p-2 rounded-full bg-gray-100">
          {status
            ? `Delivery: ${status.charAt(0).toUpperCase() + status.slice(1)}`
            : "Delivery status not available"}
        </span>
      </div>
      <div className="font-medium text-gray-900">
        Total: <span className="text-green-700">₹{order.totalAmount}</span>
      </div>
      </div>
    </motion.div>
  );
};

export default OrderCart;
