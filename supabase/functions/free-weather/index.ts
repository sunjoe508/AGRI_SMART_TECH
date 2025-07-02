
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon, location } = await req.json();
    
    console.log(`🌤️ AgriSmart Weather: Fetching for coordinates: ${lat}, ${lon}, Location: ${location}`);

    // Use Open-Meteo API (free and reliable for agriculture)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
    
    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🌍 Weather API response received:', data.current);

    // Enhanced weather code mapping for agriculture
    const getWeatherCondition = (code: number) => {
      if (code === 0) return 'Clear';
      if (code <= 3) return 'Clouds';
      if (code >= 51 && code <= 67) return 'Rain';
      if (code >= 71 && code <= 77) return 'Snow';
      if (code >= 80 && code <= 82) return 'Rain';
      if (code >= 95 && code <= 99) return 'Thunderstorm';
      return 'Clouds';
    };

    // Get agricultural recommendations based on weather
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

    // Format the enhanced response for AgriSmart
    const currentTemp = Math.round(data.current.temperature_2m);
    const currentHumidity = data.current.relative_humidity_2m;
    const currentCondition = getWeatherCondition(data.current.weather_code);
    
    const weatherData = {
      temperature: currentTemp,
      humidity: currentHumidity,
      windSpeed: Math.round(data.current.wind_speed_10m),
      condition: currentCondition,
      location: location || 'Kenya',
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      agriculturalAdvice: getAgriculturalAdvice(currentCondition, currentTemp, currentHumidity),
      forecast: data.daily.time.slice(0, 5).map((date: string, index: number) => {
        const dayCondition = getWeatherCondition(data.daily.weather_code[index]);
        return {
          day: index === 0 ? 'Today' : 
               index === 1 ? 'Tomorrow' : 
               new Date(date).toLocaleDateString('en', { weekday: 'short' }),
          high: Math.round(data.daily.temperature_2m_max[index]),
          low: Math.round(data.daily.temperature_2m_min[index]),
          condition: dayCondition,
          agriculturalRecommendation: getAgriculturalRecommendation(dayCondition, data.daily.temperature_2m_max[index])
        };
      }),
      lastUpdated: new Date().toISOString(),
      source: 'Open-Meteo Agricultural Weather Service'
    };

    console.log('✅ AgriSmart weather data formatted:', {
      location: weatherData.location,
      temperature: weatherData.temperature,
      condition: weatherData.condition,
      forecastDays: weatherData.forecast.length
    });

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ AgriSmart Weather fetch error:', error);
    
    // Enhanced Kenya-specific fallback weather data
    const kenyaLocations = {
      'Nairobi': { temp: 22, humidity: 65, condition: 'Clouds' },
      'Mombasa': { temp: 28, humidity: 75, condition: 'Clear' },
      'Kisumu': { temp: 26, humidity: 70, condition: 'Clouds' },
      'Eldoret': { temp: 18, humidity: 60, condition: 'Clear' },
      'Nakuru': { temp: 20, humidity: 65, condition: 'Clouds' }
    };
    
    // Determine location-based fallback
    const locationKey = Object.keys(kenyaLocations).find(city => 
      (req.body?.location || '').includes(city)
    ) || 'Nairobi';
    
    const locationData = kenyaLocations[locationKey as keyof typeof kenyaLocations];
    
    const fallbackData = {
      temperature: locationData.temp + Math.round(Math.random() * 6 - 3), // ±3°C variation
      humidity: locationData.humidity + Math.round(Math.random() * 10 - 5),
      windSpeed: 8 + Math.round(Math.random() * 12),
      condition: locationData.condition,
      location: `${locationKey}, Kenya`,
      coordinates: { lat: -1.2921, lon: 36.8219 },
      agriculturalAdvice: [
        'Fallback weather data - Check connection for live updates',
        'Monitor crops regularly during weather uncertainty',
        'Maintain consistent irrigation schedule'
      ],
      forecast: [
        { day: 'Today', high: locationData.temp + 3, low: locationData.temp - 5, condition: locationData.condition, agriculturalRecommendation: 'Monitor soil moisture' },
        { day: 'Tomorrow', high: locationData.temp + 4, low: locationData.temp - 4, condition: 'Clear', agriculturalRecommendation: 'Good planting conditions' },
        { day: 'Wed', high: locationData.temp + 2, low: locationData.temp - 6, condition: 'Clouds', agriculturalRecommendation: 'Stable growing weather' },
        { day: 'Thu', high: locationData.temp + 5, low: locationData.temp - 3, condition: 'Clear', agriculturalRecommendation: 'Optimal for field work' },
        { day: 'Fri', high: locationData.temp + 3, low: locationData.temp - 4, condition: 'Rain', agriculturalRecommendation: 'Natural irrigation expected' }
      ],
      lastUpdated: new Date().toISOString(),
      source: 'AgriSmart Fallback Weather Service',
      isEstimated: true
    };

    console.log('🔄 AgriSmart fallback weather data generated for:', locationKey);

    return new Response(JSON.stringify(fallbackData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function for agricultural recommendations
function getAgriculturalRecommendation(condition: string, maxTemp: number): string {
  if (condition === 'Rain') return 'Natural irrigation - reduce watering';
  if (condition === 'Clear' && maxTemp > 30) return 'Hot day - increase irrigation';
  if (condition === 'Clear' && maxTemp < 20) return 'Cool weather - monitor growth';
  if (condition === 'Clouds') return 'Stable conditions - normal care';
  return 'Monitor crops regularly';
}
