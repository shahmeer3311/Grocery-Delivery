import mongoose from "mongoose";

interface IMessage{
    _id?: mongoose.Types.ObjectId;
    roomId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    text: string;
    time: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
    roomId:{type:mongoose.Types.ObjectId,ref:"ChatRoom",required:true},
    senderId:{type:mongoose.Types.ObjectId,ref:"User",required:true},
    text:{type:String,required:true},
    time:{type:String,required:true},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
},{timestamps:true});

const MessageModel =
    (mongoose.models.Message as mongoose.Model<IMessage>) ||
    mongoose.model<IMessage>("Message", messageSchema);

export default MessageModel;