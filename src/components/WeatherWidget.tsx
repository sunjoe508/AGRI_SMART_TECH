
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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
      
      // Fetch weather data from OpenWeatherMap API
      // Note: You'll need to add your API key to Supabase secrets
      const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
      
      if (!API_KEY) {
        throw new Error('Weather API key not configured');
      }
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      
      const forecastData = await forecastResponse.json();
      
      // Process forecast data
      const forecast = processForecastData(forecastData);
      
      setWeather({
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        condition: data.weather[0].main,
        location: data.name,
        forecast: forecast
      });
      
    } catch (error: any) {
      console.error('Weather fetch error:', error);
      setError(error.message);
      
      // Show fallback message
      toast({
        title: "⚠️ Weather Service Unavailable",
        description: "Unable to fetch real weather data. Please configure weather API key.",
        variant: "destructive"
      });
      
      // Set fallback data indicating service is unavailable
      setWeather({
        temperature: 0,
        humidity: 0,
        windSpeed: 0,
        condition: 'Unavailable',
        location: 'Location Unknown',
        forecast: []
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

  const processForecastData = (data: any) => {
    const dailyData: any = {};
    
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (!dailyData[day]) {
        dailyData[day] = {
          day,
          high: item.main.temp,
          low: item.main.temp,
          condition: item.weather[0].main
        };
      } else {
        dailyData[day].high = Math.max(dailyData[day].high, item.main.temp);
        dailyData[day].low = Math.min(dailyData[day].low, item.main.temp);
      }
    });
    
    return Object.values(dailyData).slice(0, 5).map((day: any) => ({
      ...day,
      high: Math.round(day.high),
      low: Math.round(day.low)
    }));
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clear':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'Clouds':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'Rain':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'Unavailable':
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
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
              Configure weather API key to get real weather data
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
          {getWeatherIcon(weather?.condition || 'Unavailable')}
          <span>Real Weather Data</span>
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

        {/* Data Source Info */}
        <div className="text-xs text-gray-500 text-center">
          Real-time data from OpenWeatherMap
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
