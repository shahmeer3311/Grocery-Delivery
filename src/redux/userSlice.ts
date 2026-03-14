import { createSlice } from "@reduxjs/toolkit";
import mongoose, { set } from "mongoose";

interface User {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryboy" | "admin";
  comparePassword(candidatePassword: string): Promise<boolean>;
  images?: string;
}

interface UserState {
    userData: User | null;
}

const initialState: UserState = {
    userData: null
}

const userSlice=createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        clearUserData: (state) => {
            state.userData = null;
        }
    }
});

export const { setUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer;