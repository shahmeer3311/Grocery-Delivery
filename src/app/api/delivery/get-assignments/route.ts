import { auth } from "@/auth";
import connectDB from "@/lib/db"
import DeliveryAssignmentModel from "@/models/deliveryAssignment.model";
import { NextResponse } from "next/server";

export const GET=async()=>{
    try {
        await connectDB();
        const session=await auth();
        if(!session?.user?.id){
            return new Response(JSON.stringify({message:"Unauthorized"}),{status:401});
        }
        const userId = session.user.id;

        // Return only assignments currently broadcasted to this delivery boy.
        // The active accepted assignment is fetched via /api/delivery/current-order.
        const assignments = await DeliveryAssignmentModel.find({
            broadCastTo: userId,
            status: "broadcast",
        }).populate("orderId");
        return NextResponse.json({assignments}, {status:200});
    } catch (error) {
        return new Response(JSON.stringify({message:"Failed to fetch assignments",error:error instanceof Error ? error.message : "Unknown error"}),{status:500});
    }
}