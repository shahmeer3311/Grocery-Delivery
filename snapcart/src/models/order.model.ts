import mongoose from "mongoose";

interface IOrderItem {
    _id?: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    unit?: string;
    category?: string;
}

interface OrderDoc {
    userId?: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    status: "pending" | "completed" | "cancelled" | "out-for-delivery";
    paymentMethod: "cod" | "online";
    address: {
        fullName: string;
        phone: string;
        city: string;
        state: string;
        pincode: string;
        fullAddress: string;
        latitude?: number;
        longitude?: number;
    };
    assignedDeliveryBoy?: mongoose.Types.ObjectId | null;
    assigmentId?: mongoose.Types.ObjectId | null;
    createdAt?: Date;
    updatedAt?: Date;
    deliveryOtp?: string;
    deliveryOtpVerified?: boolean;
    deliveryTime?: Date;
}

const orderItemSchema= new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: String,
    price: Number,
    quantity: Number,
    imageUrl: String,
    unit: String,
    category: String,
},{_id: false})

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    items: { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "cancelled", "out-for-delivery"], default: "pending" },
    paymentMethod: { type: String, enum: ["cod", "online"], required: true },   
    assignedDeliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assigmentId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryAssignment", default: null },
    address: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        fullAddress: { type: String, required: true },
        latitude: Number,
        longitude: Number,
    },
    deliveryOtp: String,
    deliveryOtpVerified: { type: Boolean, default: false },
    deliveryTime: Date,
},{timestamps: true})

const OrderModel = mongoose.models.Order || mongoose.model<OrderDoc>("Order", orderSchema);

export default OrderModel;