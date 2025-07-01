import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Check, Sparkles, Zap, Crown, Apple } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PricingSectionProps {
  show: boolean;
}

export const SubtlePricingSection = ({ show }: PricingSectionProps) => {
  const navigate = useNavigate();

  const handlePlanClick = (planName: string) => {
    switch (planName) {
      case 'Free':
        // Navigate to download page for free plan
        navigate('/download');
        break;
      case 'Pro':
        // Navigate to signup with pro plan selection
        navigate('/signup?plan=pro');
        break;
      case 'Enterprise':
        // Open contact form or mailto for enterprise
        window.open('mailto:sales@gosubtle.app?subject=Enterprise%20Plan%20Inquiry', '_blank');
        break;
      default:
        navigate('/signup');
    }
  };
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/mo",
      description: "Get a taste for how Subtle works with a few responses on us.",
      icon: <Sparkles className="w-6 h-6" />,
      features: [
        { text: "5 pro responses per day", included: true },
        { text: "Unlimited access to free models", included: true, badge: "GPT-4.0-mini" },
        { text: "100 character output limit", included: true },
        { text: "Sees your screen, hears your audio", included: true },
        { text: "Custom system prompt", included: true },
        { text: "Community support only", included: true }
      ],
      cta: "Download for Mac",
      ctaIcon: true,
      highlighted: false
    },
    {
      name: "Pro",
      price: "$20",
      period: "/mo",
      description: "Unlimited access to Subtle. Use the latest models, get full response output, and play with your own custom prompts.",
      icon: <Zap className="w-6 h-6" />,
      features: [
        { text: "Unlimited pro responses", included: true },
        { text: "Unlimited access to latest models", included: true, badge: "Claude-3.7 GPT-4.1" },
        { text: "Full access to conversations dashboard", included: true },
        { text: "Priority support", included: true },
        { text: "Plus everything in free", included: true, isPlus: true }
      ],
      cta: "Subscribe",
      highlighted: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Specifically made for teams who need full customization.",
      icon: <Crown className="w-6 h-6" />,
      features: [
        { text: "Custom integrations", included: true, badge: "Coming soon" },
        { text: "User provisioning & role-based access", included: true },
        { text: "Advanced Post-call analytics", included: true },
        { text: "Single sign-on", included: true, badge: "IDP/SSO" },
        { text: "Advanced security features", included: true },
        { text: "Centralized billing", included: true },
        { text: "Usage analytics & reporting dashboard", included: true },
        { text: "Plus Everything in pro", included: true, isPlus: true }
      ],
      cta: "Talk to Sales",
      highlighted: false,
      isDark: true
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={cn(
                "relative p-8 h-full flex flex-col",
                plan.isDark 
                  ? "bg-background border-border" 
                  : "glass-light border-border/50"
              )}
            >
              <div className="mb-8">
                <h3 className="text-4xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-normal">{plan.price}</span>
                  {plan.period && <span className="text-2xl text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <Button 
                className={cn(
                  "w-full rounded-full py-6 mb-8 text-base font-medium",
                  plan.isDark 
                    ? "bg-white text-black hover:bg-white/90" 
                    : "bg-primary text-white hover:bg-primary/90"
                )}
                size="lg"
                onClick={() => handlePlanClick(plan.name)}
              >
                {plan.ctaIcon && <Apple className="mr-2 h-5 w-5" />}
                {plan.cta}
              </Button>

              <div className="space-y-4 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className={cn(
                    "flex items-start gap-3",
                    feature.isPlus && "pt-4 border-t border-border/50"
                  )}>
                    <Check className={cn(
                      "w-5 h-5 mt-0.5 shrink-0",
                      plan.isDark ? "text-white" : "text-green-500"
                    )} />
                    <div className="flex-1">
                      <span className={cn(
                        "text-sm",
                        plan.isDark ? "text-white/90" : "text-foreground"
                      )}>
                        {feature.text}
                      </span>
                      {feature.badge && (
                        <span className={cn(
                          "ml-2 inline-flex px-2 py-0.5 text-xs rounded-full",
                          feature.badge === "Coming soon" 
                            ? "bg-muted text-muted-foreground" 
                            : "bg-green-500/20 text-green-600"
                        )}>
                          {feature.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

      </div>
    </AnimatedTransition>
  );
};