import { AnimatedTransition } from '@/components/AnimatedTransition';
import { 
  Download, 
  Settings, 
  Key, 
  Rocket,
  CheckCircle,
  Monitor,
  Cpu,
  HardDrive,
  Shield
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InstallSectionProps {
  show: boolean;
}

export const SubtleInstallSection = ({ show }: InstallSectionProps) => {
  const steps = [
    {
      icon: <Download className="w-6 h-6" />,
      title: "Download Subtle",
      description: "Get the latest version from our website"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Grant Permissions",
      description: "Allow screen recording and microphone access"
    },
    {
      icon: <Key className="w-6 h-6" />,
      title: "Sign In",
      description: "Create your account or sign in to start using AI features"
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Start Using",
      description: "Press ⌘⇧Space to toggle the AI overlay"
    }
  ];

  const requirements = [
    { icon: <Monitor />, label: "macOS 13.0 (Ventura) or later" },
    { icon: <Cpu />, label: "Apple Silicon or Intel Mac" },
    { icon: <HardDrive />, label: "100MB free disk space" },
    { icon: <Shield />, label: "Screen Recording permission" }
  ];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">Get Started in</span>{' '}
            <span className="text-primary coral-glow">Minutes</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            Simple installation, powerful results. No complex setup required.
          </p>
        </div>

        {/* Installation steps */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <Card className="glass-light p-6 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                      {step.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* System Requirements */}
        <div className="max-w-4xl mx-auto">
          <Card className="glass-panel p-8">
            <h3 className="text-2xl font-semibold mb-6 text-center">System Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    {req.icon}
                  </div>
                  <span className="text-foreground/80">{req.label}</span>
                  <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-border/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-semibold mb-1">Ready to enhance your productivity?</p>
                  <p className="text-sm text-muted-foreground">
                    Free during beta • No credit card required
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="rounded-xl px-8 coral-glow"
                >
                  Download for macOS
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="glass-light p-6 text-center">
            <h4 className="font-semibold mb-2">Secure & Private</h4>
            <p className="text-sm text-muted-foreground">
              Your data stays on your device unless you're using AI features
            </p>
          </Card>
          <Card className="glass-light p-6 text-center">
            <h4 className="font-semibold mb-2">Regular Updates</h4>
            <p className="text-sm text-muted-foreground">
              New features and improvements delivered automatically
            </p>
          </Card>
          <Card className="glass-light p-6 text-center">
            <h4 className="font-semibold mb-2">Expert Support</h4>
            <p className="text-sm text-muted-foreground">
              Get help from our team and active community
            </p>
          </Card>
        </div>
      </div>
    </AnimatedTransition>
  );
};