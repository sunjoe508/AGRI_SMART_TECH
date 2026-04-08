import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Wheat } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Farmer {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  county: string | null;
  sub_county: string | null;
  ward: string | null;
  farm_name: string | null;
  crop_types: string[] | null;
  farm_size_acres: number | null;
  latitude: number | null;
  longitude: number | null;
}

interface FarmersMapProps {
  farmers: Farmer[];
}

const defaultCenter: [number, number] = [-1.2921, 36.8219];

const countyCoordinates: Record<string, { lat: number; lng: number }> = {
  'Nairobi': { lat: -1.2921, lng: 36.8219 },
  'Kiambu': { lat: -1.1714, lng: 36.8356 },
  'Nakuru': { lat: -0.3031, lng: 36.0800 },
  'Mombasa': { lat: -4.0435, lng: 39.6682 },
  'Kisumu': { lat: -0.1022, lng: 34.7617 },
  'Uasin Gishu': { lat: 0.5143, lng: 35.2698 },
  'Machakos': { lat: -1.5177, lng: 37.2634 },
  'Kajiado': { lat: -1.8519, lng: 36.7768 },
  'Meru': { lat: 0.0500, lng: 37.6500 },
  'Nyeri': { lat: -0.4167, lng: 36.9500 },
  'Kirinyaga': { lat: -0.5000, lng: 37.3000 },
  'Embu': { lat: -0.5333, lng: 37.4500 },
};

const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10 });
    }
  }, [positions, map]);
  return null;
};

const FarmersMap: React.FC<FarmersMapProps> = ({ farmers }) => {
  const farmersWithCoordinates = useMemo(() => {
    return farmers.map((farmer, index) => {
      if (farmer.latitude && farmer.longitude) {
        return { ...farmer, lat: farmer.latitude, lng: farmer.longitude };
      }
      const county = farmer.county || 'Nairobi';
      const coords = countyCoordinates[county] || { lat: defaultCenter[0], lng: defaultCenter[1] };
      const offset = index * 0.01;
      return {
        ...farmer,
        lat: coords.lat + (Math.random() - 0.5) * 0.1 + offset * 0.001,
        lng: coords.lng + (Math.random() - 0.5) * 0.1 + offset * 0.001
      };
    });
  }, [farmers]);

  const mapCenter = useMemo((): [number, number] => {
    if (farmersWithCoordinates.length === 0) return defaultCenter;
    const avgLat = farmersWithCoordinates.reduce((sum, f) => sum + (f.lat || 0), 0) / farmersWithCoordinates.length;
    const avgLng = farmersWithCoordinates.reduce((sum, f) => sum + (f.lng || 0), 0) / farmersWithCoordinates.length;
    return [avgLat || defaultCenter[0], avgLng || defaultCenter[1]];
  }, [farmersWithCoordinates]);

  const positions = useMemo(() => farmersWithCoordinates.map(f => [f.lat!, f.lng!] as [number, number]), [farmersWithCoordinates]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 md:pb-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-foreground">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-base md:text-lg">Registered Farmers Map</span>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary w-fit">
            <Users className="w-4 h-4 mr-1" />
            {farmers.length} Farmers
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-6">
        <div className="rounded-lg overflow-hidden" style={{ height: '400px' }}>
          <MapContainer center={mapCenter} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {positions.length > 0 && <FitBounds positions={positions} />}
            {farmersWithCoordinates.map((farmer) => (
              <Marker key={farmer.id} position={[farmer.lat!, farmer.lng!]} icon={greenIcon}>
                <Popup>
                  <div className="min-w-[180px]">
                    <h3 className="font-bold text-sm">{farmer.full_name || 'Unknown Farmer'}</h3>
                    {farmer.farm_name && <p className="text-xs text-muted-foreground">{farmer.farm_name}</p>}
                    <div className="mt-1 space-y-0.5 text-xs">
                      {farmer.county && <p><strong>County:</strong> {farmer.county}</p>}
                      {farmer.sub_county && <p><strong>Sub-County:</strong> {farmer.sub_county}</p>}
                      {farmer.phone_number && <p><strong>Phone:</strong> {farmer.phone_number}</p>}
                      {farmer.farm_size_acres && <p><strong>Farm Size:</strong> {farmer.farm_size_acres} acres</p>}
                      {farmer.crop_types && farmer.crop_types.length > 0 && (
                        <p><strong>Crops:</strong> {farmer.crop_types.join(', ')}</p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="p-2 md:p-3 bg-primary/10 rounded-lg text-center">
            <p className="text-lg md:text-2xl font-bold text-primary">{farmers.length}</p>
            <p className="text-xs text-muted-foreground">Total Farmers</p>
          </div>
          <div className="p-2 md:p-3 bg-blue-500/10 rounded-lg text-center">
            <p className="text-lg md:text-2xl font-bold text-blue-500">
              {new Set(farmers.map(f => f.county).filter(Boolean)).size}
            </p>
            <p className="text-xs text-muted-foreground">Counties</p>
          </div>
          <div className="p-2 md:p-3 bg-yellow-500/10 rounded-lg text-center">
            <p className="text-lg md:text-2xl font-bold text-yellow-500">
              {farmers.reduce((sum, f) => sum + (f.farm_size_acres || 0), 0).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Acres</p>
          </div>
          <div className="p-2 md:p-3 bg-purple-500/10 rounded-lg text-center">
            <p className="text-lg md:text-2xl font-bold text-purple-500">
              {new Set(farmers.flatMap(f => f.crop_types || [])).size}
            </p>
            <p className="text-xs text-muted-foreground">Crop Types</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmersMap;
