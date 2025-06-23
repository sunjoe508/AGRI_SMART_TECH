
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { 
  Droplets, 
  CloudRain, 
  Sun, 
  Thermometer, 
  Activity, 
  FileText, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  TestTube,
  Wifi,
  Database
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [moistureLevel, setMoistureLevel] = useState(65);
  const [temperature, setTemperature] = useState(24);
  const [humidity, setHumidity] = useState(68);
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [systemStatus, setSystemStatus] = useState('optimal');
  const [lastIrrigation, setLastIrrigation] = useState('2 hours ago');
  const [waterUsage, setWaterUsage] = useState(145);
  const [soilPh, setSoilPh] = useState(6.8);
  const [nutrients, setNutrients] = useState({ nitrogen: 78, phosphorus: 65, potassium: 82 });
  const [weatherForecast, setWeatherForecast] = useState([
    { day: 'Today', temp: 24, humidity: 68, rain: 0 },
    { day: 'Tomorrow', temp: 26, humidity: 72, rain: 15 },
    { day: 'Wed', temp: 22, humidity: 80, rain: 75 },
    { day: 'Thu', temp: 20, humidity: 85, rain: 90 },
    { day: 'Fri', temp: 23, humidity: 70, rain: 20 }
  ]);

  const { toast } = useToast();

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate moisture level changes
      setMoistureLevel(prev => {
        const change = (Math.random() - 0.5) * 4;
        const newLevel = Math.max(20, Math.min(100, prev + change));
        
        // Auto irrigation trigger
        if (newLevel < 30 && !isIrrigating) {
          setIsIrrigating(true);
          setLastIrrigation('Now');
          toast({
            title: "🚿 Irrigation Started",
            description: "Soil moisture below threshold. Auto-irrigation activated.",
          });
          
          setTimeout(() => {
            setIsIrrigating(false);
            setMoistureLevel(70);
            setWaterUsage(prev => prev + Math.floor(Math.random() * 20) + 10);
          }, 8000);
        }
        
        return newLevel;
      });

      // Simulate temperature fluctuations
      setTemperature(prev => Math.max(15, Math.min(35, prev + (Math.random() - 0.5) * 2)));
      
      // Simulate humidity changes
      setHumidity(prev => Math.max(40, Math.min(95, prev + (Math.random() - 0.5) * 3)));
    }, 3000);

    return () => clearInterval(interval);
  }, [isIrrigating, toast]);

  // Generate soil test every 30 seconds (simulating weekly tests)
  useEffect(() => {
    const soilTestInterval = setInterval(() => {
      setSoilPh(prev => Math.max(5.5, Math.min(8.0, prev + (Math.random() - 0.5) * 0.3)));
      setNutrients(prev => ({
        nitrogen: Math.max(40, Math.min(100, prev.nitrogen + (Math.random() - 0.5) * 10)),
        phosphorus: Math.max(40, Math.min(100, prev.phosphorus + (Math.random() - 0.5) * 8)),
        potassium: Math.max(40, Math.min(100, prev.potassium + (Math.random() - 0.5) * 12))
      }));
      
      toast({
        title: "🧪 Soil Test Complete",
        description: "Weekly soil analysis results updated.",
      });
    }, 30000);

    return () => clearInterval(soilTestInterval);
  }, [toast]);

  const chartData = [
    { time: '00:00', moisture: 45, temperature: 22 },
    { time: '04:00', moisture: 42, temperature: 20 },
    { time: '08:00', moisture: 48, temperature: 24 },
    { time: '12:00', moisture: moistureLevel, temperature: temperature },
    { time: '16:00', moisture: 52, temperature: 28 },
    { time: '20:00', moisture: 55, temperature: 25 },
  ];

  const generateReport = () => {
    toast({
      title: "📊 Report Generated",
      description: "Weekly irrigation report sent to your email.",
    });
  };

  const getStatusColor = () => {
    if (moistureLevel < 30) return 'text-red-500';
    if (moistureLevel < 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (moistureLevel < 30) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (moistureLevel < 50) return <Clock className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🌱 Smart Irrigation System
          </h1>
          <p className="text-gray-600">
            Automated soil monitoring, weather integration & intelligent watering
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Current Time: {currentTime.toLocaleString()}
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Soil Moisture</p>
                  <p className={`text-2xl font-bold ${getStatusColor()}`}>{moistureLevel.toFixed(1)}%</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <Droplets className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <Progress value={moistureLevel} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="text-2xl font-bold text-orange-600">{temperature.toFixed(1)}°C</p>
                </div>
                <Thermometer className="w-8 h-8 text-orange-500" />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Optimal: 20-25°C
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Humidity</p>
                  <p className="text-2xl font-bold text-blue-600">{humidity.toFixed(1)}%</p>
                </div>
                <CloudRain className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Air moisture level
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Water Usage</p>
                  <p className="text-2xl font-bold text-green-600">{waterUsage}L</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Today's consumption
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Irrigation Status */}
        <Card className={`border-2 ${isIrrigating ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${isIrrigating ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}>
                  <Droplets className={`w-6 h-6 ${isIrrigating ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {isIrrigating ? '🚿 Irrigation Active' : '💧 Irrigation Standby'}
                  </h3>
                  <p className="text-gray-600">
                    Last irrigation: {lastIrrigation}
                  </p>
                </div>
              </div>
              {isIrrigating && (
                <Badge variant="default" className="animate-pulse">
                  <Zap className="w-4 h-4 mr-1" />
                  ACTIVE
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitoring">📊 Monitoring</TabsTrigger>
            <TabsTrigger value="weather">🌤️ Weather</TabsTrigger>
            <TabsTrigger value="soil-lab">🧪 Soil Lab</TabsTrigger>
            <TabsTrigger value="reports">📋 Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Real-time Monitoring</span>
                </CardTitle>
                <CardDescription>
                  Live sensor data from field stations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    moisture: { label: "Moisture", color: "#3b82f6" },
                    temperature: { label: "Temperature", color: "#f59e0b" }
                  }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="moisture" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Sensor Network</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span>Sensor A1</span>
                      </span>
                      <Badge variant="outline">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span>Sensor B2</span>
                      </span>
                      <Badge variant="outline">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span>Sensor C3</span>
                      </span>
                      <Badge variant="outline">Online</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Pump Status</span>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Valve Control</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Network</span>
                      <Badge className="bg-green-500">Connected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setIsIrrigating(true);
                        setTimeout(() => setIsIrrigating(false), 5000);
                        toast({ title: "Manual irrigation started", description: "System will run for 5 minutes" });
                      }}
                      disabled={isIrrigating}
                    >
                      Manual Irrigation
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      System Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weather" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sun className="w-5 h-5" />
                  <span>Weather Forecast Integration</span>
                </CardTitle>
                <CardDescription>
                  AI-powered weather predictions for optimal irrigation scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {weatherForecast.map((day, index) => (
                    <Card key={index} className={index === 0 ? 'border-blue-500' : ''}>
                      <CardContent className="p-4 text-center">
                        <p className="font-semibold">{day.day}</p>
                        <div className="my-2">
                          {day.rain > 50 ? (
                            <CloudRain className="w-8 h-8 mx-auto text-blue-500" />
                          ) : (
                            <Sun className="w-8 h-8 mx-auto text-yellow-500" />
                          )}
                        </div>
                        <p className="text-lg font-bold">{day.temp}°C</p>
                        <p className="text-sm text-gray-600">💧 {day.humidity}%</p>
                        <p className="text-sm text-blue-600">🌧️ {day.rain}%</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🤖 AI Irrigation Recommendation</h4>
                  <p className="text-blue-700">
                    Based on weather forecast: Reduce irrigation by 40% for next 2 days due to expected rainfall. 
                    Resume normal schedule on Friday.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="soil-lab" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="w-5 h-5" />
                  <span>Automated Soil Laboratory</span>
                </CardTitle>
                <CardDescription>
                  Weekly soil analysis and nutrient monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Soil Chemistry</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>pH Level</span>
                        <span className="font-bold text-green-600">{soilPh.toFixed(1)}</span>
                      </div>
                      <Progress value={(soilPh - 5.5) / 2.5 * 100} className="h-2" />
                      <p className="text-sm text-gray-600">Optimal: 6.0 - 7.5</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Nutrient Levels</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Nitrogen (N)</span>
                          <span className="text-sm font-semibold">{nutrients.nitrogen}%</span>
                        </div>
                        <Progress value={nutrients.nitrogen} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Phosphorus (P)</span>
                          <span className="text-sm font-semibold">{nutrients.phosphorus}%</span>
                        </div>
                        <Progress value={nutrients.phosphorus} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Potassium (K)</span>
                          <span className="text-sm font-semibold">{nutrients.potassium}%</span>
                        </div>
                        <Progress value={nutrients.potassium} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🧪 Latest Test Results</h4>
                  <p className="text-green-700">
                    Soil health: Excellent. Nutrient balance optimal for current crop cycle. 
                    Next automated test scheduled in 6 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Automated Reporting</span>
                </CardTitle>
                <CardDescription>
                  Generate and manage system reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">📊 Weekly Summary</h4>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Total water usage: 1,250L</li>
                          <li>• Irrigation cycles: 23</li>
                          <li>• Average soil moisture: 68%</li>
                          <li>• System uptime: 99.8%</li>
                        </ul>
                        <Button 
                          className="w-full mt-3" 
                          variant="outline"
                          onClick={generateReport}
                        >
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">🔔 Notifications</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Report sent to admin@farm.com</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Soil test complete</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span>Low moisture alert sent</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-4">📈 Performance Analytics</h4>
                      <ChartContainer
                        config={{
                          usage: { label: "Water Usage (L)", color: "#3b82f6" }
                        }}
                      >
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={[
                            { day: 'Mon', usage: 180 },
                            { day: 'Tue', usage: 160 },
                            { day: 'Wed', usage: 220 },
                            { day: 'Thu', usage: 140 },
                            { day: 'Fri', usage: 190 },
                            { day: 'Sat', usage: 210 },
                            { day: 'Sun', usage: waterUsage }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="usage" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
