
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Droplets, 
  Activity, 
  Database, 
  MapPin, 
  MessageSquare,
  Zap,
  Cpu,
  Wifi
} from 'lucide-react';

interface HolographicStatsProps {
  stats: any;
}

const HolographicStats = ({ stats }: HolographicStatsProps) => {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStage((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const holographicCards = [
    {
      title: "ACTIVE FARMERS",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      glowColor: "shadow-blue-500/50",
      metric: "nodes",
      growth: "+12.3%"
    },
    {
      title: "IRRIGATION CYCLES",
      value: stats?.totalIrrigationLogs || 0,
      icon: Droplets,
      color: "from-green-500 to-teal-500",
      glowColor: "shadow-green-500/50",
      metric: "events",
      growth: "+8.7%"
    },
    {
      title: "SENSOR MATRIX",
      value: stats?.totalSensorData || 0,
      icon: Activity,
      color: "from-orange-500 to-red-500",
      glowColor: "shadow-orange-500/50",
      metric: "readings",
      growth: "+15.2%"
    },
    {
      title: "QUANTUM EFFICIENCY",
      value: `${stats?.quantumEfficiency || 87.6}%`,
      icon: Zap,
      color: "from-purple-500 to-pink-500",
      glowColor: "shadow-purple-500/50",
      metric: "optimal",
      growth: "+2.1%"
    },
    {
      title: "NEURAL PROCESSING",
      value: `${stats?.aiProcessingPower || 94.2}%`,
      icon: Cpu,
      color: "from-cyan-500 to-blue-500",
      glowColor: "shadow-cyan-500/50",
      metric: "capacity",
      growth: "+5.4%"
    },
    {
      title: "GRID LOCATIONS",
      value: stats?.totalLocations || 0,
      icon: MapPin,
      color: "from-indigo-500 to-purple-500",
      glowColor: "shadow-indigo-500/50",
      metric: "zones",
      growth: "+3.8%"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {holographicCards.map((card, index) => (
        <Card 
          key={index}
          className={`
            relative overflow-hidden bg-black/40 backdrop-blur-xl border-2 
            ${animationStage === index % 4 ? 'border-white' : 'border-cyan-500/30'}
            hover:border-cyan-400/50 transition-all duration-500 transform hover:scale-105
            ${card.glowColor} hover:shadow-2xl
          `}
          style={{
            boxShadow: animationStage === index % 4 
              ? `0 0 30px ${card.color.includes('blue') ? '#3b82f6' : 
                          card.color.includes('green') ? '#10b981' : 
                          card.color.includes('orange') ? '#f97316' : 
                          card.color.includes('purple') ? '#8b5cf6' : 
                          card.color.includes('cyan') ? '#06b6d4' : '#6366f1'}50`
              : undefined
          }}
        >
          {/* Holographic Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20"></div>
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent_99%),linear-gradient(-45deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent_99%)] bg-[length:20px_20px]"></div>
          </div>

          {/* Animated Corner Elements */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400 opacity-70"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-400 opacity-70"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-400 opacity-70"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400 opacity-70"></div>

          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <card.icon 
                className={`w-12 h-12 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}
                style={{
                  filter: animationStage === index % 4 ? 'drop-shadow(0 0 10px currentColor)' : undefined
                }}
              />
              <Badge className={`bg-gradient-to-r ${card.color} text-white animate-pulse`}>
                {card.growth}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider">
                {card.title}
              </h3>
              <p 
                className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent transition-all duration-500`}
                style={{
                  textShadow: animationStage === index % 4 ? '0 0 20px currentColor' : undefined
                }}
              >
                {card.value}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                {card.metric} • quantum synchronized
              </p>
            </div>

            {/* Scanning Line Animation */}
            <div 
              className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${card.color} transition-all duration-2000 ${
                animationStage === index % 4 ? 'w-full' : 'w-0'
              }`}
            ></div>

            {/* Data Stream Visualization */}
            <div className="absolute top-4 right-4 flex flex-col space-y-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-1 h-1 rounded-full bg-gradient-to-r ${card.color} ${
                    animationStage === (index + i) % 4 ? 'animate-ping' : 'opacity-30'
                  }`}
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HolographicStats;
