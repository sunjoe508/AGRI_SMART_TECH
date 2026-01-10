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
    
    // Create client for auth verification
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized - No token provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    // Verify admin role
    const { data: adminRole, error: adminError } = await supabaseAdmin
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (adminError || !adminRole) {
      return new Response(JSON.stringify({ error: 'Forbidden - Not an admin' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      })
    }

    // Fetch all stats in parallel (only counts, not sensitive data)
    const [
      profilesResult,
      irrigationResult,
      ordersResult,
      sensorDataResult,
      ticketsResult,
      transactionsResult,
      budgetsResult,
      activityResult
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, full_name, county, created_at', { count: 'exact' }),
      supabaseAdmin.from('irrigation_logs').select('*', { count: 'exact' }),
      supabaseAdmin.from('orders').select('*', { count: 'exact' }),
      supabaseAdmin.from('sensor_data').select('*', { count: 'exact' }),
      supabaseAdmin.from('support_tickets').select('*', { count: 'exact' }),
      supabaseAdmin.from('financial_transactions').select('*', { count: 'exact' }),
      supabaseAdmin.from('budgets').select('*', { count: 'exact' }),
      supabaseAdmin.from('activity_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(100)
    ])

    const stats = {
      totalUsers: profilesResult.count || 0,
      totalIrrigationLogs: irrigationResult.count || 0,
      totalOrders: ordersResult.count || 0,
      totalSensorReadings: sensorDataResult.count || 0,
      totalSupportTickets: ticketsResult.count || 0,
      totalTransactions: transactionsResult.count || 0,
      totalBudgets: budgetsResult.count || 0,
      totalFarmRecords: profilesResult.count || 0,
      activeUsers: profilesResult.data?.length || 0,
      recentActivities: activityResult.data || [],
      // Only return non-sensitive profile data
      profiles: (profilesResult.data || []).map(p => ({
        id: p.id,
        full_name: p.full_name,
        county: p.county,
        created_at: p.created_at
      }))
    }

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
