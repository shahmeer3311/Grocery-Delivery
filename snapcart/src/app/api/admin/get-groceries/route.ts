import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest } from "next/server";

export async function GET(req:NextRequest){
    try {
        await connectDB();
        const groceries = await Grocery.find({});
        return new Response(JSON.stringify(groceries), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch groceries" }), { status: 500 });
    }
}