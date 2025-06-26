
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Droplets, Clock, Thermometer, Gauge, WifiOff } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RegisteredSensor {
  id: string;
  name: string;
  ip_address: string;
  sensor_type: string;
  location_zone: string;
  status: 'online' | 'offline';
  last_ping: string | null;
}

interface IrrigationZone {
  id: string;
  name: string;
  isActive: boolean;
  progress: number;
  duration: number;
  waterAmount: number;
  soilMoisture: number;
  temperature: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  sensorConnected: boolean;
  lastSensorReading: string | null;
}

interface EnhancedIrrigationCycleProps {
  user: any;
}

const EnhancedIrrigationCycle = ({ user }: EnhancedIrrigationCycleProps) => {
  const [zones, setZones] = useState<IrrigationZone[]>([]);
  const [globalStatus, setGlobalStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    initializeZones();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (globalStatus === 'running') {
      interval = setInterval(() => {
        setZones(prevZones => 
          prevZones.map(zone => {
            if (zone.isActive && zone.status === 'running' && zone.progress < 100) {
              const newProgress = Math.min(zone.progress + (100 / (zone.duration * 10)), 100);
              const newStatus = newProgress === 100 ? 'completed' : 'running';
              
              return {
                ...zone,
                progress: newProgress,
                status: newStatus
              };
            }
            return zone;
          })
        );
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [globalStatus]);

  const initializeZones = async () => {
    try {
      // Fetch registered sensors to determine real zones
      const { data: sensors, error } = await supabase
        .from('registered_sensors')
        .select('*')
        .eq('user_id', user.id)
        .eq('sensor_type', 'moisture');

      if (error) throw error;

      if (!sensors || sensors.length === 0) {
        // No sensors registered, show empty state
        setZones([]);
        setLoading(false);
        return;
      }

      // Create zones based on registered sensors
      const zonesData: IrrigationZone[] = [];
      
      for (const sensor of sensors as RegisteredSensor[]) {
        // Get latest sensor reading
        const { data: latestReading } = await supabase
          .from('sensor_data')
          .select('*')
          .eq('user_id', user.id)
          .eq('location_zone', sensor.location_zone)
          .eq('sensor_type', 'moisture')
          .order('created_at', { ascending: false })
          .limit(1);

        const reading = latestReading?.[0];
        const moistureLevel = reading ? reading.value : 0;
        
        zonesData.push({
          id: sensor.id,
          name: `${sensor.location_zone} - ${sensor.name}`,
          isActive: false,
          progress: 0,
          duration: 30, // Default duration
          waterAmount: 150, // Default amount
          soilMoisture: moistureLevel,
          temperature: 0, // Will be fetched from temperature sensor if available
          status: 'idle',
          sensorConnected: sensor.status === 'online',
          lastSensorReading: reading?.created_at || null
        });
      }

      setZones(zonesData);
      
    } catch (error: any) {
      console.error('Error initializing zones:', error);
      toast({
        title: "❌ Initialization Error",
        description: "Failed to load irrigation zones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startIrrigation = async (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    
    if (!zone?.sensorConnected) {
      toast({
        title: "❌ Sensor Offline",
        description: "Cannot start irrigation. Sensor is not connected.",
        variant: "destructive"
      });
      return;
    }

    try {
      setZones(prevZones =>
        prevZones.map(zone =>
          zone.id === zoneId
            ? { ...zone, isActive: true, status: 'running' }
            : zone
        )
      );
      setGlobalStatus('running');

      toast({
        title: "🚿 Irrigation Started",
        description: `Irrigation cycle started for ${zone?.name}`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Start Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const pauseIrrigation = (zoneId: string) => {
    setZones(prevZones =>
      prevZones.map(zone =>
        zone.id === zoneId
          ? { ...zone, status: 'paused' }
          : zone
      )
    );
    setGlobalStatus('paused');
    
    toast({
      title: "⏸️ Irrigation Paused",
      description: "Irrigation cycle paused",
    });
  };

  const stopIrrigation = async (zoneId: string) => {
    try {
      const zone = zones.find(z => z.id === zoneId);
      if (zone && user) {
        // Log irrigation data to database
        const { error } = await supabase
          .from('irrigation_logs')
          .insert({
            user_id: user.id,
            zone: zone.name,
            duration_minutes: Math.round((zone.progress / 100) * zone.duration),
            water_amount_liters: Math.round((zone.progress / 100) * zone.waterAmount),
            soil_moisture_before: zone.soilMoisture,
            soil_moisture_after: zone.soilMoisture + (zone.progress / 100) * 20, // Estimated increase
            temperature: zone.temperature,
            humidity: 60 // Default value
          });

        if (error) throw error;
      }

      setZones(prevZones =>
        prevZones.map(zone =>
          zone.id === zoneId
            ? { ...zone, isActive: false, status: 'idle', progress: 0 }
            : zone
        )
      );
      setGlobalStatus('idle');

      toast({
        title: "🛑 Irrigation Stopped",
        description: "Irrigation cycle stopped and logged",
      });
    } catch (error: any) {
      toast({
        title: "❌ Stop Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading irrigation system...</div>
        </CardContent>
      </Card>
    );
  }

  if (zones.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="w-6 h-6 text-blue-600" />
            <span>Smart Irrigation System</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <WifiOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Irrigation Zones Available</h3>
          <p className="text-gray-600">
            Register moisture sensors to create irrigation zones and start automated watering.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="w-6 h-6 text-blue-600" />
            <span>Smart Irrigation System</span>
            <Badge variant="outline" className={getStatusColor(globalStatus)}>
              {globalStatus.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Irrigation Visualization */}
          <div className="bg-gradient-to-b from-green-100 to-green-200 p-6 rounded-lg">
            <div className="text-center text-lg font-semibold text-green-800 mb-4">
              🌱 Real Sensor-Based Irrigation 🌱
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    zone.isActive
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : zone.sensorConnected
                      ? 'border-green-300 bg-green-50'
                      : 'border-red-300 bg-red-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {zone.sensorConnected ? '🌿' : '⚠️'}
                    </div>
                    <div className="font-semibold text-sm">{zone.name}</div>
                    
                    {zone.isActive && (
                      <div className="mt-2">
                        <div className="text-2xl animate-pulse">💧</div>
                        <div className="text-xs text-blue-600">Irrigating...</div>
                      </div>
                    )}
                    
                    {!zone.sensorConnected && (
                      <div className="mt-2">
                        <div className="text-xs text-red-600">Sensor Offline</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <Card key={zone.id} className="border-2 hover:border-blue-300 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{zone.name}</span>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(zone.status)} text-white`}
                    >
                      {zone.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Sensor Status */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Sensor Status:</span>
                    <Badge variant={zone.sensorConnected ? 'default' : 'destructive'}>
                      {zone.sensorConnected ? 'Connected' : 'Offline'}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(zone.progress)}%</span>
                    </div>
                    <Progress value={zone.progress} className="w-full" />
                  </div>

                  {/* Zone Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{zone.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span>{zone.waterAmount}L</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gauge className="w-4 h-4 text-green-500" />
                      <span>{zone.soilMoisture}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span>{zone.temperature}°C</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex space-x-2">
                    {zone.status === 'idle' && (
                      <Button
                        onClick={() => startIrrigation(zone.id)}
                        disabled={!zone.sensorConnected}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    )}
                    
                    {zone.status === 'running' && (
                      <>
                        <Button
                          onClick={() => pauseIrrigation(zone.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                        <Button
                          onClick={() => stopIrrigation(zone.id)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      </>
                    )}

                    {zone.status === 'paused' && (
                      <>
                        <Button
                          onClick={() => startIrrigation(zone.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                        <Button
                          onClick={() => stopIrrigation(zone.id)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      </>
                    )}

                    {zone.status === 'completed' && (
                      <Button
                        onClick={() => stopIrrigation(zone.id)}
                        variant="outline"
                        className="w-full"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedIrrigationCycle;
