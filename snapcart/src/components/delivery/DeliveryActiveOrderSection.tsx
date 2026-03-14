import React from "react";
import CurrentAssignmentCard from "../CurrentAssignmentCard";
import DeliveryChat from "../DeliveryChat";
import LiveMap from "../LiveMap";

type DeliveryActiveOrderSectionProps = {
  activeOrder: any;
  userAddressLocation: [number, number] | null;
  location: [number, number] | null;
  deliveryLocation: [number, number] | null;
  userId: string;
  showOtpBox: boolean;
  onSendOtp: () => void;
};

const DeliveryActiveOrderSection = ({
  activeOrder,
  userAddressLocation,
  location,
  deliveryLocation,
  userId,
  showOtpBox,
  onSendOtp,
}: DeliveryActiveOrderSectionProps) => {
  const customerId =
    typeof activeOrder?.userId === "string"
      ? activeOrder.userId
      : activeOrder?.userId?._id?.toString() || "";

  return (
    <>
      <div className="grid items-start gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <CurrentAssignmentCard order={activeOrder} />
        </div>

        <div className="overflow-hidden rounded-xl border shadow-lg">
          <LiveMap
            userLocation={userAddressLocation || location}
            deliveryLocation={deliveryLocation || location}
          />
        </div>
      </div>

      <div className="mt-6">
        <DeliveryChat
          orderId={activeOrder?._id?.toString()}
          deliveryBoyId={userId}
          customerId={customerId}
          currentUserId={userId}
        />
      </div>

      <div className="mt-6 flex justify-end rounded-xl border bg-white p-3 shadow">
        {!showOtpBox && !activeOrder.deliveryOtpVerified && (
          <button
            onClick={onSendOtp}
            className="w-full cursor-pointer rounded-lg bg-green-500 px-4 py-2 text-white transition hover:bg-green-600 md:w-auto"
          >
            Send OTP
          </button>
        )}
        {activeOrder.deliveryOtpVerified && (
          <div className="w-full rounded-lg border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-center text-sm font-semibold text-emerald-200 md:w-auto">
            Order completed ✅
          </div>
        )}
      </div>
    </>
  );
};

export default DeliveryActiveOrderSection;
