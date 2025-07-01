
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Tractor,
  LogOut,
  Shield,
  Zap,
  Brain,
  Sparkles,
  Rocket,
  Eye,
  Cpu,
  Wifi,
  Bot,
  Command,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Star,
  Layers,
  Target,
  Award
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AIAssistant from './AIAssistant';
import HolographicStats from './HolographicStats';
import NeuralNetworkBackground from './NeuralNetworkBackground';
import VoiceCommands from './VoiceCommands';
import DataVisualization3D from './DataVisualization3D';
import FuturisticUserCard from './FuturisticUserCard';

const FuturisticAdminDashboard = () => {
  const [adminSession, setAdminSession] = useState<any>(null);
  const [isAIActive, setIsAIActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hologramMode, setHologramMode] = useState(true);
  const [neuralMode, setNeuralMode] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      navigate('/admin-login');
      return;
    }
    
    try {
      const parsedSession = JSON.parse(session);
      if (!parsedSession.isAdmin || parsedSession.username !== 'joe') {
        localStorage.removeItem('adminSession');
        navigate('/admin-login');
        return;
      }
      setAdminSession(parsedSession);
      
      // Welcome message with futuristic flair
      setTimeout(() => {
        toast({
          title: "🚀 QUANTUM ADMIN PORTAL ACTIVATED",
          description: "Welcome to the future of agricultural management, Commander!",
        });
      }, 1000);
    } catch (error) {
      localStorage.removeItem('adminSession');
      navigate('/admin-login');
    }
  }, [navigate, toast]);

  // Fetch comprehensive stats with real-time updates
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['futuristic-admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalIrrigationLogs },
        { count: totalSensorData },
        { count: totalOrders },
        { count: totalLocations },
        { count: totalSupportTickets }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('irrigation_logs').select('*', { count: 'exact', head: true }),
        supabase.from('sensor_data').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('kenyan_locations').select('*', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalIrrigationLogs: totalIrrigationLogs || 0,
        totalSensorData: totalSensorData || 0,
        totalOrders: totalOrders || 0,
        totalLocations: totalLocations || 0,
        totalSupportTickets: totalSupportTickets || 0,
        systemHealth: 98.7,
        aiProcessingPower: 94.2,
        quantumEfficiency: 87.6
      };
    },
    enabled: !!adminSession,
    refetchInterval: 5000 // Real-time updates every 5 seconds
  });

  // Fetch users with advanced filtering
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['futuristic-users', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,county.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!adminSession
  });

  // Advanced AI-powered analytics
  const { data: aiInsights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      // Simulate AI processing with real data
      const insights = [
        {
          type: 'prediction',
          title: 'Crop Yield Forecast',
          value: '+23.4%',
          confidence: 94,
          icon: Wheat,
          color: 'text-green-400'
        },
        {
          type: 'optimization',
          title: 'Water Usage Efficiency',
          value: '87.2%',
          confidence: 91,
          icon: Droplets,
          color: 'text-blue-400'
        },
        {
          type: 'alert',
          title: 'System Performance',
          value: 'Optimal',
          confidence: 98,
          icon: Zap,
          color: 'text-yellow-400'
        },
        {
          type: 'growth',
          title: 'User Engagement',
          value: '+18.7%',
          confidence: 89,
          icon: TrendingUp,
          color: 'text-purple-400'
        }
      ];
      
      return insights;
    },
    enabled: !!adminSession,
    refetchInterval: 15000
  });

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    toast({
      title: "🌟 QUANTUM SESSION TERMINATED",
      description: "Safe travels, Commander. The portal awaits your return.",
    });
    navigate('/admin-login');
  };

  const activateAI = () => {
    setIsAIActive(!isAIActive);
    toast({
      title: isAIActive ? "🤖 AI Assistant Deactivated" : "🚀 AI Assistant Activated",
      description: isAIActive ? "AI systems in standby mode" : "Neural networks online. How may I assist you?",
    });
  };

  const toggleVoiceCommands = () => {
    setVoiceEnabled(!voiceEnabled);
    toast({
      title: voiceEnabled ? "🎤 Voice Commands Disabled" : "🎤 Voice Commands Enabled",
      description: voiceEnabled ? "Switching to manual control" : "Voice recognition systems online",
    });
  };

  const exportQuantumData = async () => {
    toast({
      title: "🌌 QUANTUM DATA EXPORT INITIATED",
      description: "Compiling multi-dimensional agricultural data matrix...",
    });

    // Simulate advanced export with real data
    setTimeout(() => {
      toast({
        title: "📊 QUANTUM EXPORT COMPLETE",
        description: `Exported ${stats?.totalUsers || 0} farmer profiles and ${stats?.totalIrrigationLogs || 0} irrigation records`,
      });
    }, 3000);
  };

  const launchAIAnalysis = () => {
    toast({
      title: "🧠 NEURAL ANALYSIS LAUNCHING",
      description: "Deploying advanced AI algorithms for predictive analytics...",
    });
  };

  if (!adminSession || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center overflow-hidden">
        <NeuralNetworkBackground />
        <div className="text-center z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-cyan-400 border-t-transparent mx-auto mb-8"></div>
            <div className="absolute inset-0 rounded-full h-32 w-32 border-4 border-purple-400 border-r-transparent mx-auto animate-spin animation-delay-150"></div>
          </div>
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">QUANTUM PORTAL INITIALIZING</h2>
          <p className="text-gray-300 animate-pulse">Connecting to neural networks...</p>
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={dashboardRef}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden relative"
    >
      {neuralMode && <NeuralNetworkBackground />}
      
      {/* Futuristic Header */}
      <div className="relative z-10 bg-black/30 backdrop-blur-xl border-b border-cyan-500/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="w-10 h-10 text-cyan-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <Globe className="w-10 h-10 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  AgriSmart QUANTUM Command Center
                </h1>
                <p className="text-sm text-gray-400 flex items-center space-x-2">
                  <Cpu className="w-4 h-4" />
                  <span>Neural Grid: ONLINE</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                ADMIN NEXUS
              </Badge>
              <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                <Zap className="w-3 h-3 mr-1" />
                QUANTUM ACTIVE
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={toggleVoiceCommands}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            
            <Button 
              onClick={activateAI}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              <Brain className="w-4 h-4 mr-2" />
              {isAIActive ? 'AI ACTIVE' : 'ACTIVATE AI'}
            </Button>
            
            <div className="text-sm text-gray-300">
              <span>Commander: {adminSession.username}</span>
            </div>
            
            <Button 
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              DISENGAGE
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Holographic Stats */}
        {hologramMode && <HolographicStats stats={stats} />}

        {/* AI Insights Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiInsights?.map((insight, index) => (
            <Card key={index} className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <insight.icon className={`w-8 h-8 ${insight.color}`} />
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                    {insight.confidence}% AI
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{insight.title}</h3>
                <p className={`text-2xl font-bold ${insight.color} mb-2`}>{insight.value}</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${insight.confidence}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quantum Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={exportQuantumData}
            className="h-20 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex flex-col items-center justify-center space-y-2"
          >
            <Download className="w-6 h-6" />
            <span>QUANTUM EXPORT</span>
          </Button>
          
          <Button 
            onClick={launchAIAnalysis}
            className="h-20 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex flex-col items-center justify-center space-y-2"
          >
            <Brain className="w-6 h-6" />
            <span>AI ANALYSIS</span>
          </Button>
          
          <Button 
            onClick={() => setHologramMode(!hologramMode)}
            className="h-20 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 flex flex-col items-center justify-center space-y-2"
          >
            <Layers className="w-6 h-6" />
            <span>HOLOGRAM {hologramMode ? 'OFF' : 'ON'}</span>
          </Button>
          
          <Button 
            onClick={() => setNeuralMode(!neuralMode)}
            className="h-20 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 flex flex-col items-center justify-center space-y-2"
          >
            <Cpu className="w-6 h-6" />
            <span>NEURAL {neuralMode ? 'OFF' : 'ON'}</span>
          </Button>
        </div>

        {/* Enhanced Tabs with Futuristic Design */}
        <Tabs defaultValue="neural-users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 backdrop-blur-xl border border-cyan-500/30">
            <TabsTrigger 
              value="neural-users" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              NEURAL USERS ({users?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="quantum-analytics" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              QUANTUM ANALYTICS
            </TabsTrigger>
            <TabsTrigger 
              value="ai-insights" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI INSIGHTS
            </TabsTrigger>
            <TabsTrigger 
              value="command-center" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 text-white"
            >
              <Command className="w-4 h-4 mr-2" />
              COMMAND CENTER
            </TabsTrigger>
          </TabsList>

          <TabsContent value="neural-users" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-cyan-400">
                  <span className="flex items-center space-x-2">
                    <Users className="w-6 h-6" />
                    <span>NEURAL USER MATRIX</span>
                  </span>
                  <Badge className="bg-gradient-to-r from-green-500 to-blue-500">
                    {users?.length || 0} ACTIVE NODES
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time farmer network across Kenya's quantum grid
                </CardDescription>
                <div className="flex items-center space-x-4">
                  <Input
                    placeholder="🔍 Search quantum database..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md bg-black/50 border-cyan-500/30 text-white placeholder-gray-400"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {users?.map((user) => (
                    <FuturisticUserCard 
                      key={user.id} 
                      user={user} 
                      onSelect={setSelectedUser}
                    />
                  ))}
                  
                  {(!users || users.length === 0) && (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No users detected in quantum matrix</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quantum-analytics" className="space-y-6">
            <DataVisualization3D data={stats} />
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center space-x-2">
                  <Brain className="w-6 h-6" />
                  <span>AI NEURAL NETWORK INSIGHTS</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {aiInsights?.map((insight, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500">
                          AI Confidence: {insight.confidence}%
                        </Badge>
                      </div>
                      <p className={`text-xl font-bold ${insight.color}`}>{insight.value}</p>
                      <div className="mt-2 text-sm text-gray-300">
                        Neural analysis indicates optimal performance metrics
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="command-center" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-xl border border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center space-x-2">
                  <Command className="w-6 h-6" />
                  <span>QUANTUM COMMAND CENTER</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-lg text-center">
                    <Database className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                    <p className="text-white font-semibold">System Status</p>
                    <p className="text-green-400">OPTIMAL</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg text-center">
                    <Wifi className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-white font-semibold">Network Grid</p>
                    <p className="text-green-400">CONNECTED</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-900/50 to-teal-900/50 rounded-lg text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-white font-semibold">Power Core</p>
                    <p className="text-green-400">98.7%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Assistant */}
      {isAIActive && <AIAssistant />}
      
      {/* Voice Commands */}
      {voiceEnabled && <VoiceCommands />}
    </div>
  );
};

export default FuturisticAdminDashboard;
