
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Droplets, 
  Thermometer, 
  Wind, 
  Gauge, 
  Leaf, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import WeatherWidget from './WeatherWidget';
import ReportGenerator from './ReportGenerator';
import SensorMonitoring from './SensorMonitoring';

interface EnhancedFarmDashboardProps {
  user: any;
}

const EnhancedFarmDashboard = ({ user }: EnhancedFarmDashboardProps) => {
  // Fetch real-time dashboard data
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [irrigationResult, sensorResult, profileResult] = await Promise.all([
        supabase.from('irrigation_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('sensor_data').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('profiles').select('*').eq('id', user.id).single()
      ]);

      const irrigationData = irrigationResult.data || [];
      const sensorData = sensorResult.data || [];
      const profile = profileResult.data;

      // Calculate statistics
      const totalWaterUsed = irrigationData.reduce((sum, log) => sum + (log.water_amount_liters || 0), 0);
      const avgSoilMoisture = sensorData
        .filter(s => s.sensor_type === 'soil_moisture')
        .reduce((sum, s, _, arr) => sum + (s.value / arr.length), 0) || 0;
      
      const avgTemperature = sensorData
        .filter(s => s.sensor_type === 'temperature')
        .reduce((sum, s, _, arr) => sum + (s.value / arr.length), 0) || 0;

      const avgHumidity = sensorData
        .filter(s => s.sensor_type === 'humidity')
        .reduce((sum, s, _, arr) => sum + (s.value / arr.length), 0) || 0;

      return {
        totalWaterUsed: Math.round(totalWaterUsed),
        avgSoilMoisture: Math.round(avgSoilMoisture * 10) / 10,
        avgTemperature: Math.round(avgTemperature * 10) / 10,
        avgHumidity: Math.round(avgHumidity * 10) / 10,
        totalIrrigationSessions: irrigationData.length,
        totalSensorReadings: sensorData.length,
        profile,
        lastIrrigation: irrigationData[0],
        recentSensorData: sensorData.slice(0, 20)
      };
    },
    enabled: !!user?.id,
    refetchInterval: 10000 // Update every 10 seconds
  });

  const getSystemHealthScore = () => {
    if (!dashboardStats) return 0;
    
    let score = 0;
    
    // Water usage efficiency (0-30 points)
    if (dashboardStats.totalWaterUsed > 0) score += 30;
    
    // Sensor activity (0-25 points)  
    if (dashboardStats.totalSensorReadings > 10) score += 25;
    
    // Soil moisture optimal range (0-25 points)
    if (dashboardStats.avgSoilMoisture >= 40 && dashboardStats.avgSoilMoisture <= 70) score += 25;
    
    // Temperature range (0-20 points)
    if (dashboardStats.avgTemperature >= 18 && dashboardStats.avgTemperature <= 30) score += 20;
    
    return Math.min(score, 100);
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'Needs Attention', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const healthScore = getSystemHealthScore();
  const healthStatus = getHealthStatus(healthScore);

  return (
    <div className="space-y-6">
      {/* Farm Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Water Used Today</p>
                <p className="text-2xl font-bold text-blue-700">{dashboardStats?.totalWaterUsed || 0}L</p>
              </div>
              <Droplets className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {dashboardStats?.totalIrrigationSessions || 0} sessions
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Soil Moisture</p>
                <p className="text-2xl font-bold text-green-700">{dashboardStats?.avgSoilMoisture || 0}%</p>
              </div>
              <Gauge className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Progress value={dashboardStats?.avgSoilMoisture || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Temperature</p>
                <p className="text-2xl font-bold text-orange-700">{dashboardStats?.avgTemperature || 0}°C</p>
              </div>
              <Thermometer className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge 
                variant={dashboardStats?.avgTemperature >= 18 && dashboardStats?.avgTemperature <= 30 ? "default" : "destructive"}
                className="text-xs"
              >
                {dashboardStats?.avgTemperature >= 18 && dashboardStats?.avgTemperature <= 30 ? 'Optimal' : 'Monitor'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">System Health</p>
                <p className="text-2xl font-bold text-purple-700">{healthScore}%</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Badge className={`text-xs ${healthStatus.bgColor} ${healthStatus.color}`}>
                {healthStatus.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Farm Overview</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Farm Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <span>Farm Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Farm Name:</span>
                    <span className="font-medium">{dashboardStats?.profile?.farm_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{dashboardStats?.profile?.county}, {dashboardStats?.profile?.ward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Farm Size:</span>
                    <span className="font-medium">{dashboardStats?.profile?.farm_size_acres} acres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crop Types:</span>
                    <span className="font-medium">{dashboardStats?.profile?.crop_types?.join(', ') || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats?.lastIrrigation ? (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Droplets className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Last Irrigation</p>
                        <p className="text-sm text-gray-600">
                          {dashboardStats.lastIrrigation.zone} - {dashboardStats.lastIrrigation.water_amount_liters}L
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(dashboardStats.lastIrrigation.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                      <p>No recent irrigation data</p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Sensor Readings</p>
                      <p className="text-sm text-gray-600">{dashboardStats?.totalSensorReadings || 0} readings today</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weather">
          <WeatherWidget />
        </TabsContent>

        <TabsContent value="sensors">
          <SensorMonitoring user={user} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportGenerator user={user} />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span>Farm Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Irrigation Efficiency</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Water Usage</span>
                      <span>{dashboardStats?.totalWaterUsed || 0}L</span>
                    </div>
                    <Progress value={Math.min((dashboardStats?.totalWaterUsed || 0) / 10, 100)} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Environmental Conditions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Soil Moisture</span>
                      <Badge variant={dashboardStats?.avgSoilMoisture >= 40 ? "default" : "destructive"}>
                        {dashboardStats?.avgSoilMoisture || 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Temperature</span>
                      <Badge variant="secondary">{dashboardStats?.avgTemperature || 0}°C</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Humidity</span>
                      <Badge variant="outline">{dashboardStats?.avgHumidity || 0}%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedFarmDashboard;
