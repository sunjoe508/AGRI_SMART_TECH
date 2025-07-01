
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

interface DataVisualization3DProps {
  data: any;
}

const DataVisualization3D = ({ data }: DataVisualization3DProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;

    let animationFrame = 0;

    const drawQuantumVisualization = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.1)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3D-like data bars
      const barData = [
        { label: 'Users', value: data?.totalUsers || 0, color: '#06b6d4' },
        { label: 'Irrigation', value: data?.totalIrrigationLogs || 0, color: '#10b981' },
        { label: 'Sensors', value: data?.totalSensorData || 0, color: '#f97316' },
        { label: 'Orders', value: data?.totalOrders || 0, color: '#8b5cf6' },
      ];

      const maxValue = Math.max(...barData.map(d => d.value));
      const barWidth = 120;
      const barSpacing = 160;
      const startX = 100;

      barData.forEach((bar, index) => {
        const x = startX + index * barSpacing;
        const height = (bar.value / maxValue) * 200 + 20;
        const y = canvas.height - height - 50;

        // 3D effect - side face
        ctx.fillStyle = bar.color + '80';
        ctx.beginPath();
        ctx.moveTo(x + barWidth, y);
        ctx.lineTo(x + barWidth + 20, y - 20);
        ctx.lineTo(x + barWidth + 20, y + height - 20);
        ctx.lineTo(x + barWidth, y + height);
        ctx.fill();

        // 3D effect - top face
        ctx.fillStyle = bar.color + 'aa';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20, y - 20);
        ctx.lineTo(x + barWidth + 20, y - 20);
        ctx.lineTo(x + barWidth, y);
        ctx.fill();

        // Main bar face
        ctx.fillStyle = bar.color;
        ctx.fillRect(x, y, barWidth, height);

        // Animated glow effect
        const glowIntensity = Math.sin(animationFrame * 0.02 + index) * 0.3 + 0.7;
        ctx.shadowColor = bar.color;
        ctx.shadowBlur = 20 * glowIntensity;
        ctx.fillRect(x, y, barWidth, height);
        ctx.shadowBlur = 0;

        // Value text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(bar.value.toString(), x + barWidth / 2, y - 30);
        
        // Label text
        ctx.font = '12px Arial';
        ctx.fillText(bar.label, x + barWidth / 2, y + height + 20);
      });

      // Animated particles
      for (let i = 0; i < 20; i++) {
        const x = (Math.sin(animationFrame * 0.01 + i) * 300) + canvas.width / 2;
        const y = (Math.cos(animationFrame * 0.015 + i) * 100) + canvas.height / 2;
        const alpha = Math.sin(animationFrame * 0.02 + i) * 0.5 + 0.5;
        
        ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrame++;
    };

    const animate = () => {
      drawQuantumVisualization();
      requestAnimationFrame(animate);
    };

    animate();
  }, [data]);

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-purple-400">
            <span className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6" />
              <span>QUANTUM DATA VISUALIZATION</span>
            </span>
            <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500">
              REAL-TIME 3D
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas 
              ref={canvasRef}
              className="w-full h-auto border border-cyan-500/20 rounded-lg bg-black/20"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            <div className="absolute top-4 right-4 text-cyan-400 text-sm">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>NEURAL PROCESSING</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Quantum Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border border-cyan-500/30">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Growth Rate</h3>
            <p className="text-3xl font-bold text-cyan-400">+23.7%</p>
            <p className="text-sm text-gray-300">Quantum acceleration</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30">
          <CardContent className="p-6 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Neural Efficiency</h3>
            <p className="text-3xl font-bold text-purple-400">94.2%</p>
            <p className="text-sm text-gray-300">AI optimization</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-teal-900/50 border border-green-500/30">
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <h3 className="text-lg font-semibold text-white mb-2">System Load</h3>
            <p className="text-3xl font-bold text-green-400">67.8%</p>
            <p className="text-sm text-gray-300">Optimal range</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataVisualization3D;
