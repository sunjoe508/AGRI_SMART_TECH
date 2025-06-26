
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Cloud } from 'lucide-react';

const WeatherDashboard = () => {
  return (
    <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <span>Weather Dashboard - Real Data Only</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <Cloud className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-semibold mb-2">Simulated Data Removed</h3>
        <p className="text-gray-600 mb-4">
          This component has been disabled as it contained simulated weather data.
        </p>
        <p className="text-sm text-gray-500">
          Please use the Weather Widget which fetches real weather data from APIs.
        </p>
      </CardContent>
    </Card>
  );
};

export default WeatherDashboard;
