import React from 'react';

interface VideoBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 dark:from-green-950 dark:via-emerald-950 dark:to-blue-950" />
        
        {/* Animated floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-300/30 dark:bg-green-600/20 rounded-full filter blur-3xl animate-pulse" 
             style={{ animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-300/30 dark:bg-blue-600/20 rounded-full filter blur-3xl animate-pulse" 
             style={{ animation: 'float 10s ease-in-out infinite 2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-emerald-300/30 dark:bg-emerald-600/20 rounded-full filter blur-3xl animate-pulse" 
             style={{ animation: 'float 12s ease-in-out infinite 4s' }} />
        
        {/* Moving gradient waves */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/50 to-transparent dark:via-green-700/30"
               style={{ animation: 'wave 15s linear infinite' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-200/50 to-transparent dark:via-blue-700/30"
               style={{ animation: 'wave 20s linear infinite reverse' }} />
        </div>

        {/* Particle dots */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-green-400/40 dark:bg-green-300/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
          }
          25% {
            transform: translateY(-20px) translateX(10px) scale(1.05);
          }
          50% {
            transform: translateY(-10px) translateX(-15px) scale(0.95);
          }
          75% {
            transform: translateY(-25px) translateX(5px) scale(1.02);
          }
        }
        
        @keyframes wave {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
};

export default VideoBackground;
