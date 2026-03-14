import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CartModel from "@/models/cart.model";
import Grocery from "@/models/grocery.model";
import { getToken } from "next-auth/jwt";

async function mergeCarts(serverItems: any[], clientCart: any[]) {
  const map = new Map<string, any>();
  (serverItems || []).forEach((it: any) => map.set(it._id, { ...it }));
  if (!Array.isArray(clientCart)) return Array.from(map.values());

  for (const c of clientCart) {
    if (!c?._id) continue;
    const prod = await Grocery.findById(c._id);
    if (!prod) continue;
    const qty = Math.max(0, Math.floor(c.quantity || 0));
    if (qty <= 0) continue;
    const existing = map.get(c._id);
    if (existing) {
      existing.quantity = Math.min(prod.stock || 0, (existing.quantity || 0) + qty);
      existing.price = prod.price;
    } else {
      map.set(c._id, {
        _id: prod._id.toString(),
        name: prod.name,
        price: prod.price,
        quantity: Math.min(qty, prod.stock || 0),
        imageUrl: prod.imageUrl,
        unit: prod.unit,
        category: prod.category,
      });
    }
  }
  return Array.from(map.values());
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ ok: false, message: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { cart: clientCart } = body || {};

    const userId = token.sub;
    let cartDoc = await CartModel.findOne({ userId });
    if (!cartDoc) {
      cartDoc = new CartModel({ userId, items: clientCart || [] });
    } else {
      cartDoc.items = await mergeCarts(cartDoc.items, clientCart || []);
    }

    await cartDoc.save();
    return NextResponse.json({ ok: true, cart: cartDoc.items || [] }, { status: 200 });
  } catch (err) {
    console.error("/api/cart/set error", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
