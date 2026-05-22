import React from "react";
import { MapContainer as LeafletMapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const RecenterMap = ({ location }) => {
  if (location?.lat && location?.lng) {
    const map = useMap();
    map.setView([location.lat, location.lng], 16, { animate: true });
  }
  return null;
};

const MapContainer = ({
  location,
  onDragEnd,
  draggable = true,
  className = "w-full h-full",
  height = "400px",
  zoom = 16,
}) => {
  // Always show map, even if location is [0,0]
  const mapLocation = location?.lat !== undefined && location?.lng !== undefined 
    ? { lat: location.lat, lng: location.lng }
    : { lat: 0, lng: 0 };

  return (
    <div className={`${className} rounded-xl border overflow-hidden relative z-10`} style={{ height }}>
      <LeafletMapContainer
        className="w-full h-full"
        center={[mapLocation.lat, mapLocation.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap location={mapLocation} />
        <Marker
          position={[mapLocation.lat, mapLocation.lng]}
          draggable={draggable}
          eventHandlers={draggable ? { dragend: onDragEnd } : {}}
        />
      </LeafletMapContainer>
    </div>
  );
};

export default MapContainer;
