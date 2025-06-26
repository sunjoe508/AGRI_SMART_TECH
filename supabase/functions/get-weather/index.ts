
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    
    const WEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY')
    if (!WEATHER_API_KEY) {
      throw new Error('Weather API key not configured')
    }

    // Fetch current weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    )
    
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data')
    }
    
    const weatherData = await weatherResponse.json()
    
    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    )
    
    const forecastData = await forecastResponse.json()
    
    // Process forecast data to get daily forecasts
    const dailyForecasts = []
    const processedDates = new Set()
    
    for (const item of forecastData.list.slice(0, 15)) {
      const date = new Date(item.dt * 1000).toDateString()
      if (!processedDates.has(date) && dailyForecasts.length < 5) {
        dailyForecasts.push({
          day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          condition: item.weather[0].main
        })
        processedDates.add(date)
      }
    }

    const response = {
      temperature: Math.round(weatherData.main.temp),
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
      condition: weatherData.weather[0].main,
      location: weatherData.name,
      forecast: dailyForecasts
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
