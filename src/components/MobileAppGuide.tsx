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
  AlertTriangle,
  Chrome
} from 'lucide-react';

const MobileAppGuide = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [browserType, setBrowserType] = useState('');
  const [isIOS, setIsIOS] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Detect browser type and device
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
    
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
      
      toast({
        title: "📱 App Ready to Install!",
        description: "Click the big install button below",
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
        description: "AgriSmart is now on your home screen",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    // Force show manual instructions for all cases to ensure it works
    if (isIOS || browserType === 'safari') {
      // iOS Safari instructions
      toast({
        title: "📱 Install on iPhone/iPad",
        description: "1. Tap Share button (□↑) at bottom\n2. Tap 'Add to Home Screen'\n3. Tap 'Add'",
        duration: 15000,
      });
    } else if (browserType === 'chrome') {
      // Android Chrome instructions
      if (deferredPrompt) {
        try {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          
          if (outcome === 'accepted') {
            toast({
              title: "🎉 Installing...",
              description: "App will appear on home screen",
            });
          }
          
          setDeferredPrompt(null);
          setCanInstall(false);
        } catch (error) {
          // Fallback to manual instructions
          showChromeInstructions();
        }
      } else {
        showChromeInstructions();
      }
    } else {
      // Other browsers
      toast({
        title: "📱 Install Instructions",
        description: "Look for 'Add to Home Screen' in your browser menu (⋮)",
        duration: 10000,
      });
    }
  };

  const showChromeInstructions = () => {
    toast({
      title: "📱 Install on Android",
      description: "1. Tap menu (⋮) at top right\n2. Tap 'Add to Home Screen'\n3. Tap 'Add'",
      duration: 15000,
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
      {/* Main Install Button - Always Visible */}
      <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 border-2 border-blue-300">
        <CardContent className="text-center py-8">
          <Download className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-bounce" />
          <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4">
            📱 Install AgriSmart App
          </h3>
          <Button 
            onClick={handleInstallClick}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-12 py-6 text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Download className="w-8 h-8 mr-3" />
            INSTALL NOW - FREE
          </Button>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-4 font-medium">
            Works on all phones • One-click install • No app store needed
          </p>
        </CardContent>
      </Card>

      {/* Device-Specific Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Android Instructions */}
        <Card className="bg-green-50 dark:bg-green-900 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <PlayCircle className="w-5 h-5" />
              <span>Android Phones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <span>Open this page in <strong>Chrome browser</strong></span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <span>Tap the <strong>3-dot menu (⋮)</strong> at top right</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <span>Select <strong>"Add to Home Screen"</strong></span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                <span>Tap <strong>"Add"</strong> to confirm</span>
              </div>
            </div>
            <Button 
              onClick={showChromeInstructions}
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Show Android Steps
            </Button>
          </CardContent>
        </Card>

        {/* iPhone Instructions */}
        <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <Apple className="w-5 h-5" />
              <span>iPhone/iPad</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <span>Open this page in <strong>Safari browser</strong></span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <span>Tap <strong>Share button (□↑)</strong> at bottom</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <span>Scroll and find <strong>"Add to Home Screen"</strong></span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                <span>Tap <strong>"Add"</strong> to install</span>
              </div>
            </div>
            <Button 
              onClick={() => {
                toast({
                  title: "📱 iPhone Installation",
                  description: "1. Safari browser required\n2. Share button (□↑) at bottom\n3. Add to Home Screen\n4. Tap Add",
                  duration: 15000,
                });
              }}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
            >
              <Apple className="w-4 h-4 mr-2" />
              Show iPhone Steps
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Troubleshooting */}
      <Card className="bg-orange-50 dark:bg-orange-900 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
            <div>
              <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-3">
                Can't Find "Add to Home Screen"?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Android Users:</h5>
                  <ul className="space-y-1 text-orange-600 dark:text-orange-400">
                    <li>• Use Chrome browser (not other browsers)</li>
                    <li>• Look in the address bar for install icon</li>
                    <li>• Try refreshing the page first</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">iPhone Users:</h5>
                  <ul className="space-y-1 text-orange-600 dark:text-orange-400">
                    <li>• Must use Safari browser (not Chrome)</li>
                    <li>• Share button is at the very bottom</li>
                    <li>• Scroll down in the share menu</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 p-6 rounded-lg">
        <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200 text-center">
          🌟 Why Install the AgriSmart App?
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="font-medium">Faster Loading</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📱</div>
            <div className="font-medium">Works Offline</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🏠</div>
            <div className="font-medium">Home Screen Access</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🆓</div>
            <div className="font-medium">Completely Free</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppGuide;
