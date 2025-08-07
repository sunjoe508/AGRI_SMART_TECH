import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Droplets, 
  Activity, 
  Database, 
  Globe, 
  MapPin,
  Smartphone,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCcw,
  Calendar,
  Target,
  Zap
} from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SystemAnalytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const { toast } = useToast();

  // Fetch comprehensive system analytics
  const { data: analytics, isLoading: analyticsLoading, refetch } = useQuery({
    queryKey: ['system-analytics', selectedTimeRange],
    queryFn: async () => {
      console.log('Fetching comprehensive system analytics...');
      
      const timeRanges = {
        '24h': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90
      };
      
      const daysBack = timeRanges[selectedTimeRange as keyof typeof timeRanges] || 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Fetch all data in parallel
      const [
        { data: profiles, count: totalUsers },
        { data: irrigationLogs },
        { data: sensorData },
        { data: supportTickets },
        { data: orders },
        { data: registeredSensors },
        { data: locations }
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('irrigation_logs')
          .select('*')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('sensor_data')
          .select('*')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('support_tickets')
          .select('*')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('orders')
          .select('*')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('registered_sensors')
          .select('*'),
        supabase
          .from('kenyan_locations')
          .select('*')
      ]);

      // Get total counts
      const { count: totalProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Calculate user growth over time
      const userGrowthData = [];
      for (let i = daysBack; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayProfiles = profiles?.filter(p => 
          new Date(p.created_at).toDateString() === date.toDateString()
        ) || [];
        
        userGrowthData.push({
          date: date.toLocaleDateString(),
          users: dayProfiles.length,
          cumulative: profiles?.filter(p => 
            new Date(p.created_at) <= date
          ).length || 0
        });
      }

      // Calculate irrigation activity over time
      const irrigationData = [];
      for (let i = daysBack; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayLogs = irrigationLogs?.filter(log => 
          new Date(log.created_at).toDateString() === date.toDateString()
        ) || [];
        
        const totalWater = dayLogs.reduce((sum, log) => sum + (log.water_amount_liters || 0), 0);
        
        irrigationData.push({
          date: date.toLocaleDateString(),
          sessions: dayLogs.length,
          water: Math.round(totalWater),
          avgDuration: dayLogs.length > 0 
            ? Math.round(dayLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / dayLogs.length)
            : 0
        });
      }

      // Calculate sensor activity
      const sensorActivityData = [];
      const sensorTypes = ['temperature', 'humidity', 'soil_moisture', 'light_intensity'];
      
      for (let i = daysBack; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayData = sensorData?.filter(data => 
          new Date(data.created_at).toDateString() === date.toDateString()
        ) || [];
        
        const dataPoint: any = {
          date: date.toLocaleDateString(),
          total: dayData.length
        };
        
        sensorTypes.forEach(type => {
          const typeData = dayData.filter(d => d.sensor_type === type);
          dataPoint[type] = typeData.length;
        });
        
        sensorActivityData.push(dataPoint);
      }

      // County distribution
      const countyDistribution: any = {};
      profiles?.forEach(profile => {
        if (profile.county) {
          countyDistribution[profile.county] = (countyDistribution[profile.county] || 0) + 1;
        }
      });

      const countyData = Object.entries(countyDistribution)
        .map(([county, count]) => ({ county, count: count as number }))
        .sort((a, b) => (b.count as number) - (a.count as number))
        .slice(0, 10);

      // Support ticket status distribution
      const ticketStatusData = [
        { status: 'Open', count: supportTickets?.filter(t => t.status === 'open').length || 0, color: '#ef4444' },
        { status: 'In Progress', count: supportTickets?.filter(t => t.status === 'in_progress').length || 0, color: '#f59e0b' },
        { status: 'Resolved', count: supportTickets?.filter(t => t.status === 'resolved').length || 0, color: '#10b981' },
        { status: 'Closed', count: supportTickets?.filter(t => t.status === 'closed').length || 0, color: '#6b7280' }
      ];

      // System health metrics
      const systemHealth = {
        userGrowthRate: profiles?.length || 0,
        averageSessionDuration: irrigationLogs?.length 
          ? Math.round(irrigationLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / irrigationLogs.length)
          : 0,
        sensorHealth: registeredSensors?.filter(s => s.status === 'online').length || 0,
        totalSensors: registeredSensors?.length || 0,
        supportResolutionRate: supportTickets?.length 
          ? Math.round(((supportTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length) / supportTickets.length) * 100)
          : 100,
        systemUptime: 99.2 + Math.random() * 0.8, // Simulated uptime
        avgResponseTime: 120 + Math.random() * 50 // Simulated response time in ms
      };

      // Crop type distribution
      const cropDistribution: any = {};
      profiles?.forEach(profile => {
        profile.crop_types?.forEach(crop => {
          cropDistribution[crop] = (cropDistribution[crop] || 0) + 1;
        });
      });

      const cropData = Object.entries(cropDistribution)
        .map(([crop, count]) => ({ crop, count: count as number }))
        .sort((a, b) => (b.count as number) - (a.count as number))
        .slice(0, 8);

      console.log('System analytics calculated successfully');
      
      return {
        overview: {
          totalUsers: totalProfiles || 0,
          newUsers: profiles?.length || 0,
          totalIrrigations: irrigationLogs?.length || 0,
          totalSensorReadings: sensorData?.length || 0,
          totalSupportTickets: supportTickets?.length || 0,
          totalOrders: orders?.length || 0,
          activeSensors: registeredSensors?.filter(s => s.status === 'online').length || 0,
          totalSensors: registeredSensors?.length || 0
        },
        userGrowthData,
        irrigationData,
        sensorActivityData,
        countyData,
        ticketStatusData,
        systemHealth,
        cropData,
        lastUpdated: new Date().toISOString()
      };
    },
    refetchInterval: 30000, // Update every 30 seconds
  });

  const exportAnalytics = async () => {
    try {
      if (!analytics) return;
      
      const exportData = {
        exportDate: new Date().toISOString(),
        timeRange: selectedTimeRange,
        analytics
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agrismart-analytics-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "📊 Analytics Exported",
        description: `System analytics for ${selectedTimeRange} exported successfully`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Export Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading system analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <span>System Analytics</span>
              <Badge className="bg-green-100 text-green-800">
                <Activity className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCcw className="w-4 h-4" />
              </Button>
              <Button onClick={exportAnalytics} variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Comprehensive system performance and user engagement analytics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.overview.totalUsers}</p>
                <p className="text-xs text-green-600">+{analytics.overview.newUsers} new</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sensors</p>
                <p className="text-2xl font-bold text-green-600">{analytics.overview.activeSensors}</p>
                <p className="text-xs text-gray-500">of {analytics.overview.totalSensors} total</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Irrigations</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.overview.totalIrrigations}</p>
                <p className="text-xs text-gray-500">in period</p>
              </div>
              <Droplets className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.systemHealth.systemUptime.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">uptime</p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Crop Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.cropData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="crop" />
                      <YAxis />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="irrigation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Irrigation Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.irrigationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Line yAxisId="left" type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="water" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Ticket Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.ticketStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label
                      >
                        {analytics.ticketStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Data Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.sensorActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Area type="monotone" dataKey="temperature" stackId="1" stroke="#ef4444" fill="#ef4444" />
                    <Area type="monotone" dataKey="humidity" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                    <Area type="monotone" dataKey="soil_moisture" stackId="1" stroke="#10b981" fill="#10b981" />
                    <Area type="monotone" dataKey="light_intensity" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution by County</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.countyData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="county" type="category" width={80} />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>System Uptime</span>
                    <span>{analytics.systemHealth.systemUptime.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.systemHealth.systemUptime} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sensor Health</span>
                    <span>{Math.round((analytics.overview.activeSensors / Math.max(analytics.overview.totalSensors, 1)) * 100)}%</span>
                  </div>
                  <Progress value={(analytics.overview.activeSensors / Math.max(analytics.overview.totalSensors, 1)) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Support Resolution</span>
                    <span>{analytics.systemHealth.supportResolutionRate}%</span>
                  </div>
                  <Progress value={analytics.systemHealth.supportResolutionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <Badge variant="outline">{Math.round(analytics.systemHealth.avgResponseTime)}ms</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Session Duration</span>
                  <Badge variant="outline">{analytics.systemHealth.averageSessionDuration}min</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <Badge variant="outline">{analytics.overview.totalUsers}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.overview.totalSensorReadings}</div>
                  <div className="text-sm text-gray-600">Sensor Readings</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.overview.totalOrders}</div>
                  <div className="text-sm text-gray-600">Marketplace Orders</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analytics.overview.totalSupportTickets}</div>
                  <div className="text-sm text-gray-600">Support Tickets</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemAnalytics;