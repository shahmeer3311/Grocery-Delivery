import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CartModel from "@/models/cart.model";
import Grocery from "@/models/grocery.model";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ ok: false, message: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { item } = body || {};
    if (!item?._id) {
      return NextResponse.json({ ok: false, message: "item._id required" }, { status: 400 });
    }

    const userId = token.sub;
    let cartDoc = await CartModel.findOne({ userId });
    if (!cartDoc) {
      cartDoc = new CartModel({ userId, items: [] });
    }

    const itemId = String(item._id);
    const prod = await Grocery.findById(itemId);
    if (!prod) return NextResponse.json({ ok: false, message: "Product not found" }, { status: 404 });

    const addQty = item.quantity || 1;
    const idx = cartDoc.items.findIndex((it: any) => String(it._id) === itemId);
    const currentQty = idx >= 0 ? cartDoc.items[idx].quantity || 0 : 0;
    if (currentQty + addQty > prod.stock) {
      return NextResponse.json({ ok: false, message: "Insufficient stock" }, { status: 400 });
    }

    if (idx >= 0) {
      cartDoc.items[idx].quantity = currentQty + addQty;
      cartDoc.items[idx].price = prod.price;
    } else {
      cartDoc.items.push({
        _id: prod._id.toString(),
        name: prod.name,
        price: prod.price,
        quantity: addQty,
        imageUrl: prod.imageUrl,
        unit: prod.unit,
        category: prod.category,
      });
    }

    await cartDoc.save();
    return NextResponse.json({ ok: true, cart: cartDoc.items || [] }, { status: 200 });
  } catch (err) {
    console.error("/api/cart/add error", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
