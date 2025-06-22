
import { Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export const LoadingScreen = () => {
  const [showEye, setShowEye] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setShowEye(prev => !prev);
    }, 800);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="relative flex items-center justify-center w-full h-full">
          {showEye ? (
            <Eye size={48} className="text-primary transition-all duration-300" />
          ) : (
            <EyeOff size={48} className="text-primary transition-all duration-300" />
          )}
        </div>
      </div>
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-primary">Subtle</span>
        </h2>
        <p className="text-muted-foreground animate-pulse">Initializing invisible intelligence...</p>
      </div>
    </div>
  );
};
