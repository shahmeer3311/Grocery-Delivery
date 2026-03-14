import connectDB from "@/lib/db";
import chatRoomModel from "@/models/chatRoom.model";
import messageModel from "@/models/message.model";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest){
    try {
        await connectDB();
        const {senderId,text,roomId,time}=await request.json();
        console.log(senderId,text,roomId,time);
        if(!senderId || !text || !roomId || !time){
            return new Response(JSON.stringify({message:"Missing required fields"}),{status:400});
        }
        const room=await chatRoomModel.findById(roomId);
        if(!room){
            return new Response(JSON.stringify({message:"Chat room not found"}),{status:404});
        }
        const message=await messageModel.create({senderId,text,roomId,time});
        return new Response(JSON.stringify({message:"Message saved", data: message}),{status:201});
    } catch (error) {
        return new Response(JSON.stringify({message:"save message failed", error}),{status:500});
    }
} 