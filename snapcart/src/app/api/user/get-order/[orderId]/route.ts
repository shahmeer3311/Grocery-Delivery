import connectDB from "@/lib/db";
import OrderModel from "@/models/order.model";
import { NextRequest } from "next/server";

interface RouteContext {
    params: Promise<{ orderId: string }>;
}

// In App Router route handlers, params are provided as a Promise in dev for dynamic APIs
export async function GET(req: NextRequest, { params }: RouteContext) {
   try {
    await connectDB();
     const { orderId } = await params;
    const order=await OrderModel.findById(orderId).populate("assignedDeliveryBoy").exec();
    if(!order){
        return new Response(JSON.stringify({message:"Order not found"}), {status:404});
    }
    return new Response(JSON.stringify(order), {status:200});
   } catch (error) {
    return new Response(JSON.stringify({message:"Internal server error"}), {status:500});
   }
}