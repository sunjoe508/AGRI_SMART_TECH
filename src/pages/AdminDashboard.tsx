
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, 
  MapPin, 
  Droplets, 
  TrendingUp, 
  Globe, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Database,
  Settings,
  Download,
  Mail,
  MessageSquare,
  BarChart3,
  Wheat,
  Tractor
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const [totalFarms, setTotalFarms] = useState(247);
  const [activeFarms, setActiveFarms] = useState(231);
  const [totalWaterSaved, setTotalWaterSaved] = useState(1.2); // Million liters
  const [globalStats, setGlobalStats] = useState({
    foodSecurityIndex: 78,
    waterEfficiency: 92,
    cropYield: 15.2, // % increase
    carbonReduction: 3400 // tons CO2
  });

  const { toast } = useToast();

  const farmData = [
    { name: 'Green Valley', status: 'active', efficiency: 95, location: 'California', waterSaved: 15400 },
    { name: 'Sunset Farms', status: 'active', efficiency: 87, location: 'Texas', waterSaved: 12200 },
    { name: 'Blue Ridge', status: 'maintenance', efficiency: 0, location: 'Oregon', waterSaved: 8900 },
    { name: 'Golden Harvest', status: 'active', efficiency: 92, location: 'Nebraska', waterSaved: 18700 },
    { name: 'Prairie View', status: 'active', efficiency: 89, location: 'Kansas', waterSaved: 14300 }
  ];

  const waterUsageData = [
    { month: 'Jan', traditional: 45000, smart: 28000 },
    { month: 'Feb', traditional: 42000, smart: 26000 },
    { month: 'Mar', traditional: 48000, smart: 29000 },
    { month: 'Apr', traditional: 52000, smart: 31000 },
    { month: 'May', traditional: 58000, smart: 34000 },
    { month: 'Jun', traditional: 65000, smart: 38000 }
  ];

  const globalFoodSecurityData = [
    { region: 'North America', secure: 85, moderate: 12, severe: 3 },
    { region: 'Europe', secure: 82, moderate: 15, severe: 3 },
    { region: 'Asia', secure: 68, moderate: 22, severe: 10 },
    { region: 'Africa', secure: 45, moderate: 30, severe: 25 },
    { region: 'South America', secure: 72, moderate: 20, severe: 8 }
  ];

  const efficiencyData = [
    { name: 'Water Saved', value: 35, color: '#3b82f6' },
    { name: 'Energy Reduced', value: 28, color: '#10b981' },
    { name: 'Yield Increased', value: 22, color: '#f59e0b' },
    { name: 'Carbon Offset', value: 15, color: '#8b5cf6' }
  ];

  const sendGlobalReport = () => {
    toast({
      title: "📊 Global Report Dispatched",
      description: "Comprehensive global food security and water efficiency report sent to all stakeholders.",
    });
  };

  const exportData = () => {
    toast({
      title: "📁 Data Export Initiated",
      description: "Exporting farm performance data and analytics...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-800">AgriSmart Global Command</h1>
                <p className="text-sm text-gray-600">Worldwide Farm Management System</p>
              </div>
            </div>
            <Badge className="bg-red-500">Admin</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            <Button onClick={onLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Global Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Active Farms</p>
                  <p className="text-3xl font-bold">{activeFarms}</p>
                  <p className="text-sm text-blue-100">of {totalFarms} total</p>
                </div>
                <Tractor className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Water Saved</p>
                  <p className="text-3xl font-bold">{totalWaterSaved}M</p>
                  <p className="text-sm text-green-100">Liters this year</p>
                </div>
                <Droplets className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Crop Yield</p>
                  <p className="text-3xl font-bold">+{globalStats.cropYield}%</p>
                  <p className="text-sm text-orange-100">Average increase</p>
                </div>
                <Wheat className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">CO₂ Reduced</p>
                  <p className="text-3xl font-bold">{globalStats.carbonReduction}</p>
                  <p className="text-sm text-purple-100">Tons this year</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="farms" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="farms">🚜 Farms</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
            <TabsTrigger value="food-security">🌍 Food Security</TabsTrigger>
            <TabsTrigger value="reports">📋 Reports</TabsTrigger>
            <TabsTrigger value="system">⚙️ System</TabsTrigger>
          </TabsList>

          <TabsContent value="farms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Farm Network Status</span>
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of all connected farms worldwide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {farmData.map((farm, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${farm.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <div>
                          <h4 className="font-semibold">{farm.name}</h4>
                          <p className="text-sm text-gray-600">{farm.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Efficiency</p>
                          <p className="font-bold text-green-600">{farm.efficiency}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Water Saved</p>
                          <p className="font-bold text-blue-600">{farm.waterSaved}L</p>
                        </div>
                        <Badge variant={farm.status === 'active' ? 'default' : 'secondary'}>
                          {farm.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Water Usage Comparison</CardTitle>
                  <CardDescription>Traditional vs Smart Irrigation (Liters/Month)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      traditional: { label: "Traditional", color: "#ef4444" },
                      smart: { label: "Smart System", color: "#22c55e" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={waterUsageData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="traditional" fill="#ef4444" />
                        <Bar dataKey="smart" fill="#22c55e" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Global Efficiency Metrics</CardTitle>
                  <CardDescription>Impact distribution across key areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: { label: "Impact %", color: "#3b82f6" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={efficiencyData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {efficiencyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="food-security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Global Food Security Index</span>
                </CardTitle>
                <CardDescription>
                  Contributing to UN SDG 2: Zero Hunger through smart agriculture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                    <h3 className="text-3xl font-bold text-green-800 mb-2">{globalStats.foodSecurityIndex}%</h3>
                    <p className="text-green-600">Global Food Security Index</p>
                    <p className="text-sm text-gray-600 mt-2">+5.2% improvement this year</p>
                  </div>

                  {globalFoodSecurityData.map((region, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{region.region}</span>
                        <span className="text-sm text-gray-600">
                          {region.secure}% Secure | {region.moderate}% Moderate | {region.severe}% Severe
                        </span>
                      </div>
                      <div className="flex h-4 bg-gray-200 rounded overflow-hidden">
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${region.secure}%` }}
                        />
                        <div 
                          className="bg-yellow-500" 
                          style={{ width: `${region.moderate}%` }}
                        />
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${region.severe}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Global Reporting Center</span>
                </CardTitle>
                <CardDescription>
                  Generate and distribute comprehensive reports to stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Button onClick={sendGlobalReport} className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Global Report
                    </Button>
                    <Button onClick={exportData} variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Analytics Data
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send SMS Alerts
                    </Button>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">📧 Report Distribution</h4>
                    <div className="text-sm space-y-1">
                      <p>• Weekly: 2,400+ farmers</p>
                      <p>• Monthly: Government agencies</p>
                      <p>• Quarterly: UN Food Programme</p>
                      <p>• Annual: Global sustainability report</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>System Administration</span>
                </CardTitle>
                <CardDescription>
                  Manage global system settings and user permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold">Database</span>
                      </div>
                      <p className="text-sm text-gray-600">99.9% uptime</p>
                      <Progress value={99.9} className="mt-2" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        <span className="font-semibold">API Health</span>
                      </div>
                      <p className="text-sm text-gray-600">All systems operational</p>
                      <Badge className="bg-green-500 mt-2">Healthy</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold">Active Users</span>
                      </div>
                      <p className="text-sm text-gray-600">3,247 online</p>
                      <p className="text-xs text-gray-500 mt-1">Peak: 4,891</p>
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

export default AdminDashboard;
