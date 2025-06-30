import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, Sprout } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 dark:from-green-900 dark:via-emerald-900 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <Sprout className="w-24 h-24 text-green-600 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-green-800 dark:text-green-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/')}
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/auth')}
              variant="outline"
            >
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
    </div>
  );
};

export default NotFound;
