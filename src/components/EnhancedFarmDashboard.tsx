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
        supabase.from('irrigation_logs' as any).select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10) as any,
        supabase.from('sensor_data' as any).select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50) as any,
        supabase.from('profiles' as any).select('*').eq('user_id', user.id).single() as any
      ]);

      const irrigationData = irrigationResult.data || [];
      const sensorData = sensorResult.data || [];
      const profile = profileResult.data;

      // Calculate statistics
      const totalWaterUsed = irrigationData.reduce((sum: number, log: any) => sum + (log.water_used_liters || 0), 0);
      const avgSoilMoisture = sensorData
        .filter((s: any) => s.soil_moisture)
        .reduce((sum: number, s: any, _: any, arr: any[]) => sum + ((s.soil_moisture || 0) / arr.length), 0) || 0;
      
      const avgTemperature = sensorData
        .filter((s: any) => s.temperature)
        .reduce((sum: number, s: any, _: any, arr: any[]) => sum + ((s.temperature || 0) / arr.length), 0) || 0;

      const avgHumidity = sensorData
        .filter((s: any) => s.humidity)
        .reduce((sum: number, s: any, _: any, arr: any[]) => sum + ((s.humidity || 0) / arr.length), 0) || 0;

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
    refetchInterval: 10000
  });

  const getSystemHealthScore = () => {
    if (!dashboardStats) return 0;
    
    let score = 0;
    if (dashboardStats.totalWaterUsed > 0) score += 30;
    if (dashboardStats.totalSensorReadings > 10) score += 25;
    if (dashboardStats.avgSoilMoisture >= 40 && dashboardStats.avgSoilMoisture <= 70) score += 25;
    if (dashboardStats.avgTemperature >= 18 && dashboardStats.avgTemperature <= 30) score += 20;
    
    return Math.min(score, 100);
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900' };
    return { label: 'Needs Attention', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-card">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-4"></div>
                <div className="h-6 bg-muted rounded"></div>
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
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Water Used Today</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats?.totalWaterUsed || 0}L</p>
              </div>
              <Droplets className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {dashboardStats?.totalIrrigationSessions || 0} sessions
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Soil Moisture</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats?.avgSoilMoisture || 0}%</p>
              </div>
              <Gauge className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="mt-2">
              <Progress value={dashboardStats?.avgSoilMoisture || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Temperature</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats?.avgTemperature || 0}°C</p>
              </div>
              <Thermometer className="w-8 h-8 text-orange-600 dark:text-orange-400" />
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

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">System Health</p>
                <p className="text-2xl font-bold text-foreground">{healthScore}%</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
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
        <TabsList className="grid w-full grid-cols-5 bg-muted">
          <TabsTrigger value="overview">Farm Overview</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Farm Info */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span>Farm Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Farm Name:</span>
                    <span className="font-medium text-foreground">{dashboardStats?.profile?.farm_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium text-foreground">{dashboardStats?.profile?.county || 'N/A'}, {dashboardStats?.profile?.ward || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Farm Size:</span>
                    <span className="font-medium text-foreground">{dashboardStats?.profile?.farm_size_acres || 'N/A'} acres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Crop Types:</span>
                    <span className="font-medium text-foreground">{dashboardStats?.profile?.crop_types?.join(', ') || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats?.lastIrrigation ? (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium text-foreground">Last Irrigation</p>
                        <p className="text-sm text-muted-foreground">
                          {dashboardStats.lastIrrigation.zone} - {dashboardStats.lastIrrigation.water_used_liters}L
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(dashboardStats.lastIrrigation.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                      <p>No recent irrigation data</p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-foreground">Sensor Readings</p>
                      <p className="text-sm text-muted-foreground">{dashboardStats?.totalSensorReadings || 0} readings today</p>
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
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Farm Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Irrigation Efficiency</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Water Usage</span>
                      <span>{dashboardStats?.totalWaterUsed || 0}L</span>
                    </div>
                    <Progress value={Math.min((dashboardStats?.totalWaterUsed || 0) / 10, 100)} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Environmental Conditions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Soil Moisture</span>
                      <Badge variant={dashboardStats?.avgSoilMoisture >= 40 ? "default" : "destructive"}>
                        {dashboardStats?.avgSoilMoisture || 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Temperature</span>
                      <Badge variant="secondary">{dashboardStats?.avgTemperature || 0}°C</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Humidity</span>
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
