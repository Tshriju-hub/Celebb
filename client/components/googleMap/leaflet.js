"use client";
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: "/Image/marker-icon.png",
  iconRetinaUrl: "/Image/marker-icon-2x.png",
  shadowUrl: "/Image/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const center = {
  lat: 27.720022633799353,
  lng: 85.37539444855487,
};

// Component to handle map updates
function MapUpdater() {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], 13);
  }, [map]);

  return null;
}

function UserLeafletMap() {
  useEffect(() => {
    // Fix for default marker icons in Leaflet with Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/Image/marker-icon-2x.png",
      iconUrl: "/Image/marker-icon.png",
      shadowUrl: "/Image/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      style={{ width: "100%", height: "100%", minHeight: "400px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[center.lat, center.lng]} icon={icon}>
        <Popup>
          Our Location
        </Popup>
      </Marker>
      <MapUpdater />
    </MapContainer>
  );
}

export default UserLeafletMap; 