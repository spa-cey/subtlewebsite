'use client';

import { Button } from '@/components/ui/button';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Download, MessageCircle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CallToActionProps {
  show: boolean;
}

export const CallToAction = ({
  show
}: CallToActionProps) => {
  const router = useRouter();

  return <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24 rounded-2xl text-center glass-heavy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 -z-10" />
        <h2 className="text-4xl font-bold mb-4 md:text-6xl">
          <span className="text-foreground">Ready to Work</span>{' '}
          <span className="text-primary coral-glow">Invisibly Smarter?</span>
        </h2>
        <p className="text-xl mb-10 text-muted-foreground">
          Join thousands of professionals using Subtle for their most important work.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            size="lg" 
            className="rounded-xl px-8 py-6 text-base font-medium coral-glow"
            onClick={() => router.push('/download')}
          >
            <Download className="mr-2 w-5 h-5" />
            Download for macOS
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-xl px-8 py-6 text-base font-medium glass-light hover:glass-medium"
            onClick={() => router.push('/features')}
          >
            <FileText className="mr-2 w-5 h-5" />
            View Features
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-xl px-8 py-6 text-base font-medium glass-light hover:glass-medium"
            onClick={() => window.open('mailto:support@gosubtle.app?subject=Support%20Request', '_blank')}
          >
            <MessageCircle className="mr-2 w-5 h-5" />
            Contact Support
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-6">
          Free tier available • macOS 13.0+ required • Privacy focused
        </p>
      </div>
    </AnimatedTransition>;
};