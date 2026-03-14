import connectDB from "@/lib/db";
import OrderModel from "@/models/order.model";
import UserModel from "@/models/user.model";
import { asyncHandler, HttpError } from "@/lib/asyncHandler";
import { NextRequest, NextResponse } from "next/server";
import emitEventHandler from "@/lib/emitEventHandler";

// Controller: handle Cash-on-Delivery order creation
async function handleCod(req: NextRequest) {
    await connectDB();

    const body = await req.json();
    const { userId, items, totalAmount, paymentMethod, address } = body || {};

    if (!userId) throw new HttpError("User ID is required", 400);
    if (!Array.isArray(items) || items.length === 0)
        throw new HttpError("Order items are required", 400);
    if (typeof totalAmount !== "number" || totalAmount <= 0)
        throw new HttpError("Total amount must be a positive number", 400);
    if (!paymentMethod || paymentMethod !== "cod")
        throw new HttpError("Invalid payment method for COD", 400);
    if (!address)
        throw new HttpError("Address is required", 400);

    const user = await UserModel.findById(userId);
    if (!user) throw new HttpError("User not found", 404);

    const newOrder = await OrderModel.create({
        userId,
        items,
        totalAmount,
        paymentMethod,
        address,
    });

    await emitEventHandler("new-order", newOrder,) ;

    return NextResponse.json(
        { message: "Order placed successfully", order: newOrder },
        { status: 201 }
    );
}

export const POST = asyncHandler(handleCod);