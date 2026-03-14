import connectDB from "@/lib/db";
import DeliveryAssignmentModel from "@/models/deliveryAssignment.model";
import OrderModel from "@/models/order.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
    try {
        await connectDB();
        const { orderId, otp } = await req.json();
        if(!orderId || !otp){
            return new Response(JSON.stringify({message:"Order ID and OTP are required"}),{status:400})
        }
        const order=await OrderModel.findById(orderId);
        if(!order){
            return new Response(JSON.stringify({message:"Order not found"}),{status:404})
        }
        if(order.status!=="out-for-delivery"){
            return new Response(JSON.stringify({message:"OTP can only be verified for orders out for delivery"}),{status:400})
        }
        if(order.deliveryOtp!==otp){
            return new Response(JSON.stringify({message:"Invalid OTP"}),{status:400})
        }
        order.status="completed";
        order.deliveryOtpVerified=true;
        order.deliveryTime=new Date();

       await DeliveryAssignmentModel.findOneAndUpdate(
        {orderId},
        {$set: {assignedTo: null, status: "completed"}},
        {new: true}
       );

        await order.save();
        return new Response(JSON.stringify({message:"OTP verified successfully"}),{status:200})
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return new Response(JSON.stringify({message:"Internal server error"}),{status:500})
    }
}