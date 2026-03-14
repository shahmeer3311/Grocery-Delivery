"use client";
import { getSocket } from '@/lib/socket';
import React, { useEffect } from 'react'

const GeoUpdater = ({userId}: {userId: string}) => {
    let socket=getSocket();
    useEffect(()=>{
      if(!userId) return;
      if(!navigator.geolocation){
        console.log("Geolocation is not supported by this browser.");
        return;
      }
     const watcher = navigator.geolocation.watchPosition((pos)=>{
        const {latitude, longitude} = pos.coords;
          socket.emit("locationUpdate", { userId, location: [longitude, latitude] });
      }, (err)=>{
        if (err.code === 1) {
          console.warn("Location permission denied. Please allow location access in your browser.");
        } else if (err.code === 2) {
          console.warn("Location is currently unavailable. This can happen if device location is off or there is no network.");
        } else if (err.code === 3) {
          console.warn("Location request timed out while sending updates. This can happen with weak GPS/Wi‑Fi.");
        } else {
          console.error("Error getting location:", err);
        }
      }, {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 30000,
      }); 
      return ()=>{
        navigator.geolocation.clearWatch(watcher);
      }
    },[userId]);
  return null;
}

export default GeoUpdater
