
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sprout, 
  Droplets, 
  Shield, 
  Users, 
  MapPin, 
  Phone, 
  Cloud,
  BarChart3,
  Leaf,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Droplets className="w-12 h-12 text-blue-500" />,
      title: "Smart Irrigation",
      description: "AI-powered water management for optimal crop growth",
      color: "from-blue-50 to-blue-100"
    },
    {
      icon: <Cloud className="w-12 h-12 text-orange-500" />,
      title: "Weather Forecasting", 
      description: "Real-time Kenyan weather data and predictions",
      color: "from-orange-50 to-orange-100"
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-green-500" />,
      title: "Data Analytics",
      description: "Comprehensive farm performance insights",
      color: "from-green-50 to-green-100"
    },
    {
      icon: <Phone className="w-12 h-12 text-purple-500" />,
      title: "SMS Alerts",
      description: "Instant notifications to Kenyan mobile numbers",
      color: "from-purple-50 to-purple-100"
    }
  ];

  const kenyanBenefits = [
    "💧 Conserve water in arid regions",
    "📱 SMS integration with Safaricom, Airtel, Telkom",
    "🌾 Optimize maize, beans, and coffee production", 
    "🇰🇪 Tailored for Kenyan climate and soils",
    "💰 Reduce farming costs by up to 40%",
    "📍 County-specific weather and soil data"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Sprout className="w-16 h-16 text-green-600" />
              <h1 className="text-5xl font-bold text-green-800">AgriSmart Kenya</h1>
            </div>
            
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Badge variant="outline" className="bg-green-50 text-lg px-4 py-2">
                <Droplets className="w-5 h-5 mr-2" />
                Water Efficient
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-lg px-4 py-2">
                <Shield className="w-5 h-5 mr-2" />
                AI Powered
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-lg px-4 py-2">
                <MapPin className="w-5 h-5 mr-2" />
                🇰🇪 Kenya Focused
              </Badge>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 max-w-4xl mx-auto leading-tight">
              Revolutionary Smart Irrigation System for Kenyan Farmers
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Increase crop yields by 60% while conserving water. Designed specifically for Kenya's diverse climate zones, from Nairobi to Mombasa, with SMS alerts and county-specific weather data.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button 
                onClick={() => navigate('/auth')}
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
              >
                <Users className="w-5 h-5 mr-2" />
                Join AgriSmart Kenya
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-3 border-green-600 text-green-600 hover:bg-green-50"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call +254 700 123 456
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className={`bg-gradient-to-br ${feature.color} border-0 shadow-lg hover:shadow-xl transition-shadow`}>
              <CardContent className="p-8 text-center">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Kenyan Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-green-800 mb-6">
              Built for Kenyan Agriculture
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {kenyanBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl">{benefit.split(' ')[0]}</div>
                  <p className="text-gray-700">{benefit.substring(3)}</p>
                </div>
              ))}
            </div>
          </div>
          
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-green-600" />
                <span>Kenya Coverage</span>
              </CardTitle>
              <CardDescription>
                Available across all 47 counties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p>🏙️ <strong>Nairobi:</strong> Urban farming</p>
                  <p>🌾 <strong>Nakuru:</strong> Wheat & maize</p>
                  <p>☕ <strong>Nyeri:</strong> Coffee farms</p>
                  <p>🥔 <strong>Nyandarua:</strong> Potatoes</p>
                </div>
                <div className="space-y-1">
                  <p>🏖️ <strong>Mombasa:</strong> Coastal crops</p>
                  <p>🌽 <strong>Kisumu:</strong> Rice & sugarcane</p>
                  <p>🫘 <strong>Meru:</strong> Beans & vegetables</p>
                  <p>🌿 <strong>Kiambu:</strong> Tea & coffee</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Transforming Kenyan Agriculture
            </h3>
            <p className="text-gray-600 text-lg">
              Join thousands of farmers already using AgriSmart across Kenya
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2,400+</div>
              <p className="text-gray-600">Active Farmers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">47</div>
              <p className="text-gray-600">Counties Covered</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">60%</div>
              <p className="text-gray-600">Yield Increase</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">40%</div>
              <p className="text-gray-600">Water Saved</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12 text-white">
          <Leaf className="w-16 h-16 mx-auto mb-6 text-green-200" />
          <h3 className="text-3xl font-bold mb-4">
            Ready to Transform Your Farm?
          </h3>
          <p className="text-xl mb-8 text-green-100">
            Join the smart farming revolution in Kenya today
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              onClick={() => navigate('/auth')}
              size="lg" 
              className="bg-white text-green-600 hover:bg-green-50 text-lg px-8 py-3"
            >
              <Zap className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3 border-white text-white hover:bg-white/10"
            >
              <Phone className="w-5 h-5 mr-2" />
              Request Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sprout className="w-8 h-8" />
                <h4 className="text-xl font-bold">AgriSmart Kenya</h4>
              </div>
              <p className="text-green-200">
                Empowering Kenyan farmers with smart irrigation technology for sustainable agriculture.
              </p>
            </div>
            
            <div>
              <h5 className="font-bold mb-4">Contact Info</h5>
              <div className="space-y-2 text-green-200">
                <p>📞 +254 700 123 456</p>
                <p>📧 info@agrismart.co.ke</p>
                <p>📍 Westlands, Nairobi, Kenya</p>
              </div>
            </div>
            
            <div>
              <h5 className="font-bold mb-4">Quick Links</h5>
              <div className="space-y-2 text-green-200">
                <p>🌾 Crop Advisory</p>
                <p>💧 Water Management</p>
                <p>📱 SMS Services</p>
                <p>🎓 Farmer Training</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-200">
            <p>&copy; 2024 AgriSmart Kenya. Transforming agriculture across all 47 counties.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
