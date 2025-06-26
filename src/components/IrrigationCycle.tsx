
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, WifiOff } from 'lucide-react';

const IrrigationCycle = () => {
  return (
    <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <span>Irrigation Cycle - Real Data Only</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <WifiOff className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-semibold mb-2">No Simulated Data</h3>
        <p className="text-gray-600">
          This component has been disabled. Please use the Enhanced Irrigation System 
          which works with real sensor data only.
        </p>
      </CardContent>
    </Card>
  );
};

export default IrrigationCycle;
