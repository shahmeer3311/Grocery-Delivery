"use client";

import type { CartItem, CartResponse } from "./types";

export async function fetchCart(): Promise<CartResponse> {
  const res = await fetch("/api/cart");
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function addToCart(item: any): Promise<CartResponse> {
  const res = await fetch("/api/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ item }),
  });

  if (!res.ok) {
    throw new Error("Failed to add to cart");
  }

  return res.json();
}

export async function incrementCartItem(id: string): Promise<CartResponse> {
  const res = await fetch("/api/cart/increment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw new Error("Failed to increment cart item");
  }

  return res.json();
}

export async function decrementCartItem(id: string): Promise<CartResponse> {
  const res = await fetch("/api/cart/decrement", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw new Error("Failed to decrement cart item");
  }

  return res.json();
}

export async function removeCartItem(id: string): Promise<CartResponse> {
  const res = await fetch("/api/cart/remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw new Error("Failed to remove cart item");
  }

  return res.json();
}

export async function setCart(cart: any[]): Promise<CartResponse> {
  const res = await fetch("/api/cart/set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ cart }),
  });

  if (!res.ok) {
    throw new Error("Failed to set cart");
  }

  return res.json();
}
