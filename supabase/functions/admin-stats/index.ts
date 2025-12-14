import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all stats in parallel
    const [
      profilesResult,
      irrigationResult,
      ordersResult,
      sensorDataResult,
      ticketsResult
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact' }),
      supabase.from('irrigation_logs').select('*', { count: 'exact' }),
      supabase.from('orders').select('*', { count: 'exact' }),
      supabase.from('sensor_data').select('*', { count: 'exact' }),
      supabase.from('support_tickets').select('*', { count: 'exact' })
    ])

    const stats = {
      totalUsers: profilesResult.count || 0,
      totalIrrigationLogs: irrigationResult.count || 0,
      totalOrders: ordersResult.count || 0,
      totalSensorReadings: sensorDataResult.count || 0,
      totalSupportTickets: ticketsResult.count || 0,
      totalFarmRecords: profilesResult.count || 0, // Using profiles as farm records proxy
      activeUsers: profilesResult.data?.length || 0,
      profiles: profilesResult.data || []
    }

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
