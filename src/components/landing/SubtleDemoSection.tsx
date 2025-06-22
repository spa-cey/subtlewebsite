import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Play, Monitor, Eye, Mic, Brain, FileText, Maximize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DemoSectionProps {
  show: boolean;
}

export const SubtleDemoSection = ({ show }: DemoSectionProps) => {
  const [activeDemo, setActiveDemo] = useState(0);

  const demos = [
    {
      title: "Invisible Overlay",
      description: "See how Subtle stays hidden from screen sharing",
      icon: <Eye className="w-5 h-5" />,
      preview: "Demo showing Subtle overlay invisible in Zoom screen share",
      features: ["Excluded from screen capture", "Ghost bar mode", "Floating window"]
    },
    {
      title: "Real-time OCR",
      description: "Watch text extraction from your screen in action",
      icon: <Monitor className="w-5 h-5" />,
      preview: "Live OCR extraction from code editor and documents",
      features: ["150ms processing", "Multiple languages", "Code detection"]
    },
    {
      title: "Audio Transcription",
      description: "See live transcription during meetings",
      icon: <Mic className="w-5 h-5" />,
      preview: "Real-time meeting transcription with speaker detection",
      features: ["Low latency", "Speaker identification", "Noise reduction"]
    },
    {
      title: "AI Assistance",
      description: "Context-aware responses based on your screen",
      icon: <Brain className="w-5 h-5" />,
      preview: "AI providing coding suggestions based on visible code",
      features: ["Streaming responses", "Context awareness", "Multiple personas"]
    }
  ];

  const screenshots = [
    {
      name: "Dashboard",
      description: "Clean, glassmorphic interface"
    },
    {
      name: "Settings",
      description: "Easy Azure OpenAI configuration"
    },
    {
      name: "Knowledge Hub",
      description: "Document management system"
    },
    {
      name: "Permissions",
      description: "Clear permission requests"
    }
  ];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">See Subtle in</span>{' '}
            <span className="text-primary coral-glow">Action</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            Watch how Subtle enhances your productivity while staying completely invisible to others.
          </p>
        </div>

        {/* Video Demo Section */}
        <Card className="glass-panel p-8 mb-16 max-w-5xl mx-auto">
          <div className="aspect-video bg-black/50 rounded-lg mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center">
              <Button 
                size="lg" 
                className="rounded-full w-20 h-20 p-0 coral-glow group-hover:scale-110 transition-transform"
              >
                <Play className="w-8 h-8 ml-1" />
              </Button>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              {demos.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDemo(index)}
                  className={`flex-1 p-2 rounded-lg transition-all ${
                    activeDemo === index 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <span className="text-xs font-medium">{demo.title}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                {demos[activeDemo].icon}
                {demos[activeDemo].title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {demos[activeDemo].description}
              </p>
              <div className="space-y-2">
                {demos[activeDemo].features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-light rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Demo Preview:</p>
              <p className="text-sm italic">{demos[activeDemo].preview}</p>
            </div>
          </div>
        </Card>

        {/* Screenshots Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center mb-8">Screenshots</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {screenshots.map((screenshot, index) => (
              <Card 
                key={index} 
                className="glass-light overflow-hidden group cursor-pointer hover:glass-medium transition-all"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-primary/30" />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/50">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-1">{screenshot.name}</h4>
                  <p className="text-sm text-muted-foreground">{screenshot.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Interactive Demo CTA */}
        <Card className="glass-medium p-8 text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4">Try It Yourself</h3>
          <p className="text-muted-foreground mb-6">
            Experience the power of invisible AI assistance. Download Subtle and see how it transforms your workflow.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="rounded-xl coral-glow">
              Download Free Beta
            </Button>
            <Button variant="outline" className="rounded-xl">
              Schedule Demo
            </Button>
          </div>
        </Card>
      </div>
    </AnimatedTransition>
  );
};