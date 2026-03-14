"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  decrementCartItem,
  fetchCart,
} from "@/api/cart";
import type { CartItem, CartResponse } from "@/api/types";

interface IGrocery {
  _id?: string;
  name: string;
  category?: string;
  price: number;
  imageUrl?: string;
  unit?: string;
  description?: string;
  stock?: number;
}

const GroceryItemCard = ({ grocery }: { grocery: IGrocery }) => {
  const {
    name,
    category,
    price,
    imageUrl,
    unit,
    description,
    stock = 0,
  } = grocery as any;

  const queryClient = useQueryClient();
  const { data } = useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });
  const cart = data?.cart || [];
  const cartItem = cart.find((i: any) => i._id === (grocery as any)._id);

  const mutation = useMutation<
    CartResponse,
    Error,
    { type: "add" | "decrement"; id?: string },
    { previous?: CartResponse }
  >({
    mutationFn: async (payload) => {
      if (payload.type === "decrement" && payload.id) {
        return decrementCartItem(payload.id);
      }
      return addToCart({ ...(grocery as any), quantity: 1 });
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData<CartResponse>(["cart"]);
      const prevCart = previous?.cart || [];
      let nextCart: CartItem[] = prevCart;
      const { type, id } = payload || {};

      if (type === "add") {
        const existingIndex = prevCart.findIndex(
          (i) => i._id === (grocery as any)._id
        );
        if (existingIndex >= 0) {
          nextCart = prevCart.map((i, idx) =>
            idx === existingIndex
              ? { ...i, quantity: (i.quantity || 0) + 1 }
              : i
          );
        } else {
          nextCart = [
            ...prevCart,
            { ...(grocery as any), quantity: 1 } as CartItem,
          ];
        }
      } else if (type === "decrement" && id) {
        nextCart = prevCart
          .map((i) =>
            i._id === id ? { ...i, quantity: (i.quantity || 0) - 1 } : i
          )
          .filter((i) => (i.quantity || 0) > 0);
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
  const qty = cartItem?.quantity || 0;

  const formattedPrice = typeof price === "number" ? `$ ${price.toFixed(2)}` : price;
  const shortDesc = description ? (description.length > 90 ? description.slice(0, 90) + "..." : description) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.4 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col group
      hover:scale-105 transition-transform duration-300"
    >
      <div className="relative h-48 w-full bg-gray-white cursor-pointer overflow-hidden ">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-md font-semibold text-gray-800">{name}</h3>
            {category && <p className="text-xs text-gray-500">{category}</p>}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-700">{formattedPrice}</div>
            {unit && <div className="text-xs text-gray-500">per {unit}</div>}
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-2 flex-1">{shortDesc}</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {stock > 0 ? `${stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {qty > 0 ? (
            <div className="flex items-center gap-2">
                <button
                  aria-label={`Decrease ${name}`}
                  onClick={() => {
                    mutation.mutate({ type: "decrement", id: (grocery as any)._id });
                  }}
                className="px-3 py-2 bg-gray-200 rounded-full"
              >
                <Minus className="w-4 h-4 text-gray-700" />
              </button>

              <div className="px-4 py-2 bg-white rounded-full font-semibold">{qty}</div>

              <button
                aria-label={`Increase ${name}`}
                onClick={() => {
                  if (stock <= 0) return;
                  mutation.mutate({ type: "add" });
                }}
                className="px-3 py-2 bg-green-600 text-white rounded-full"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={stock > 0 ? { scale: 1.04 } : undefined}
              whileTap={stock > 0 ? { scale: 0.96 } : undefined}
              transition={{ duration: 0.12 }}
              className={`px-7 py-2 rounded-full flex items-center justify-center gap-2 font-semibold text-white ${stock > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={stock <= 0}
              aria-label={`Add ${name}`}
              onClick={() => {
                if (stock <= 0) return;
                mutation.mutate({ type: "add" });
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GroceryItemCard;
