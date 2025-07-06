
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
  const [autoInstallAttempted, setAutoInstallAttempted] = useState(false);
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

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      setShowAutoInstall(true);
      
      // Show immediate notification
      toast({
        title: "🎉 AgriSmart App Ready for Install!",
        description: "Your app is ready to be installed. Installing automatically...",
        duration: 6000,
      });

      // Auto-trigger after a short delay
      setTimeout(() => {
        if (!autoInstallAttempted) {
          handleAutoInstall(e);
          setAutoInstallAttempted(true);
        }
      }, 2000);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('App installed successfully');
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      toast({
        title: "✅ AgriSmart Installed Successfully!",
        description: "App is now on your home screen. Enjoy farming smarter!",
        duration: 8000,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For browsers that support it but don't fire beforeinstallprompt immediately
    setTimeout(() => {
      if (!canInstall && !isInstalled && !isIOSDevice) {
        setShowAutoInstall(true);
        toast({
          title: "📱 Install AgriSmart App",
          description: "Add AgriSmart to your home screen for the best experience!",
          duration: 10000,
        });
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast, autoInstallAttempted]);

  const handleAutoInstall = async (promptEvent?: any) => {
    const prompt = promptEvent || deferredPrompt;
    
    if (prompt) {
      try {
        console.log('Attempting auto-install...');
        const result = await prompt.prompt();
        console.log('Prompt result:', result);
        
        const { outcome } = await prompt.userChoice;
        console.log('User choice:', outcome);
        
        if (outcome === 'accepted') {
          toast({
            title: "🎉 Installing AgriSmart...",
            description: "App will appear on your home screen shortly!",
            duration: 5000,
          });
        } else {
          toast({
            title: "📱 Install Available",
            description: "You can install AgriSmart anytime using the button below",
            duration: 8000,
          });
        }
        
        setDeferredPrompt(null);
        setCanInstall(false);
      } catch (error) {
        console.log('Auto-install failed:', error);
        handleManualInstall();
      }
    } else {
      console.log('No install prompt available, showing manual instructions');
      handleManualInstall();
    }
  };

  const handleManualInstall = () => {
    if (isIOS || browserType === 'safari') {
      toast({
        title: "🍎 Install on iPhone/iPad",
        description: "1. Tap Share button (□↑)\n2. Scroll and tap 'Add to Home Screen'\n3. Tap 'Add' to install",
        duration: 15000,
      });
    } else if (browserType === 'chrome') {
      toast({
        title: "🤖 Install on Android/Chrome", 
        description: "1. Tap menu (⋮) in top right\n2. Select 'Add to Home Screen'\n3. Tap 'Add' to install",
        duration: 15000,
      });
    } else {
      toast({
        title: "📱 Install Instructions",
        description: "Look for 'Add to Home Screen' or 'Install' in your browser menu",
        duration: 12000,
      });
    }
  };

  const handleForceInstall = () => {
    if (deferredPrompt) {
      handleAutoInstall();
    } else {
      handleManualInstall();
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
            🚀 Install AgriSmart App
          </h2>
          
          <Button 
            onClick={handleForceInstall}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-16 py-8 text-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-bounce"
          >
            <Download className="w-10 h-10 mr-4" />
            INSTALL NOW
          </Button>
          
          <div className="mt-6 space-y-2">
            <p className="text-lg text-blue-700 dark:text-blue-300 font-semibold">
              ⚡ One-Click Install • 🆓 Completely Free • 📱 Works Offline
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {canInstall ? "✅ Ready for automatic installation!" : "Setting up installation..."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Auto Install Status */}
      {(showAutoInstall || canInstall) && (
        <Card className="bg-green-50 dark:bg-green-900 border-green-200 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-bold text-green-800 dark:text-green-200">
                  🤖 Auto-Install Ready
                </h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {canInstall 
                    ? "Click the INSTALL NOW button above for instant installation!"
                    : "AgriSmart is being prepared for installation. Please wait..."
                  }
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
              <span>Android Install</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm mb-4">
              <div className="bg-green-100 dark:bg-green-800 p-3 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-200">
                  🤖 Best on Chrome browser:
                </p>
                <p className="text-green-700 dark:text-green-300">
                  Use Chrome for automatic installation
                </p>
              </div>
            </div>
            <Button 
              onClick={handleManualInstall}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Show Android Steps
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <Apple className="w-5 h-5" />
              <span>iPhone Install</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm mb-4">
              <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-lg">
                <p className="font-semibold text-blue-800 dark:text-blue-200">
                  🍎 Best on Safari browser:
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Use Safari for best iPhone experience
                </p>
              </div>
            </div>
            <Button 
              onClick={handleManualInstall}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Apple className="w-4 h-4 mr-2" />
              Show iPhone Steps
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Troubleshooting */}
      {showAutoInstall && !canInstall && (
        <Card className="bg-yellow-50 dark:bg-yellow-900 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
              <div>
                <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                  🔧 Installation Not Working?
                </h4>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                  <p>• Refresh the page and try again</p>
                  <p>• Make sure you're using Chrome (Android) or Safari (iPhone)</p>
                  <p>• Allow popups and notifications in browser settings</p>
                  <p>• Clear browser cache and try again</p>
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
