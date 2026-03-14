import { auth } from "@/auth";
import connectDB from "@/lib/db";
import DeliveryAssignmentModel from "@/models/deliveryAssignment.model";
import "@/models/order.model";
import { NextResponse } from "next/server";
import { Types } from "mongoose";

const toIdString = (value: any) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && typeof value.toString === "function") {
    return value.toString();
  }
  return String(value);
};

const normalizeOrder = (orderDoc: any) => {
  if (!orderDoc) return null;

  return {
    ...orderDoc,
    _id: toIdString(orderDoc._id),
    userId:
      orderDoc.userId && typeof orderDoc.userId === "object"
        ? { ...orderDoc.userId, _id: toIdString(orderDoc.userId._id) }
        : toIdString(orderDoc.userId),
    assignedDeliveryBoy: toIdString(orderDoc.assignedDeliveryBoy),
    assigmentId: toIdString(orderDoc.assigmentId),
    items: Array.isArray(orderDoc.items)
      ? orderDoc.items.map((item: any) => ({
          ...item,
          _id: toIdString(item?._id) ?? undefined,
        }))
      : [],
  };
};

export const GET = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const userId = session.user.id;

    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid user session" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the current active assignment for this delivery boy
    const assignmentDoc = await DeliveryAssignmentModel.findOne({
      assignedTo: userId,
      status: { $in: ["assigned", "out-for-delivery"] },
    })
      .populate({
        path: "orderId",
        populate: {
          path: "userId",
          select: "name email mobile",
        },
      })
      .lean();

    if (!assignmentDoc) {
      return NextResponse.json(
        { assignment: null, order: null },
        { status: 200 }
      );
    }

    const { orderId, ...assignmentRest } = assignmentDoc;

    const assignment = {
      ...assignmentRest,
      _id: toIdString(assignmentRest._id),
      assignedTo: toIdString(assignmentRest.assignedTo),
      broadCastTo: Array.isArray(assignmentRest.broadCastTo)
        ? assignmentRest.broadCastTo.map((id: any) => toIdString(id))
        : [],
      orderId: orderId?._id ? toIdString(orderId._id) : toIdString(orderId),
    };

    const order = normalizeOrder(orderId);

    return NextResponse.json(
      { assignment, order },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] /delivery/current-order error", error);
    return new Response(
      JSON.stringify({
        message: "Failed to fetch current order",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
};
