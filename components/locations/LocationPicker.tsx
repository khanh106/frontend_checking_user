'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Navigation, Crosshair, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useGeolocation, reverseGeocode } from '@/lib/utils/geolocation'

export interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  defaultLocation?: { lat: number; lng: number }
  className?: string
  onCancel?: () => void
  radius?: number
}

// Custom marker icon
const pickLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function LocationPicker({ 
  onLocationSelect, 
  defaultLocation, 
  className, 
  onCancel,
  radius = 100 
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    defaultLocation || null
  );
  const [address, setAddress] = useState('');
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  
  const { position, loading: geoLoading, getCurrentPosition } = useGeolocation();

  const center: [number, number] = useMemo(() => 
    selectedLocation 
      ? [selectedLocation.lat, selectedLocation.lng] 
      : [10.762622, 106.660172], // Default HCMC
    [selectedLocation]
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
        center: center,
        zoom: 15,
        scrollWheelZoom: true,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add click handler
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
        setSelectedLocation(coords);
        await handleReverseGeocode(coords.lat, coords.lng);
      });

      mapRef.current = map;
      setIsMapReady(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Không thể khởi tạo bản đồ');
    }
  }, [center]);

  // Handle geolocation result
  useEffect(() => {
    if (position) {
      setSelectedLocation({ lat: position.lat, lng: position.lng });
      handleReverseGeocode(position.lat, position.lng);
      if (mapRef.current) {
        mapRef.current.setView([position.lat, position.lng], 15);
      }
      toast.success('Đã lấy vị trí hiện tại');
    }
  }, [position]);

  const handleReverseGeocode = async (lat: number, lng: number) => {
    setIsGeocodingAddress(true);
    try {
      const geocodedAddress = await reverseGeocode(lat, lng);
      setAddress(geocodedAddress);
    } catch (error) {
      console.error('Geocoding error:', error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  // Update marker and circle
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    // Remove existing marker and circle
    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    if (circleRef.current) {
      mapRef.current.removeLayer(circleRef.current);
      circleRef.current = null;
    }

    // Add new marker and circle if location selected
    if (selectedLocation) {
      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: pickLocationIcon
      }).addTo(mapRef.current);

      const circle = L.circle([selectedLocation.lat, selectedLocation.lng], {
        radius: radius,
        color: '#22c55e',
        fillColor: '#22c55e',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(mapRef.current);

      markerRef.current = marker;
      circleRef.current = circle;
    }
  }, [selectedLocation, radius, isMapReady]);

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
      markerRef.current = null;
      circleRef.current = null;
    };
  }, []);

  const handleGetCurrentLocation = () => {
    getCurrentPosition();
  };

  const handleConfirm = () => {
    if (selectedLocation && address) {
      onLocationSelect({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address
      });
    } else {
      toast.error('Vui lòng chọn một vị trí');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Chọn vị trí trên bản đồ</span>
          </div>
          {(isGeocodingAddress || geoLoading) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleGetCurrentLocation}
            disabled={geoLoading}
            className="flex items-center space-x-2"
          >
            <Crosshair className={`h-4 w-4 ${geoLoading ? 'animate-spin' : ''}`} />
            <span>{geoLoading ? 'Đang lấy vị trí...' : 'Vị trí hiện tại'}</span>
          </Button>
          
          {selectedLocation && (
            <div className="text-sm text-muted-foreground flex items-center space-x-2 px-3 py-2 bg-muted rounded-md">
              <MapPin className="h-3 w-3" />
              <span>
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </span>
            </div>
          )}
        </div>

        <div className="h-[400px] w-full rounded-lg overflow-hidden border">
          <div
            ref={mapContainerRef}
            style={{ height: '100%', width: '100%' }}
            />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Địa chỉ</Label>
          <div className="relative">
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
              placeholder="Click vào bản đồ để chọn vị trí..."
              disabled={isGeocodingAddress}
            />
            {isGeocodingAddress && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Click vào bản đồ để chọn vị trí mới. Địa chỉ sẽ được tự động tạo.
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button 
              type="button"
              variant="outline" 
              onClick={onCancel}
            >
              Hủy
            </Button>
          )}
          <Button 
            onClick={handleConfirm}
            disabled={!selectedLocation || !address || isGeocodingAddress}
            className="flex items-center space-x-2"
          >
            <Navigation className="h-4 w-4" />
            <span>Xác nhận vị trí</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
