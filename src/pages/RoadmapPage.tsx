import { useAnimateIn } from '@/lib/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Circle } from 'lucide-react';

const RoadmapPage = () => {
  const animateIn = useAnimateIn();

  const roadmapItems = [
    {
      quarter: "Q1 2024",
      status: "completed",
      items: [
        { title: "Enhanced Privacy Controls", status: "completed" },
        { title: "Performance Optimizations", status: "completed" },
        { title: "New AI Model Integration", status: "completed" }
      ]
    },
    {
      quarter: "Q2 2024",
      status: "in-progress",
      items: [
        { title: "Advanced Automation Features", status: "completed" },
        { title: "Custom Workflow Builder", status: "in-progress" },
        { title: "Team Collaboration Tools", status: "planned" }
      ]
    },
    {
      quarter: "Q3 2024",
      status: "planned",
      items: [
        { title: "Mobile Companion App", status: "planned" },
        { title: "API for Third-party Integrations", status: "planned" },
        { title: "Advanced Analytics Dashboard", status: "planned" }
      ]
    },
    {
      quarter: "Q4 2024",
      status: "planned",
      items: [
        { title: "Multi-language Support", status: "planned" },
        { title: "Enterprise Features", status: "planned" },
        { title: "Advanced Security Features", status: "planned" }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'in-progress':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-muted-foreground/10 text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16" {...animateIn}>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Product Roadmap
          </h1>
          <p className="text-xl text-muted-foreground">
            See what we're building and what's coming next for Subtle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roadmapItems.map((quarter, index) => (
            <Card 
              key={quarter.quarter} 
              className="relative"
              {...animateIn}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{quarter.quarter}</CardTitle>
                  <Badge className={getStatusColor(quarter.status)}>
                    {quarter.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quarter.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <span className={item.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}>
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 p-6 bg-muted/30 rounded-lg" {...animateIn}>
          <h3 className="text-lg font-semibold mb-2">Have a Feature Request?</h3>
          <p className="text-muted-foreground mb-4">
            We'd love to hear your ideas! Our roadmap is influenced by user feedback and requests.
          </p>
          <a 
            href="mailto:feedback@subtle.app" 
            className="text-primary hover:underline"
          >
            Send us your suggestions →
          </a>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;