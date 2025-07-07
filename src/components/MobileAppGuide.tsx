
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
  const [showAutoInstall, setShowAutoInstall] = useState(false);
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
      return;
    }

    // Auto-trigger installation flow after 2 seconds
    const autoInstallTimer = setTimeout(() => {
      setShowAutoInstall(true);
      if (!isIOSDevice && browserType === 'chrome') {
        // Show immediate install prompt for Chrome users
        toast({
          title: "🚀 Ready to Install AgriSmart!",
          description: "Click the install button below for instant app installation",
          duration: 8000,
        });
      }
    }, 2000);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      
      // Auto-trigger the install prompt immediately
      setTimeout(() => {
        handleAutoInstall(e);
      }, 1000);
      
      toast({
        title: "🎉 AgriSmart App Ready!",
        description: "Installing automatically... or click Install Now below",
        duration: 6000,
      });
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      toast({
        title: "✅ AgriSmart Installed Successfully!",
        description: "App is now on your home screen. Enjoy farming smarter!",
        duration: 5000,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(autoInstallTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast, browserType, isIOS]);

  const handleAutoInstall = async (promptEvent?: any) => {
    const prompt = promptEvent || deferredPrompt;
    
    if (prompt) {
      try {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        
        if (outcome === 'accepted') {
          toast({
            title: "🎉 Installing AgriSmart...",
            description: "App will appear on your home screen in seconds!",
            duration: 4000,
          });
        } else {
          toast({
            title: "📱 Manual Install Available",
            description: "You can still install using the button below anytime",
            duration: 6000,
          });
        }
        
        setDeferredPrompt(null);
        setCanInstall(false);
      } catch (error) {
        console.log('Auto-install failed, showing manual instructions');
        handleManualInstall();
      }
    } else {
      handleManualInstall();
    }
  };

  const handleManualInstall = () => {
    if (isIOS || browserType === 'safari') {
      toast({
        title: "🍎 iPhone Install Steps",
        description: "1. Tap Share (□↑) at bottom\n2. Select 'Add to Home Screen'\n3. Tap 'Add'",
        duration: 12000,
      });
    } else if (browserType === 'chrome') {
      toast({
        title: "🤖 Android Install Steps", 
        description: "1. Tap menu (⋮) at top right\n2. Select 'Add to Home Screen'\n3. Tap 'Add'",
        duration: 12000,
      });
    } else {
      toast({
        title: "📱 Install Instructions",
        description: "Look for 'Add to Home Screen' in your browser menu",
        duration: 10000,
      });
    }
  };

  if (isInstalled) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 border-2 border-green-200">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-600" />
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            ✅ AgriSmart App Installed!
          </h3>
          <p className="text-green-600 dark:text-green-400">
            You're using the full app experience. Check your home screen!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Auto-Install Button */}
      <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 border-2 border-blue-300 shadow-2xl">
        <CardContent className="text-center py-10">
          <Zap className="w-20 h-20 mx-auto mb-4 text-blue-600 animate-pulse" />
          <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-6">
            🚀 Auto-Install AgriSmart
          </h2>
          
          <Button 
            onClick={() => handleAutoInstall()}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-16 py-8 text-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-bounce"
          >
            <Download className="w-10 h-10 mr-4" />
            INSTALL NOW - AUTO
          </Button>
          
          <div className="mt-6 space-y-2">
            <p className="text-lg text-blue-700 dark:text-blue-300 font-semibold">
              ⚡ Instant Installation • 🆓 Completely Free • 📱 Works on All Phones
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {canInstall ? "✅ Ready for one-click install!" : "Setting up auto-install..."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Auto Install Status */}
      {showAutoInstall && (
        <Card className="bg-orange-50 dark:bg-orange-900 border-orange-200 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-orange-600" />
              <div>
                <h4 className="font-bold text-orange-800 dark:text-orange-200">
                  🤖 Auto-Install Active
                </h4>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  AgriSmart is attempting automatic installation. If popup appears, click "Install" or "Add".
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Specific Quick Install */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-green-50 dark:bg-green-900 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <PlayCircle className="w-5 h-5" />
              <span>Android Auto-Install</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm mb-4">
              <div className="bg-green-100 dark:bg-green-800 p-3 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-200">
                  🤖 For automatic installation:
                </p>
                <p className="text-green-700 dark:text-green-300">
                  Use Chrome browser and allow install prompts
                </p>
              </div>
            </div>
            <Button 
              onClick={handleManualInstall}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Install on Android
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <Apple className="w-5 h-5" />
              <span>iPhone Auto-Install</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm mb-4">
              <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-lg">
                <p className="font-semibold text-blue-800 dark:text-blue-200">
                  🍎 For automatic installation:
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Use Safari browser for best results
                </p>
              </div>
            </div>
            <Button 
              onClick={handleManualInstall}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Apple className="w-4 h-4 mr-2" />
              Install on iPhone
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* App Benefits */}
      <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 p-6 rounded-lg">
        <h4 className="font-bold mb-4 text-gray-800 dark:text-gray-200 text-center text-lg">
          🌟 Why AgriSmart is Better as an App
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-medium">Lightning Fast</div>
            <div className="text-xs text-gray-600">Instant loading</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-3xl mb-2">📱</div>
            <div className="font-medium">Works Offline</div>
            <div className="text-xs text-gray-600">No internet needed</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-3xl mb-2">🔔</div>
            <div className="font-medium">Push Notifications</div>
            <div className="text-xs text-gray-600">Farm alerts</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-3xl mb-2">🏠</div>
            <div className="font-medium">Home Screen</div>
            <div className="text-xs text-gray-600">One-tap access</div>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      {!canInstall && (
        <Card className="bg-yellow-50 dark:bg-yellow-900 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
              <div>
                <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                  🔧 Auto-Install Not Working?
                </h4>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                  <p>• Make sure you're using Chrome (Android) or Safari (iPhone)</p>
                  <p>• Allow popups and install prompts in browser settings</p>
                  <p>• Try refreshing the page and clicking Install again</p>
                  <p>• Use the manual install buttons above as backup</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileAppGuide;
