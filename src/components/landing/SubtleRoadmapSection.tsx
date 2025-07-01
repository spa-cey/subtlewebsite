import { AnimatedTransition } from '@/components/AnimatedTransition';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Rocket, 
  Sparkles,
  Cloud,
  Globe
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface RoadmapSectionProps {
  show: boolean;
}

export const SubtleRoadmapSection = ({ show }: RoadmapSectionProps) => {
  const milestones = [
    {
      quarter: "Q1 2025",
      title: "Beta Launch",
      status: "in-progress",
      icon: <Rocket className="w-5 h-5" />,
      features: [
        { name: "Core stealth overlay", status: "completed" },
        { name: "Screen capture & OCR", status: "completed" },
        { name: "Audio transcription", status: "completed" },
        { name: "Azure OpenAI integration", status: "completed" },
        { name: "Knowledge Hub RAG", status: "in-progress" },
        { name: "Audio-to-chat flow", status: "in-progress" }
      ]
    },
    {
      quarter: "Q2 2025",
      title: "Enhanced Intelligence",
      status: "planned",
      icon: <Sparkles className="w-5 h-5" />,
      features: [
        { name: "Local LLM support", status: "planned" },
        { name: "Custom AI personas editor", status: "planned" },
        { name: "Multi-modal analysis", status: "planned" },
        { name: "Persistent chat history", status: "planned" },
        { name: "Smart context switching", status: "planned" }
      ]
    },
    {
      quarter: "Q3 2025",
      title: "Pro Features",
      status: "planned",
      icon: <Cloud className="w-5 h-5" />,
      features: [
        { name: "Managed AI API service", status: "planned" },
        { name: "Cloud sync & backup", status: "planned" },
        { name: "Team collaboration", status: "planned" },
        { name: "Analytics dashboard", status: "planned" },
        { name: "API for integrations", status: "planned" }
      ]
    },
    {
      quarter: "Q4 2025",
      title: "Platform Expansion",
      status: "planned",
      icon: <Globe className="w-5 h-5" />,
      features: [
        { name: "Windows support", status: "planned" },
        { name: "Linux support", status: "planned" },
        { name: "Mobile companion app", status: "planned" },
        { name: "Browser extension", status: "planned" },
        { name: "Enterprise features", status: "planned" }
      ]
    }
  ];


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-primary animate-pulse" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'border-primary/50 bg-primary/5';
      case 'completed':
        return 'border-green-500/50 bg-green-500/5';
      default:
        return 'border-border/50';
    }
  };

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">The Road to</span>{' '}
            <span className="text-primary coral-glow">Invisible Intelligence</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            Our vision for making AI assistance truly seamless and invisible.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto mb-16">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border/50" />
          
          {milestones.map((milestone, index) => (
            <div key={index} className="relative flex gap-8 mb-12 last:mb-0">
              <div className={`absolute left-8 w-4 h-4 -translate-x-1/2 rounded-full border-2 ${
                milestone.status === 'in-progress' 
                  ? 'bg-primary border-primary animate-pulse' 
                  : milestone.status === 'completed'
                  ? 'bg-green-500 border-green-500'
                  : 'bg-background border-border'
              }`} />
              
              <div className="flex-1 ml-16">
                <Card className={`glass-light p-6 ${getStatusColor(milestone.status)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {milestone.icon}
                        </div>
                        <h3 className="text-xl font-semibold">{milestone.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{milestone.quarter}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      milestone.status === 'in-progress' 
                        ? 'bg-primary/20 text-primary' 
                        : milestone.status === 'completed'
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {milestone.status === 'in-progress' ? 'In Progress' : 
                       milestone.status === 'completed' ? 'Completed' : 'Planned'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {milestone.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {getStatusIcon(feature.status)}
                        <span className={`text-sm ${
                          feature.status === 'completed' ? 'text-muted-foreground line-through' : ''
                        }`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AnimatedTransition>
  );
};