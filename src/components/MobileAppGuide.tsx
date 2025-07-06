
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  Download, 
  Apple, 
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Chrome,
  Zap
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

    // Check if app is already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      
      toast({
        title: "🚀 AgriSmart App Ready!",
        description: "Install AgriSmart as a standalone app on your device!",
        duration: 8000,
      });
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('AgriSmart installed as standalone app');
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      toast({
        title: "✅ AgriSmart Installed!",
        description: "AgriSmart is now installed as a standalone app!",
        duration: 8000,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        const result = await deferredPrompt.prompt();
        console.log('Install prompt result:', result);
        
        const { outcome } = await deferredPrompt.userChoice;
        console.log('User choice:', outcome);
        
        if (outcome === 'accepted') {
          toast({
            title: "🎉 Installing AgriSmart...",
            description: "AgriSmart will appear as a standalone app on your device!",
            duration: 5000,
          });
        }
        
        setDeferredPrompt(null);
        setCanInstall(false);
      } catch (error) {
        console.log('Install failed:', error);
        showManualInstructions();
      }
    } else {
      showManualInstructions();
    }
  };

  const showManualInstructions = () => {
    if (isIOS || browserType === 'safari') {
      toast({
        title: "🍎 Install on iPhone/iPad",
        description: "1. Tap Share button (□↑)\n2. Scroll and tap 'Add to Home Screen'\n3. Tap 'Add' - This creates a STANDALONE app!",
        duration: 15000,
      });
    } else if (browserType === 'chrome') {
      toast({
        title: "🤖 Install Standalone App", 
        description: "1. Tap menu (⋮) in top right\n2. Select 'Install app' or 'Add to Home Screen'\n3. Tap 'Install' - This creates a STANDALONE app!",
        duration: 15000,
      });
    } else {
      toast({
        title: "📱 Install Standalone App",
        description: "Look for 'Install app' or 'Add to Home Screen' in your browser menu to install as standalone app",
        duration: 12000,
      });
    }
  };

  if (isInstalled) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 border-2 border-green-200">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-600" />
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            ✅ AgriSmart Standalone App Installed!
          </h3>
          <p className="text-green-600 dark:text-green-400">
            You're using AgriSmart as a standalone app - completely independent from your browser!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Install Button */}
      <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 border-2 border-blue-300 shadow-2xl">
        <CardContent className="text-center py-10">
          <Zap className="w-20 h-20 mx-auto mb-4 text-blue-600 animate-pulse" />
          <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-4">
            🚀 Install AgriSmart as Standalone App
          </h2>
          <p className="text-lg text-blue-700 dark:text-blue-300 mb-6">
            Get AgriSmart as a completely independent app - not just a Chrome bookmark!
          </p>
          
          <Button 
            onClick={handleInstallApp}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-16 py-8 text-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <Download className="w-10 h-10 mr-4" />
            INSTALL STANDALONE APP
          </Button>
          
          <div className="mt-6 space-y-2">
            <p className="text-lg text-blue-700 dark:text-blue-300 font-semibold">
              📱 Standalone App • 🆓 Completely Free • ⚡ Works Offline
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {canInstall ? "✅ Ready for standalone installation!" : "Setting up standalone app installation..."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Installation Status */}
      {canInstall && (
        <Card className="bg-green-50 dark:bg-green-900 border-green-200 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-bold text-green-800 dark:text-green-200">
                  🎯 Standalone App Ready
                </h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Click the button above to install AgriSmart as a standalone app that runs independently!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Specific Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-green-50 dark:bg-green-900 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <PlayCircle className="w-5 h-5" />
              <span>Android Standalone App</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm mb-4">
              <div className="bg-green-100 dark:bg-green-800 p-3 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-200">
                  🤖 Chrome Browser:
                </p>
                <p className="text-green-700 dark:text-green-300">
                  Look for "Install app" option in menu - this creates a standalone app!
                </p>
              </div>
            </div>
            <Button 
              onClick={showManualInstructions}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Show Android Instructions
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <Apple className="w-5 h-5" />
              <span>iPhone Standalone App</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm mb-4">
              <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-lg">
                <p className="font-semibold text-blue-800 dark:text-blue-200">
                  🍎 Safari Browser:
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  "Add to Home Screen" creates a standalone app that runs independently!
                </p>
              </div>
            </div>
            <Button 
              onClick={showManualInstructions}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Apple className="w-4 h-4 mr-2" />
              Show iPhone Instructions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Standalone App Benefits */}
      <Card className="bg-purple-50 dark:bg-purple-900 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-700 dark:text-purple-300">
            🎯 Why Install as Standalone App?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-600" />Runs independently from browser</p>
              <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-600" />Own app icon on home screen</p>
              <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-600" />Faster startup and performance</p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-600" />Works offline completely</p>
              <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-600" />Full screen experience</p>
              <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-600" />No browser address bar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAppGuide;
