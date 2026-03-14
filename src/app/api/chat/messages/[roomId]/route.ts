import connectDB from "@/lib/db";
import messageModel from "@/models/message.model";
import { NextRequest } from "next/server";

interface RouteParams {
  params: {
    roomId: string;
  } | Promise<{ roomId: string }>;
}

export async function GET(_request: NextRequest, context: RouteParams) {
  try {
    await connectDB();
    const params = await context.params;
    const roomId = params?.roomId;

    if (!roomId) {
      return new Response(
        JSON.stringify({ message: "roomId is required in route params" }),
        { status: 400 }
      );
    }

    const messages = await messageModel
      .find({ roomId })
      .sort({ createdAt: 1 });

    return new Response(
      JSON.stringify({ message: "Messages fetched", data: messages }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch messages", error }),
      { status: 500 }
    );
  }
}
