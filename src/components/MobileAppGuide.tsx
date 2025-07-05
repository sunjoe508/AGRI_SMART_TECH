
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Download, 
  Apple, 
  PlayCircle,
  Share,
  Plus,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const MobileAppGuide = () => {
  const handleAddToHomeScreen = () => {
    // PWA installation prompt
    if ('serviceWorker' in navigator) {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    }
  };

  const handleIOSInstall = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      alert('To install: Tap the Share button in Safari, then "Add to Home Screen"');
    }
  };

  return (
    <div className="space-y-6">
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

          {/* Quick Install Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleAddToHomeScreen}
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

          {/* Installation Instructions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Installation Instructions:</h4>
            
            {/* Android Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-600">
                  <PlayCircle className="w-5 h-5" />
                  <span>Android Devices</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <strong>Chrome Browser:</strong> Look for "Add to Home Screen" popup or tap the menu (⋮) and select "Add to Home Screen"
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <strong>Other Browsers:</strong> Use the browser menu to find "Add to Home Screen" option
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* iOS Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-600">
                  <Apple className="w-5 h-5" />
                  <span>iOS Devices (iPhone/iPad)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start space-x-3">
                  <Share className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <strong>Step 1:</strong> Open this page in Safari browser (required for iOS)
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Plus className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <strong>Step 2:</strong> Tap the Share button (□↑) at the bottom of the screen
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <strong>Step 3:</strong> Scroll down and tap "Add to Home Screen"
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-600">
                  <Download className="w-5 h-5" />
                  <span>Desktop/Laptop</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <strong>Chrome/Edge:</strong> Look for the install icon in the address bar or use browser menu
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <strong>Firefox/Safari:</strong> Bookmark this page for quick access
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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

          {/* Direct Links */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Or share this direct link to install:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border">
              <code className="text-sm break-all">
                https://82b9e680-33b2-4cf9-8b11-b9a3998ea0e7.lovableproject.com
              </code>
            </div>
            <Button 
              onClick={() => navigator.share?.({ 
                title: 'AgriSmart Mobile App', 
                url: window.location.href 
              })}
              variant="outline"
              size="sm"
              className="mt-3"
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
