import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { registerUser } from "@/services/auth";

export const POST = asyncHandler(async (request: NextRequest) => {
  const { name, email, password } = await request.json();
  const user = await registerUser({ name, email, password });
  return NextResponse.json({ message: "User registered successfully", user }, { status: 200 });
});