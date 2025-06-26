
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Wifi, 
  WifiOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface RegisteredSensor {
  id: string;
  name: string;
  ip_address: string;
  sensor_type: string;
  location_zone: string;
  status: 'online' | 'offline';
  last_ping: string | null;
}

interface RealSensorData {
  id: string;
  sensor_type: string;
  value: number;
  unit: string;
  location_zone: string;
  created_at: string;
  sensor_name: string;
  sensor_ip: string;
  sensor_status: 'online' | 'offline';
}

interface RealSensorMonitoringProps {
  user: any;
}

const RealSensorMonitoring = ({ user }: RealSensorMonitoringProps) => {
  const [sensorData, setSensorData] = useState<RealSensorData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRealSensorData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchRealSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRealSensorData = async () => {
    try {
      // Fetch real sensor data from registered sensors
      const { data: sensors, error: sensorsError } = await supabase
        .from('registered_sensors')
        .select('*')
        .eq('user_id', user.id);

      if (sensorsError) throw sensorsError;

      if (!sensors || sensors.length === 0) {
        setSensorData([]);
        setChartData([]);
        setLoading(false);
        return;
      }

      // Fetch latest readings from each online sensor
      const allSensorData: RealSensorData[] = [];
      
      for (const sensor of sensors as RegisteredSensor[]) {
        if (sensor.status === 'online') {
          try {
            // Fetch data from actual sensor with proper AbortController
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`http://${sensor.ip_address}/data`, {
              method: 'GET',
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              const data = await response.json();
              
              // Store the reading in database
              await supabase
                .from('sensor_data')
                .insert({
                  user_id: user.id,
                  sensor_type: sensor.sensor_type,
                  value: data.value,
                  unit: data.unit || getDefaultUnit(sensor.sensor_type),
                  location_zone: sensor.location_zone
                });

              allSensorData.push({
                id: sensor.id,
                sensor_type: sensor.sensor_type,
                value: data.value,
                unit: data.unit || getDefaultUnit(sensor.sensor_type),
                location_zone: sensor.location_zone,
                created_at: new Date().toISOString(),
                sensor_name: sensor.name,
                sensor_ip: sensor.ip_address,
                sensor_status: 'online'
              });
            }
          } catch (error) {
            console.error(`Failed to fetch data from sensor ${sensor.ip_address}:`, error);
            
            // Mark sensor as offline if fetch fails
            await supabase
              .from('registered_sensors')
              .update({ status: 'offline' })
              .eq('id', sensor.id);
          }
        } else {
          // Include offline sensors in the display
          allSensorData.push({
            id: sensor.id,
            sensor_type: sensor.sensor_type,
            value: 0,
            unit: getDefaultUnit(sensor.sensor_type),
            location_zone: sensor.location_zone,
            created_at: sensor.last_ping || new Date().toISOString(),
            sensor_name: sensor.name,
            sensor_ip: sensor.ip_address,
            sensor_status: 'offline'
          });
        }
      }

      setSensorData(allSensorData);

      // Fetch historical data for charts
      const { data: historicalData, error: historyError } = await supabase
        .from('sensor_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(24);

      if (historyError) throw historyError;

      // Process chart data
      const processedChartData = processChartData(historicalData || []);
      setChartData(processedChartData);

    } catch (error: any) {
      console.error('Error fetching sensor data:', error);
      toast({
        title: "❌ Data Fetch Error",
        description: "Failed to fetch real sensor data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDefaultUnit = (sensorType: string) => {
    switch (sensorType) {
      case 'temperature': return '°C';
      case 'moisture': return '%';
      case 'humidity': return '%';
      case 'ph': return 'pH';
      default: return '';
    }
  };

  const processChartData = (data: any[]) => {
    const grouped = data.reduce((acc: any, item: any) => {
      const hour = new Date(item.created_at).getHours();
      const key = `${hour}:00`;
      
      if (!acc[key]) {
        acc[key] = { time: key };
      }
      
      acc[key][item.sensor_type] = item.value;
      return acc;
    }, {});
    
    return Object.values(grouped).reverse();
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'moisture':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-red-500" />;
      case 'ph':
        return <Activity className="w-5 h-5 text-purple-500" />;
      case 'humidity':
        return <Droplets className="w-5 h-5 text-green-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const manualRefresh = () => {
    setRefreshing(true);
    fetchRealSensorData();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading real sensor data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-green-600" />
              <span>Real Sensor Monitoring</span>
            </div>
            <Button 
              onClick={manualRefresh} 
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {sensorData.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <WifiOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Sensor Data Available</h3>
            <p className="text-gray-600">
              Register and connect sensors to start monitoring real data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Sensor Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensorData.map((sensor) => (
              <Card key={sensor.id} className="border-2 hover:border-blue-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getSensorIcon(sensor.sensor_type)}
                      <h4 className="font-semibold">{sensor.sensor_name}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      {sensor.sensor_status === 'online' ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500" />
                      )}
                      <Badge 
                        variant={sensor.sensor_status === 'online' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {sensor.sensor_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Value:</span>
                      <span className={`text-lg font-bold ${
                        sensor.sensor_status === 'online' ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {sensor.sensor_status === 'online' ? 
                          `${sensor.value} ${sensor.unit}` : 
                          'No Data'
                        }
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Zone: {sensor.location_zone}</span>
                      <span className="text-gray-500">IP: {sensor.sensor_ip}</span>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      {sensor.sensor_status === 'online' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {sensor.sensor_status === 'online' ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Real Data Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span>Real Sensor Data (Last 24 Hours)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    moisture: { label: "Moisture", color: "#3b82f6" },
                    temperature: { label: "Temperature", color: "#ef4444" },
                    ph: { label: "pH Level", color: "#8b5cf6" },
                    humidity: { label: "Humidity", color: "#10b981" }
                  }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="moisture" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ fill: '#ef4444' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ph" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="humidity" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default RealSensorMonitoring;
