import mongoose from "mongoose";

interface IGrocery {
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  unit: string;
  description: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const GrocerySchema = new mongoose.Schema<IGrocery>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Fruits", "Vegetables", "Dairy", "Meat", "Bakery", "Beverages"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    unit: {
      type: String,
      enum: ["kg", "g", "liter", "ml", "piece"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const Grocery =
  mongoose.models.Grocery ||
  mongoose.model<IGrocery>("Grocery", GrocerySchema);

export default Grocery;
