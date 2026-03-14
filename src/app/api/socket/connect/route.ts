import connectDB from "@/lib/db";
import UserModel from "@/models/user.model";
import { NextRequest } from "next/server";

 
 export async function POST(req: NextRequest){
    try {
        await connectDB();
        const {userId,socketId}=await req.json();
        if(!userId || !socketId){
            return new Response(JSON.stringify({message:"userId and socketId are required"}),{status:400});
        }
        const user=await UserModel.findById(userId);
        if(!user){
            return new Response(JSON.stringify({message:"User not found"}),{status:404});
        }
        user.socketId=socketId;
        user.isOnline=true;
        await user.save();
        return new Response(JSON.stringify({message:"Socket ID updated successfully",user}),{status:200});
    } catch (error) {
        return new Response(JSON.stringify({message:"Error updating socket ID"}),{status:500});
    }
 }