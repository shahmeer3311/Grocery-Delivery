import { auth } from "@/auth";
import UserModel from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await UserModel.findOne({ email: session.user.email }).select("-password");
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const userObj = typeof (user as any).toObject === "function" ? (user as any).toObject() : JSON.parse(JSON.stringify(user));

        return NextResponse.json({ user: userObj }, { status: 200 });
    } catch (err: any) {
        console.error("GET /api/me error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};