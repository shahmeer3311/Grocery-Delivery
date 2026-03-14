"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2, Truck, Clock, Package, ArrowRight } from "lucide-react";

const OrderSuccessPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 via-white to-green-100 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl px-6 py-10 text-center relative overflow-hidden">
        {/* Floating background accents */}
        <motion.div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-green-100"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-green-200 opacity-60"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />

        {/* Main success icon */}
        <motion.div
          initial={{ scale: 0, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-700 shadow-lg relative z-10"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>

        {/* Title & subtitle */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 16 }}
          className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2"
        >
          Order Confirmed!
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="text-sm md:text-base text-gray-600 mb-6"
        >
          Thank you for shopping with Snapcart. We&apos;re getting your order
          ready and will notify you once it&apos;s on the way.
        </motion.p>

        {/* Status row icons with different motion styles */}
        <div className="flex items-center justify-center gap-6 mb-8 text-xs md:text-sm text-gray-600 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-1"
          >
            <Package className="w-5 h-5 text-green-600" />
            <span>Order received</span>
          </motion.div>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <Truck className="w-5 h-5 text-green-600" />
            <span>Preparing delivery</span>
          </motion.div>
          <motion.div
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <Clock className="w-5 h-5 text-green-600" />
            <span>Arriving soon</span>
          </motion.div>
        </div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 18 }}
          className="relative z-10"
        >
          <Link
            href="/user/my-order"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow-lg hover:bg-green-700 transition-colors"
          >
            View My Orders
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              className="inline-flex"
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
