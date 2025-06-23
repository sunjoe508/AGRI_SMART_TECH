
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Droplets, 
  Thermometer, 
  Cloud, 
  Sun, 
  Sprout, 
  TestTube, 
  CheckCircle, 
  Activity,
  Zap,
  Database
} from 'lucide-react';

const IrrigationCycle = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [cycleProgress, setCycleProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const cycleSteps = [
    {
      id: 0,
      name: "Soil Monitoring",
      icon: <TestTube className="w-6 h-6" />,
      description: "Sensors detect soil moisture levels",
      details: "pH: 6.8 | Moisture: 25% | Temperature: 24°C",
      color: "bg-blue-500",
      duration: 3000
    },
    {
      id: 1,
      name: "Weather Analysis",
      icon: <Cloud className="w-6 h-6" />,
      description: "AI analyzes weather forecast data",
      details: "Rain expected: 15% | Wind: 8km/h | Humidity: 68%",
      color: "bg-indigo-500",
      duration: 2500
    },
    {
      id: 2,
      name: "AI Decision Making",
      icon: <Database className="w-6 h-6" />,
      description: "System calculates optimal irrigation",
      details: "Algorithm: Predictive ML | Confidence: 94%",
      color: "bg-purple-500",
      duration: 2000
    },
    {
      id: 3,
      name: "Irrigation Activation",
      icon: <Droplets className="w-6 h-6" />,
      description: "Smart valves open, water flows",
      details: "Zone: A1-A4 | Flow rate: 15L/min | Duration: 12min",
      color: "bg-blue-600",
      duration: 4000
    },
    {
      id: 4,
      name: "Real-time Monitoring",
      icon: <Activity className="w-6 h-6" />,
      description: "Continuous feedback loop active",
      details: "Pressure: 2.3 bar | Flow: Optimal | Sensors: Online",
      color: "bg-green-500",
      duration: 3000
    },
    {
      id: 5,
      name: "Growth Optimization",
      icon: <Sprout className="w-6 h-6" />,
      description: "Plants receive optimal hydration",
      details: "Growth rate: +12% | Stress level: Low | Health: 98%",
      color: "bg-emerald-500",
      duration: 3500
    },
    {
      id: 6,
      name: "Data Collection",
      icon: <CheckCircle className="w-6 h-6" />,
      description: "Cycle data stored for analysis",
      details: "Report generated | Analytics updated | ML trained",
      color: "bg-green-600",
      duration: 2000
    }
  ];

  // Auto-advance through cycle
  useEffect(() => {
    if (!isPlaying) return;
    
    const currentStepData = cycleSteps[currentStep];
    const interval = setInterval(() => {
      setCycleProgress(prev => {
        if (prev >= 100) {
          setCurrentStep(prevStep => (prevStep + 1) % cycleSteps.length);
          return 0;
        }
        return prev + (100 / (currentStepData.duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep, isPlaying]);

  const currentStepData = cycleSteps[currentStep];

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-green-600" />
            <span>Live Irrigation Cycle</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              className={`${currentStepData.color} text-white animate-pulse`}
            >
              Step {currentStep + 1}/7
            </Badge>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-sm bg-white px-3 py-1 rounded-full border"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Step Visualization */}
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border-2 border-dashed border-green-300">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentStepData.color} text-white mb-4`}>
            {currentStepData.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {currentStepData.name}
          </h3>
          <p className="text-gray-600 mb-3">{currentStepData.description}</p>
          <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded">
            {currentStepData.details}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Step Progress</span>
              <span>{Math.round(cycleProgress)}%</span>
            </div>
            <Progress value={cycleProgress} className="h-3" />
          </div>
        </div>

        {/* Cycle Overview */}
        <div className="grid grid-cols-7 gap-2">
          {cycleSteps.map((step, index) => (
            <div
              key={step.id}
              className={`text-center p-3 rounded-lg transition-all duration-300 ${
                index === currentStep
                  ? 'bg-green-100 border-2 border-green-500 scale-105'
                  : index < currentStep
                  ? 'bg-green-50 border border-green-300'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 ${
                index === currentStep
                  ? step.color + ' text-white'
                  : index < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {React.cloneElement(step.icon, { className: 'w-4 h-4' })}
              </div>
              <p className="text-xs font-medium">{step.name}</p>
            </div>
          ))}
        </div>

        {/* System Status Indicators */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Thermometer className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-semibold text-blue-800">Temperature</p>
            <p className="text-lg font-bold text-blue-600">24.2°C</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Droplets className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-semibold text-green-800">Soil Moisture</p>
            <p className="text-lg font-bold text-green-600">68%</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <Sun className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
            <p className="text-sm font-semibold text-yellow-800">UV Index</p>
            <p className="text-lg font-bold text-yellow-600">6.2</p>
          </div>
        </div>

        {/* Next Action Preview */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">
            🔮 Next: {cycleSteps[(currentStep + 1) % cycleSteps.length].name}
          </h4>
          <p className="text-sm text-yellow-700">
            {cycleSteps[(currentStep + 1) % cycleSteps.length].description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default IrrigationCycle;
