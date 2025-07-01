'use client';

import { useState, useEffect } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { SubtlePricingSection } from '@/components/landing/SubtlePricingSection-nextjs';
import { SubtleFAQSection } from '@/components/landing/SubtleFAQSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, DollarSign } from 'lucide-react';

export default function PricingPage() {
  const [loading, setLoading] = useState(true);
  const showHero = useAnimateIn(false, 300);
  const showPricing = useAnimateIn(false, 600);
  const showFAQ = useAnimateIn(false, 900);

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
          <DollarSign className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        {/* Hero Section */}
        <div className={`text-center mb-16 transition-all duration-700 ${showHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">Choose Your</span>{' '}
            <span className="text-primary coral-glow">Perfect Plan</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Start with our free tier and upgrade as you grow. No hidden fees, no surprises.
          </p>
          <div className="flex gap-4 justify-center mb-8">
            <Button asChild size="lg" className="coral-glow">
              <Link href="/download">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required • 5 pro responses per day • Cancel anytime
          </p>
        </div>

        {/* Pricing Section */}
        <SubtlePricingSection show={showPricing} />
        
        {/* FAQ Section */}
        <div className="mt-24">
          <SubtleFAQSection show={showFAQ} />
        </div>

        {/* Additional Info */}
        <div className={`mt-24 transition-all duration-700 ${showFAQ ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-muted/50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-6">All plans include:</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'macOS 13.0+ support',
                'Automatic updates',
                'End-to-end encryption',
                'Priority customer support',
                'API access (Pro & Enterprise)',
                'Custom integrations (Enterprise)',
                'Team collaboration tools',
                'Advanced analytics',
                'SSO support (Enterprise)'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}