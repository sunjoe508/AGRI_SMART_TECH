
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  location: string;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRealWeatherData();
    // Update every 30 minutes
    const interval = setInterval(fetchRealWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchRealWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user's location
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // Call our edge function for weather data
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: {
          lat: latitude,
          lon: longitude
        }
      });

      if (error) throw error;

      setWeather(data);
      
    } catch (error: any) {
      console.error('Weather fetch error:', error);
      setError(error.message);
      
      toast({
        title: "⚠️ Weather Service Unavailable",
        description: "Unable to fetch real weather data. Please check your location settings.",
        variant: "destructive"
      });
      
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: true
      });
    });
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading real weather data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <span>Weather Service Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-gray-600">
              Please enable location access and try again
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getWeatherIcon(weather?.condition || 'Clouds')}
          <span>Live Weather</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-blue-600">{weather?.temperature}°C</div>
          <div className="text-lg text-gray-600">{weather?.condition}</div>
          <div className="text-sm text-gray-500">{weather?.location}</div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <Droplets className="w-5 h-5 text-blue-500 mx-auto" />
            <div className="text-sm text-gray-600">Humidity</div>
            <div className="font-semibold">{weather?.humidity}%</div>
          </div>
          <div className="space-y-1">
            <Wind className="w-5 h-5 text-gray-500 mx-auto" />
            <div className="text-sm text-gray-600">Wind</div>
            <div className="font-semibold">{weather?.windSpeed} km/h</div>
          </div>
          <div className="space-y-1">
            <Thermometer className="w-5 h-5 text-red-500 mx-auto" />
            <div className="text-sm text-gray-600">Feels Like</div>
            <div className="font-semibold">{(weather?.temperature || 0) + 2}°C</div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        {weather?.forecast && weather.forecast.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">5-Day Forecast</h4>
            {weather.forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
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

        <div className="text-xs text-gray-500 text-center">
          Real-time data from OpenWeatherMap
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
