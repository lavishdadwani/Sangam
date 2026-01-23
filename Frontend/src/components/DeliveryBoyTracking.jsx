import React, { useEffect, useState } from "react";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";

const deliveryBoyIcon = L.icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});
const customerIcon = L.icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});


const DeliveryBoyTracking = ({ data }) => {
  const deliveryBoyLat = data.deliveryBoyLocation.lat;
  const deliveryBoyLng = data.deliveryBoyLocation.lng;
  const customerLat = data.customerLocation.lat;
  const customerLng = data.customerLocation.lng;

  const [routePath, setRoutePath] = useState([
    [deliveryBoyLat, deliveryBoyLng],
    [customerLat, customerLng],
  ]);
  const [routeDuration, setRouteDuration] = useState(null); 
  const [routeDistance, setRouteDistance] = useState(null);

  const formatDuration = (seconds) => {
    if (!seconds) return 'Calculating...';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const getETA = (durationSeconds) => {
    if (!durationSeconds) return null;
    
    const now = new Date();
    const eta = new Date(now.getTime() + durationSeconds * 1000);
    
    return eta.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDistance = (meters) => {
    if (!meters) return '';
    
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // Fetch route from OSRM
  useEffect(() => {
    const fetchRoute = async () => {
      if (!deliveryBoyLat || !deliveryBoyLng || !customerLat || !customerLng) {
        return;
      }

      try {
        // OSRM API
        const coordinates = `${deliveryBoyLng},${deliveryBoyLat};${customerLng},${customerLat}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

        const response = await fetch(url);
        const routeData = await response.json();

        if (routeData.code === 'Ok' && routeData.routes && routeData.routes.length > 0) {
          const route = routeData.routes[0];
          
          const coordinates = route.geometry.coordinates;
          const routeCoordinates = coordinates.map(coord => [coord[1], coord[0]]);
          setRoutePath(routeCoordinates);
          
          setRouteDuration(route.duration); // Duration in seconds
          setRouteDistance(route.distance); // Distance in meters
        } else {
          setRoutePath([
            [deliveryBoyLat, deliveryBoyLng],
            [customerLat, customerLng],
          ]);
          setRouteDuration(null);
          setRouteDistance(null);
        }
      } catch (error) {
        console.error('Error fetching route from OSRM:', error);
        setRoutePath([
          [deliveryBoyLat, deliveryBoyLng],
          [customerLat, customerLng],
        ]);
        setRouteDuration(null);
        setRouteDistance(null);
      }
    };

    fetchRoute();
  }, [deliveryBoyLat, deliveryBoyLng, customerLat, customerLng]);

  const center = [deliveryBoyLat, deliveryBoyLng];
  return (
    <div className="w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md">
      <MapContainer className={"w-full h-full"} center={center} zoom={16}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LeafletTrackingMarker
          icon={deliveryBoyIcon}
          position={[deliveryBoyLat, deliveryBoyLng]}
          duration={2000}
        >
          <Popup>
            <div className="text-center">
              <div className="font-semibold text-gray-800 mb-2">Delivery Boy</div>
              {routeDuration && (
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">Time to reach:</span> {formatDuration(routeDuration)}
                  </div>
                  {routeDistance && (
                    <div className="text-gray-600">
                      <span className="font-medium">Distance:</span> {formatDistance(routeDistance)}
                    </div>
                  )}
                  <div className="text-blue-600 font-medium">
                    <span className="font-medium">ETA:</span> {getETA(routeDuration)}
                  </div>
                </div>
              )}
              {!routeDuration && (
                <div className="text-sm text-gray-500">Calculating route...</div>
              )}
            </div>
          </Popup>
        </LeafletTrackingMarker>

        <Marker position={[customerLat, customerLng]} icon={customerIcon}>
          <Popup>
            <div className="text-center">
              <div className="font-semibold text-gray-800 mb-2">Customer Location</div>
              {routeDuration && (
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">Delivery time:</span> {formatDuration(routeDuration)}
                  </div>
                  {routeDistance && (
                    <div className="text-gray-600">
                      <span className="font-medium">Distance:</span> {formatDistance(routeDistance)}
                    </div>
                  )}
                  <div className="text-green-600 font-medium">
                    <span className="font-medium">Expected arrival:</span> {getETA(routeDuration)}
                  </div>
                </div>
              )}
              {!routeDuration && (
                <div className="text-sm text-gray-500">Calculating route...</div>
              )}
            </div>
          </Popup>
        </Marker>
        <Polyline 
          positions={routePath} 
          weight={4} 
          color="#3b82f6" 
          opacity={0.7}
          // dashArray="10, 5"
        />
      </MapContainer>
    </div>
  );
};

export default DeliveryBoyTracking;
