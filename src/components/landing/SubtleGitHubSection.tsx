import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Github, Star, GitFork, Users, Code, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GitHubSectionProps {
  show: boolean;
}

export const SubtleGitHubSection = ({ show }: GitHubSectionProps) => {
  const stats = [
    { icon: <Star className="w-5 h-5" />, label: "Stars", value: "1.2k+" },
    { icon: <GitFork className="w-5 h-5" />, label: "Forks", value: "89" },
    { icon: <Users className="w-5 h-5" />, label: "Contributors", value: "23" },
    { icon: <Code className="w-5 h-5" />, label: "Commits", value: "500+" }
  ];

  const topContributors = [
    { name: "John Doe", avatar: "JD", commits: 234 },
    { name: "Sarah Chen", avatar: "SC", commits: 189 },
    { name: "Mike Wilson", avatar: "MW", commits: 145 },
    { name: "Emma Lee", avatar: "EL", commits: 98 },
    { name: "Alex Kim", avatar: "AK", commits: 76 },
    { name: "Lisa Park", avatar: "LP", commits: 54 }
  ];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">Open Source</span>{' '}
            <span className="text-primary coral-glow">Community</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            Built in the open with contributions from developers worldwide.
          </p>
        </div>

        {/* GitHub Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-light p-6 text-center hover:glass-medium transition-all">
              <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Main CTA */}
        <Card className="glass-panel p-8 max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-semibold mb-3 flex items-center gap-2 justify-center md:justify-start">
                <Github className="w-6 h-6" />
                subtle-app/subtle
              </h3>
              <p className="text-muted-foreground mb-6">
                Stealth context-aware AI assistant for macOS. Invisible overlay, real-time OCR, 
                audio transcription, and Azure OpenAI integration.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <Button className="rounded-xl coral-glow">
                  <Star className="mr-2 w-4 h-4" />
                  Star on GitHub
                </Button>
                <Button variant="outline" className="rounded-xl">
                  <GitFork className="mr-2 w-4 h-4" />
                  Fork Repository
                </Button>
              </div>
            </div>
            <div className="glass-light rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">1,234</div>
              <div className="text-sm text-muted-foreground mb-3">GitHub Stars</div>
              <div className="flex -space-x-2 justify-center">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                  +18
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contributors */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold mb-6 text-center">Top Contributors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {topContributors.map((contributor, index) => (
              <Card key={index} className="glass-light p-4 text-center hover:glass-medium transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium mx-auto mb-3">
                  {contributor.avatar}
                </div>
                <div className="text-sm font-medium truncate">{contributor.name}</div>
                <div className="text-xs text-muted-foreground">{contributor.commits} commits</div>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Want to contribute?
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="#" className="text-primary hover:underline text-sm">
                Contributing Guide
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-primary hover:underline text-sm">
                Good First Issues
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-primary hover:underline text-sm">
                Development Setup
              </a>
            </div>
          </div>
        </div>

        {/* Open Source Badge */}
        <div className="mt-12 text-center">
          <Card className="glass-medium inline-flex items-center gap-3 px-6 py-3">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm">
              Proudly open source under the MIT License
            </span>
          </Card>
        </div>
      </div>
    </AnimatedTransition>
  );
};