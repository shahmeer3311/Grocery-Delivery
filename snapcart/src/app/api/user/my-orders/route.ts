import { auth } from "@/auth";
import connectDB from "@/lib/db";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await auth();

        // If the user is not authenticated, treat as no orders for now
        if (!session?.user?.id) {
            return NextResponse.json([], { status: 200 });
        }

        // Order schema uses `userId` field, not `user`
        const orders = await OrderModel.find({ userId: session.user.id }).populate(
            "userId assignedDeliveryBoy",
        ).sort({ createdAt: -1 });
        console.log("Orders found for user:", orders);

        // Return an empty array instead of 404 so the client
        // can simply show "No orders found" without an error.
        if (!orders || orders.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(orders, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 },
        );
    }
}