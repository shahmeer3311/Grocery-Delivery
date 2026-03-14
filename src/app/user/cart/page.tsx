"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  decrementCartItem,
  fetchCart,
  incrementCartItem,
  removeCartItem,
} from "@/api/cart";
import type { CartItem, CartResponse } from "@/api/types";
import { motion } from "framer-motion";
import { FaArrowLeft, FaShoppingCart, FaTrash } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });

  const cart = data?.cart || [];

  const mutation = useMutation<
    CartResponse,
    Error,
    { type: "increment" | "decrement" | "remove"; id: string },
    { previous?: CartResponse }
  >({
    mutationFn: async ({ type, id }) => {
      if (type === "increment") return incrementCartItem(id);
      if (type === "decrement") return decrementCartItem(id);
      return removeCartItem(id);
    },
    onMutate: async ({ type, id }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData<CartResponse>(["cart"]);
      const prevCart = previous?.cart || [];
      let nextCart: CartItem[] = prevCart;

      if (type === "increment") {
        nextCart = prevCart.map((i) =>
          i._id === id ? { ...i, quantity: (i.quantity || 0) + 1 } : i
        );
      } else if (type === "decrement") {
        nextCart = prevCart
          .map((i) =>
            i._id === id ? { ...i, quantity: (i.quantity || 0) - 1 } : i
          )
          .filter((i) => (i.quantity || 0) > 0);
      } else if (type === "remove") {
        nextCart = prevCart.filter((i) => i._id !== id);
      }

      queryClient.setQueryData<CartResponse>(["cart"], {
        ...(previous || { ok: true, cart: [] }),
        cart: nextCart,
      });

      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData<CartResponse>(["cart"], context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<CartResponse>(["cart"], data);
    },
  });

  if (isLoading) {
    return (
      <div className="w-[95%] sm:w-[90%] md:w-[80%] mx-auto mt-8 mb-24">
        <p className="text-gray-500 text-lg">Loading cart...</p>
      </div>
    );
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const deliveryFee = 50;

  return (
    <div className="w-[95%] sm:w-[90%] md:w-[80%] mx-auto mt-8 mb-24">
      <div className="rounded-full items-center gap-4 mb-6 p-3 bg-green-600 inline-flex text-white ">
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:text-black"
        >
          <FaArrowLeft />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="flex items-center justify-center gap-3 mb-10 text-green-700">
        <FaShoppingCart size={28} />
        <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {cart.length === 0 && (
            <p className="text-gray-500 text-lg">Your cart is empty</p>
          )}

          {cart.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-6 p-4 bg-white rounded-xl shadow"
            >
              <div className="w-24 h-24 relative">
                <Image
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover rounded"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-gray-500">{item.category}</p>
              </div>

              <div className="flex flex-col-reverse items-center gap-3">
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() =>
                      mutation.mutate({
                        type: "decrement",
                        id: item._id as string,
                      })
                    }
                    className="w-8 h-8 border rounded"
                  >
                    −
                  </button>

                  <span className="font-semibold">{item.quantity}</span>

                  <button
                    onClick={() =>
                      mutation.mutate({
                        type: "increment",
                        id: item._id as string,
                      })
                    }
                    className="w-8 h-8 border rounded"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() =>
                    mutation.mutate({
                      type: "remove",
                      id: item._id as string,
                    })
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow p-6 h-fit"
        >
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>

          <div className="flex justify-between mb-4">
            <span>Items</span>
            <span className="text-green-600">{cart.length}</span>
          </div>

          <div className="flex justify-between mb-4">
            <span>Total</span>
            <span className="font-bold text-green-600">Rs {total}</span>
          </div>

          <div className="flex justify-between mb-4">
            <span>Delivery Fee</span>
            <span className="font-bold text-green-600">Rs {deliveryFee}</span>
          </div>

          <button
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-full hover:bg-green-700 font-semibold"
            onClick={() => router.push("/user/checkout")}
          >
            Proceed to Checkout
          </button>
        </motion.div>
      </div>
    </div>
  );
}
