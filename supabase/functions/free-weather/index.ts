
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lat, lon } = await req.json()
    
    // Use OpenMeteo API - free weather service
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
    
    const response = await fetch(weatherUrl)
    const data = await response.json()
    
    // Map weather codes to conditions
    const getWeatherCondition = (code: number) => {
      if (code === 0) return 'Clear'
      if (code <= 3) return 'Clouds'
      if (code <= 67) return 'Rain'
      if (code <= 77) return 'Snow'
      return 'Clouds'
    }
    
    const weatherData = {
      temperature: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      condition: getWeatherCondition(data.current.weather_code),
      location: 'Kenya',
      forecast: data.daily.time.slice(0, 5).map((date: string, index: number) => ({
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        high: Math.round(data.daily.temperature_2m_max[index]),
        low: Math.round(data.daily.temperature_2m_min[index]),
        condition: getWeatherCondition(data.daily.weather_code[index])
      }))
    }

    return new Response(
      JSON.stringify(weatherData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Weather fetch error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch weather data' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
