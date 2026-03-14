import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignmentModel from "@/models/deliveryAssignment.model";
import OrderModel from "@/models/order.model";
import UserModel from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ orderId: string }> };

export const POST = async (req: NextRequest, context: RouteContext) => {
    try {
        await connectDB();
        const { orderId } = await context.params;
        const { status } = await req.json();
        const order = await OrderModel.findById(orderId).populate("userId");
        if(!order){
            return new Response(JSON.stringify({message:"Order not found"}),{status:404});
        }
        order.status = status;
        let availableDeliveryBoysPayload: any[] = [];

                // When moving to out-for-delivery, try to broadcast assignment once
                if (status === "out-for-delivery" && !order.assigmentId) {
                         const { longitude, latitude } = order.address;

                         // If we don't have coordinates on the order, we can't search nearby
                         if (longitude == null || latitude == null) {
                             await order.save();
                             return NextResponse.json({
                                 assignment: order.assigmentId,
                                 availableBoys: [],
                                 message: "Order status updated but address has no coordinates",
                             }, { status: 200 });
                         }

                         const nearByDeliveryBoy = await UserModel.find({
                            role: { $in: ["deliveryboy", "deliveryBoy", "delivery"] },
                                location: {
                                        $near: {
                                                $geometry: { type: "Point", coordinates: [longitude, latitude] },
                                                $maxDistance: 10000,
                                        },
                                },
                         });
                        console.log("Nearby delivery candidates count:", nearByDeliveryBoy.length);
            const nearByIds=nearByDeliveryBoy.map(db=>db._id.toString()); 
            const busyIds = await DeliveryAssignmentModel.find({
                assignedTo: {$in: nearByIds},
                status: {$nin: ["broadcast","completed"]}
            }).distinct("assignedTo"); 
            const busyIdsSet=new Set(busyIds.map(id=>id.toString()));
            const availableDeliveryBoys=nearByDeliveryBoy.filter(db=>!busyIdsSet.has(db._id.toString()));
            console.log("Available delivery boys after busy filter:", availableDeliveryBoys.length);
            const candidates = availableDeliveryBoys.map(db => db._id);
            if(candidates.length===0){
               await order.save();
               await emitEventHandler("order-status-updated", { orderId: order._id, status: order.status });
               return NextResponse.json({message:"Order status updated but no delivery boy is available"},{status:200});
            }
            const deliveryAssignment = await DeliveryAssignmentModel.create({
                orderId: order._id,
                broadCastTo : candidates,
                assignedTo: null,
                status: "broadcast",
            });

            await deliveryAssignment.populate("orderId").populate("broadCastTo").populate("assignedTo"); 
            for(const candidateId of candidates){
                const boy=await UserModel.findById(candidateId);
                if(boy.socketId){
                    await emitEventHandler("new-delivery-assignment", deliveryAssignment, boy.socketId);
                }
            }

            order.assigmentId = deliveryAssignment._id;
            // order.assignedliveryBoy=deliveryAssignment.assignedTo[0];
            availableDeliveryBoysPayload = availableDeliveryBoys.map(b => ({
                id: b._id,
                name: b.name,
                mobile: b.mobile,
                latitude: b.location.coordinates[1],
                longitude: b.location.coordinates[0],
            }));
        }
        await order.save();
        await emitEventHandler("order-status-updated", { orderId: order._id, status: order.status }); 
        await order.populate("userId");
        return NextResponse.json({
           assignment: order.assigmentId,
           availableBoys: availableDeliveryBoysPayload 
        },{status:200});
    } catch (error) {
        console.error("Error updating order status", error);
        return NextResponse.json({message:"Error updating order status"},{status:500});
    }
}