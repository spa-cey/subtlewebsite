
import { useState, useEffect } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { useSEO } from '@/hooks/useSEO';
import { HeroSection } from '@/components/landing/HeroSection';
import { SubtleFeaturesSection } from '@/components/landing/SubtleFeaturesSection';
import { SubtleDemoSection } from '@/components/landing/SubtleDemoSection';
import { SubtleUseCasesSection } from '@/components/landing/SubtleUseCasesSection';
import { SubtleArchitectureSection } from '@/components/landing/SubtleArchitectureSection';
import { SubtleInstallSection } from '@/components/landing/SubtleInstallSection';
import { SubtlePricingSection } from '@/components/landing/SubtlePricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { SubtleCommunitySection } from '@/components/landing/SubtleCommunitySection';
import { SubtleRoadmapSection } from '@/components/landing/SubtleRoadmapSection';
import { SubtleFAQSection } from '@/components/landing/SubtleFAQSection';
import { CallToAction } from '@/components/landing/CallToAction';
import { LoadingScreen } from '@/components/landing/LoadingScreen';

const Index = () => {
  useSEO();
  
  const [loading, setLoading] = useState(true);
  const showHero = useAnimateIn(false, 300);
  const showFeatures = useAnimateIn(false, 600);
  const showDemo = useAnimateIn(false, 900);
  const showUseCases = useAnimateIn(false, 1200);
  const showArchitecture = useAnimateIn(false, 1500);
  const showInstall = useAnimateIn(false, 1800);
  const showPricing = useAnimateIn(false, 2100);
  const showTestimonials = useAnimateIn(false, 2400);
  const showCommunity = useAnimateIn(false, 2700);
  const showRoadmap = useAnimateIn(false, 3000);
  const showFAQ = useAnimateIn(false, 3300);
  const showCallToAction = useAnimateIn(false, 3600);
  
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
          
          {/* Demo Section */}
          <SubtleDemoSection show={showDemo} />
          
          {/* Use Cases Section */}
          <SubtleUseCasesSection show={showUseCases} />
          
          {/* Architecture Section */}
          <SubtleArchitectureSection show={showArchitecture} />
          
          {/* Installation Section */}
          <SubtleInstallSection show={showInstall} />
          
          {/* Pricing Section */}
          <SubtlePricingSection show={showPricing} />
          
          {/* Testimonials Section */}
          <TestimonialsSection showTestimonials={showTestimonials} />
          
          {/* Community Section */}
          <SubtleCommunitySection show={showCommunity} />
          
          {/* Roadmap Section */}
          <SubtleRoadmapSection show={showRoadmap} />
          
          {/* FAQ Section */}
          <SubtleFAQSection show={showFAQ} />
          
          {/* Call to Action */}
          <CallToAction show={showCallToAction} />
        </div>
      </div>
    </div>
  );
};

export default Index;
