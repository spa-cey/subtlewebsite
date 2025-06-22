import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PricingSectionProps {
  show: boolean;
}

export const SubtlePricingSection = ({ show }: PricingSectionProps) => {
  const plans = [
    {
      name: "Open Source",
      price: "Free",
      period: "forever",
      description: "Perfect for developers who want to customize and self-host",
      icon: <Sparkles className="w-6 h-6" />,
      features: [
        "Full source code access",
        "All core features",
        "Community support",
        "Self-hosted",
        "MIT License",
        "Contribute to development"
      ],
      limitations: [
        "Bring your own Azure OpenAI key",
        "No priority support",
        "Manual updates"
      ],
      cta: "View on GitHub",
      highlighted: false
    },
    {
      name: "Beta Access",
      price: "Free",
      period: "during beta",
      description: "Early access to the latest features and improvements",
      icon: <Zap className="w-6 h-6" />,
      features: [
        "Pre-built releases",
        "Automatic updates",
        "Beta features first",
        "Discord priority channel",
        "Bug report priority",
        "Feature request voting"
      ],
      limitations: [
        "Still need Azure OpenAI key",
        "Beta stability",
        "Limited to macOS"
      ],
      cta: "Download Beta",
      highlighted: true
    },
    {
      name: "Pro (Coming Soon)",
      price: "$19",
      period: "/month",
      description: "For professionals who want a fully managed experience",
      icon: <Crown className="w-6 h-6" />,
      features: [
        "Managed AI API included",
        "Priority support",
        "Custom AI personas",
        "Advanced analytics",
        "Team collaboration",
        "API access",
        "Cloud sync & backup",
        "Early access features"
      ],
      limitations: [],
      cta: "Join Waitlist",
      highlighted: false,
      comingSoon: true
    }
  ];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">Simple, Transparent</span>{' '}
            <span className="text-primary coral-glow">Pricing</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            Start free, stay free, or upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={cn(
                "relative p-8 transition-all duration-300",
                plan.highlighted 
                  ? "glass-medium border-primary/50 coral-glow scale-105" 
                  : "glass-light hover:glass-medium"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Recommended
                </div>
              )}
              
              {plan.comingSoon && (
                <div className="absolute -top-4 right-4 px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
                  Coming Soon
                </div>
              )}

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-3">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                
                {plan.limitations.length > 0 && (
                  <>
                    <div className="border-t border-border/50 my-4" />
                    {plan.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="w-5 h-5 text-muted-foreground mt-0.5 text-center">•</span>
                        <span className="text-sm text-muted-foreground">{limitation}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <Button 
                className={cn(
                  "w-full rounded-xl",
                  plan.highlighted ? "coral-glow" : "",
                  plan.comingSoon ? "opacity-75" : ""
                )}
                variant={plan.highlighted ? "default" : "outline"}
                disabled={plan.comingSoon}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <Card className="glass-light p-8">
            <h3 className="text-xl font-semibold mb-4">About Azure OpenAI Keys</h3>
            <p className="text-muted-foreground mb-4">
              Currently, Subtle requires you to bring your own Azure OpenAI API key. This ensures maximum privacy 
              and control over your data. Your API calls go directly from your Mac to Azure, and we never see your data.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" size="sm" className="rounded-lg">
                Azure Setup Guide
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg">
                Pricing Calculator
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AnimatedTransition>
  );
};