
import { useState, useEffect } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { HeroSection } from '@/components/landing/HeroSection';
import { SubtleFeaturesSection } from '@/components/landing/SubtleFeaturesSection';
import { SubtleUseCasesSection } from '@/components/landing/SubtleUseCasesSection';
import { SubtleInstallSection } from '@/components/landing/SubtleInstallSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CallToAction } from '@/components/landing/CallToAction';
import { LoadingScreen } from '@/components/landing/LoadingScreen';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const showHero = useAnimateIn(false, 300);
  const showFeatures = useAnimateIn(false, 600);
  const showUseCases = useAnimateIn(false, 900);
  const showInstall = useAnimateIn(false, 1200);
  const showTestimonials = useAnimateIn(false, 1500);
  const showCallToAction = useAnimateIn(false, 1800);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="relative overflow-hidden">
      {/* Background elements with coral glow */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[350px] h-[350px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <div className="flex flex-col">
          {/* Hero Section */}
          <HeroSection showTitle={showHero} />
          
          {/* Features Section */}
          <SubtleFeaturesSection show={showFeatures} />
          
          {/* Use Cases Section */}
          <SubtleUseCasesSection show={showUseCases} />
          
          {/* Installation Section */}
          <SubtleInstallSection show={showInstall} />
          
          {/* Testimonials Section */}
          <TestimonialsSection showTestimonials={showTestimonials} />
          
          {/* Call to Action */}
          <CallToAction show={showCallToAction} />
        </div>
      </div>
    </div>
  );
};

export default Index;
