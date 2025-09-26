'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { Button } from '@/components/ui/button';
import { Locate, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';

import { Location } from '@/types';
import { useGeolocation } from '@/lib/utils/geolocation';

interface MapViewProps {
  locations: Location[];
  className?: string;
  onMapClick?: (coordinates: { lat: number; lng: number }) => void;
  showUserLocation?: boolean;
  enableLocationPicker?: boolean;
}

// Custom icons
const locationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function MapView({ 
  locations, 
  className, 
  onMapClick, 
  showUserLocation = true,
  enableLocationPicker = false 
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const circlesRef = useRef<L.Circle[]>([]);
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [userMarker, setUserMarker] = useState<{ lat: number; lng: number } | null>(null);
  const { position, loading: geoLoading, error: geoError, getCurrentPosition } = useGeolocation();

  const defaultCenter: [number, number] = useMemo(() => 
    locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : [10.762622, 106.660172], // Default to HCMC
    [locations]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      // Force clear any existing map
      const element = mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number };
      if (element._leaflet_id) {
        delete element._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        scrollWheelZoom: true,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add click handler if needed
      if (onMapClick || enableLocationPicker) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          if (onMapClick) {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
          }
        });
      }

      mapRef.current = map;
      setIsMapReady(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Không thể khởi tạo bản đồ');
    }
  }, [defaultCenter, onMapClick, enableLocationPicker]);

  // Handle geolocation
  useEffect(() => {
    if (position && showUserLocation) {
      setUserMarker({ lat: position.lat, lng: position.lng });
      if (mapRef.current) {
        mapRef.current.setView([position.lat, position.lng], 15);
      }
    }
    if (geoError) {
      toast.error(geoError);
    }
  }, [position, geoError, showUserLocation]);

  // Update locations markers
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    // Clear existing markers and circles
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    circlesRef.current.forEach(circle => {
      mapRef.current?.removeLayer(circle);
    });
    markersRef.current = [];
    circlesRef.current = [];

    // Add location markers
    locations.forEach((location) => {
      if (!mapRef.current) return;

      const marker = L.marker([location.latitude, location.longitude], {
        icon: locationIcon
      }).addTo(mapRef.current);

      const popupContent = `
        <div class="min-w-[200px]">
          <div class="font-semibold text-sm">${location.name}</div>
          <p class="text-xs text-gray-600 mt-1">${location.address}</p>
          <div class="flex items-center justify-between mt-2 text-xs">
            <span class="px-2 py-1 rounded-full text-white ${
              location.isActive ? 'bg-green-500' : 'bg-gray-500'
            }">
              ${location.isActive ? 'Hoạt động' : 'Không hoạt động'}
            </span>
            <span class="text-gray-500">
              Bán kính: ${location.radius}m
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);

      // Add radius circle
      const circle = L.circle([location.latitude, location.longitude], {
        radius: location.radius,
        color: location.isActive ? '#22c55e' : '#6b7280',
        fillColor: location.isActive ? '#22c55e' : '#6b7280',
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(mapRef.current);

      circlesRef.current.push(circle);
    });
  }, [locations, isMapReady]);

  // Update user marker
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    // Add new user marker if available
    if (userMarker && showUserLocation) {
      const marker = L.marker([userMarker.lat, userMarker.lng], {
        icon: userIcon
      }).addTo(mapRef.current);

      const popupContent = `
        <div class="text-center">
          <div class="font-semibold text-sm">Vị trí của bạn</div>
          <p class="text-xs text-gray-600 mt-1">
            ${userMarker.lat.toFixed(6)}, ${userMarker.lng.toFixed(6)}
          </p>
        </div>
      `;

      marker.bindPopup(popupContent);
      userMarkerRef.current = marker;
    }
  }, [userMarker, showUserLocation, isMapReady]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
        mapRef.current = null;
      }
      markersRef.current = [];
      circlesRef.current = [];
      userMarkerRef.current = null;
    };
  }, []);

  const handleLocateMe = () => {
    getCurrentPosition();
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
      className={className}
      style={{ height: '100%', width: '100%' }}
      />

      {showUserLocation && (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleLocateMe}
            disabled={geoLoading}
            className="shadow-lg"
          >
            <Locate className={`h-4 w-4 ${geoLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleZoomIn}
            className="shadow-lg"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleZoomOut}
            className="shadow-lg"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
