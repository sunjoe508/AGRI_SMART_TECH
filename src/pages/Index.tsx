
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, Droplets, BarChart3, Cloud, Users, Shield, CheckCircle, Star, TrendingUp, Zap, Award, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Droplets,
      title: "Smart Irrigation",
      description: "AI-powered irrigation system that waters your crops at the perfect time with the right amount.",
      color: "text-blue-600",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop",
      benefits: ["40% Water Savings", "Automated Scheduling", "Weather Integration"]
    },
    {
      icon: BarChart3,
      title: "Real-time Monitoring",
      description: "Monitor soil moisture, temperature, and humidity levels in real-time through our mobile app.",
      color: "text-green-600",
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&auto=format&fit=crop",
      benefits: ["24/7 Monitoring", "Instant Alerts", "Data Analytics"]
    },
    {
      icon: Cloud,
      title: "Weather Integration",
      description: "Automatic weather-based irrigation adjustments to optimize water usage and crop health.",
      color: "text-purple-600",
      image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&auto=format&fit=crop",
      benefits: ["Weather Forecasts", "Auto Adjustments", "Climate Insights"]
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "24/7 support from agricultural experts and direct connection to verified vendors.",
      color: "text-orange-600",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop",
      benefits: ["Expert Advice", "Vendor Network", "Community Support"]
    }
  ];

  const testimonials = [
    {
      name: "John Mwangi",
      location: "Kiambu County",
      quote: "AgriSmart increased my maize yield by 35% while reducing water usage. It's transformed my farming business completely.",
      rating: 5,
      crop: "Maize & Beans"
    },
    {
      name: "Mary Wanjiku",
      location: "Nakuru County",
      quote: "The automated irrigation system works perfectly. I can monitor my greenhouse tomatoes from anywhere using my phone.",
      rating: 5,
      crop: "Greenhouse Tomatoes"
    },
    {
      name: "Peter Kimani",
      location: "Meru County",
      quote: "Professional support and reliable technology. My coffee plantation has never been more productive.",
      rating: 5,
      crop: "Coffee"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Farmers", icon: Users },
    { number: "2.5M", label: "Liters Water Saved", icon: Droplets },
    { number: "35%", label: "Average Yield Increase", icon: TrendingUp },
    { number: "24/7", label: "Expert Support", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-25 to-blue-50 dark:from-green-950 dark:via-emerald-950 dark:to-blue-950 relative overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Header */}
      <header className="relative z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-green-200 dark:border-green-800 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Sprout className="w-8 h-8 text-green-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-green-800 dark:text-green-300">AgriSmart</span>
                <div className="flex items-center space-x-1 mt-1">
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                    🏆 Award Winning
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button onClick={() => navigate('/auth')} className="bg-green-600 hover:bg-green-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full mb-6">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Kenya's #1 Smart Farming Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Transform Your Farm with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> Smart Technology</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Join thousands of Kenyan farmers using AgriSmart to increase crop yields by 35%, 
              reduce water usage by 40%, and build sustainable farming practices with AI-powered precision agriculture.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 px-6 py-3 text-lg border-green-200">
                <Droplets className="w-5 h-5 mr-2" />
                40% Water Savings
              </Badge>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-6 py-3 text-lg border-blue-200">
                <TrendingUp className="w-5 h-5 mr-2" />
                35% Yield Increase
              </Badge>
              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-6 py-3 text-lg border-purple-200">
                <Shield className="w-5 h-5 mr-2" />
                100% Secure
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Smart Farming Today
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                <Globe className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <stat.icon className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.number}</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features for Modern Farming
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to transform your farm into a smart, profitable, and sustainable operation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${
                      feature.color.includes('blue') ? 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800' :
                      feature.color.includes('green') ? 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-800' :
                      feature.color.includes('purple') ? 'from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800' :
                      'from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800'
                    }`}>
                      <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white mb-3">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-center mb-4 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center text-sm text-green-700 dark:text-green-300">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Trusted by Farmers Across Kenya
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Real stories from farmers who transformed their operations with AgriSmart
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.location}</div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">{testimonial.crop}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            Join thousands of successful farmers using AgriSmart. Start your journey to smarter, 
            more profitable farming today with our 30-day free trial.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg">
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-green-100 mt-6">
            No credit card required • Cancel anytime • Full support included
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Sprout className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold">AgriSmart Kenya</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
                Empowering Kenyan farmers with cutting-edge technology for sustainable agriculture 
                and improved food security across the nation.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="bg-green-800 text-green-100 border-green-600">
                  🏆 Award Winning Platform
                </Badge>
                <Badge variant="outline" className="bg-green-800 text-green-100 border-green-600">
                  🇰🇪 Proudly Kenyan
                </Badge>
                <Badge variant="outline" className="bg-green-800 text-green-100 border-green-600">
                  🌱 Eco-Friendly Technology
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-green-400">Smart Features</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Automated Irrigation Systems</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Real-time Sensor Monitoring</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Weather-based Predictions</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Vendor Marketplace Access</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Expert Agricultural Support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-green-400">Contact & Support</h4>
              <ul className="space-y-3 text-gray-300">
                <li>📞 +254 700 000 000</li>
                <li>📧 support@agrismart.co.ke</li>
                <li>🏢 Nairobi, Kenya</li>
                <li>🕐 24/7 Customer Support</li>
                <li>💬 WhatsApp Support Available</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 AgriSmart Kenya. All rights reserved. Transforming agriculture, one farm at a time. 🌾
            </p>
            <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-500">
              <a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-green-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
