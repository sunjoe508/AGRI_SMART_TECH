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
  Database,
  Sprout,
  Tractor,
  LogOut,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import IrrigationCycle from '@/components/IrrigationCycle';

const Index = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
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
      description: "Weekly irrigation report will be sent to your email (Supabase integration required).",
    });
  };

  const sendSMSAlert = () => {
    toast({
      title: "📱 SMS Alert",
      description: "SMS functionality requires Supabase integration for backend services.",
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header with Agricultural Theme */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-600 rounded-full">
                  <Sprout className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-blue-600 bg-clip-text text-transparent">
                    🌱 AgriSmart Pro
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {user?.farmName || 'Smart Irrigation'} - Precision Agriculture System
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <Badge className="bg-green-500">
                  <Tractor className="w-4 h-4 mr-1" />
                  Farm Active
                </Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  <Droplets className="w-4 h-4 mr-1" />
                  Water Efficient
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
                <p className="text-xs text-gray-500">{currentTime.toLocaleString()}</p>
              </div>
              <Button onClick={onLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Live Irrigation Cycle Video-like Component */}
        <IrrigationCycle />

        {/* Enhanced Status Overview with Agricultural Aesthetics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Soil Moisture</p>
                  <p className={`text-3xl font-bold`}>{moistureLevel.toFixed(1)}%</p>
                  <p className="text-sm text-blue-100">Critical: &lt;30%</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <Droplets className="w-10 h-10 text-blue-200" />
                </div>
              </div>
              <Progress value={moistureLevel} className="mt-3 bg-blue-300" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Temperature</p>
                  <p className="text-3xl font-bold">{temperature.toFixed(1)}°C</p>
                  <p className="text-sm text-orange-100">Optimal: 20-25°C</p>
                </div>
                <Thermometer className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100">Air Humidity</p>
                  <p className="text-3xl font-bold">{humidity.toFixed(1)}%</p>
                  <p className="text-sm text-cyan-100">Atmospheric moisture</p>
                </div>
                <CloudRain className="w-10 h-10 text-cyan-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Water Usage</p>
                  <p className="text-3xl font-bold">{waterUsage}L</p>
                  <p className="text-sm text-green-100">Today's consumption</p>
                </div>
                <Activity className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Irrigation Status */}
        <Card className={`border-2 shadow-xl ${isIrrigating ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50' : 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-full ${isIrrigating ? 'bg-blue-500 animate-pulse' : 'bg-green-300'} shadow-lg`}>
                  <Droplets className={`w-8 h-8 ${isIrrigating ? 'text-white' : 'text-green-700'}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {isIrrigating ? '🚿 Irrigation System Active' : '💧 System on Standby'}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Last irrigation: {lastIrrigation}
                  </p>
                  <p className="text-sm text-gray-500">
                    Next scheduled: Based on weather & soil conditions
                  </p>
                </div>
              </div>
              {isIrrigating && (
                <div className="flex flex-col items-center space-y-2">
                  <Badge variant="default" className="animate-pulse bg-blue-500">
                    <Zap className="w-4 h-4 mr-1" />
                    IRRIGATING
                  </Badge>
                  <div className="text-center">
                    <p className="text-sm text-blue-600">Zone: A1-A4</p>
                    <p className="text-xs text-gray-500">15.2 L/min</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="monitoring">📊 Live Monitoring</TabsTrigger>
            <TabsTrigger value="weather">🌤️ Weather AI</TabsTrigger>
            <TabsTrigger value="soil-lab">🧪 Soil Laboratory</TabsTrigger>
            <TabsTrigger value="reports">📋 Reports & Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-4">
            <Card className="shadow-xl border-0 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Real-time Field Monitoring</span>
                </CardTitle>
                <CardDescription>
                  Live sensor data from agricultural field stations
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
                      <Line type="monotone" dataKey="moisture" stroke="#3b82f6" strokeWidth={3} />
                      <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-lg border-0 bg-white/90">
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
                        <span>Field Sensor A1</span>
                      </span>
                      <Badge variant="outline" className="bg-green-50">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span>Weather Station B2</span>
                      </span>
                      <Badge variant="outline" className="bg-green-50">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span>Irrigation Control C3</span>
                      </span>
                      <Badge variant="outline" className="bg-green-50">Online</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/90">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Water Pump</span>
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
                    <div className="flex items-center justify-between">
                      <span>AI Engine</span>
                      <Badge className="bg-blue-500">Learning</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/90">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700" 
                      onClick={() => {
                        setIsIrrigating(true);
                        setTimeout(() => setIsIrrigating(false), 5000);
                        toast({ title: "Manual irrigation started", description: "System will run for 5 minutes" });
                      }}
                      disabled={isIrrigating}
                    >
                      <Droplets className="w-4 h-4 mr-2" />
                      Manual Irrigation
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      System Settings
                    </Button>
                    <Button variant="outline" className="w-full" onClick={sendSMSAlert}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send SMS Alert
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weather" className="space-y-4">
            <Card className="shadow-xl border-0 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sun className="w-5 h-5" />
                  <span>AI-Powered Weather Integration</span>
                </CardTitle>
                <CardDescription>
                  Machine learning predictions for optimal irrigation scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {weatherForecast.map((day, index) => (
                    <Card key={index} className={`shadow-lg ${index === 0 ? 'border-2 border-blue-500 bg-blue-50' : 'border-0 bg-white'}`}>
                      <CardContent className="p-4 text-center">
                        <p className="font-semibold text-lg">{day.day}</p>
                        <div className="my-3">
                          {day.rain > 50 ? (
                            <CloudRain className="w-10 h-10 mx-auto text-blue-500" />
                          ) : (
                            <Sun className="w-10 h-10 mx-auto text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xl font-bold">{day.temp}°C</p>
                        <p className="text-sm text-gray-600">💧 {day.humidity}%</p>
                        <p className="text-sm text-blue-600">🌧️ {day.rain}%</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3 text-lg">🤖 AI Irrigation Recommendation</h4>
                  <p className="text-blue-700 text-base">
                    Based on weather forecast analysis: Reduce irrigation by 40% for next 2 days due to expected rainfall. 
                    Resume normal schedule on Friday. Predicted water savings: 280L.
                  </p>
                  <div className="mt-3 flex items-center space-x-4">
                    <Badge className="bg-green-500">Water Efficient</Badge>
                    <Badge variant="outline" className="border-blue-500 text-blue-600">94% Confidence</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="soil-lab" className="space-y-4">
            <Card className="shadow-xl border-0 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="w-5 h-5" />
                  <span>Automated Soil Analysis Laboratory</span>
                </CardTitle>
                <CardDescription>
                  Weekly automated soil testing and nutrient monitoring for optimal crop health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg">
                    <h4 className="font-bold mb-4 text-lg">Soil Chemistry Analysis</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">pH Level</span>
                        <span className="font-bold text-green-600 text-xl">{soilPh.toFixed(1)}</span>
                      </div>
                      <Progress value={(soilPh - 5.5) / 2.5 * 100} className="h-3" />
                      <p className="text-sm text-gray-600">Optimal range: 6.0 - 7.5 for most crops</p>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">pH levels are optimal</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
                    <h4 className="font-bold mb-4 text-lg">Nutrient Levels (NPK)</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Nitrogen (N)</span>
                          <span className="text-sm font-bold">{nutrients.nitrogen}%</span>
                        </div>
                        <Progress value={nutrients.nitrogen} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Phosphorus (P)</span>
                          <span className="text-sm font-bold">{nutrients.phosphorus}%</span>
                        </div>
                        <Progress value={nutrients.phosphorus} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Potassium (K)</span>
                          <span className="text-sm font-bold">{nutrients.potassium}%</span>
                        </div>
                        <Progress value={nutrients.potassium} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                  <h4 className="font-bold text-green-800 mb-3 text-lg">🧪 Latest Laboratory Results</h4>
                  <p className="text-green-700 text-base mb-3">
                    Soil health: Excellent. Nutrient balance optimal for current crop cycle. 
                    Microorganism activity: High. Organic matter content: 4.2%.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-green-500">Soil Health: A+</Badge>
                    <Badge variant="outline" className="border-green-500 text-green-600">Next test: 6 days</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="shadow-xl border-0 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Automated Reporting & Communication Center</span>
                </CardTitle>
                <CardDescription>
                  Generate comprehensive reports and send alerts to stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="p-6">
                        <h4 className="font-bold mb-4 text-lg">📊 Weekly Performance Summary</h4>
                        <ul className="text-sm space-y-2 text-gray-700 mb-4">
                          <li>• Total water usage: 1,250L (-15% vs last week)</li>
                          <li>• Irrigation cycles: 23 (optimal efficiency)</li>
                          <li>• Average soil moisture: 68% (target: 65-75%)</li>
                          <li>• System uptime: 99.8% (5 min maintenance)</li>
                          <li>• Crop health index: 94% (excellent)</li>
                          <li>• Weather prediction accuracy: 92%</li>
                        </ul>
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700" 
                          onClick={generateReport}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email Weekly Report
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-green-200 bg-green-50">
                      <CardContent className="p-6">
                        <h4 className="font-bold mb-4 text-lg">🔔 Alert & Notification Center</h4>
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Weekly report sent to {user?.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Soil test analysis complete</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span>Low moisture alert (resolved)</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            <span>SMS alerts: Requires Supabase setup</span>
                          </div>
                        </div>
                        <Button 
                          onClick={sendSMSAlert} 
                          variant="outline" 
                          className="w-full border-green-500 text-green-600"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Setup SMS Alerts
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-6">
                      <h4 className="font-bold mb-4 text-lg">📈 Agricultural Performance Analytics</h4>
                      <ChartContainer
                        config={{
                          usage: { label: "Water Usage (L)", color: "#3b82f6" }
                        }}
                      >
                        <ResponsiveContainer width="100%" height={250}>
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
                            <Bar dataKey="usage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6">
                    <h4 className="font-bold text-yellow-800 mb-3 text-lg">🌍 Contributing to Global Food Security</h4>
                    <p className="text-yellow-700 mb-4">
                      Your smart irrigation system is part of a global network helping achieve UN Sustainable Development Goal 2: Zero Hunger. 
                      This month you've saved 1,250L of water while maintaining optimal crop yield.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-yellow-500">Water Saved: 1,250L</Badge>
                      <Badge className="bg-green-500">Yield Increase: +12%</Badge>
                      <Badge className="bg-blue-500">CO₂ Reduced: 45kg</Badge>
                    </div>
                  </div>
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
