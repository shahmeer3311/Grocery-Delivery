import connectDB from "@/lib/db";
import UserModel from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { userId, location } = await req.json();

        if (!userId || !location) {
            return NextResponse.json(
                { message: "userId and location are required" },
                { status: 400 },
            );
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.location = location;
        await user.save();

        return NextResponse.json(
            { message: "Location updated successfully", user },
            { status: 200 },
        );
    } catch (error: any) {
        console.error("Error in /api/socket/update-location", error);
        return NextResponse.json(
            { message: "Failed to update location", error: error?.message ?? "Unknown error" },
            { status: 500 },
        );
    }
}