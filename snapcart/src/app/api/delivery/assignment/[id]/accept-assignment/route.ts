import { auth } from "@/auth";
import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignmentModel from "@/models/deliveryAssignment.model";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
   try {
        await connectDB();
        const { id } = await params;
    const session=await auth();
    const deliveryBoy=session?.user?.id;
    if(!deliveryBoy){
        return new Response(JSON.stringify({message:"Unauthorized"}),{status:401});
    }
    const assignment=await DeliveryAssignmentModel.findById(id);
    if(!assignment){
        return new Response(JSON.stringify({message:"Assignment not found"}),{status:404});
    }
    if(assignment.status!=="broadcast"){
        return new Response(JSON.stringify({message:"Assignment already accepted by someone else"}),{status:400});
    }
    const alreadyAssigned=await DeliveryAssignmentModel.findOne({assignedTo: deliveryBoy, status: {$nin: ["completed","broadcast"]}});
    if(alreadyAssigned){
        return new Response(JSON.stringify({message:"You already have an active assignment. Please complete it before accepting a new one."}),{status:400});
    } 
    assignment.assignedTo=deliveryBoy;
    assignment.status="assigned";
    assignment.acceptedAt=new Date();
    await assignment.save();

    const order=await OrderModel.findById(assignment.orderId);
   if(order){
    order.assignedDeliveryBoy=deliveryBoy;
    await order.save();
   }

   await order.populate("assignedDeliveryBoy","name email phone");
   await emitEventHandler("order-assigned",{
    orderId: order._id,
    assignedDeliveryBoy: order.assignedDeliveryBoy})

   await DeliveryAssignmentModel.updateMany({
    _id: {$ne: assignment._id},
    broadCastTo: deliveryBoy,
    status: "broadcast"
   },{
    $pull: {broadCastTo: deliveryBoy}
   })
    return NextResponse.json({message:"Assignment accepted", order});
   } catch (error) {
    return new Response(JSON.stringify({message:"Internal server error"}),{status:500});
   }
}