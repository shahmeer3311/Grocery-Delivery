"use client";

import React from "react";
import L, { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface LiveMapProps {
  userLocation: [number, number] | null;
  deliveryLocation: [number, number] | null;
}

const LiveMapClient = ({ userLocation, deliveryLocation }: LiveMapProps) => {

  const deliveryBoyIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/9561/9561839.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/18390/18390769.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const center =
    deliveryLocation || userLocation || [30.1997, 71.4996];

    const linePosition=
    deliveryLocation && userLocation
    ? [userLocation, deliveryLocation]
    : [];

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow relative">
      <MapContainer
        center={center as LatLngExpression}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {deliveryLocation && (
          <Marker position={deliveryLocation} icon={deliveryBoyIcon}>
            <Popup>Delivery Boy</Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>User Location</Popup>
          </Marker>
        )}

        <Polyline positions={linePosition} color="blue" weight={3} />

      </MapContainer>
    </div>
  );
};

export default LiveMapClient;