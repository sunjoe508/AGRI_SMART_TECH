
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, Droplets, BarChart3, Cloud, Users, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 relative overflow-hidden"
         style={{
           backgroundImage: `url("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80")`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed',
         }}>
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b-4 border-green-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Sprout className="w-10 h-10 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-green-800">AgriSmart Kenya</h1>
                  <p className="text-green-600">Smart Farming for Sustainable Agriculture</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Users className="w-4 h-4 mr-2" />
                    Farmer Login
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" className="border-purple-500 text-purple-700 hover:bg-purple-50">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                🌱 Transform Your Farm with Smart Technology
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Join thousands of Kenyan farmers using AgriSmart to increase crop yields, 
                conserve water, and build sustainable farming practices with AI-powered irrigation systems.
              </p>
              
              <div className="flex items-center justify-center space-x-6 mb-8">
                <Badge variant="outline" className="bg-green-50 text-green-700 px-4 py-2 text-lg">
                  <Droplets className="w-5 h-5 mr-2" />
                  40% Water Savings
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 px-4 py-2 text-lg">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  25% Yield Increase
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 px-4 py-2 text-lg">
                  <Shield className="w-5 h-5 mr-2" />
                  100% Secure
                </Badge>
              </div>

              <Link to="/auth">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                  Start Smart Farming Today
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center">
                  <Droplets className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-green-800">Smart Irrigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    AI-powered irrigation system that waters your crops at the perfect time with the right amount.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center">
                  <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <CardTitle className="text-green-800">Real-time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Monitor soil moisture, temperature, and humidity levels in real-time through our mobile app.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center">
                  <Cloud className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle className="text-green-800">Weather Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Automatic weather-based irrigation adjustments to optimize water usage and crop health.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center">
                  <Users className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <CardTitle className="text-green-800">Expert Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    24/7 support from agricultural experts and direct connection to verified vendors.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-green-800/90 backdrop-blur-sm text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">🌱 AgriSmart Kenya</h3>
                <p className="text-green-200 mb-4">
                  Empowering Kenyan farmers with cutting-edge technology for sustainable agriculture 
                  and improved food security across the nation.
                </p>
                <div className="flex space-x-4">
                  <Badge variant="outline" className="bg-green-700 text-green-100 border-green-500">
                    🏆 Award Winning
                  </Badge>
                  <Badge variant="outline" className="bg-green-700 text-green-100 border-green-500">
                    🇰🇪 Made in Kenya
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Smart Features</h4>
                <ul className="space-y-2 text-green-200">
                  <li>• Automated Irrigation Systems</li>
                  <li>• Real-time Sensor Monitoring</li>
                  <li>• Weather-based Predictions</li>
                  <li>• Vendor Marketplace Access</li>
                  <li>• Expert Agricultural Support</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact & Support</h4>
                <ul className="space-y-2 text-green-200">
                  <li>📞 +254 700 000 000</li>
                  <li>📧 support@agrismart.co.ke</li>
                  <li>🏢 Nairobi, Kenya</li>
                  <li>🕐 24/7 Customer Support</li>
                  <li>💬 WhatsApp Support Available</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-200">
              <p>&copy; 2024 AgriSmart Kenya. All rights reserved. Transforming agriculture, one farm at a time. 🌾</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
