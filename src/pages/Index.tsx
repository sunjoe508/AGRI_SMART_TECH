
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, Droplets, BarChart3, Cloud, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 dark:from-green-900 dark:via-emerald-900 dark:to-blue-900 relative overflow-hidden"
         style={{
           backgroundImage: `url("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80")`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed',
         }}>
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/80 dark:bg-black/60 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-green-200 dark:border-green-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <Sprout className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-green-800 dark:text-green-300">AgriSmart</span>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Button onClick={() => navigate('/auth')} variant="outline">
                  Farmer Login
                </Button>
                <Button 
                  onClick={() => navigate('/admin-login')} 
                  variant="outline"
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300"
                >
                  Admin Portal
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
              <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
                🌱 Transform Your Farm with Smart Technology
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Join thousands of Kenyan farmers using AgriSmart to increase crop yields, 
                conserve water, and build sustainable farming practices with AI-powered irrigation systems.
              </p>
              
              <div className="flex items-center justify-center space-x-6 mb-8 flex-wrap">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-2 text-lg">
                  <Droplets className="w-5 h-5 mr-2" />
                  40% Water Savings
                </Badge>
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 text-lg">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  25% Yield Increase
                </Badge>
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-4 py-2 text-lg">
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
              {[
                {
                  icon: Droplets,
                  title: "Smart Irrigation",
                  description: "AI-powered irrigation system that waters your crops at the perfect time with the right amount.",
                  color: "text-blue-600",
                  image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"
                },
                {
                  icon: BarChart3,
                  title: "Real-time Monitoring",
                  description: "Monitor soil moisture, temperature, and humidity levels in real-time through our mobile app.",
                  color: "text-green-600",
                  image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400"
                },
                {
                  icon: Cloud,
                  title: "Weather Integration",
                  description: "Automatic weather-based irrigation adjustments to optimize water usage and crop health.",
                  color: "text-purple-600",
                  image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400"
                },
                {
                  icon: Users,
                  title: "Expert Support",
                  description: "24/7 support from agricultural experts and direct connection to verified vendors.",
                  color: "text-orange-600",
                  image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400"
                }
              ].map((feature, index) => (
                <Card key={index} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white/95 dark:hover:bg-gray-800/95 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="text-center">
                    <feature.icon className={`w-12 h-12 ${feature.color} mx-auto mb-4`} />
                    <CardTitle className="text-green-800 dark:text-green-400">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center dark:text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-green-800/90 dark:bg-green-900/90 backdrop-blur-sm text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">🌱 AgriSmart Kenya</h3>
                <p className="text-green-200 mb-4">
                  Empowering Kenyan farmers with cutting-edge technology for sustainable agriculture 
                  and improved food security across the nation.
                </p>
                <div className="flex space-x-4 flex-wrap">
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
