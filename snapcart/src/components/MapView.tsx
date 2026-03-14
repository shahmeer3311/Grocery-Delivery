"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
  iconSize: [25, 25],
  iconAnchor: [12, 25],
});

interface MapViewProps {
  position: [number, number] | null;
  setPosition: React.Dispatch<React.SetStateAction<[number, number] | null>>;
}

const DraggableMarker: React.FC<MapViewProps> = ({ position, setPosition }) => {
  const map = useMap();

  if (!position) return null;

  // Recenter map when position changes from outside (e.g. search)
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [map, position]);

  return (
    <Marker
      icon={markerIcon}
      position={position}
      draggable
      eventHandlers={{
        dragend: (e: L.LeafletEvent) => {
          const marker = e.target as L.Marker;
          const { lat, lng } = marker.getLatLng();
          const nextPos: [number, number] = [lat, lng];
          setPosition(nextPos);
          map.setView(nextPos, map.getZoom(), { animate: true });
        },
      }}
    >
      <Popup>Your delivery location</Popup>
    </Marker>
  );
};

const MapView: React.FC<MapViewProps> = ({ position, setPosition }) => {
  if (!position) return null;

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker position={position} setPosition={setPosition} />
    </MapContainer>
  );
};

export default MapView;
