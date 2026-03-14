import axios from "axios";
import React from "react";

interface AssignmentCardProps {
  assignment: any;
  onAccept: () => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onAccept }) => {
  const order = assignment.orderId || {};

  const statusBadgeClasses: Record<string, string> = {
    broadcast: "bg-amber-100 text-amber-800 border-amber-200",
    assigned: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-rose-100 text-rose-800 border-rose-200",
  };

    const handleAccept = async (id: string) => {
      try {
        const result = await axios.get(
          `/api/delivery/assignment/${id}/accept-assignment`
        );
        console.log("Assignment accepted:", result.data);
        alert(result.data?.message || "Assignment accepted successfully");
        onAccept();
        // Refresh the dashboard so only the current assignment is shown
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          console.error(
            "Error accepting assignment:",
            error.response?.data || error.message
          );
          alert(
            (error.response?.data as any)?.message ||
              "Failed to accept assignment"
          );
        } else {
          console.error("Error accepting assignment:", error);
          alert("Failed to accept assignment");
        }
      }
    };

  const badgeClass =
    statusBadgeClasses[assignment.status] ||
    "bg-gray-100 text-gray-700 border-gray-200";

  const shortOrderId =
    typeof order._id === "string" ? order._id.slice(-6).toUpperCase() : "N/A";

  return (
    <div className="w-full rounded-2xl border bg-white/90 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Order
          </p>
          <p className="text-lg font-semibold text-gray-900">
            #{shortOrderId}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${badgeClass}`}
        >
          {assignment.status.replace(/-/g, " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
        <div className="space-y-1">
          <p className="font-medium text-gray-900">Delivery details</p>
          <p className="text-gray-600">
            <span className="font-medium">Name: </span>
            {order.address?.fullName || "-"}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Phone: </span>
            {order.address?.phone || "-"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-medium text-gray-900">Order summary</p>
          <p className="text-gray-600">
            <span className="font-medium">Amount: </span>
            ₹{order.totalAmount?.toFixed?.(2) ?? order.totalAmount ?? "-"}
          </p>
          <p className="text-gray-600 capitalize">
            <span className="font-medium">Payment: </span>
            {order.paymentMethod || "-"}
          </p>
        </div>
      </div>

      <div className="mt-2 border-t border-dashed pt-3 text-sm text-gray-600">
        <p className="font-medium text-gray-900 mb-1">Address</p>
        <p className="leading-snug">
          {order.address?.fullAddress || "Address not available"}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {order.address?.city}, {order.address?.state} - {order.address?.pincode}
        </p>
      </div>
      {assignment.status === "broadcast" && (
        <div className="">
          <button
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            onClick={() => handleAccept(assignment._id)}
          >
            Accept Assignment
          </button>
          <button className="w-full mt-2 py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-200">
            Reject Assignment
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;
