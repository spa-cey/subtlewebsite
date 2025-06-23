import { ArrowRight, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { useState } from 'react';
import { WaitlistModal } from '../waitlist/WaitlistModal';
import DiagramComponent from './DiagramComponent';
interface HeroSectionProps {
  showTitle: boolean;
}
export const HeroSection = ({
  showTitle
}: HeroSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'stealth' | 'ai' | 'productivity'>('stealth');
  return <div className="py-12 md:py-16 flex flex-col items-center text-center">
      <AnimatedTransition show={showTitle} animation="slide-up" duration={600}>
        {/* Logo */}
        <img 
          src="/Subtle_LOGO-nobackground.png" 
          alt="Subtle" 
          className="w-20 h-20 mb-6 mx-auto"
        />
        
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-bold mb-6 md:text-7xl">
          <span className="text-foreground">AI Assistance</span>
          <br />
          <span className="text-primary coral-glow">Only You Can See</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
          Subtle is a sophisticated macOS menu bar app that provides contextual AI guidance through an invisible overlay.
          Perfect for interviews, sales calls, coding sessions, and everyday productivity.
        </p>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
          <button
            onClick={() => setActiveFeature('stealth')}
            className={`p-6 rounded-xl transition-all duration-300 text-left ${activeFeature === 'stealth' ? 'glass-medium border-primary/50' : 'glass-light hover:glass-medium'}`}
          >
            <EyeOff className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Invisible Overlay</h3>
            <p className="text-sm text-muted-foreground">Excluded from screen sharing & recordings</p>
          </button>
          
          <button
            onClick={() => setActiveFeature('ai')}
            className={`p-6 rounded-xl transition-all duration-300 text-left ${activeFeature === 'ai' ? 'glass-medium border-primary/50' : 'glass-light hover:glass-medium'}`}
          >
            <Sparkles className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Context-Aware AI</h3>
            <p className="text-sm text-muted-foreground">Real-time screen & audio analysis</p>
          </button>
          
          <button
            onClick={() => setActiveFeature('productivity')}
            className={`p-6 rounded-xl transition-all duration-300 text-left ${activeFeature === 'productivity' ? 'glass-medium border-primary/50' : 'glass-light hover:glass-medium'}`}
          >
            <Shield className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Privacy First</h3>
            <p className="text-sm text-muted-foreground">Local processing, no telemetry</p>
          </button>
        </div>
        
        {/* Call to action */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button 
            size="lg" 
            onClick={() => setIsModalOpen(true)} 
            className="rounded-xl px-8 py-6 text-base font-medium bg-primary hover:bg-primary/90 transition-all duration-300 coral-glow"
          >
            Get Beta Access
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-xl px-8 py-6 text-base font-medium glass-light hover:glass-medium transition-all duration-300"
            onClick={() => {
              // Scroll to demo section instead of fake functionality
              const demoSection = document.getElementById('demo-section');
              if (demoSection) {
                demoSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Watch Demo
            <Eye className="ml-2 w-5 h-5" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4">
          Requires macOS 13.0+ • Free during beta
        </p>

        <WaitlistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </AnimatedTransition>
    </div>;
};