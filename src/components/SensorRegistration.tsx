
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RegisteredSensor {
  id: string;
  name: string;
  ip_address: string;
  sensor_type: string;
  status: 'online' | 'offline';
  last_ping: string | null;
  location_zone: string;
}

interface SensorRegistrationProps {
  user: any;
  onSensorUpdate: () => void;
}

const SensorRegistration = ({ user, onSensorUpdate }: SensorRegistrationProps) => {
  const [sensors, setSensors] = useState<RegisteredSensor[]>([]);
  const [newSensor, setNewSensor] = useState({
    name: '',
    ip_address: '',
    sensor_type: 'moisture',
    location_zone: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRegisteredSensors();
    // Check sensor connectivity every 30 seconds
    const interval = setInterval(checkSensorConnectivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRegisteredSensors = async () => {
    try {
      const { data, error } = await supabase
        .from('registered_sensors')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Type cast the data to match our interface
      const typedSensors: RegisteredSensor[] = (data || []).map(sensor => ({
        ...sensor,
        status: sensor.status as 'online' | 'offline'
      }));
      
      setSensors(typedSensors);
    } catch (error: any) {
      console.error('Error fetching sensors:', error);
    }
  };

  const checkSensorConnectivity = async () => {
    for (const sensor of sensors) {
      try {
        // Simple ping test to sensor IP
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`http://${sensor.ip_address}/ping`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const isOnline = response.ok;
        
        // Update sensor status
        await supabase
          .from('registered_sensors')
          .update({ 
            status: isOnline ? 'online' : 'offline',
            last_ping: new Date().toISOString()
          })
          .eq('id', sensor.id);
          
      } catch (error) {
        // Sensor is offline
        await supabase
          .from('registered_sensors')
          .update({ 
            status: 'offline',
            last_ping: new Date().toISOString()
          })
          .eq('id', sensor.id);
      }
    }
    
    fetchRegisteredSensors();
  };

  const registerSensor = async () => {
    if (!newSensor.name || !newSensor.ip_address || !newSensor.location_zone) {
      toast({
        title: "❌ Missing Information",
        description: "Please fill in all sensor details",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Test connection to sensor
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`http://${newSensor.ip_address}/ping`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const status = response.ok ? 'online' : 'offline';
      
      const { error } = await supabase
        .from('registered_sensors')
        .insert({
          user_id: user.id,
          name: newSensor.name,
          ip_address: newSensor.ip_address,
          sensor_type: newSensor.sensor_type,
          location_zone: newSensor.location_zone,
          status: status,
          last_ping: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "✅ Sensor Registered",
        description: `${newSensor.name} has been registered successfully`,
      });

      setNewSensor({
        name: '',
        ip_address: '',
        sensor_type: 'moisture',
        location_zone: ''
      });

      fetchRegisteredSensors();
      onSensorUpdate();
      
    } catch (error: any) {
      toast({
        title: "❌ Registration Failed",
        description: "Could not connect to sensor. Check IP address and network.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeSensor = async (sensorId: string) => {
    try {
      const { error } = await supabase
        .from('registered_sensors')
        .delete()
        .eq('id', sensorId);

      if (error) throw error;

      toast({
        title: "🗑️ Sensor Removed",
        description: "Sensor has been unregistered",
      });

      fetchRegisteredSensors();
      onSensorUpdate();
    } catch (error: any) {
      toast({
        title: "❌ Removal Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Sensor Registration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Registration Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <Input
            placeholder="Sensor Name"
            value={newSensor.name}
            onChange={(e) => setNewSensor({...newSensor, name: e.target.value})}
          />
          <Input
            placeholder="IP Address (e.g., 192.168.1.100)"
            value={newSensor.ip_address}
            onChange={(e) => setNewSensor({...newSensor, ip_address: e.target.value})}
          />
          <select
            value={newSensor.sensor_type}
            onChange={(e) => setNewSensor({...newSensor, sensor_type: e.target.value})}
            className="px-3 py-2 border rounded-md"
          >
            <option value="moisture">Soil Moisture</option>
            <option value="temperature">Temperature</option>
            <option value="ph">pH Level</option>
            <option value="humidity">Humidity</option>
          </select>
          <Input
            placeholder="Location Zone"
            value={newSensor.location_zone}
            onChange={(e) => setNewSensor({...newSensor, location_zone: e.target.value})}
          />
          <Button 
            onClick={registerSensor} 
            disabled={loading}
            className="md:col-span-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? 'Registering...' : 'Register Sensor'}
          </Button>
        </div>

        {/* Registered Sensors List */}
        <div className="space-y-3">
          <h3 className="font-semibold">Registered Sensors ({sensors.length})</h3>
          {sensors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <WifiOff className="w-12 h-12 mx-auto mb-2" />
              <p>No sensors registered yet</p>
              <p className="text-sm">Register your first sensor to start monitoring</p>
            </div>
          ) : (
            sensors.map((sensor) => (
              <div key={sensor.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {sensor.status === 'online' ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">{sensor.name}</div>
                    <div className="text-sm text-gray-600">
                      {sensor.ip_address} • {sensor.sensor_type} • {sensor.location_zone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={sensor.status === 'online' ? 'default' : 'destructive'}
                    className="flex items-center space-x-1"
                  >
                    {sensor.status === 'online' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    <span>{sensor.status}</span>
                  </Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeSensor(sensor.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorRegistration;
