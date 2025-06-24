
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Droplets, Clock, Thermometer, Gauge } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

interface EnhancedIrrigationCycleProps {
  user: any;
}

const EnhancedIrrigationCycle = ({ user }: EnhancedIrrigationCycleProps) => {
  const [zones, setZones] = useState<IrrigationZone[]>([
    {
      id: '1',
      name: 'Zone A - Maize Field',
      isActive: false,
      progress: 0,
      duration: 30,
      waterAmount: 150,
      soilMoisture: 45,
      temperature: 24,
      status: 'idle'
    },
    {
      id: '2',
      name: 'Zone B - Vegetable Garden',
      isActive: false,
      progress: 0,
      duration: 20,
      waterAmount: 80,
      soilMoisture: 38,
      temperature: 26,
      status: 'idle'
    },
    {
      id: '3',
      name: 'Zone C - Bean Field',
      isActive: false,
      progress: 0,
      duration: 25,
      waterAmount: 120,
      soilMoisture: 52,
      temperature: 23,
      status: 'idle'
    }
  ]);
  const [globalStatus, setGlobalStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (globalStatus === 'running') {
      interval = setInterval(() => {
        setZones(prevZones => 
          prevZones.map(zone => {
            if (zone.isActive && zone.status === 'running' && zone.progress < 100) {
              const newProgress = Math.min(zone.progress + (100 / (zone.duration * 10)), 100);
              const newStatus = newProgress === 100 ? 'completed' : 'running';
              
              // Update soil moisture as irrigation progresses
              const moistureIncrease = (newProgress - zone.progress) * 0.3;
              const newMoisture = Math.min(zone.soilMoisture + moistureIncrease, 80);
              
              return {
                ...zone,
                progress: newProgress,
                status: newStatus,
                soilMoisture: Math.round(newMoisture)
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

  const startIrrigation = async (zoneId: string) => {
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
        description: `Irrigation cycle started for ${zones.find(z => z.id === zoneId)?.name}`,
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
            soil_moisture_before: 45,
            soil_moisture_after: zone.soilMoisture,
            temperature: zone.temperature,
            humidity: Math.floor(Math.random() * 20) + 60 // Simulated humidity
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
              🌱 Farm Irrigation Layout 🌱
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    zone.isActive
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-green-300 bg-green-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {zone.name.includes('Maize') ? '🌽' : 
                       zone.name.includes('Vegetable') ? '🥕' : '🫘'}
                    </div>
                    <div className="font-semibold text-sm">{zone.name}</div>
                    
                    {zone.isActive && (
                      <div className="mt-2">
                        <div className="text-2xl animate-pulse">💧</div>
                        <div className="text-xs text-blue-600">Irrigating...</div>
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
