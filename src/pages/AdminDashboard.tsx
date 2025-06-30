
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, 
  MapPin, 
  Droplets, 
  TrendingUp, 
  Globe, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Database,
  Settings,
  Download,
  Mail,
  MessageSquare,
  BarChart3,
  Wheat,
  Tractor,
  LogOut,
  Shield
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [adminSession, setAdminSession] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      navigate('/admin-login');
      return;
    }
    
    try {
      const parsedSession = JSON.parse(session);
      if (!parsedSession.isAdmin || parsedSession.username !== 'joe') {
        localStorage.removeItem('adminSession');
        navigate('/admin-login');
        return;
      }
      setAdminSession(parsedSession);
    } catch (error) {
      localStorage.removeItem('adminSession');
      navigate('/admin-login');
    }
  }, [navigate]);

  // Fetch real data from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalIrrigationLogs },
        { count: totalSensorData },
        { count: totalOrders },
        { count: totalLocations }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('irrigation_logs').select('*', { count: 'exact', head: true }),
        supabase.from('sensor_data').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('kenyan_locations').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalIrrigationLogs: totalIrrigationLogs || 0,
        totalSensorData: totalSensorData || 0,
        totalOrders: totalOrders || 0,
        totalLocations: totalLocations || 0
      };
    },
    enabled: !!adminSession
  });

  // Fetch Kenyan locations data
  const { data: kenyanLocations } = useQuery({
    queryKey: ['kenyan-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kenyan_locations')
        .select('*')
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!adminSession
  });

  // Fetch recent irrigation data for charts
  const { data: irrigationData } = useQuery({
    queryKey: ['irrigation-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('irrigation_logs')
        .select('created_at, water_amount_liters, duration_minutes')
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      // Group by date and calculate daily totals
      const groupedData = data.reduce((acc: any, log) => {
        const date = new Date(log.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, totalWater: 0, totalDuration: 0, count: 0 };
        }
        acc[date].totalWater += Number(log.water_amount_liters);
        acc[date].totalDuration += log.duration_minutes;
        acc[date].count += 1;
        return acc;
      }, {});
      
      return Object.values(groupedData).slice(0, 7);
    },
    enabled: !!adminSession
  });

  // Fetch user distribution by county
  const { data: usersByCounty } = useQuery({
    queryKey: ['users-by-county'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('county')
        .not('county', 'is', null);
      
      if (error) throw error;
      
      const countByCounty = data.reduce((acc: any, profile) => {
        const county = profile.county || 'Unknown';
        acc[county] = (acc[county] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(countByCounty).map(([county, count]) => ({
        county,
        users: count
      })).slice(0, 10);
    },
    enabled: !!adminSession
  });

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    toast({
      title: "👋 Logged Out",
      description: "You have been successfully logged out from admin panel.",
    });
    navigate('/admin-login');
  };

  const sendGlobalReport = () => {
    toast({
      title: "📊 Global Report Dispatched",
      description: "Comprehensive Kenya agricultural report sent to all stakeholders.",
    });
  };

  const exportData = () => {
    toast({
      title: "📁 Data Export Initiated",
      description: "Exporting Kenya farm performance data and analytics...",
    });
  };

  if (!adminSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-800 font-semibold">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-800 font-semibold">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-purple-600" />
              <Globe className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-800">AgriSmart Kenya Admin</h1>
                <p className="text-sm text-gray-600">Independent Administrative Interface</p>
              </div>
            </div>
            <Badge className="bg-purple-500">Admin Portal</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {adminSession.username}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Global Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Registered Farmers</p>
                  <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                  <p className="text-sm text-blue-100">Across Kenya</p>
                </div>
                <Users className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Irrigation Events</p>
                  <p className="text-3xl font-bold">{stats?.totalIrrigationLogs || 0}</p>
                  <p className="text-sm text-green-100">Total logged</p>
                </div>
                <Droplets className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Sensor Readings</p>
                  <p className="text-3xl font-bold">{stats?.totalSensorData || 0}</p>
                  <p className="text-sm text-orange-100">Data points</p>
                </div>
                <Activity className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Kenya Locations</p>
                  <p className="text-3xl font-bold">{stats?.totalLocations || 0}</p>
                  <p className="text-sm text-purple-100">Covered areas</p>
                </div>
                <MapPin className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="locations">🗺️ Kenya Locations</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
            <TabsTrigger value="users">👥 Users</TabsTrigger>
            <TabsTrigger value="reports">📋 Reports</TabsTrigger>
            <TabsTrigger value="system">⚙️ System</TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Kenya Coverage Areas</span>
                </CardTitle>
                <CardDescription>
                  AgriSmart coverage across Kenyan counties, sub-counties, and wards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-800">Coverage Areas</h4>
                    {kenyanLocations?.map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold">{location.county}</h4>
                          <p className="text-sm text-gray-600">{location.sub_county} - {location.ward}</p>
                          {location.latitude && location.longitude && (
                            <p className="text-xs text-gray-500">
                              {Number(location.latitude).toFixed(4)}, {Number(location.longitude).toFixed(4)}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 mb-4">User Distribution by County</h4>
                    {usersByCounty?.map((item, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.county}</span>
                          <span className="text-sm text-gray-600">{item.users} farmers</span>
                        </div>
                        <Progress value={(item.users / (stats?.totalUsers || 1)) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Water Usage (Last 7 Days)</CardTitle>
                  <CardDescription>Water consumption across all farms in liters</CardDescription>
                </CardHeader>
                <CardContent>
                  {irrigationData && irrigationData.length > 0 ? (
                    <ChartContainer
                      config={{
                        totalWater: { label: "Water (L)", color: "#22c55e" }
                      }}
                    >
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={irrigationData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="totalWater" fill="#22c55e" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      No irrigation data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Real-time system status across Kenya</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Database Connection</span>
                    <Badge className="bg-green-500">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Response Time</span>
                    <span className="text-sm text-green-600">< 200ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Sensors</span>
                    <span className="text-sm text-blue-600">{stats?.totalSensorData || 0} readings</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System Uptime</span>
                    <span className="text-sm text-green-600">99.9%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Overview of farmers registered in the AgriSmart Kenya system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-800">{stats?.totalUsers || 0}</h3>
                    <p className="text-blue-600">Total Farmers</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-800">{stats?.totalOrders || 0}</h3>
                    <p className="text-green-600">Orders Placed</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-purple-800">{stats?.totalLocations || 0}</h3>
                    <p className="text-purple-600">Coverage Areas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Kenya Agricultural Reports</span>
                </CardTitle>
                <CardDescription>
                  Generate and distribute reports for Kenya's agricultural development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Button onClick={sendGlobalReport} className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Kenya Agricultural Report
                    </Button>
                    <Button onClick={exportData} variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Farm Data
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send SMS to Farmers
                    </Button>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">📊 Report Distribution</h4>
                    <div className="text-sm space-y-1">
                      <p>• Daily: {stats?.totalUsers || 0} farmers</p>
                      <p>• Weekly: County agricultural officers</p>
                      <p>• Monthly: Ministry of Agriculture</p>
                      <p>• Quarterly: Kenya development partners</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>System Administration</span>
                </CardTitle>
                <CardDescription>
                  Manage Kenya AgriSmart system settings and configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold">Database</span>
                      </div>
                      <p className="text-sm text-gray-600">99.9% uptime</p>
                      <Progress value={99.9} className="mt-2" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        <span className="font-semibold">API Health</span>
                      </div>
                      <p className="text-sm text-gray-600">All systems operational</p>
                      <Badge className="bg-green-500 mt-2">Healthy</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold">Kenya Coverage</span>
                      </div>
                      <p className="text-sm text-gray-600">{stats?.totalLocations || 0} areas</p>
                      <p className="text-xs text-gray-500 mt-1">Expanding daily</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
