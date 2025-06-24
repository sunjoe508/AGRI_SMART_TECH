
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer,
  Eye,
  Gauge,
  MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const WeatherDashboard = () => {
  const [currentWeather, setCurrentWeather] = useState({
    location: 'Nairobi, Kenya',
    temperature: 28,
    humidity: 65,
    windSpeed: 12,
    pressure: 1013,
    visibility: 10,
    uvIndex: 7,
    condition: 'Partly Cloudy',
    precipitation: 15
  });

  const [forecast, setForecast] = useState([
    { day: 'Today', temp: 28, humidity: 65, condition: 'Partly Cloudy', rain: 15 },
    { day: 'Tomorrow', temp: 30, humidity: 58, condition: 'Sunny', rain: 5 },
    { day: 'Wed', temp: 26, humidity: 72, condition: 'Rainy', rain: 80 },
    { day: 'Thu', temp: 25, humidity: 75, condition: 'Cloudy', rain: 40 },
    { day: 'Fri', temp: 29, humidity: 60, condition: 'Sunny', rain: 10 },
    { day: 'Sat', temp: 27, humidity: 68, condition: 'Partly Cloudy', rain: 25 },
    { day: 'Sun', temp: 31, humidity: 55, condition: 'Sunny', rain: 0 }
  ]);

  const [hourlyData, setHourlyData] = useState([
    { time: '00:00', temp: 22, humidity: 70 },
    { time: '03:00', temp: 20, humidity: 75 },
    { time: '06:00', temp: 24, humidity: 68 },
    { time: '09:00', temp: 26, humidity: 62 },
    { time: '12:00', temp: 28, humidity: 58 },
    { time: '15:00', temp: 30, humidity: 55 },
    { time: '18:00', temp: 27, humidity: 60 },
    { time: '21:00', temp: 25, humidity: 65 }
  ]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      default:
        return <Cloud className="w-8 h-8 text-blue-400" />;
    }
  };

  const kenyanLocations = [
    { name: 'Nairobi', temp: 28, condition: 'Partly Cloudy' },
    { name: 'Mombasa', temp: 32, condition: 'Sunny' },
    { name: 'Kisumu', temp: 26, condition: 'Rainy' },
    { name: 'Nakuru', temp: 24, condition: 'Cloudy' },
    { name: 'Eldoret', temp: 22, condition: 'Partly Cloudy' },
    { name: 'Nyeri', temp: 20, condition: 'Cloudy' }
  ];

  return (
    <div className="space-y-6">
      {/* Current Weather Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cloud className="w-6 h-6 text-blue-600" />
              <span>Current Weather</span>
            </div>
            <Badge className="bg-blue-500">
              <MapPin className="w-3 h-3 mr-1" />
              {currentWeather.location}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Main Weather Display */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <div className="text-center p-6 bg-white/50 rounded-lg">
                {getWeatherIcon(currentWeather.condition)}
                <h3 className="text-4xl font-bold text-gray-800 mt-2">
                  {currentWeather.temperature}°C
                </h3>
                <p className="text-gray-600 mt-1">{currentWeather.condition}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Feels like {currentWeather.temperature + 2}°C
                </p>
              </div>
            </div>

            {/* Weather Details */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/50 p-4 rounded-lg text-center">
                  <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Humidity</p>
                  <p className="text-xl font-bold text-blue-600">{currentWeather.humidity}%</p>
                </div>

                <div className="bg-white/50 p-4 rounded-lg text-center">
                  <Wind className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Wind Speed</p>
                  <p className="text-xl font-bold text-gray-600">{currentWeather.windSpeed} km/h</p>
                </div>

                <div className="bg-white/50 p-4 rounded-lg text-center">
                  <Gauge className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Pressure</p>
                  <p className="text-xl font-bold text-purple-600">{currentWeather.pressure} hPa</p>
                </div>

                <div className="bg-white/50 p-4 rounded-lg text-center">
                  <Eye className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Visibility</p>
                  <p className="text-xl font-bold text-green-600">{currentWeather.visibility} km</p>
                </div>

                <div className="bg-white/50 p-4 rounded-lg text-center">
                  <CloudRain className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Rain Chance</p>
                  <p className="text-xl font-bold text-blue-600">{currentWeather.precipitation}%</p>
                </div>

                <div className="bg-white/50 p-4 rounded-lg text-center">
                  <Sun className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">UV Index</p>
                  <p className="text-xl font-bold text-orange-600">{currentWeather.uvIndex}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sun className="w-5 h-5 text-orange-500" />
              <span>7-Day Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getWeatherIcon(day.condition)}
                    <div>
                      <p className="font-medium">{day.day}</p>
                      <p className="text-sm text-gray-600">{day.condition}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{day.temp}°C</p>
                    <p className="text-sm text-blue-600">{day.rain}% rain</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Temperature Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              <span>24-Hour Temperature</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                temp: { label: "Temperature", color: "#ef4444" },
                humidity: { label: "Humidity", color: "#3b82f6" }
              }}
            >
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Kenya Weather Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <span>Kenya Weather Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kenyanLocations.map((location, index) => (
              <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-800">{location.name}</h4>
                    <p className="text-sm text-gray-600">{location.condition}</p>
                  </div>
                  <div className="text-right">
                    {getWeatherIcon(location.condition)}
                    <p className="text-xl font-bold text-green-600 mt-1">{location.temp}°C</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherDashboard;
