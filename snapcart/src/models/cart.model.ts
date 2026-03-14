import mongoose from "mongoose";

interface CartItem {
  _id?: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  unit?: string;
  category?: string;
}

interface CartDoc {
  userId?: mongoose.Types.ObjectId;
  items: CartItem[];
}

const cartItemSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: String,
    price: Number,
    quantity: Number,
    imageUrl: String,
    unit: String,
    category: String,
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

const CartModel = mongoose.models.Cart || mongoose.model<CartDoc>("Cart", cartSchema);

export default CartModel;
