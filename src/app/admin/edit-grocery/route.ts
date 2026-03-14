import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
    try {
        await connectDB();
        const session=await auth();
        if(!session || session?.user?.role!=="admin"){
            return new Response("Unauthorized",{status:401});
        }
        const formData=await req.json();
        const groceryId=formData.get("groceryId");
        const name=formData.get("name");
        const category=formData.get("category");
        const unit=formData.get("unit");
        const price=formData.get("price");
        const file=formData.get("image");

        let imgUrl;
        if(file){
            imgUrl=await uploadOnCloudinary(file);
        }
        const grocery=await Grocery.findByIdAndUpdate(groceryId,{
            name,
            category,
            unit,
            price,
            image:imgUrl
        },{new:true});
        return new Response(JSON.stringify(grocery),{status:200});
    } catch (error) {
        return new Response("Internal Server Error",{status:500});
    }
}