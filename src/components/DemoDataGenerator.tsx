import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Users, 
  Activity,
  ShoppingCart,
  MessageSquare,
  Droplets,
  BarChart3,
  CheckCircle,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DemoDataGeneratorProps {
  user: any;
  onDataGenerated: () => void;
}

const DemoDataGenerator = ({ user, onDataGenerated }: DemoDataGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<string[]>([]);
  const { toast } = useToast();

  const sampleProfiles = [
    { 
      id: user.id, 
      full_name: 'Demo User', 
      phone_number: '+254712345678', 
      county: 'Kiambu', 
      sub_county: 'Kiambu East', 
      ward: 'Riabai', 
      farm_name: 'Demo Smart Farm', 
      crop_types: ['Maize', 'Beans', 'Tomatoes'], 
      farm_size_acres: 5.5 
    }
  ];

  const sampleSensors = [
    { name: 'Soil Moisture Sensor A1', type: 'soil_moisture', ip: '192.168.1.101', zone: 'Zone A' },
    { name: 'Temperature Sensor B1', type: 'temperature', ip: '192.168.1.102', zone: 'Zone B' },
    { name: 'Humidity Sensor C1', type: 'humidity', ip: '192.168.1.103', zone: 'Greenhouse 1' },
    { name: 'pH Sensor D1', type: 'ph', ip: '192.168.1.104', zone: 'Field 1' },
    { name: 'Light Sensor E1', type: 'light_intensity', ip: '192.168.1.105', zone: 'Garden' },
    { name: 'Nutrient Sensor F1', type: 'nutrients', ip: '192.168.1.106', zone: 'Main Field' }
  ];

  const generateProfile = async () => {
    try {
      const profile = sampleProfiles[0];
      const { error } = await (supabase
        .from('profiles' as any)
        .upsert(profile as any, { onConflict: 'id' }) as any);

      if (error) throw error;
      setGeneratedData(prev => [...prev, '✅ User Profile']);
    } catch (error: any) {
      console.error('Profile error:', error);
    }
  };

  const generateSensorData = async () => {
    try {
      const now = new Date();
      for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000);
        
        for (const sensor of sampleSensors) {
          await (supabase
            .from('sensor_data' as any)
            .insert({
              user_id: user.id,
              sensor_id: sensor.name,
              temperature: 20 + Math.random() * 10,
              humidity: 50 + Math.random() * 30,
              soil_moisture: 45 + Math.random() * 30,
              ph_level: 6.0 + Math.random() * 2,
              created_at: timestamp.toISOString()
            } as any) as any);
        }
      }
      setGeneratedData(prev => [...prev, '✅ Sensor Data']);
    } catch (error) {
      console.error('Sensor data error:', error);
    }
  };

  const generateIrrigationLogs = async () => {
    try {
      const zones = ['Zone A', 'Zone B', 'Greenhouse 1', 'Field 1', 'Garden', 'Main Field'];
      const now = new Date();
      
      for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - i * 12 * 60 * 60 * 1000);
        const zone = zones[Math.floor(Math.random() * zones.length)];
        
        await (supabase
          .from('irrigation_logs' as any)
          .insert({
            user_id: user.id,
            zone: zone,
            duration_minutes: 20 + Math.floor(Math.random() * 60),
            water_used_liters: 50 + Math.random() * 200,
            status: 'completed',
            created_at: timestamp.toISOString()
          } as any) as any);
      }
      setGeneratedData(prev => [...prev, '✅ Irrigation Logs']);
    } catch (error) {
      console.error('Irrigation error:', error);
    }
  };

  const generateSupportTickets = async () => {
    try {
      const tickets = [
        { subject: 'Sensor calibration help', message: 'Need assistance calibrating my soil moisture sensor', priority: 'medium', status: 'open' },
        { subject: 'Irrigation scheduling', message: 'How to set up automatic irrigation for tomatoes?', priority: 'low', status: 'in_progress' },
        { subject: 'Data export feature', message: 'Cannot export sensor data to CSV format', priority: 'high', status: 'resolved' }
      ];

      for (let i = 0; i < tickets.length; i++) {
        const timestamp = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        await (supabase
          .from('support_tickets' as any)
          .insert({
            user_id: user.id,
            subject: tickets[i].subject,
            message: tickets[i].message,
            priority: tickets[i].priority,
            status: tickets[i].status,
            created_at: timestamp.toISOString()
          } as any) as any);
      }
      setGeneratedData(prev => [...prev, '✅ Support Tickets']);
    } catch (error) {
      console.error('Support tickets error:', error);
    }
  };

  const generateOrders = async () => {
    try {
      const products = ['Fertilizer NPK', 'Seed Package', 'Irrigation Kit', 'pH Sensor'];
      
      for (let i = 0; i < 5; i++) {
        await (supabase
          .from('orders' as any)
          .insert({
            user_id: user.id,
            product_name: products[Math.floor(Math.random() * products.length)],
            quantity: 1 + Math.floor(Math.random() * 5),
            total_amount: 1000 + Math.random() * 5000,
            status: ['pending', 'completed', 'shipped'][Math.floor(Math.random() * 3)]
          } as any) as any);
      }
      setGeneratedData(prev => [...prev, '✅ Orders']);
    } catch (error) {
      console.error('Orders error:', error);
    }
  };

  const generateAllData = async () => {
    setIsGenerating(true);
    setGeneratedData([]);

    try {
      await generateProfile();
      await generateSensorData();
      await generateIrrigationLogs();
      await generateSupportTickets();
      await generateOrders();

      toast({
        title: "🎉 Demo Data Generated!",
        description: "All sample data has been created for testing",
      });

      onDataGenerated();
    } catch (error: any) {
      toast({
        title: "❌ Generation Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-foreground">
          <Database className="w-5 h-5 text-primary" />
          <span>Demo Data Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate sample data to test all system features including sensors, irrigation, orders, and more.
        </p>

        {generatedData.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {generatedData.map((item, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" /> Profiles
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" /> Sensors
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3" /> Irrigation
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Tickets
          </div>
          <div className="flex items-center gap-1">
            <ShoppingCart className="w-3 h-3" /> Orders
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Reports
          </div>
        </div>

        <Button 
          onClick={generateAllData}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>Generating Demo Data...</>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Generate All Demo Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DemoDataGenerator;
