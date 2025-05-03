"use client";
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

function VenueMap({ venue }) {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fix for default marker icons in Leaflet with Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/Image/marker-icon-2x.png",
      iconUrl: "/Image/marker-icon.png",
      shadowUrl: "/Image/marker-shadow.png",
    });
  }, []);

  useEffect(() => {
    const geocodeAddress = async () => {
      if (!venue?.address) {
        setLoading(false);
        return;
      }

      try {
        // Use OpenStreetMap Nominatim API for geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            venue.address + ", Kathmandu, Nepal"
          )}`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          setCoordinates({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          });
        } else {
          // If no results found, use default Kathmandu coordinates
          setCoordinates({
            lat: 27.720022633799353,
            lng: 85.37539444855487
          });
        }
      } catch (error) {
        console.error("Error geocoding address:", error);
        // Use default coordinates on error
        setCoordinates({
          lat: 27.720022633799353,
          lng: 85.37539444855487
        });
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [venue?.address]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[coordinates?.lat || 27.720022633799353, coordinates?.lng || 85.37539444855487]}
      zoom={13}
      style={{ width: "100%", height: "100%", minHeight: "300px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {coordinates && (
        <Marker position={[coordinates.lat, coordinates.lng]} icon={icon}>
          <Popup>
            {venue?.name || "Venue Location"}
            <br />
            {venue?.address}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default VenueMap; 