import mongoose from "mongoose";
import bcrypt from "bcryptjs";

interface User {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryboy" | "deliveryBoy" | "delivery" | "admin";
  comparePassword(candidatePassword: string): Promise<boolean>;
  images?: string;
  location?: {
    type: {
        type: StringConstructor;
        enum: string[];
        default: string;
    };
    coordinates: {
        type: NumberConstructor[];
        default: number[];
    };
},
  socketId?: string| null;
  isOnline?: boolean;
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    mobile: { type: String },
    role: {
      type: String,
      enum: ["user", "deliveryboy", "deliveryBoy", "delivery", "admin"],
      default: "user",
    },
    images: { type: String  },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      }
    },
    socketId: { type: String, default: null },
    isOnline: {type: Boolean, default: false},
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ location: "2dsphere" });
 
const UserModel = mongoose.models.User || mongoose.model<User>("User", userSchema);

export default UserModel;

// Every hot reload does:
// “Create User model again”

// In Next.js, hot reload re-runs backend files without restarting the server, so Mongoose models stay in memory.MongoDB models are global. If a model is created again using mongoose.model(), it causes an error because the model already exists. To avoid this, we check mongoose.models first and reuse the existing model if it is already defined, which makes the application safe during hot reload.