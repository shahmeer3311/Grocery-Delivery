"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2Icon,
  MapPin,
  User,
  Phone,
  Building2,
  MapPinned,
  Hash,
  Search,
  CreditCard,
  CreditCardIcon,
  Truck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import axios from "axios";
import { fetchCart } from "@/api/cart";
import type { CartResponse } from "@/api/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface DeliveryInfo {
  fullName?: string;
  mobile?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  fullAddress?: string;
}

const CheckoutPage = () => {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

   const { data: cartData } = useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });

   const cartItem = cartData?.cart || [];
    console.log("Cart items in checkout page:", cartItem);
   const subtotal = cartItem.reduce(
    (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const deliveryFee = cartItem.length > 0 ? 50 : 0;
  const finalTotal = subtotal + deliveryFee;

  const { data } = useQuery<{ user: any | null }>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (res.status === 401) {
        return { user: null };
      }
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      return res.json();
    },
  });

  const handleCod = async () => {
    if (!data?.user?._id) {
      alert("Please login to place an order.");
      router.push("/login");
      return;
    }

    if (!deliveryInfo?.fullName || !deliveryInfo.mobile || !deliveryInfo.city || !deliveryInfo.state || !deliveryInfo.pinCode || !deliveryInfo.fullAddress) {
      alert("Please complete your delivery address before placing the order.");
      return;
    }

    if (!cartItem.length) {
      alert("Your cart is empty.");
      return;
    }

    try {
      const res = await axios.post("/api/user/order", {
        userId: data.user._id,
        items: cartItem,
        totalAmount: finalTotal,
        paymentMethod: "cod",
        address: {
          fullName: deliveryInfo.fullName,
          phone: deliveryInfo.mobile,
          city: deliveryInfo.city,
          state: deliveryInfo.state,
          pincode: deliveryInfo.pinCode,
          fullAddress: deliveryInfo.fullAddress,
          latitude: position?.[0],
          longitude: position?.[1],
        },
      });

      if (res.status === 201) {
        alert("Order placed successfully!");
        router.push("/user/order-success");
        console.log("Order response:", res.data);
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (error: any) {
      console.error("COD order error", error);
      const message = error?.response?.data?.message || error?.response?.data?.error || "Failed to place order";
      alert(message);
    }
  };

  const handleOnlinePayment = async () => {} 

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [searchCity, setSearchCity] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const recenterToCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setGeoError(null);
      },
      (err) => {
        console.warn("Error getting current location:", err);
        setGeoError(
          "We couldn't get your current location. Please allow location access or search manually."
        );
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
    );
  };

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          setPosition([latitude, longitude]);
          setGeoError(null);
        },
        (err) => {
          console.warn("Error getting geolocation:", err);
          setGeoError(
            "We couldn't automatically detect your location. You can still search by city or fill the address manually."
          );
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );
    } else {
      setGeoError("Geolocation is not supported in this browser.");
    }
  }, []);

  useEffect(()=>{
    if(!position) return;
    const fetchAddress=async()=>{
        const result=await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`);
        const address=result.data.address;
        console.log(address);
        setDeliveryInfo((prev)=>({
            ...(prev||{}),
            city: address?.city || address?.town || address?.village || '',
            state: address?.state || '',
            pinCode: address?.postcode || '',
            fullAddress: result.data.display_name || ''
        }));
    }
    fetchAddress();
  },[position]);

  useEffect(() => {
    if (data?.user) {
      const u = data.user as any;
      setDeliveryInfo((prev) => ({
        ...(prev || {}),
        fullName: u.name,
        mobile: u.mobile,
        // keep reverse‑geocoded values if already set
        city: prev?.city ?? u.city,
        state: prev?.state ?? u.state,
        pinCode: prev?.pinCode ?? u.pinCode,
        fullAddress: prev?.fullAddress ?? u.address,
      }));
    }
  }, [data]);

  const handleSearch = async () => {
    if (!searchCity.trim()) return;
    setIsSearching(true);
    try {
      const { OpenStreetMapProvider } = await import("leaflet-geosearch");
      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query: searchCity });
      if (results.length > 0) {
        const { x, y } = results[0];
        console.log("Search result:", x, y);
        setPosition([y, x]);
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error("City search failed:", err);
      alert("Something went wrong while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-[95%] sm:w-[90%] md:w-[80%] mx-auto mt-8 mb-24">
      <div className="rounded-full items-center gap-4 mb-6 p-3 bg-green-600 inline-flex text-white ">
        <Link
          href="/user/cart"
          className="flex items-center gap-2 text-white hover:text-black"
        >
          <FaArrowLeft />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="flex items-center justify-center gap-3 mb-10 text-green-700">
        <CheckCircle2Icon size={28} />
        <h1 className="text-3xl font-bold">Your Checkout</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Left: Delivery address */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-green-600" size={20} />
            <h2 className="font-semibold text-lg">Delivery address</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex flex-col">
              <label className="font-medium mb-1">Full name</label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  value={deliveryInfo?.fullName ?? ""}
                  placeholder="Enter full name"
                  onChange={(e) =>
                    setDeliveryInfo((prev) => ({
                      ...(prev || {}),
                      fullName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Mobile</label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  value={deliveryInfo?.mobile ?? ""}
                  placeholder="Enter mobile number"
                  onChange={(e) =>
                    setDeliveryInfo((prev) => ({
                      ...(prev || {}),
                      mobile: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col">
                <label className="font-medium mb-1">City</label>
                <div className="relative">
                  <Building2
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    value={deliveryInfo?.city ?? ""}
                    placeholder="City"
                    onChange={(e) =>
                      setDeliveryInfo((prev) => ({
                        ...(prev || {}),
                        city: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="font-medium mb-1">State</label>
                <div className="relative">
                  <MapPinned
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    value={deliveryInfo?.state ?? ""}
                    placeholder="State"
                    onChange={(e) =>
                      setDeliveryInfo((prev) => ({
                        ...(prev || {}),
                        state: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="font-medium mb-1">Pin code</label>
                <div className="relative">
                  <Hash
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    value={deliveryInfo?.pinCode ?? ""}
                    placeholder="Pin code"
                    onChange={(e) =>
                      setDeliveryInfo((prev) => ({
                        ...(prev || {}),
                        pinCode: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col mt-4">
              <label className="font-medium mb-1">Full address</label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <textarea
                  rows={2}
                  className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                  value={deliveryInfo?.fullAddress ?? ""}
                  placeholder="House no, street, area"
                  onChange={(e) =>
                    setDeliveryInfo((prev) => ({
                      ...(prev || {}),
                      fullAddress: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex items-end gap-2 mt-4">
              <div className="flex flex-col flex-1">
                <label className="font-medium mb-1">Search city</label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="Search city"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="h-10 px-4 bg-green-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : (
                  <Search size={16} />
                )}
                <span>{isSearching ? "Searching..." : "Search"}</span>
              </button>
            </div>
            {geoError && (
              <p className="mt-2 text-xs text-red-500">
                {geoError}
              </p>
            )}
            <div className="relative mt-6 h-82.5 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              {/* Map component */}
              <div className="absolute inset-0">
                <MapView position={position} setPosition={setPosition} />
                {/* Current location floating button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={recenterToCurrentLocation}
                 className="absolute bottom-7 right-4 rounded-full bg-green-600 shadow-md border border-gray-200 p-2 flex items-center justify-center text-white hover:bg-green-500 z-1000"
                  title="Go to my location"
                >
                  <MapPin size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: order summary / payment */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 h-fit space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="text-green-600" /> Payment Method
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod("online")}
                className={`flex items-center gap-2 w-full border rounded-lg p-3 transition-all text-sm
                  ${paymentMethod === "online" ? "bg-green-50 text-black border-green-600" : "bg-white hover:bg-gray-50"}
                `}
              >
                <CreditCardIcon className="text-green-600" />
                <span>Pay Online (Stripe)</span>
              </button>
              <button
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-center gap-2 w-full border rounded-lg p-3 transition-all text-sm
                  ${paymentMethod === "cod" ? "bg-green-50 text-black border-green-600" : "bg-white hover:bg-gray-50"}
                `}
              >
                <Truck className="text-green-600" />
                <span>Pay on Delivery</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium">Rs {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-medium">{deliveryFee > 0 ? `Rs ${deliveryFee.toFixed(2)}` : "Free"}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-gray-900 mt-2">
              <span>Total</span>
              <span>Rs {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={cartItem.length === 0}
            className={`w-full mt-2 py-3 rounded-full font-semibold flex items-center justify-center gap-2
              ${cartItem.length === 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"}
            `}
            onClick={() => {
              if (cartItem.length === 0) return;
              alert("Order placed! (Implement backend order API here)");
              if(paymentMethod==="cod"){
                handleCod();
              }else{
                handleOnlinePayment();
              }
            }}
          >
            {paymentMethod === "online" ? "Proceed to Payment" : "Place Order"}
          </button>
          {cartItem.length === 0 && (
            <p className="text-xs text-gray-500 text-center">
              Your cart is empty. Add items to place an order.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
