"use client";

import React from "react";
import { MapPin, CreditCard, Truck } from "lucide-react";

interface CurrentAssignmentCardProps {
	order: any;
}

const CurrentAssignmentCard: React.FC<CurrentAssignmentCardProps> = ({ order }) => {
	const createdAt = order?.createdAt
		? new Date(order.createdAt).toLocaleString()
		: "";

	return (
		<div className="w-full rounded-2xl border border-green-300 bg-white shadow-md p-4 md:p-5 flex flex-col gap-3">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-wide text-green-600 font-semibold">
						Current Delivery
					</p>
					<p className="text-xs uppercase tracking-wide text-gray-400 mt-1">
						Order ID
					</p>
					<p className="text-lg font-semibold text-gray-900 break-all">
						{order?._id}
					</p>
					{createdAt && (
						<p className="text-xs text-gray-500 mt-1">Placed on {createdAt}</p>
					)}
				</div>
				<div className="flex flex-col items-end gap-2">
					<span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase bg-green-50 text-green-700 border-green-300">
						{order?.status?.toUpperCase?.() || "STATUS N/A"}
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
						<CreditCard className="w-4 h-4 text-green-500" />
					</div>
					<div>
						<p className="font-medium">Payment</p>
						<p className="text-xs text-gray-500 capitalize">
							{order?.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
						<Truck className="w-4 h-4 text-green-600" />
					</div>
					<div>
						<p className="font-medium">Delivery status</p>
						<p className="text-xs text-gray-500">
							{order?.status
								? `Delivery: ${order.status.charAt(0).toUpperCase()}${order.status.slice(1)}`
								: "Delivery status not available"}
						</p>
					</div>
				</div>
			</div>

			<div className="mt-2 border-t border-dashed pt-3 text-sm text-gray-600">
				<p className="font-medium text-gray-900 mb-1">Address</p>
				<div className="flex items-start gap-3">
					<div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mt-0.5">
						<MapPin className="w-4 h-4 text-green-600" />
					</div>
					<div>
						<p className="text-xs text-gray-500">
							{order?.address?.fullName} • {order?.address?.phone}
						</p>
						<p className="text-xs text-gray-500 mt-1">
							{order?.address?.fullAddress}, {order?.address?.city},{" "}
							{order?.address?.state} - {order?.address?.pincode}
						</p>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between text-xs text-gray-700 pt-2">
				<span className="font-medium text-gray-900">
					Total: <span className="text-green-700">₹{order?.totalAmount}</span>
				</span>
			</div>
		</div>
	);
};

export default CurrentAssignmentCard;

