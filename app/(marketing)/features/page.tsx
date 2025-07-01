'use client';

import { useState, useEffect } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { SubtleFeaturesSection } from '@/components/landing/SubtleFeaturesSection';
import { SubtleArchitectureSection } from '@/components/landing/SubtleArchitectureSection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { IntegrationShowcase } from '@/components/landing/IntegrationShowcase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FeaturesPage() {
  const [loading, setLoading] = useState(true);
  const showHero = useAnimateIn(false, 300);
  const showFeatures = useAnimateIn(false, 600);
  const showArchitecture = useAnimateIn(false, 900);
  const showSecurity = useAnimateIn(false, 1200);
  const showIntegrations = useAnimateIn(false, 1500);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        {/* Hero Section */}
        <div className={`text-center mb-16 transition-all duration-700 ${showHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">Powerful Features for</span>{' '}
            <span className="text-primary coral-glow">Modern Workflows</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover how Subtle transforms your productivity with AI-powered assistance that understands your context and adapts to your needs.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="coral-glow">
              <Link href="/download">
                Download Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <SubtleFeaturesSection show={showFeatures} />
        
        {/* Architecture Section */}
        <div className="mt-24">
          <SubtleArchitectureSection show={showArchitecture} />
        </div>
        
        {/* Security Section */}
        <div className="mt-24">
          <SecuritySection show={showSecurity} />
        </div>
        
        {/* Integration Showcase */}
        <div className="mt-24">
          <IntegrationShowcase show={showIntegrations} />
        </div>

        {/* CTA Section */}
        <div className={`mt-24 text-center transition-all duration-700 ${showIntegrations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience the Future of AI Assistance?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who are already working smarter with Subtle.
            </p>
            <Button asChild size="lg" className="coral-glow">
              <Link href="/download">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}