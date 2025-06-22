import { AnimatedTransition } from '@/components/AnimatedTransition';
import { MessageSquare, Users, FileText, Heart, Star, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CommunitySectionProps {
  show: boolean;
}

export const SubtleCommunitySection = ({ show }: CommunitySectionProps) => {
  const stats = [
    { icon: <Users className="w-5 h-5" />, label: "Active Users", value: "12k+" },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Discord Members", value: "3.2k" },
    { icon: <Star className="w-5 h-5" />, label: "App Store Rating", value: "4.8/5" },
    { icon: <Zap className="w-5 h-5" />, label: "Daily Sessions", value: "45k+" }
  ];

  const communityChannels = [
    {
      name: "Discord Community",
      description: "Get help, share tips, and connect with other Subtle users",
      icon: <MessageSquare className="w-8 h-8" />,
      members: "3.2k members",
      activity: "Very Active",
      color: "from-blue-500/20 to-blue-600/20"
    },
    {
      name: "Feature Requests",
      description: "Vote on new features and suggest improvements",
      icon: <Star className="w-8 h-8" />,
      members: "1.8k votes",
      activity: "Weekly Updates",
      color: "from-yellow-500/20 to-yellow-600/20"
    },
    {
      name: "Help Center",
      description: "Documentation, tutorials, and troubleshooting guides",
      icon: <FileText className="w-8 h-8" />,
      members: "500+ articles",
      activity: "Always Updated",
      color: "from-green-500/20 to-green-600/20"
    }
  ];

  const testimonials = [
    { text: "The Discord community is incredibly helpful!", author: "Sarah K." },
    { text: "Love how responsive the team is to feedback", author: "Mike R." },
    { text: "Feature requests actually get implemented", author: "Emma L." }
  ];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">Join the</span>{' '}
            <span className="text-primary coral-glow">Community</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            Connect with thousands of professionals using Subtle to enhance their productivity.
          </p>
        </div>

        {/* Community Stats */}
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

        {/* Community Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          {communityChannels.map((channel, index) => (
            <Card 
              key={index} 
              className="glass-light hover:glass-medium transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className={`h-2 bg-gradient-to-r ${channel.color}`} />
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${channel.color} text-primary`}>
                    {channel.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{channel.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{channel.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{channel.members}</span>
                      <span>•</span>
                      <span>{channel.activity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main CTA */}
        <Card className="glass-panel p-8 max-w-4xl mx-auto mb-12">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">Ready to Join?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get help from our community, share your experiences, and help shape the future of Subtle.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="rounded-xl coral-glow">
                <MessageSquare className="mr-2 w-4 h-4" />
                Join Discord
              </Button>
              <Button variant="outline" className="rounded-xl">
                <FileText className="mr-2 w-4 h-4" />
                Visit Help Center
              </Button>
            </div>
          </div>
        </Card>

        {/* Community Love */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            What our community says:
          </p>
          <div className="flex flex-wrap gap-6 justify-center max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-light rounded-lg p-4 max-w-xs">
                <p className="text-sm italic mb-2">"{testimonial.text}"</p>
                <p className="text-xs text-muted-foreground">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Community Badge */}
        <div className="mt-12 text-center">
          <Card className="glass-medium inline-flex items-center gap-3 px-6 py-3">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm">
              Proudly serving productivity professionals worldwide
            </span>
          </Card>
        </div>
      </div>
    </AnimatedTransition>
  );
};