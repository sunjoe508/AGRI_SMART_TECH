import React, { useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Wheat } from 'lucide-react';

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

const containerStyle = {
  width: '100%',
  height: '500px'
};

// Kenya center coordinates
const defaultCenter = {
  lat: -1.2921,
  lng: 36.8219
};

// Kenya county coordinates for fallback
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
  'Nyandarua': { lat: -0.1833, lng: 36.5167 },
  'Laikipia': { lat: 0.3600, lng: 36.7800 },
  'Muranga': { lat: -0.7833, lng: 37.1500 },
  'Kirinyaga': { lat: -0.5000, lng: 37.3000 },
  'Embu': { lat: -0.5333, lng: 37.4500 },
  'Tharaka-Nithi': { lat: -0.3000, lng: 37.8667 },
  'Trans Nzoia': { lat: 1.0167, lng: 34.9500 },
  'Bungoma': { lat: 0.5667, lng: 34.5667 },
  'Kakamega': { lat: 0.2833, lng: 34.7500 },
  'Vihiga': { lat: 0.0500, lng: 34.7167 },
  'Busia': { lat: 0.4667, lng: 34.1167 },
  'Siaya': { lat: 0.0600, lng: 34.2900 },
  'Homa Bay': { lat: -0.5167, lng: 34.4500 },
  'Migori': { lat: -1.0667, lng: 34.4667 },
  'Kisii': { lat: -0.6833, lng: 34.7667 },
  'Nyamira': { lat: -0.5667, lng: 34.9333 },
  'Kericho': { lat: -0.3692, lng: 35.2863 },
  'Bomet': { lat: -0.7833, lng: 35.3333 },
  'Narok': { lat: -1.0833, lng: 35.8667 },
  'Samburu': { lat: 1.0000, lng: 36.8333 },
  'Turkana': { lat: 3.1167, lng: 35.6000 },
  'West Pokot': { lat: 1.2500, lng: 35.1167 },
  'Baringo': { lat: 0.4667, lng: 35.9833 },
  'Elgeyo Marakwet': { lat: 0.6833, lng: 35.5167 },
  'Nandi': { lat: 0.1833, lng: 35.1333 },
  'Kitui': { lat: -1.3667, lng: 38.0167 },
  'Makueni': { lat: -2.2333, lng: 37.8167 },
  'Taita Taveta': { lat: -3.3167, lng: 38.3500 },
  'Kwale': { lat: -4.1833, lng: 39.4500 },
  'Kilifi': { lat: -3.5167, lng: 39.8500 },
  'Tana River': { lat: -1.5000, lng: 40.0333 },
  'Lamu': { lat: -2.2667, lng: 40.9000 },
  'Garissa': { lat: -0.4536, lng: 39.6401 },
  'Wajir': { lat: 1.7500, lng: 40.0667 },
  'Mandera': { lat: 3.9333, lng: 41.8667 },
  'Marsabit': { lat: 2.3333, lng: 37.9833 },
  'Isiolo': { lat: 0.3500, lng: 37.5833 }
};

const FarmersMap: React.FC<FarmersMapProps> = ({ farmers }) => {
  const [selectedFarmer, setSelectedFarmer] = React.useState<Farmer | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const farmersWithCoordinates = useMemo(() => {
    return farmers.map((farmer, index) => {
      // If farmer has coordinates, use them
      if (farmer.latitude && farmer.longitude) {
        return { ...farmer, lat: farmer.latitude, lng: farmer.longitude };
      }
      
      // Otherwise, use county coordinates with small offset for visibility
      const county = farmer.county || 'Nairobi';
      const coords = countyCoordinates[county] || defaultCenter;
      
      // Add small random offset so farmers in same county don't overlap
      const offset = index * 0.01;
      return {
        ...farmer,
        lat: coords.lat + (Math.random() - 0.5) * 0.1 + offset * 0.001,
        lng: coords.lng + (Math.random() - 0.5) * 0.1 + offset * 0.001
      };
    });
  }, [farmers]);

  const mapCenter = useMemo(() => {
    if (farmersWithCoordinates.length === 0) return defaultCenter;
    
    const avgLat = farmersWithCoordinates.reduce((sum, f) => sum + (f.lat || 0), 0) / farmersWithCoordinates.length;
    const avgLng = farmersWithCoordinates.reduce((sum, f) => sum + (f.lng || 0), 0) / farmersWithCoordinates.length;
    
    return { lat: avgLat || defaultCenter.lat, lng: avgLng || defaultCenter.lng };
  }, [farmersWithCoordinates]);

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-red-600" />
            <span>Google Maps API Key Missing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please configure VITE_GOOGLE_MAPS_API_KEY in your environment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <span>Registered Farmers Map</span>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <Users className="w-4 h-4 mr-1" />
            {farmers.length} Farmers
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={6}
            options={{
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ],
              mapTypeControl: true,
              streetViewControl: false,
              fullscreenControl: true
            }}
          >
            {farmersWithCoordinates.map((farmer) => (
              <Marker
                key={farmer.id}
                position={{ lat: farmer.lat!, lng: farmer.lng! }}
                onClick={() => setSelectedFarmer(farmer)}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#22c55e" stroke="#15803d" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(32, 32),
                  anchor: new window.google.maps.Point(16, 32)
                }}
              />
            ))}

            {selectedFarmer && (
              <InfoWindow
                position={{ 
                  lat: (selectedFarmer as any).lat || defaultCenter.lat, 
                  lng: (selectedFarmer as any).lng || defaultCenter.lng 
                }}
                onCloseClick={() => setSelectedFarmer(null)}
              >
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg text-green-800">
                    {selectedFarmer.full_name || 'Unknown Farmer'}
                  </h3>
                  {selectedFarmer.farm_name && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Wheat className="w-3 h-3 mr-1" />
                      {selectedFarmer.farm_name}
                    </p>
                  )}
                  <div className="mt-2 space-y-1 text-sm">
                    {selectedFarmer.county && (
                      <p><strong>County:</strong> {selectedFarmer.county}</p>
                    )}
                    {selectedFarmer.sub_county && (
                      <p><strong>Sub-County:</strong> {selectedFarmer.sub_county}</p>
                    )}
                    {selectedFarmer.ward && (
                      <p><strong>Ward:</strong> {selectedFarmer.ward}</p>
                    )}
                    {selectedFarmer.phone_number && (
                      <p><strong>Phone:</strong> {selectedFarmer.phone_number}</p>
                    )}
                    {selectedFarmer.farm_size_acres && (
                      <p><strong>Farm Size:</strong> {selectedFarmer.farm_size_acres} acres</p>
                    )}
                    {selectedFarmer.crop_types && selectedFarmer.crop_types.length > 0 && (
                      <div>
                        <strong>Crops:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedFarmer.crop_types.map((crop, i) => (
                            <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-700">{farmers.length}</p>
            <p className="text-xs text-green-600">Total Farmers</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-700">
              {new Set(farmers.map(f => f.county).filter(Boolean)).size}
            </p>
            <p className="text-xs text-blue-600">Counties Covered</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-700">
              {farmers.reduce((sum, f) => sum + (f.farm_size_acres || 0), 0).toFixed(1)}
            </p>
            <p className="text-xs text-yellow-600">Total Acres</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-700">
              {new Set(farmers.flatMap(f => f.crop_types || [])).size}
            </p>
            <p className="text-xs text-purple-600">Crop Varieties</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmersMap;
