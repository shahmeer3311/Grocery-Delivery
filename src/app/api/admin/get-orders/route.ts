import connectDB from "@/lib/db";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const orders = await OrderModel.find({})
            .populate("userId assignedDeliveryBoy")
            .sort({ createdAt: -1 });

        // Return an empty array instead of an error when there are no orders
        if (!orders || orders.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(orders, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching admin orders:", error);
        return NextResponse.json(
            { message: "Failed to fetch orders", error: error?.message ?? "Unknown error" },
            { status: 500 },
        );
    }
}