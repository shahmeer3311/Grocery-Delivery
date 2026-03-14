import mongoose, { mongo } from "mongoose";

interface IDeliveryAssignment {
    _id?: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    broadCastTo: mongoose.Types.ObjectId[];
    assignedTo: mongoose.Types.ObjectId | null;
    status: "broadcast" | "assigned" | "completed";
    createdAt?: Date;
    updatedAt?: Date;
    acceptedAt: Date | null;
}

const DeliveryAssignmentSchema = new mongoose.Schema<IDeliveryAssignment>(
    {
        orderId: { type: mongoose.Types.ObjectId, ref: "Order", required: true },
        broadCastTo: [{ type: mongoose.Types.ObjectId, ref: "User" }],
        assignedTo: { type: mongoose.Types.ObjectId, ref: "User", default: null },
        status: {
            type: String,
            enum: ["broadcast", "assigned", "rejected", "completed"],
            default: "broadcast",
        },
        acceptedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

const DeliveryAssignmentModel = mongoose.models.DeliveryAssignment || mongoose.model<IDeliveryAssignment>("DeliveryAssignment", DeliveryAssignmentSchema);

export default DeliveryAssignmentModel;