import { auth } from "@/auth";
import connectDB from "@/lib/db";
import UserModel from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
   try {
    await connectDB();
    const {role, mobile}=await req.json();
    const session=await auth();
    const user=await UserModel.findOneAndUpdate({email:session?.user?.email},{role, mobile},{new:true});
    if(!user){
        return NextResponse.json({message:"User not found"}, {status:404}); 
    }
    return NextResponse.json({message:"Profile updated successfully", user}, {status:200});
   } catch (error) {
    return NextResponse.json({message:"Internal Server Error"}, {status:500});
   }
}