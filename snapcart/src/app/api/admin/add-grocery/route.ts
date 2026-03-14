import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try {
        await connectDB();
        const session=await auth();
        if(!session || session?.user?.role!=="admin"){
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const formData=await req.formData();
        const name=formData.get("name") as string;
        const category=formData.get("category") as string;
        const price=parseFloat(formData.get("price") as string);
        const unit=formData.get("unit") as string;
        const description=formData.get("description") as string;
        const stock=parseInt(formData.get("stock") as string);
        const imageFile=formData.get("image") as Blob | null;

        if(!name || !category || (isNaN(price) && price !== 0) || !unit || !description || isNaN(stock) || !imageFile){
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        if(imageFile.size > 5 * 1024 * 1024){
            return NextResponse.json({ message: "Image size should be less than 5MB" }, { status: 400 });
        }

        if(!["Fruits", "Vegetables", "Dairy", "Meat", "Bakery", "Beverages"].includes(category)){
            return NextResponse.json({ message: "Invalid category" }, { status: 400 });
        }

        let imageUrl;

        if(imageFile){
            imageUrl=await uploadOnCloudinary(imageFile);
        }
        const newGrocery=await Grocery.create({
            name,
            category,
            price,
            unit,
            description,
            stock,
            imageUrl: imageUrl || "",
        });

        return NextResponse.json({ message: "Grocery added successfully", grocery: newGrocery }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}