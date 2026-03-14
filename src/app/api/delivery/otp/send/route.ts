import connectDB from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import OrderModel from "@/models/order.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
    try {
        await connectDB();
        const { orderId } = await req.json();
        const order=await OrderModel.findById(orderId).populate("userId","email");
        if(!order){
            return new Response(JSON.stringify({message:"Order not found"}),{status:404})
        }
        if(order.status!=="out-for-delivery"){
            return new Response(JSON.stringify({message:"OTP can only be sent for orders out for delivery"}),{status:400})
        }
        const otp=Math.floor(100000 + Math.random() * 900000).toString();
        order.deliveryOtp=otp;
        await order.save();
        
        await sendEmail(order.userId.email,"Your Delivery OTP",`<p>Your OTP for order delivery is: <strong>${otp}</strong></p><p>Please provide this OTP to the delivery person upon receiving your order.</p>`);
        console.log(`OTP for order ${orderId}: ${otp}`);
        return new Response(JSON.stringify({message:"OTP sent successfully"}),{status:200})
    } catch (error) {
        console.error("Error sending OTP:", error);
        return new Response(JSON.stringify({message:"Internal server error"}),{status:500})
    }
}