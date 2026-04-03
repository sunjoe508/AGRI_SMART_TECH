
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, AlertTriangle, MapPin, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  agriculturalAdvice: string[];
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    agriculturalRecommendation: string;
  }>;
  lastUpdated: string;
  source: string;
  isEstimated?: boolean;
}

interface WeatherWidgetProps {
  user?: any;
}

const WeatherWidget = ({ user }: WeatherWidgetProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<string>('Kenya');
  const { toast } = useToast();

  // Get user profile data for location
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      const location = `${profile.county || 'Kenya'}${profile.ward ? ', ' + profile.ward : ''}`;
      setUserLocation(location);
    }
    fetchWeatherData();
    // Update weather every 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [profile]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌤️ Fetching weather data for AgriSmart...');
      
      // Default coordinates for Kenya regions
      let latitude = -1.2921; // Nairobi default
      let longitude = 36.8219;
      let locationName = userLocation || 'Nairobi, Kenya';

      // Map counties to approximate coordinates
      if (profile?.county) {
        const countyCoords = getCountyCoordinates(profile.county);
        latitude = countyCoords.lat;
        longitude = countyCoords.lon;
        locationName = `${profile.county}, Kenya`;
      }

      try {
        // Try to get user's precise location
        const position = await getCurrentPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log('📍 Using user location:', latitude, longitude);
      } catch (geoError) {
        console.log('📍 Using county/default location');
      }
      
      const { data, error } = await supabase.functions.invoke('free-weather', {
        body: { 
          lat: latitude, 
          lon: longitude,
          location: locationName 
        }
      });

      if (error) {
        console.error('❌ Weather API error:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Weather data received:', data);
        setWeather(data);
        
        toast({
          title: "🌤️ Weather Updated",
          description: `Live weather data for ${data.location} updated successfully`,
        });
      }
      
    } catch (error: any) {
      console.error('❌ Weather fetch error:', error);
      setError('Unable to fetch live weather data');
      
      // Enhanced fallback with location-specific data
      const fallbackWeather = generateLocationBasedFallback(userLocation);
      setWeather(fallbackWeather);
      
      toast({
        title: "⚠️ Weather Fallback",
        description: `Using estimated weather data for ${userLocation}`,
        variant: "destructive"
      });
      
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        resolve, 
        reject, 
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  };

  const getCountyCoordinates = (county: string) => {
    const coordinates: { [key: string]: { lat: number; lon: number } } = {
      'Nairobi': { lat: -1.2921, lon: 36.8219 },
      'Kiambu': { lat: -1.1748, lon: 36.8356 },
      'Nakuru': { lat: -0.3031, lon: 36.0800 },
      'Meru': { lat: 0.0469, lon: 37.6556 },
      'Kisumu': { lat: -0.0917, lon: 34.7680 },
      'Uasin Gishu': { lat: 0.5143, lon: 35.2698 },
      'Nyeri': { lat: -0.4167, lon: 36.9500 },
      'Busia': { lat: 0.4604, lon: 34.1118 },
      'Murang\'a': { lat: -0.7167, lon: 37.1500 },
      'Kericho': { lat: -0.3691, lon: 35.2861 },
      'Embu': { lat: -0.5312, lon: 37.4504 },
      'Bungoma': { lat: 0.5635, lon: 34.5606 },
      'Kirinyaga': { lat: -0.5090, lon: 37.2803 },
      'Machakos': { lat: -1.5177, lon: 37.2634 },
      'Nandi': { lat: 0.1833, lon: 35.1167 },
      'Siaya': { lat: 0.0607, lon: 34.2881 },
      'Laikipia': { lat: 0.0000, lon: 36.7833 },
      'Nyandarua': { lat: -0.3167, lon: 36.3500 },
      'Kakamega': { lat: 0.2827, lon: 34.7519 },
      'Bomet': { lat: -0.7833, lon: 35.3417 },
      'Homa Bay': { lat: -0.5273, lon: 34.4571 },
      'Kajiado': { lat: -1.8500, lon: 36.7833 },
      'Mombasa': { lat: -4.0435, lon: 39.6682 },
      'Tharaka Nithi': { lat: -0.3000, lon: 37.8000 },
      'Makueni': { lat: -1.8000, lon: 37.6167 },
      'Kitui': { lat: -1.3667, lon: 38.0167 },
      'Garissa': { lat: -0.4532, lon: 39.6461 },
      'Wajir': { lat: 1.7471, lon: 40.0573 },
      'Mandera': { lat: 3.9373, lon: 41.8569 },
    };
    
    return coordinates[county] || { lat: -1.2921, lon: 36.8219 };
  };

  const generateLocationBasedFallback = (location: string): WeatherData => {
    // Generate realistic weather based on Kenyan climate patterns
    const baseTemp = location.includes('Nairobi') ? 22 : 
                    location.includes('Mombasa') ? 28 :
                    location.includes('Eldoret') ? 18 : 
                    location.includes('Kisumu') ? 26 : 24;
    
    const currentTemp = baseTemp + Math.round(Math.random() * 8 - 4);
    const humidity = 60 + Math.round(Math.random() * 20);
    const condition = Math.random() < 0.3 ? 'Rain' : Math.random() < 0.6 ? 'Clouds' : 'Clear';
    
    return {
      temperature: currentTemp,
      humidity: humidity,
      windSpeed: 8 + Math.round(Math.random() * 12),
      condition: condition,
      location: location,
      coordinates: { lat: -1.2921, lon: 36.8219 },
      agriculturalAdvice: getAgriculturalAdvice(condition, currentTemp, humidity),
      forecast: generateRealisticForecast(),
      lastUpdated: new Date().toISOString(),
      source: 'AgriSmart Fallback Weather Service',
      isEstimated: true
    };
  };

  const getAgriculturalAdvice = (condition: string, temp: number, humidity: number) => {
    const advice = [];
    
    if (condition === 'Rain') {
      advice.push('Good conditions for soil moisture. Reduce irrigation.');
      advice.push('Monitor for plant diseases in high humidity.');
    } else if (condition === 'Clear' && temp > 30) {
      advice.push('High temperature alert. Increase irrigation frequency.');
      advice.push('Consider shade protection for sensitive crops.');
    } else if (condition === 'Clear' && temp < 15) {
      advice.push('Cool weather. Monitor for frost risk.');
      advice.push('Consider protective covering for tender plants.');
    }
    
    if (humidity > 80) {
      advice.push('High humidity - watch for fungal diseases.');
    } else if (humidity < 40) {
      advice.push('Low humidity - increase watering frequency.');
    }
    
    return advice;
  };

  const generateRealisticForecast = () => {
    const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri'];
    const conditions = ['Clear', 'Clouds', 'Rain'];
    
    return days.map(day => ({
      day,
      high: 20 + Math.round(Math.random() * 15), // 20-35°C
      low: 12 + Math.round(Math.random() * 8),   // 12-20°C
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      agriculturalRecommendation: getAgriculturalRecommendation(conditions[Math.floor(Math.random() * conditions.length)])
    }));
  };

  const getAgriculturalRecommendation = (condition: string): string => {
    if (condition === 'Rain') return 'Natural irrigation - reduce watering';
    if (condition === 'Clear') return 'Good for field work and harvesting';
    if (condition === 'Clouds') return 'Stable conditions - normal care';
    return 'Monitor crops regularly';
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clear':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'Clouds':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'Rain':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      default:
        return <Cloud className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleManualRefresh = () => {
    toast({
      title: "🔄 Refreshing Weather",
      description: "Fetching latest weather data...",
    });
    fetchWeatherData();
  };

  const handleLocationUpdate = async () => {
    toast({
      title: "📍 Updating Location",
      description: "Getting your current location...",
    });
    
    try {
      const position = await getCurrentPosition();
      const newLocation = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
      setUserLocation(newLocation);
      fetchWeatherData();
      
      toast({
        title: "✅ Location Updated",
        description: `Location updated successfully`,
      });
    } catch (error) {
      toast({
        title: "❌ Location Error",
        description: "Could not get your location. Using profile location.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 border-2 border-blue-200 dark:border-blue-700">
        <CardContent className="p-6">
          <div className="text-center">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading weather for {userLocation}...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 border-2 border-blue-200 dark:border-blue-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getWeatherIcon(weather?.condition || 'Clouds')}
            <span>AgriSmart Weather</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{weather?.temperature}°C</div>
          <div className="text-lg text-gray-600 dark:text-gray-300">{weather?.condition}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{weather?.location}</span>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <Droplets className="w-5 h-5 text-blue-500 mx-auto" />
            <div className="text-sm text-gray-600 dark:text-gray-300">Humidity</div>
            <div className="font-semibold">{weather?.humidity}%</div>
          </div>
          <div className="space-y-1">
            <Wind className="w-5 h-5 text-gray-500 mx-auto" />
            <div className="text-sm text-gray-600 dark:text-gray-300">Wind</div>
            <div className="font-semibold">{weather?.windSpeed} km/h</div>
          </div>
          <div className="space-y-1">
            <Thermometer className="w-5 h-5 text-red-500 mx-auto" />
            <div className="text-sm text-gray-600 dark:text-gray-300">Feels Like</div>
            <div className="font-semibold">{((weather?.temperature || 0) + Math.round((weather?.humidity || 0) * 0.05))}°C</div>
          </div>
        </div>

        {/* Agricultural Advice */}
        {weather?.agriculturalAdvice && weather.agriculturalAdvice.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">🌱 Agricultural Advice</h4>
            <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
              {weather.agriculturalAdvice.map((advice, index) => (
                <p key={index} className="text-sm text-green-800 dark:text-green-200">• {advice}</p>
              ))}
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {weather?.forecast && weather.forecast.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">5-Day Forecast</h4>
            {weather.forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium">{day.day}</span>
                <div className="flex items-center space-x-2">
                  {getWeatherIcon(day.condition)}
                  <span className="text-sm">{day.condition}</span>
                </div>
                <span className="text-sm font-semibold">
                  {day.high}°/{day.low}°
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={handleManualRefresh}
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Weather
          </Button>
          
          <Button
            onClick={handleLocationUpdate}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Update Location
          </Button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <span>{weather?.source} • Last updated: {weather?.lastUpdated ? new Date(weather.lastUpdated).toLocaleTimeString() : 'Now'}</span>
        </div>
        
        {error && (
          <div className="text-xs text-orange-600 text-center flex items-center justify-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Using fallback data - Check connection</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
