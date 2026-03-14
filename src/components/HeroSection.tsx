"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Leaf, Truck, Smartphone } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export const slides = [
  {
    id: 1,
    icon: Leaf,
    title: "Fresh & Organic Products",
    subtitle: "Get farm-fresh organic groceries delivered to your door.",
    btnText: "Shop Now",
    image: "https://media.istockphoto.com/id/1128687123/photo/shopping-bag-full-of-fresh-vegetables-and-fruits.jpg?s=612x612&w=0&k=20&c=jXInOVcduhEnfuUVffbUacldkF5CwAeThD3MDUXCItM=",
  },
  {
    id: 2,
    icon: Truck,
    title: "Fast & Reliable Delivery",
    subtitle: "Quick and safe delivery right to your home.",
    btnText: "Order Now",
    image: "https://media.istockphoto.com/id/2191395811/photo/car-racer-in-a-red-suit-flying-and-holding-a-shopping-cart-with-falling-groceries.jpg?s=612x612&w=0&k=20&c=WJkpm5KVpXZ_WJskL2jTtnTdtOf1bWBAey_mE0jEGqs="
  },
  {
    id: 3,
    icon: Smartphone,
    title: "Easy Mobile Ordering",
    subtitle: "Order anytime, anywhere with our simple mobile app.",
    btnText: "Get Started",
    image: "https://media.istockphoto.com/id/1568873428/photo/online-grocery-shopping-and-delivery-app.jpg?s=612x612&w=0&k=20&c=j25tQLMuLp6yb8zWdfIbRcKkuKCRJ0h97dEF5Bq6Yy4="
  },
];


export default function HeroSection() {
  const {userData} = useSelector((state: RootState) => state.user);
  console.log("User Data in HeroSection:", userData);
   useEffect(() => {
      if (!userData?._id) return; // only connect when user is loaded
      const socket = getSocket();
      socket.emit("identity", { userId: userData._id });
    }, [userData?._id]);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="relative mt-10 h-[80vh] w-[98%] mx-auto overflow-hidden rounded-3xl shadow-2xl">

      {/* Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="(max-width: 768px) 100vw, 98vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* Text */}
      <div className="relative z-10 flex h-full items-center px-6 md:px-20">
        <motion.div
          key={slide.id + "-text"}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="max-w-2xl text-white"
        >
          <Icon className="w-20 h-20 text-green-400 drop-shadow-lg mb-6" />

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            {slide.title}
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-8">
            {slide.subtitle}
          </p>

          <div className="flex gap-4">
            <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full font-semibold shadow-lg">
              {slide.btnText}
            </button>

            <button
              onClick={() => setCurrent((current + 1) % slides.length)}
              className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-full"
            >
              Next
            </button>
          </div>
        </motion.div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current ? "bg-white scale-125 w-6" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
