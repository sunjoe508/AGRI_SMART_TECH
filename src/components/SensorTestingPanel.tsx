
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Database, 
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SensorTestingPanelProps {
  user: any;
  onDataGenerated: () => void;
}

const SensorTestingPanel = ({ user, onDataGenerated }: SensorTestingPanelProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const testSensors = [
    { name: 'SoilMaster Pro SM-100', type: 'moisture', ip: '192.168.1.101', zone: 'Field A' },
    { name: 'TempGuard AT-180', type: 'temperature', ip: '192.168.1.102', zone: 'Field B' },
    { name: 'EarthSense pH Monitor', type: 'ph', ip: '192.168.1.103', zone: 'Greenhouse 1' },
    { name: 'HumidityMax RH-250', type: 'humidity', ip: '192.168.1.104', zone: 'Greenhouse 2' },
  ];

  const generateTestData = async (sensorId: string, sensorType: string, zone: string) => {
    let value: number;
    let unit: string;

    switch (sensorType) {
      case 'moisture':
        value = Math.random() * 100; // 0-100%
        unit = '%';
        break;
      case 'temperature':
        value = 20 + Math.random() * 15; // 20-35°C
        unit = '°C';
        break;
      case 'ph':
        value = 6 + Math.random() * 2; // 6-8 pH
        unit = 'pH';
        break;
      case 'humidity':
        value = 40 + Math.random() * 40; // 40-80%
        unit = '%';
        break;
      default:
        value = Math.random() * 100;
        unit = '';
    }

    const { error } = await supabase
      .from('sensor_data')
      .insert({
        user_id: user.id,
        sensor_type: sensorType,
        value: Number(value.toFixed(1)),
        unit: unit,
        location_zone: zone
      });

    if (error) throw error;
  };

  const registerAllTestSensors = async () => {
    setIsGenerating(true);
    try {
      // First, register all test sensors
      for (const sensor of testSensors) {
        const { error } = await supabase
          .from('registered_sensors')
          .insert({
            user_id: user.id,
            name: sensor.name,
            ip_address: sensor.ip,
            sensor_type: sensor.type,
            location_zone: sensor.zone,
            status: 'online',
            last_ping: new Date().toISOString()
          });

        if (error && !error.message.includes('duplicate')) {
          console.error('Error registering sensor:', error);
        }
      }

      toast({
        title: "✅ Test Sensors Registered",
        description: `${testSensors.length} test sensors have been registered successfully`,
      });

      onDataGenerated();
    } catch (error: any) {
      toast({
        title: "❌ Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTestDataForAll = async () => {
    setIsGenerating(true);
    try {
      // Generate test data for each sensor type
      const promises = testSensors.map(sensor => 
        generateTestData(sensor.ip, sensor.type, sensor.zone)
      );

      await Promise.all(promises);

      toast({
        title: "🔬 Test Data Generated",
        description: "Sample sensor data has been created for all registered sensors",
      });

      onDataGenerated();
    } catch (error: any) {
      toast({
        title: "❌ Data Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContinuousData = async () => {
    setIsGenerating(true);
    try {
      // Generate multiple data points over the last 24 hours
      const hours = 24;
      const dataPointsPerHour = 2;
      
      for (let h = 0; h < hours; h++) {
        for (let d = 0; d < dataPointsPerHour; d++) {
          const timestamp = new Date();
          timestamp.setHours(timestamp.getHours() - h);
          timestamp.setMinutes(timestamp.getMinutes() - (d * 30));

          for (const sensor of testSensors) {
            let value: number;
            let unit: string;

            switch (sensor.type) {
              case 'moisture':
                value = 45 + Math.random() * 20 + Math.sin(h / 4) * 10; // Varying moisture
                unit = '%';
                break;
              case 'temperature':
                value = 22 + Math.random() * 8 + Math.sin(h / 6) * 5; // Daily temperature cycle
                unit = '°C';
                break;
              case 'ph':
                value = 6.5 + Math.random() * 1; // Stable pH with minor variations
                unit = 'pH';
                break;
              case 'humidity':
                value = 60 + Math.random() * 20 + Math.cos(h / 8) * 15; // Humidity cycle
                unit = '%';
                break;
              default:
                value = Math.random() * 100;
                unit = '';
            }

            const { error } = await supabase
              .from('sensor_data')
              .insert({
                user_id: user.id,
                sensor_type: sensor.type,
                value: Number(value.toFixed(1)),
                unit: unit,
                location_zone: sensor.zone,
                created_at: timestamp.toISOString()
              });

            if (error) throw error;
          }
        }
      }

      toast({
        title: "📊 Historical Data Generated",
        description: `Generated ${hours * dataPointsPerHour * testSensors.length} data points over 24 hours`,
      });

      onDataGenerated();
    } catch (error: any) {
      toast({
        title: "❌ Data Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Zap className="w-5 h-5" />
          <span>Sensor Testing Panel</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testSensors.map((sensor, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <div className="font-medium text-sm">{sensor.name}</div>
                <div className="text-xs text-gray-600">
                  {sensor.type} • {sensor.zone} • {sensor.ip}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Test Sensor
              </Badge>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button 
            onClick={registerAllTestSensors} 
            disabled={isGenerating}
            className="bg-green-600 hover:bg-green-700"
          >
            <Database className="w-4 h-4 mr-2" />
            Register Test Sensors
          </Button>

          <Button 
            onClick={generateTestDataForAll} 
            disabled={isGenerating}
            variant="outline"
          >
            <Play className="w-4 h-4 mr-2" />
            Generate Sample Data
          </Button>

          <Button 
            onClick={generateContinuousData} 
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Generate 24h History
          </Button>
        </div>

        <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
          <strong>Testing Steps:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click "Register Test Sensors" to add 4 test sensors</li>
            <li>Use "Generate Sample Data" for current readings</li>
            <li>Use "Generate 24h History" for historical data charts</li>
            <li>Check the "Live Monitoring" tab to see your data</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorTestingPanel;
