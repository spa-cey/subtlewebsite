import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: PlanFeature[];
  recommended?: boolean;
  icon: React.ReactNode;
  quota: number;
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    description: 'Perfect for trying out Subtle',
    price: 0,
    interval: 'month',
    icon: <Sparkles className="h-5 w-5" />,
    quota: 100,
    features: [
      { name: '100 AI requests per month', included: true },
      { name: 'Basic AI models', included: true },
      { name: 'Standard support', included: true },
      { name: 'Advanced AI models', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    name: 'Pro',
    description: 'For power users and professionals',
    price: 19,
    interval: 'month',
    icon: <Zap className="h-5 w-5" />,
    quota: 2500,
    recommended: true,
    features: [
      { name: '2,500 AI requests per month', included: true },
      { name: 'All AI models', included: true },
      { name: 'Priority support', included: true },
      { name: 'Advanced features', included: true },
      { name: 'Usage analytics', included: true },
    ],
  },
  {
    name: 'Team',
    description: 'For teams and organizations',
    price: 49,
    interval: 'month',
    icon: <Crown className="h-5 w-5" />,
    quota: 10000,
    features: [
      { name: '10,000 AI requests per month', included: true },
      { name: 'All AI models', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Team management', included: true },
      { name: 'Custom integrations', included: true },
    ],
  },
];

interface PlanUpgradeProps {
  currentPlan?: string;
  onSelectPlan?: (plan: string) => void;
}

export function PlanUpgrade({ currentPlan = 'Free', onSelectPlan }: PlanUpgradeProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent = plan.name === currentPlan;
        
        return (
          <Card 
            key={plan.name} 
            className={`relative ${plan.recommended ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.recommended && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Recommended
              </Badge>
            )}
            
            <CardHeader>
              <div className="flex items-center gap-2">
                {plan.icon}
                <CardTitle>{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.quota.toLocaleString()} requests/month
                </p>
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-start gap-2">
                    <Check 
                      className={`h-4 w-4 mt-0.5 ${
                        feature.included ? 'text-green-600' : 'text-muted-foreground/30'
                      }`} 
                    />
                    <span 
                      className={`text-sm ${
                        feature.included ? '' : 'text-muted-foreground line-through'
                      }`}
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={() => onSelectPlan?.(plan.name)}
                className="w-full"
                variant={isCurrent ? 'outline' : plan.recommended ? 'default' : 'outline'}
                disabled={isCurrent}
              >
                {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}