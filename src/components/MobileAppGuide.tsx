
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  Download, 
  Apple, 
  PlayCircle,
  Share,
  Plus,
  CheckCircle,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

const MobileAppGuide = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [browserType, setBrowserType] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Detect browser type
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      setBrowserType('chrome');
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      setBrowserType('safari');
    } else if (userAgent.includes('Firefox')) {
      setBrowserType('firefox');
    } else {
      setBrowserType('other');
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      
      // Show immediate toast notification
      toast({
        title: "📱 Install AgriSmart App",
        description: "Click the install button below for one-click installation!",
        duration: 5000,
      });
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      toast({
        title: "🎉 App Installed Successfully!",
        description: "AgriSmart is now installed on your device",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleOneClickInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support auto-install
      if (browserType === 'safari') {
        toast({
          title: "📱 Install on Safari",
          description: "Tap the Share button (□↑) at the bottom, then 'Add to Home Screen'",
          duration: 8000,
        });
      } else {
        toast({
          title: "📱 Manual Install",
          description: "Look for 'Add to Home Screen' in your browser menu (⋮)",
          duration: 8000,
        });
      }
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "🎉 Installing AgriSmart...",
          description: "The app will appear on your home screen shortly",
        });
      } else {
        toast({
          title: "📱 Installation Cancelled",
          description: "You can install later using browser menu",
        });
      }
      
      setDeferredPrompt(null);
      setCanInstall(false);
    } catch (error) {
      console.error('Installation failed:', error);
      toast({
        title: "❌ Installation Failed",
        description: "Please try using browser menu to add to home screen",
        variant: "destructive"
      });
    }
  };

  const handleIOSInstall = () => {
    toast({
      title: "📱 iOS Installation Steps",
      description: "1. Tap Share button (□↑) at bottom\n2. Scroll and tap 'Add to Home Screen'\n3. Tap 'Add' to confirm",
      duration: 10000,
    });
  };

  if (isInstalled) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 border-2 border-green-200">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-600" />
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            🎉 App Already Installed!
          </h3>
          <p className="text-green-600 dark:text-green-400">
            AgriSmart is running as an installed app on your device.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* One-Click Install Section */}
      {canInstall && (
        <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 border-2 border-blue-300 animate-pulse">
          <CardContent className="text-center py-8">
            <Download className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-bounce" />
            <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4">
              🚀 One-Click Install Available!
            </h3>
            <Button 
              onClick={handleOneClickInstall}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              <Download className="w-6 h-6 mr-2" />
              Install AgriSmart Now
            </Button>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">
              Automatic installation detected - Click above for instant install!
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
            <Smartphone className="w-6 h-6" />
            <span>Install AgriSmart Mobile App</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Smartphone className="w-20 h-20 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-bold mb-2">Get the Full Mobile Experience</h3>
            <p className="text-gray-600 mb-4">
              Install AgriSmart as a mobile app for the best experience on your phone or tablet.
            </p>
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              Works on all devices - Android, iOS, and more!
            </Badge>
          </div>

          {/* Browser-Specific Instructions */}
          {browserType === 'chrome' && !canInstall && (
            <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <PlayCircle className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Chrome Browser Steps:</h4>
                    <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                      <li>Look for install icon in address bar</li>
                      <li>Or tap menu (⋮) → "Add to Home Screen"</li>
                      <li>Tap "Install" or "Add"</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {browserType === 'safari' && (
            <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Apple className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Safari Browser Steps:</h4>
                    <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                      <li>Tap Share button (□↑) at bottom of screen</li>
                      <li>Scroll down and find "Add to Home Screen"</li>
                      <li>Tap "Add to Home Screen"</li>
                      <li>Tap "Add" to confirm</li>
                    </ol>
                    <Button 
                      onClick={handleIOSInstall}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      <Apple className="w-4 h-4 mr-2" />
                      Show iOS Steps
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alternative Install Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => {
                // Try to trigger install prompt manually
                window.dispatchEvent(new Event('beforeinstallprompt'));
                toast({
                  title: "📱 Looking for install option...",
                  description: "Check your browser menu for 'Add to Home Screen'",
                });
              }}
              className="bg-green-600 hover:bg-green-700 text-white p-4 h-auto flex flex-col items-center space-y-2"
            >
              <PlayCircle className="w-8 h-8" />
              <div>
                <div className="font-semibold">Android Install</div>
                <div className="text-sm opacity-90">Add to Home Screen</div>
              </div>
            </Button>

            <Button 
              onClick={handleIOSInstall}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto flex flex-col items-center space-y-2"
            >
              <Apple className="w-8 h-8" />
              <div>
                <div className="font-semibold">iOS Install</div>
                <div className="text-sm opacity-90">Safari Required</div>
              </div>
            </Button>
          </div>

          {/* Troubleshooting */}
          <Card className="bg-orange-50 dark:bg-orange-900 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200">Can't Find "Add to Home Screen"?</h4>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 mt-2 space-y-1">
                    <li>• Make sure you're using Chrome (Android) or Safari (iOS)</li>
                    <li>• Refresh this page and try again</li>
                    <li>• Check browser menu (⋮) for install options</li>
                    <li>• Ensure you have storage space on your device</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">
              Benefits of Installing the App:
            </h4>
            <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
              <li>• Faster loading and better performance</li>
              <li>• Works offline for basic features</li>
              <li>• Native app-like experience</li>
              <li>• Easy access from your home screen</li>
              <li>• Push notifications (coming soon)</li>
            </ul>
          </div>

          {/* Share Option */}
          <div className="text-center">
            <Button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ 
                    title: 'AgriSmart Mobile App', 
                    text: 'Smart farming app for precision agriculture',
                    url: window.location.href 
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "📋 Link Copied!",
                    description: "Share this link to install AgriSmart",
                  });
                }
              }}
              variant="outline"
              size="sm"
            >
              <Share className="w-4 h-4 mr-2" />
              Share App Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAppGuide;
