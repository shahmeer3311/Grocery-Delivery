import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const server = http.createServer(app);
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: process.env.NEXT_BASE_URL,
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    socket.on("identity", async ({ userId }) => {
        console.log(`User ${userId} has connected with socket ID ${socket.id}`);
        // Here you can update the user's online status in the database if needed
        try {
            await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`, {
                userId,
                socketId: socket.id,
            });
        } catch (err) {
            console.error("Error calling /api/socket/connect", err?.response?.data || err?.message || err);
        }
    });

    socket.on("joinRoom", ({ roomId }) => {
        if (!roomId) return;
        console.log(`Socket ${socket.id} joining room ${roomId}`);
        socket.join(roomId);
    });

    socket.on("leaveRoom", ({ roomId }) => {
        if (!roomId) return;
        console.log(`Socket ${socket.id} leaving room ${roomId}`);
        socket.leave(roomId);
    });

    socket.on("sendMessage",async (message)=>{
        await axios.post(`${process.env.NEXT_BASE_URL}/api/chat/save`, message);
        io.to(message.roomId).emit("sendMessage", message);
    })

    socket.on("locationUpdate", async ({ userId, location }) => {
        const locationData={
            type: "Point",
            coordinates: location, // [longitude, latitude]
        }
        console.log(`Received location update from user ${userId}:`, location);
        // Here you can update the user's location in the database if needed
        try {
            await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`, {
                userId,
                location: locationData,
            });
        } catch (err) {
            console.error("Error calling /api/socket/update-location", err?.response?.data || err?.message || err);
        }

            io.emit("update-delivery-location", { userId, location });
    });

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
    });
});

app.post("/notify",(req,res)=>{
   const {event,data,socketId}=req.body;
   console.log("Emitting event to socket ID:", socketId, "Event:", event, "Data:", data);
   if(socketId && event){
         io.to(socketId).emit(event, data);
         res.status(200).json({ message: "Notification sent" });
   }else{
         io.emit(event, data);
         res.status(200).json({ message: "Broadcast notification sent" });
   }
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Socket server is running on port ${PORT}`);
});