
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DailyReportData {
  userId: string;
  email: string;
  irrigationSummary: any;
  sensorSummary: any;
  weatherSummary: any;
  recommendations: string[];
  cropSuggestions: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users who need daily reports
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .not('full_name', 'is', null);

    if (profilesError) throw profilesError;

    const today = new Date().toISOString().split('T')[0];

    for (const profile of profiles) {
      try {
        // Get recent irrigation data
        const { data: irrigationData } = await supabase
          .from('irrigation_logs')
          .select('*')
          .eq('user_id', profile.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });

        // Get recent sensor data
        const { data: sensorData } = await supabase
          .from('sensor_data')
          .select('*')
          .eq('user_id', profile.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });

        // Generate recommendations based on data
        const recommendations = generateRecommendations(irrigationData, sensorData);
        const cropSuggestions = generateCropSuggestions(sensorData);

        // Generate weather summary (simulated)
        const weatherSummary = {
          averageTemp: Math.floor(Math.random() * 10) + 20,
          humidity: Math.floor(Math.random() * 40) + 40,
          rainfall: Math.floor(Math.random() * 20),
          conditions: ['Sunny', 'Partly Cloudy', 'Light Rain'][Math.floor(Math.random() * 3)]
        };

        // Create irrigation summary
        const irrigationSummary = {
          totalSessions: irrigationData?.length || 0,
          totalWaterUsed: irrigationData?.reduce((sum, log) => sum + (log.water_amount_liters || 0), 0) || 0,
          averageDuration: irrigationData?.length > 0 ? 
            irrigationData.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / irrigationData.length : 0
        };

        // Create sensor summary
        const sensorSummary = {
          totalReadings: sensorData?.length || 0,
          averageSoilMoisture: sensorData?.filter(s => s.sensor_type === 'soil_moisture')
            .reduce((sum, s, _, arr) => sum + s.value / arr.length, 0) || 0,
          averageTemperature: sensorData?.filter(s => s.sensor_type === 'temperature')
            .reduce((sum, s, _, arr) => sum + s.value / arr.length, 0) || 0
        };

        // Save daily report
        const { error: reportError } = await supabase
          .from('daily_reports')
          .upsert({
            user_id: profile.id,
            report_date: today,
            irrigation_summary: irrigationSummary,
            weather_summary: weatherSummary,
            sensor_summary: sensorSummary,
            recommendations: recommendations,
            crop_suggestions: cropSuggestions,
            sent_at: new Date().toISOString()
          });

        if (reportError) {
          console.error(`Error saving report for user ${profile.id}:`, reportError);
        }

        // Send OTP message (simulated email report)
        const { error: otpError } = await supabase
          .from('otp_messages')
          .insert({
            user_id: profile.id,
            phone_number: 'email_report',
            otp_code: 'DAILY_REPORT',
            message_type: 'daily_report',
            status: 'sent',
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          });

        if (otpError) {
          console.error(`Error creating OTP record for user ${profile.id}:`, otpError);
        }

      } catch (userError) {
        console.error(`Error processing user ${profile.id}:`, userError);
      }
    }

    return new Response(
      JSON.stringify({ message: "Daily reports generated successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-daily-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateRecommendations(irrigationData: any[], sensorData: any[]): string[] {
  const recommendations: string[] = [];

  // Analyze irrigation patterns
  if (irrigationData && irrigationData.length > 0) {
    const avgWaterUsage = irrigationData.reduce((sum, log) => sum + (log.water_amount_liters || 0), 0) / irrigationData.length;
    if (avgWaterUsage > 200) {
      recommendations.push("Consider reducing water usage - current levels may be excessive for most crops");
    } else if (avgWaterUsage < 50) {
      recommendations.push("Water usage seems low - ensure crops are receiving adequate irrigation");
    }
  }

  // Analyze sensor data
  if (sensorData && sensorData.length > 0) {
    const soilMoistureReadings = sensorData.filter(s => s.sensor_type === 'soil_moisture');
    const tempReadings = sensorData.filter(s => s.sensor_type === 'temperature');

    if (soilMoistureReadings.length > 0) {
      const avgMoisture = soilMoistureReadings.reduce((sum, s) => sum + s.value, 0) / soilMoistureReadings.length;
      if (avgMoisture < 30) {
        recommendations.push("Soil moisture is low - increase irrigation frequency");
      } else if (avgMoisture > 70) {
        recommendations.push("Soil moisture is high - reduce irrigation to prevent waterlogging");
      }
    }

    if (tempReadings.length > 0) {
      const avgTemp = tempReadings.reduce((sum, s) => sum + s.value, 0) / tempReadings.length;
      if (avgTemp > 30) {
        recommendations.push("High temperatures detected - consider shade nets or increased irrigation");
      } else if (avgTemp < 15) {
        recommendations.push("Low temperatures - protect sensitive crops from cold stress");
      }
    }
  }

  // Default recommendations
  if (recommendations.length === 0) {
    recommendations.push("Monitor soil moisture levels regularly for optimal crop growth");
    recommendations.push("Check weather forecast for upcoming irrigation planning");
  }

  return recommendations;
}

function generateCropSuggestions(sensorData: any[]): string[] {
  const suggestions: string[] = [];

  if (sensorData && sensorData.length > 0) {
    const soilMoistureReadings = sensorData.filter(s => s.sensor_type === 'soil_moisture');
    const tempReadings = sensorData.filter(s => s.sensor_type === 'temperature');

    if (soilMoistureReadings.length > 0 && tempReadings.length > 0) {
      const avgMoisture = soilMoistureReadings.reduce((sum, s) => sum + s.value, 0) / soilMoistureReadings.length;
      const avgTemp = tempReadings.reduce((sum, s) => sum + s.value, 0) / tempReadings.length;

      if (avgTemp >= 20 && avgTemp <= 30 && avgMoisture >= 40) {
        suggestions.push("Maize - ideal temperature and moisture conditions");
        suggestions.push("Beans - suitable for current environment");
      }

      if (avgTemp >= 15 && avgTemp <= 25 && avgMoisture >= 50) {
        suggestions.push("Vegetables (tomatoes, cabbages) - good growing conditions");
      }

      if (avgTemp >= 25 && avgMoisture >= 30) {
        suggestions.push("Drought-resistant crops like sorghum or millet");
      }
    }
  }

  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push("Maize - Kenya's staple crop, suitable for most regions");
    suggestions.push("Beans - nitrogen-fixing crop, good for soil health");
    suggestions.push("Vegetables - high value crops for local markets");
  }

  return suggestions;
}

serve(handler);
