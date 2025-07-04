
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 dark:from-green-900 dark:via-emerald-900 dark:to-blue-900 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Sprout className="w-24 h-24 text-green-600" />
              <div className="absolute -top-2 -right-2 text-6xl">🌱</div>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-green-800 dark:text-green-400 mb-2">
            404
          </CardTitle>
          <CardTitle className="text-2xl text-gray-900 dark:text-white mb-4">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            Looks like this page got lost in the fields! The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
              🌾 What you can do:
            </h3>
            <ul className="text-sm text-green-700 dark:text-green-200 space-y-1">
              <li>• Check the URL for any typos</li>
              <li>• Go back to the previous page</li>
              <li>• Return to the AgriSmart homepage</li>
              <li>• Contact our support team if you need help</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1 hover:bg-green-50 hover:border-green-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
          
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Contact us at{' '}
              <a 
                href="mailto:support@agrismart.co.ke" 
                className="text-green-600 hover:text-green-700 font-medium"
              >
                support@agrismart.co.ke
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
