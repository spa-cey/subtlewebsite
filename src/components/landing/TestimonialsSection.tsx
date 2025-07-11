import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Card } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';
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

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Component to render star ratings
  const StarRating = ({
    rating
  }: {
    rating: number;
  }) => {
    return <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < rating ? "text-primary fill-primary" : "text-primary/20"} />)}
      </div>;
  };

  // Group testimonials for carousel effect
  const testimonialGroups = [];
  for (let i = 0; i < testimonials.length; i += 3) {
    testimonialGroups.push(testimonials.slice(i, i + 3));
  }

  return <AnimatedTransition show={showTestimonials} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center gap-4 mb-16 text-center">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">Loved by</span>{' '}
            <span className="text-primary coral-glow">Professionals</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            From developers to consultants, Subtle is helping professionals work smarter, not harder.
          </p>
        </div>
        
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="glass-light hover:glass-medium transition-all duration-300 p-6 rounded-xl border-0 relative overflow-hidden group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}></div>
                
                <div className="relative z-10">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  
                  {/* Star rating */}
                  <div className="mb-4">
                    <StarRating rating={testimonial.rating} />
                  </div>
                  
                  {/* Quote text */}
                  <p className="text-foreground/80 mb-6 leading-relaxed">
                    {testimonial.quote}
                  </p>
                  
                  {/* Author info */}
                  <div className="flex items-center gap-3">
                    {/* Avatar placeholder */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
                
                {/* Hover glow effect */}
                <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl transition-all duration-500 ${hoveredIndex === index ? 'scale-150 opacity-100' : 'scale-100 opacity-0'}`}></div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Bottom navigation dots */}
        <div className="flex justify-center gap-2 mt-12">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === 0 ? 'w-8 bg-primary' : 'w-2 bg-primary/30'
              }`}
            />
          ))}
        </div>
      </div>
    </AnimatedTransition>;
};