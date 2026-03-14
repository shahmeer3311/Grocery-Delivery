import mongoose from "mongoose";

interface IchatRoom{
    _id?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    deliveryBoyId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const chatRoomSchema = new mongoose.Schema<IchatRoom>({
    userId:{type:mongoose.Types.ObjectId,ref:"User",required:true},
    deliveryBoyId:{type:mongoose.Types.ObjectId,ref:"User",required:true},
    orderId:{type:mongoose.Types.ObjectId,ref:"Order",required:true},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
},{timestamps:true});

const ChatRoomModel =
    (mongoose.models.ChatRoom as mongoose.Model<IchatRoom> | undefined) ||
    mongoose.model<IchatRoom>("ChatRoom", chatRoomSchema);

export default ChatRoomModel;