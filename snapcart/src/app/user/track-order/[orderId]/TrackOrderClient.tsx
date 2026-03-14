"use client";
import { getSocket } from '@/lib/socket';
import axios from 'axios';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import LiveMap from '@/components/LiveMap';
import DeliveryChat from '@/components/DeliveryChat';

interface TrackOrderClientProps {
  orderId: string;
}

const TrackOrderClient: React.FC<TrackOrderClientProps> = ({ orderId }) => {
  console.log("[TrackOrder] Tracking order with ID:", orderId);

  const [orderData, setOrderData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [userLocation, setUserLocation] = React.useState<[number, number] | null>(null); // customer's address location
  const [deliveryLocation, setDeliveryLocation] = React.useState<[number, number] | null>(null); // live delivery boy location

  const { userData } = useSelector((state: any) => state.user);

  useEffect(() => {
    const getOrder = async () => {
      try {
        const result = await axios.get(`/api/user/get-order/${orderId}`);
        console.log("[TrackOrder] Fetched order data:", result.data);
        setOrderData(result.data);

        // Derive user's delivery address coordinates from order.address
        const addr = result.data?.address;
        if (typeof addr?.latitude === 'number' && typeof addr?.longitude === 'number') {
          const homeLocation: [number, number] = [addr.latitude, addr.longitude];
          console.log("[TrackOrder] Setting user/home location from order address:", homeLocation);
          setUserLocation(homeLocation);
        } else {
          console.warn("[TrackOrder] Order address is missing latitude/longitude, map will fall back to default center");
        }

        setLoading(false);
      } catch (error) {
        console.error("[TrackOrder] Error fetching order data:", error);
        setError("Failed to fetch order data");
        setLoading(false);
      }
    };
    if (orderId) {
      getOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderData?.assignedDeliveryBoy?._id) return;

    const socket = getSocket();
    const handler = ({ userId, location }: { userId: string; location: [number, number] }) => {
      // location from socket is [longitude, latitude]; convert to [latitude, longitude]
      if (userId.toString() === orderData.assignedDeliveryBoy._id.toString()) {
        const [lng, lat] = location;
        const mapped: [number, number] = [lat, lng];
        console.log("[TrackOrder] Received delivery location update (converted):", mapped);
        setDeliveryLocation(mapped);
      }
    };

    socket.on("update-delivery-location", handler);
    return () => {
      socket.off("update-delivery-location", handler);
    };
  }, [orderData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-sm text-gray-600">Loading your order...</p>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-sm text-red-500">{error || "Order not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 mt-24">
        <header className="rounded-3xl border bg-white px-6 py-5 shadow-lg shadow-emerald-500/10 backdrop-blur">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-green-600">Track Your Order</h1>
            <p className="text-xs text-gray-500">Order ID: {orderData?._id}</p>
            <p className="text-xs text-gray-500 capitalize">Status: {orderData?.status}</p>
          </div>
        </header>

        <main className="rounded-3xl bg-black p-5 sm:p-6 shadow-xl shadow-slate-950/40 backdrop-blur flex flex-col gap-4">
          <p className="text-sm text-slate-200 mb-2">
            Watch your delivery partner move towards your address in real time and chat with them if needed.
          </p>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1 rounded-xl border shadow-lg overflow-hidden bg-slate-900">
              <LiveMap
                userLocation={userLocation}
                deliveryLocation={deliveryLocation}
              />
            </div>

            <div className="w-full lg:w-[360px]">
              {orderData?.assignedDeliveryBoy?._id && userData?._id ? (
                <DeliveryChat
                  orderId={orderData._id}
                  deliveryBoyId={orderData.assignedDeliveryBoy._id}
                  customerId={userData._id}
                  currentUserId={userData._id}
                />
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
                  Chat will be available once a delivery partner is assigned to your order.
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            The green pin shows your delivery partner. The user icon shows your saved delivery address.
          </p>
        </main>
      </div>
    </div>
  );
};

export default TrackOrderClient;
