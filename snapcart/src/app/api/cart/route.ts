import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CartModel from "@/models/cart.model";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Return cart for authenticated user if present.
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ ok: true, cart: [] }, { status: 200 });
    }

    const userId = token.sub;
    const cartDoc = await CartModel.findOne({ userId });
    return NextResponse.json({ ok: true, cart: cartDoc?.items || [] }, { status: 200 });
  } catch (err) {
    console.error("/api/cart GET error", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
