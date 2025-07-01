
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Wheat, 
  Eye,
  Sparkles,
  Zap
} from 'lucide-react';

interface FuturisticUserCardProps {
  user: any;
  onSelect: (user: any) => void;
}

const FuturisticUserCard = ({ user, onSelect }: FuturisticUserCardProps) => {
  const getRandomColor = () => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-cyan-500 to-blue-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const cardColor = getRandomColor();

  return (
    <Card className="group relative overflow-hidden bg-black/60 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 transform hover:scale-105 hover:rotate-1">
      {/* Holographic Grid Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
        <div className="w-full h-full bg-[linear-gradient(45deg,transparent_24%,rgba(6,182,212,.1)_25%,rgba(6,182,212,.1)_26%,transparent_27%,transparent_74%,rgba(6,182,212,.1)_75%,rgba(6,182,212,.1)_76%,transparent_77%,transparent_99%),linear-gradient(-45deg,transparent_24%,rgba(6,182,212,.1)_25%,rgba(6,182,212,.1)_26%,transparent_27%,transparent_74%,rgba(6,182,212,.1)_75%,rgba(6,182,212,.1)_76%,transparent_77%,transparent_99%)] bg-[length:12px_12px]"></div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyan-400/60"></div>
      <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyan-400/60"></div>
      <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyan-400/60"></div>
      <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyan-400/60"></div>

      {/* Scanning Line Animation */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>

      <CardContent className="p-4 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${cardColor} flex items-center justify-center`}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">
                {user.full_name || 'Neural User'}
              </h3>
              <p className="text-xs text-cyan-400">
                ID: {user.id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <Badge className={`bg-gradient-to-r ${cardColor} text-xs px-2 py-1`}>
            ACTIVE
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {user.farm_name && (
            <div className="flex items-center space-x-2 text-xs">
              <Wheat className="w-3 h-3 text-green-400" />
              <span className="text-gray-300 truncate">{user.farm_name}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-xs">
            <MapPin className="w-3 h-3 text-purple-400" />
            <span className="text-gray-300 truncate">
              {user.county || 'Unknown'}, Kenya
            </span>
          </div>

          {user.phone_number && (
            <div className="flex items-center space-x-2 text-xs">
              <Phone className="w-3 h-3 text-blue-400" />
              <span className="text-gray-300">{user.phone_number}</span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-xs">
            <Calendar className="w-3 h-3 text-orange-400" />
            <span className="text-gray-300">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Crop Types */}
        {user.crop_types && user.crop_types.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {user.crop_types.slice(0, 2).map((crop: string, index: number) => (
                <Badge 
                  key={index} 
                  className="text-xs bg-green-500/20 text-green-400 border border-green-500/30"
                >
                  {crop}
                </Badge>
              ))}
              {user.crop_types.length > 2 && (
                <Badge className="text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">
                  +{user.crop_types.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Farm Size */}
        {user.farm_size_acres && (
          <div className="mb-4 p-2 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded border border-blue-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Farm Size</span>
              <span className="text-sm font-bold text-blue-400">
                {user.farm_size_acres} acres
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onSelect(user)}
          className="w-full bg-gradient-to-r from-cyan-600/80 to-purple-600/80 hover:from-cyan-500 hover:to-purple-500 text-white text-xs h-8 transition-all duration-300"
        >
          <Eye className="w-3 h-3 mr-1" />
          <span>QUANTUM SCAN</span>
          <Sparkles className="w-3 h-3 ml-1" />
        </Button>

        {/* Status Indicators */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-cyan-500/20">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">ONLINE</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-400">
              {Math.floor(Math.random() * 100)}% SYNC
            </span>
          </div>
        </div>
      </CardContent>

      {/* Hover Effect Glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${cardColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
    </Card>
  );
};

export default FuturisticUserCard;
