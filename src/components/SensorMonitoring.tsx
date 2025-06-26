
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Activity } from 'lucide-react';
import SensorRegistration from './SensorRegistration';
import RealSensorMonitoring from './RealSensorMonitoring';

interface SensorMonitoringProps {
  user: any;
}

const SensorMonitoring = ({ user }: SensorMonitoringProps) => {
  const handleSensorUpdate = () => {
    // This will trigger re-fetch in RealSensorMonitoring
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-green-600" />
            <span>Sensor Management System</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monitoring" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
              <TabsTrigger value="registration">Sensor Registration</TabsTrigger>
            </TabsList>

            <TabsContent value="monitoring">
              <RealSensorMonitoring user={user} />
            </TabsContent>

            <TabsContent value="registration">
              <SensorRegistration user={user} onSensorUpdate={handleSensorUpdate} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorMonitoring;
