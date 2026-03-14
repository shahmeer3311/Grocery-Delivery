import connectDB from "@/lib/db";
import chatRoomModel from "@/models/chatRoom.model";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest){
    try {
        await connectDB();
        const {orderId,userId,deliveryBoyId}=await request.json();
        console.log(orderId,userId,deliveryBoyId);
        if(!orderId || !userId || !deliveryBoyId){
            return new Response(JSON.stringify({message:"Missing required fields"}),{status:400});
        }
        let room=await chatRoomModel.findOne({orderId});
        if(!room){
            room=await chatRoomModel.create({orderId,userId,deliveryBoyId});
        }
        return new Response(JSON.stringify({message:"Chat room created", room}),{status:201});
    } catch (error) {
        return new Response(JSON.stringify({message:"Internal Server Error", error}),{status:500});
    }
}