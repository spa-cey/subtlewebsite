import { AnimatedTransition } from '@/components/AnimatedTransition';
import { 
  Briefcase, 
  Code, 
  Users, 
  GraduationCap, 
  Mic, 
  LineChart,
  MessageSquare,
  FileSearch
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface UseCasesSectionProps {
  show: boolean;
}

export const SubtleUseCasesSection = ({ show }: UseCasesSectionProps) => {
  const useCases = [
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Job Interviews",
      description: "Get real-time coaching and suggested responses during video interviews",
      features: ["Answer suggestions", "Company research", "Question preparation"],
      color: "from-blue-500/20 to-blue-600/20"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Sales Calls",
      description: "Access customer data and talking points without switching screens",
      features: ["CRM integration", "Objection handling", "Deal insights"],
      color: "from-green-500/20 to-green-600/20"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Coding Sessions",
      description: "Get syntax help and debugging assistance while you code",
      features: ["Code suggestions", "Error explanations", "Documentation lookup"],
      color: "from-purple-500/20 to-purple-600/20"
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Online Learning",
      description: "Take notes and get explanations during lectures and tutorials",
      features: ["Concept clarification", "Note-taking", "Q&A assistance"],
      color: "from-orange-500/20 to-orange-600/20"
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Presentations",
      description: "Stay on track with speaker notes only you can see",
      features: ["Talking points", "Time tracking", "Q&A preparation"],
      color: "from-red-500/20 to-red-600/20"
    },
    {
      icon: <LineChart className="w-8 h-8" />,
      title: "Data Analysis",
      description: "Get insights and calculations while reviewing spreadsheets",
      features: ["Formula help", "Data insights", "Visualization tips"],
      color: "from-cyan-500/20 to-cyan-600/20"
    }
  ];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">Built for</span>{' '}
            <span className="text-primary coral-glow">Real Work</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            From interviews to coding sessions, Subtle provides invisible AI assistance for your most important tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <Card 
              key={index} 
              className="glass-light hover:glass-medium transition-all duration-300 overflow-hidden group"
            >
              <div className={`h-2 bg-gradient-to-r ${useCase.color}`} />
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${useCase.color} text-primary`}>
                    {useCase.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {useCase.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Card className="glass-medium inline-flex items-center gap-4 px-8 py-4">
            <MessageSquare className="w-6 h-6 text-primary" />
            <div className="text-left">
              <p className="font-semibold">Perfect for Remote Work</p>
              <p className="text-sm text-muted-foreground">
                Invisible to screen sharing and recording software
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AnimatedTransition>
  );
};