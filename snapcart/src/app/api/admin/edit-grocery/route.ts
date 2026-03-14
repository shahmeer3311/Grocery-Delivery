import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		await connectDB();

		const session = await auth();
		if (!session || session?.user?.role !== "admin") {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const formData = await req.formData();

		const id = formData.get("id") as string | null;
		const name = formData.get("name") as string | null;
		const category = formData.get("category") as string | null;
		const priceStr = formData.get("price") as string | null;
		const unit = formData.get("unit") as string | null;
		const description = formData.get("description") as string | null;
		const stockStr = formData.get("stock") as string | null;
		const imageFile = formData.get("image") as Blob | null;

		if (!id) {
			return NextResponse.json(
				{ message: "Grocery ID is required" },
				{ status: 400 }
			);
		}

		const grocery = await Grocery.findById(id);
		if (!grocery) {
			return NextResponse.json(
				{ message: "Grocery not found" },
				{ status: 404 }
			);
		}

		const price = priceStr !== null ? parseFloat(priceStr) : grocery.price;
		const stock = stockStr !== null ? parseInt(stockStr, 10) : grocery.stock;

		if (!name || !category || !unit || !description) {
			return NextResponse.json(
				{ message: "All fields are required" },
				{ status: 400 }
			);
		}

		if ((isNaN(price) && price !== 0) || isNaN(stock)) {
			return NextResponse.json(
				{ message: "Invalid price or stock" },
				{ status: 400 }
			);
		}

		if (
			!["Fruits", "Vegetables", "Dairy", "Meat", "Bakery", "Beverages"].includes(
				category
			)
		) {
			return NextResponse.json(
				{ message: "Invalid category" },
				{ status: 400 }
			);
		}

		let imageUrl = grocery.imageUrl;

		if (imageFile) {
			if (imageFile.size > 5 * 1024 * 1024) {
				return NextResponse.json(
					{ message: "Image size should be less than 5MB" },
					{ status: 400 }
				);
			}
			imageUrl = await uploadOnCloudinary(imageFile);
		}

		grocery.name = name;
		grocery.category = category;
		grocery.price = price;
		grocery.unit = unit;
		grocery.description = description;
		grocery.stock = stock;
		grocery.imageUrl = imageUrl;

		await grocery.save();

		return NextResponse.json(
			{ message: "Grocery updated successfully", grocery },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Edit grocery error", error);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

