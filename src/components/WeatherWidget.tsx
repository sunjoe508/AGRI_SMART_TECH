
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWeatherData();
    // Update weather every 10 minutes for real-time reporting
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching real-time weather data...');
      
      // Get user's location or use Nairobi as default
      let latitude = -1.2921;
      let longitude = 36.8219;
      
      try {
        const position = await getCurrentPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log('Using user location:', latitude, longitude);
      } catch (geoError) {
        console.log('Using default location (Nairobi, Kenya):', latitude, longitude);
      }
      
      const { data, error } = await supabase.functions.invoke('free-weather', {
        body: { lat: latitude, lon: longitude }
      });

      if (error) {
        console.error('Weather API error:', error);
        throw error;
      }
      
      setWeather(data);
      setLastUpdate(new Date());
      console.log('Weather data updated successfully:', data);
      
    } catch (error: any) {
      console.error('Weather fetch error:', error);
      setError('Unable to fetch live weather data');
      
      // Set Kenya-specific fallback weather data
      setWeather({
        temperature: 24,
        humidity: 65,
        windSpeed: 12,
        condition: 'Clouds',
        location: 'Kenya',
        forecast: [
          { day: 'Today', high: 26, low: 18, condition: 'Clouds' },
          { day: 'Tomorrow', high: 28, low: 19, condition: 'Clear' },
          { day: 'Wed', high: 25, low: 17, condition: 'Rain' },
          { day: 'Thu', high: 27, low: 20, condition: 'Clear' },
          { day: 'Fri', high: 29, low: 21, condition: 'Clouds' }
        ]
      });
      setLastUpdate(new Date());
      
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
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        enableHighAccuracy: false
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
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 border-2 border-blue-200 dark:border-blue-700">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading real-time weather...</p>
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
            <span>Live Weather</span>
          </div>
          {lastUpdate && (
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{weather?.temperature}°C</div>
          <div className="text-lg text-gray-600 dark:text-gray-300">{weather?.condition}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{weather?.location}</div>
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
            <div className="font-semibold">{(weather?.temperature || 0) + 2}°C</div>
          </div>
        </div>

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

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center flex items-center justify-center space-x-2">
          <span>Real-time weather from Open-Meteo</span>
          <Button
            onClick={fetchWeatherData}
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
          >
            Refresh
          </Button>
        </div>
        
        {error && (
          <div className="text-xs text-orange-600 text-center flex items-center justify-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Using fallback data</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
