
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets } from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
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

  useEffect(() => {
    // Simulate weather API call with realistic Kenya weather data
    const simulateWeatherData = () => {
      const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      setWeather({
        temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        condition: randomCondition,
        forecast: [
          { day: 'Today', high: 28, low: 18, condition: 'Sunny' },
          { day: 'Tomorrow', high: 26, low: 16, condition: 'Partly Cloudy' },
          { day: 'Thursday', high: 24, low: 15, condition: 'Light Rain' },
          { day: 'Friday', high: 27, low: 17, condition: 'Sunny' },
          { day: 'Saturday', high: 25, low: 16, condition: 'Cloudy' }
        ]
      });
      setLoading(false);
    };

    simulateWeatherData();
    // Update every 30 minutes
    const interval = setInterval(simulateWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Sunny':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'Partly Cloudy':
      case 'Cloudy':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'Light Rain':
      case 'Heavy Rain':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading weather...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getWeatherIcon(weather?.condition || 'Sunny')}
          <span>Weather Forecast</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-blue-600">{weather?.temperature}°C</div>
          <div className="text-lg text-gray-600">{weather?.condition}</div>
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
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">5-Day Forecast</h4>
          {weather?.forecast.map((day, index) => (
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
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
