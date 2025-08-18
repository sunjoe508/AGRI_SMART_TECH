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
  CheckCircle
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

  const sampleVendors = [
    { name: 'AgriSupply Kenya Ltd', phone: '+254720123456', email: 'info@agrisupply.co.ke', location: 'Nairobi', specialization: ['Seeds', 'Fertilizers'], rating: 4.8 },
    { name: 'Green Valley Supplies', phone: '+254731234567', email: 'sales@greenvalley.co.ke', location: 'Nakuru', specialization: ['Irrigation Equipment'], rating: 4.6 },
    { name: 'Farm Tech Solutions', phone: '+254742345678', email: 'orders@farmtech.co.ke', location: 'Eldoret', specialization: ['Sensors', 'Technology'], rating: 4.9 }
  ];

  const generateProfile = async () => {
    try {
      const profile = sampleProfiles[0];
      const { error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });

      if (error) throw error;
      setGeneratedData(prev => [...prev, '✅ User Profile']);
    } catch (error: any) {
      console.error('Profile error:', error);
    }
  };

  const generateSensors = async () => {
    try {
      for (const sensor of sampleSensors) {
        const { error } = await supabase
          .from('registered_sensors')
          .insert({
            user_id: user.id,
            name: sensor.name,
            ip_address: sensor.ip,
            sensor_type: sensor.type,
            location_zone: sensor.zone,
            status: 'online',
            last_ping: new Date().toISOString()
          });

        if (error && !error.message.includes('duplicate')) {
          console.error('Sensor error:', error);
        }
      }
      setGeneratedData(prev => [...prev, '✅ Registered Sensors']);
    } catch (error) {
      console.error('Sensors error:', error);
    }
  };

  const generateSensorData = async () => {
    try {
      const now = new Date();
      for (let i = 0; i < 48; i++) { // Last 24 hours, every 30 minutes
        const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000);
        
        for (const sensor of sampleSensors) {
          let value: number;
          let unit: string;

          switch (sensor.type) {
            case 'soil_moisture':
              value = 45 + Math.random() * 30 + Math.sin(i / 8) * 10;
              unit = '%';
              break;
            case 'temperature':
              value = 20 + Math.random() * 10 + Math.sin(i / 6) * 5;
              unit = '°C';
              break;
            case 'humidity':
              value = 50 + Math.random() * 30 + Math.cos(i / 10) * 15;
              unit = '%';
              break;
            case 'ph':
              value = 6.0 + Math.random() * 2;
              unit = 'pH';
              break;
            case 'light_intensity':
              value = Math.max(0, 30000 + Math.random() * 40000 - Math.abs(Math.sin(i / 12)) * 25000);
              unit = 'lux';
              break;
            case 'nutrients':
              value = 300 + Math.random() * 300;
              unit = 'ppm';
              break;
            default:
              value = Math.random() * 100;
              unit = '';
          }

          await supabase
            .from('sensor_data')
            .insert({
              user_id: user.id,
              sensor_type: sensor.type,
              value: Number(value.toFixed(1)),
              unit: unit,
              location_zone: sensor.zone,
              created_at: timestamp.toISOString()
            });
        }
      }
      setGeneratedData(prev => [...prev, '✅ Sensor Data (48 hours)']);
    } catch (error) {
      console.error('Sensor data error:', error);
    }
  };

  const generateIrrigationLogs = async () => {
    try {
      const zones = ['Zone A', 'Zone B', 'Greenhouse 1', 'Field 1', 'Garden', 'Main Field'];
      const now = new Date();
      
      for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - i * 12 * 60 * 60 * 1000); // Every 12 hours
        const zone = zones[Math.floor(Math.random() * zones.length)];
        
        await supabase
          .from('irrigation_logs')
          .insert({
            user_id: user.id,
            zone: zone,
            duration_minutes: 20 + Math.random() * 60,
            water_amount_liters: 50 + Math.random() * 200,
            soil_moisture_before: 30 + Math.random() * 30,
            soil_moisture_after: 60 + Math.random() * 25,
            temperature: 20 + Math.random() * 10,
            humidity: 50 + Math.random() * 30,
            created_at: timestamp.toISOString()
          });
      }
      setGeneratedData(prev => [...prev, '✅ Irrigation Logs']);
    } catch (error) {
      console.error('Irrigation error:', error);
    }
  };

  const generateVendorsAndProducts = async () => {
    try {
      const vendorIds: string[] = [];
      
      // Insert vendors
      for (const vendor of sampleVendors) {
        const { data, error } = await supabase
          .from('vendors')
          .insert({
            name: vendor.name,
            contact_phone: vendor.phone,
            contact_email: vendor.email,
            location: vendor.location,
            specialization: vendor.specialization,
            rating: vendor.rating
          })
          .select('id')
          .single();

        if (error && !error.message.includes('duplicate')) {
          console.error('Vendor error:', error);
        } else if (data) {
          vendorIds.push(data.id);
        }
      }

      // Insert products for each vendor
      const products = [
        { name: 'Hybrid Maize Seeds', category: 'Seeds', price: 850, stock: 500, unit: 'kg' },
        { name: 'NPK Fertilizer 17-17-17', category: 'Fertilizers', price: 4200, stock: 200, unit: '50kg bag' },
        { name: 'Drip Irrigation Kit', category: 'Irrigation', price: 15500, stock: 50, unit: 'set' },
        { name: 'Soil Moisture Sensor Pro', category: 'Technology', price: 8900, stock: 25, unit: 'piece' },
        { name: 'Organic Compost', category: 'Fertilizers', price: 1200, stock: 300, unit: '20kg bag' }
      ];

      for (let i = 0; i < vendorIds.length && i < products.length; i++) {
        await supabase
          .from('vendor_products')
          .insert({
            vendor_id: vendorIds[i],
            product_name: products[i].name,
            category: products[i].category,
            price: products[i].price,
            stock_quantity: products[i].stock,
            unit: products[i].unit,
            description: `High quality ${products[i].name.toLowerCase()}`,
            image_url: '/placeholder.svg'
          });
      }
      
      setGeneratedData(prev => [...prev, '✅ Vendors & Products']);
    } catch (error) {
      console.error('Vendors error:', error);
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
        await supabase
          .from('support_tickets')
          .insert({
            user_id: user.id,
            subject: tickets[i].subject,
            message: tickets[i].message,
            priority: tickets[i].priority,
            status: tickets[i].status,
            created_at: timestamp.toISOString()
          });
      }
      setGeneratedData(prev => [...prev, '✅ Support Tickets']);
    } catch (error) {
      console.error('Support tickets error:', error);
    }
  };

  const generateDailyReports = async () => {
    try {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      await supabase
        .from('daily_reports')
        .insert({
          user_id: user.id,
          report_date: today.toISOString().split('T')[0],
          irrigation_summary: {
            total_water_used: 270.5,
            irrigation_cycles: 3,
            zones_irrigated: ['Zone A', 'Zone B', 'Greenhouse 1'],
            efficiency_score: 87
          },
          weather_summary: {
            avg_temperature: 24.8,
            humidity: 68.3,
            rainfall: 0,
            wind_speed: 12.5,
            conditions: 'Sunny'
          },
          sensor_summary: {
            soil_moisture_avg: 63.7,
            ph_level: 6.8,
            nutrient_status: 'Good',
            sensors_online: 6
          },
          crop_suggestions: ['Consider intercropping with legumes', 'Monitor for pest activity'],
          recommendations: ['Increase irrigation frequency', 'Apply organic fertilizer next week']
        });

      await supabase
        .from('daily_reports')
        .insert({
          user_id: user.id,
          report_date: yesterday.toISOString().split('T')[0],
          irrigation_summary: {
            total_water_used: 195.2,
            irrigation_cycles: 2,
            zones_irrigated: ['Zone A', 'Field 1'],
            efficiency_score: 91
          },
          weather_summary: {
            avg_temperature: 22.1,
            humidity: 75.8,
            rainfall: 2.5,
            wind_speed: 8.2,
            conditions: 'Partly Cloudy'
          },
          sensor_summary: {
            soil_moisture_avg: 71.2,
            ph_level: 6.9,
            nutrient_status: 'Excellent',
            sensors_online: 6
          },
          crop_suggestions: ['Good conditions for planting', 'Consider succession planting'],
          recommendations: ['Reduce irrigation due to rainfall', 'Monitor soil drainage']
        });

      setGeneratedData(prev => [...prev, '✅ Daily Reports']);
    } catch (error) {
      console.error('Daily reports error:', error);
    }
  };

  const generateAllDemoData = async () => {
    setIsGenerating(true);
    setGeneratedData([]);
    
    try {
      await generateProfile();
      await generateSensors();
      await generateSensorData();
      await generateIrrigationLogs();
      await generateVendorsAndProducts();
      await generateSupportTickets();
      await generateDailyReports();

      toast({
        title: "🎉 Demo Data Generated!",
        description: "Complete sample data has been created for your AgriSmart system",
      });

      onDataGenerated();
    } catch (error: any) {
      toast({
        title: "❌ Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-emerald-300 bg-emerald-50/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-emerald-800">
          <Database className="w-5 h-5" />
          <span>Demo Data Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Generate comprehensive sample data to showcase the full AgriSmart system functionality
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <Users className="w-4 h-4 text-blue-600" />
            <span>User Profile</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <Activity className="w-4 h-4 text-green-600" />
            <span>6 Sensors</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>48h Data</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <Droplets className="w-4 h-4 text-cyan-600" />
            <span>Irrigation</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <ShoppingCart className="w-4 h-4 text-orange-600" />
            <span>Marketplace</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <MessageSquare className="w-4 h-4 text-red-600" />
            <span>Support</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Reports</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Complete</span>
          </div>
        </div>

        <Button 
          onClick={generateAllDemoData} 
          disabled={isGenerating}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Database className="w-4 h-4 mr-2 animate-spin" />
              Generating Demo Data...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Generate Complete Demo Data
            </>
          )}
        </Button>

        {generatedData.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {generatedData.map((item, index) => (
              <Badge key={index} variant="secondary" className="justify-start">
                {item}
              </Badge>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
          <strong>What gets generated:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Complete user profile with farm details</li>
            <li>6 different sensor types with realistic data</li>
            <li>48 hours of historical sensor readings</li>
            <li>Irrigation logs and water usage data</li>
            <li>Vendor marketplace with products</li>
            <li>Support tickets and daily reports</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoDataGenerator;