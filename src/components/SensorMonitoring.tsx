
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Zap, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Plus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SensorMonitoringProps {
  user: any;
}

const SensorMonitoring = ({ user }: SensorMonitoringProps) => {
  const [sensors, setSensors] = useState([
    {
      id: '1',
      name: 'Soil Moisture A1',
      type: 'moisture',
      value: 68,
      unit: '%',
      status: 'online',
      battery: 85,
      lastUpdate: '2 min ago',
      zone: 'Zone A'
    },
    {
      id: '2',
      name: 'Temperature A1',
      type: 'temperature',
      value: 24.5,
      unit: '°C',
      status: 'online',
      battery: 92,
      lastUpdate: '1 min ago',
      zone: 'Zone A'
    },
    {
      id: '3',
      name: 'pH Sensor B1',
      type: 'ph',
      value: 6.8,
      unit: 'pH',
      status: 'offline',
      battery: 15,
      lastUpdate: '2 hours ago',
      zone: 'Zone B'
    },
    {
      id: '4',
      name: 'Humidity B1',
      type: 'humidity',
      value: 72,
      unit: '%',
      status: 'online',
      battery: 78,
      lastUpdate: '3 min ago',
      zone: 'Zone B'
    }
  ]);

  const [sensorData, setSensorData] = useState([
    { time: '00:00', moisture: 65, temperature: 22, ph: 6.8 },
    { time: '04:00', moisture: 63, temperature: 20, ph: 6.9 },
    { time: '08:00', moisture: 68, temperature: 24, ph: 6.8 },
    { time: '12:00', moisture: 70, temperature: 26, ph: 6.7 },
    { time: '16:00', moisture: 66, temperature: 28, ph: 6.8 },
    { time: '20:00', moisture: 68, temperature: 25, ph: 6.9 }
  ]);

  const { toast } = useToast();

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
        return <Settings className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string, battery: number) => {
    if (status === 'offline') {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    if (battery < 20) {
      return <Zap className="w-4 h-4 text-orange-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const addSensorReading = async (sensorType: string, value: number) => {
    try {
      const { error } = await supabase
        .from('sensor_data')
        .insert({
          user_id: user.id,
          sensor_type: sensorType,
          value: value,
          unit: sensorType === 'temperature' ? '°C' : sensorType === 'ph' ? 'pH' : '%',
          location_zone: 'Zone A'
        });

      if (error) throw error;

      toast({
        title: "📊 Data Recorded",
        description: `${sensorType} reading saved: ${value}`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: "Failed to save sensor data",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Sensor Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Active Sensors</p>
                <p className="text-3xl font-bold">{sensors.filter(s => s.status === 'online').length}</p>
              </div>
              <Activity className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Avg Moisture</p>
                <p className="text-3xl font-bold">68%</p>
              </div>
              <Droplets className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Avg Temp</p>
                <p className="text-3xl font-bold">24.5°C</p>
              </div>
              <Thermometer className="w-12 h-12 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Alerts</p>
                <p className="text-3xl font-bold">2</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Status Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-6 h-6 text-gray-600" />
              <span>Sensor Network Status</span>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Sensor
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sensors.map((sensor) => (
              <div key={sensor.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getSensorIcon(sensor.type)}
                    <h4 className="font-semibold">{sensor.name}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(sensor.status, sensor.battery)}
                    <Badge 
                      variant={sensor.status === 'online' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {sensor.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Value:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {sensor.value} {sensor.unit}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Battery Level</span>
                      <span>{sensor.battery}%</span>
                    </div>
                    <Progress 
                      value={sensor.battery} 
                      className={`h-2 ${sensor.battery < 20 ? 'bg-red-200' : 'bg-green-200'}`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Zone: {sensor.zone}</span>
                    <span className="text-gray-500">Updated: {sensor.lastUpdate}</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Wifi className={`w-4 h-4 ${sensor.status === 'online' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="text-xs text-gray-500">
                      Signal: {sensor.status === 'online' ? 'Strong' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sensor Data Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span>24-Hour Sensor Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              moisture: { label: "Moisture", color: "#3b82f6" },
              temperature: { label: "Temperature", color: "#ef4444" },
              ph: { label: "pH Level", color: "#8b5cf6" }
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensorData}>
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
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => addSensorReading('moisture', 65)} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Droplets className="w-4 h-4 mr-2" />
              Record Moisture
            </Button>
            <Button 
              onClick={() => addSensorReading('temperature', 25)} 
              className="bg-red-600 hover:bg-red-700"
            >
              <Thermometer className="w-4 h-4 mr-2" />
              Record Temperature
            </Button>
            <Button 
              onClick={() => addSensorReading('ph', 6.8)} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Activity className="w-4 h-4 mr-2" />
              Record pH Level
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorMonitoring;
