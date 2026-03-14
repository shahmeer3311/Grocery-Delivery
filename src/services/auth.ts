import connectDB from "@/lib/db";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { HttpError } from "@/lib/asyncHandler";

export async function registerUser({ name, email, password }: { name: string; email: string; password: string }) {
  await connectDB();
  const normalizedName = name?.trim();
  const normalizedEmail = email?.trim();
  const normalizedPassword = password?.trim();

  if (!normalizedName) throw new HttpError("Name is required", 400);
  if (!normalizedEmail) throw new HttpError("Email is required", 400);
  if (!normalizedPassword) throw new HttpError("Password is required", 400);

  const existing = await UserModel.findOne({ email: normalizedEmail });
  if (existing) throw new HttpError("User already exists", 400);
  if (normalizedPassword.length < 6) throw new HttpError("Password must be at least 6 characters long", 400);
  const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
  const user = await UserModel.create({ name: normalizedName, email: normalizedEmail, password: hashedPassword });
  return user;
}
