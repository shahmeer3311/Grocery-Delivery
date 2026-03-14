import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CartModel from "@/models/cart.model";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ ok: false, message: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body || {};
    if (!id) return NextResponse.json({ ok: false, message: "id required" }, { status: 400 });

    const userId = token.sub;
    let cartDoc = await CartModel.findOne({ userId });
    if (!cartDoc) {
      cartDoc = new CartModel({ userId, items: [] });
    }

    const idStr = String(id);
    cartDoc.items = cartDoc.items.filter((it: any) => String(it._id) !== idStr);

    await cartDoc.save();
    return NextResponse.json({ ok: true, cart: cartDoc.items || [] }, { status: 200 });
  } catch (err) {
    console.error("/api/cart/remove error", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
