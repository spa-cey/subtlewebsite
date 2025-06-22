import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
interface TestimonialsSectionProps {
  showTestimonials: boolean;
}
export const TestimonialsSection = ({
  showTestimonials
}: TestimonialsSectionProps) => {
  const testimonials = [{
    quote: "Subtle saved my last interview. Having real-time coaching invisible to the interviewer was incredible.",
    name: "Sarah Chen",
    role: "Senior Developer",
    rating: 5
  }, {
    quote: "The stealth overlay is genius. I can access customer data during calls without anyone knowing.",
    name: "James Rodriguez",
    role: "Sales Manager",
    rating: 5
  }, {
    quote: "As a non-native speaker, having AI assistance during presentations has boosted my confidence immensely.",
    name: "Amanda Liu",
    role: "Product Manager",
    rating: 5
  }, {
    quote: "The OCR feature helps me reference documentation while coding without switching contexts.",
    name: "Dr. Michael Thompson",
    role: "Research Engineer",
    rating: 5
  }, {
    quote: "Perfect for remote work. No one knows I'm getting AI help during video calls.",
    name: "Emma Anderson",
    role: "Marketing Lead",
    rating: 5
  }, {
    quote: "The audio transcription is incredibly accurate. Great for taking meeting notes invisibly.",
    name: "Laura Martinez",
    role: "Data Analyst",
    rating: 4
  }, {
    quote: "It's like having a senior developer looking over my shoulder, but only I can see them.",
    name: "Rafael Oliveira",
    role: "Startup Founder",
    rating: 5
  }, {
    quote: "The different AI personas are perfectly tuned. Technical persona helps with code reviews daily.",
    name: "David Kim",
    role: "Software Architect",
    rating: 5
  }, {
    quote: "Privacy-first design is what sold me. Everything stays local, no data leaves my Mac.",
    name: "Nicole Foster",
    role: "Security Consultant",
    rating: 5
  }, {
    quote: "The global hotkeys are intuitive. I can summon help instantly without breaking my flow.",
    name: "Thomas Johnson",
    role: "UX Designer",
    rating: 4
  }, {
    quote: "Subtle has become essential for my client calls. Instant access to project details invisibly.",
    name: "Sophia Patel",
    role: "Freelance Consultant",
    rating: 5
  }, {
    quote: "Clean architecture and open source. I could customize it for my specific workflow needs.",
    name: "Alex Chang",
    role: "DevOps Engineer",
    rating: 5
  }];

  // Component to render star ratings
  const StarRating = ({
    rating
  }: {
    rating: number;
  }) => {
    return <div className="flex items-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />)}
      </div>;
  };
  return <AnimatedTransition show={showTestimonials} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center gap-4 mb-12 text-center">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">Loved by</span>{' '}
            <span className="text-primary coral-glow">Professionals</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            From developers to consultants, Subtle is helping professionals work smarter, not harder.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {testimonials.map((testimonial, index) => <Card key={index} className="bg-card border border-border/50 p-6 rounded-lg shadow-sm h-full">
              <StarRating rating={testimonial.rating} />
              <p className="text-lg font-medium mb-4">{testimonial.quote}</p>
              <div className="mt-4">
                <p className="font-bold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>)}
        </div>
      </div>
    </AnimatedTransition>;
};