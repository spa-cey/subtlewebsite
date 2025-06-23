import { AnimatedTransition } from '@/components/AnimatedTransition';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from '@/components/ui/card';
import { HelpCircle, MessageCircle, BookOpen, Mail } from 'lucide-react';
import { useState } from 'react';

interface FAQSectionProps {
  show: boolean;
}

export const SubtleFAQSection = ({ show }: FAQSectionProps) => {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);
  
  const faqs = [
    {
      question: "How is Subtle invisible to screen sharing?",
      answer: "Subtle uses an NSPanel window with special properties that exclude it from screen capture APIs. This means when you share your screen in Zoom, Teams, or any other app, participants cannot see the Subtle overlay - only you can."
    },
    {
      question: "What are the system requirements?",
      answer: "Subtle requires macOS 13.0 (Ventura) or later and works on both Apple Silicon and Intel Macs. You'll need about 100MB of free disk space and must grant screen recording and microphone permissions for full functionality."
    },
    {
      question: "Do I need my own API key?",
      answer: "No! With our Pro and Enterprise plans, we handle all the AI infrastructure for you. Just sign in and start using Subtle immediately. The Free plan uses limited models that we provide at no cost."
    },
    {
      question: "Is my data private and secure?",
      answer: "Absolutely. Subtle processes everything locally on your Mac. Screen captures and audio never leave your device unless you're using AI features. With Pro/Enterprise plans, all API calls are encrypted and we never store your conversations or screen content."
    },
    {
      question: "Can I use Subtle for job interviews?",
      answer: "Yes! Subtle is perfect for interviews. The overlay is invisible to video conferencing software, giving you real-time coaching and suggested responses. Many users report it has helped them land their dream jobs."
    },
    {
      question: "How does the audio transcription work?",
      answer: "Subtle uses Apple's Speech framework to transcribe audio in real-time. It captures system audio or microphone input and converts it to text, which can then be used for context in AI responses. All transcription happens locally on your Mac."
    },
    {
      question: "What AI personas are available?",
      answer: "Subtle includes 5 specialized personas: General (everyday assistance), Technical (coding and engineering), Creative (writing and design), Business (sales and strategy), and Research (academic and analysis). Each is optimized for different types of tasks."
    },
    {
      question: "How is Subtle different from other AI assistants?",
      answer: "Subtle is the only AI assistant that's completely invisible to screen sharing and recording software. It provides real-time, context-aware assistance based on what's on your screen and what you're hearing, all while remaining hidden from others."
    },
    {
      question: "How do I install and set up Subtle?",
      answer: "Simply download Subtle, drag it to your Applications folder, and launch it. You'll go through a quick onboarding to grant necessary permissions. With our Pro plan, you don't need any API keys - just sign in and start using Subtle immediately."
    },
    {
      question: "What's the pricing model?",
      answer: "Subtle offers three tiers: Free ($0/mo) with 5 pro responses per day, Pro ($20/mo) with unlimited responses and latest models, and Enterprise (custom pricing) for teams needing full customization. All plans include our core stealth features."
    }
  ];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center gap-4 mb-16 text-center">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">Frequently Asked</span>{' '}
            <span className="text-primary coral-glow">Questions</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            Everything you need to know about Subtle and how it works.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Background glow */}
          <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10"></div>
          
          {/* FAQ Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {faqs.slice(0, Math.ceil(faqs.length / 2)).map((faq, index) => (
                <Card 
                  key={index}
                  className="glass-light hover:glass-medium transition-all duration-300 p-0 rounded-xl border-0 overflow-hidden group"
                >
                  <Accordion 
                    type="single" 
                    collapsible 
                    value={openItem}
                    onValueChange={setOpenItem}
                  >
                    <AccordionItem value={`item-${index}`} className="border-0">
                      <AccordionTrigger className="px-6 py-4 text-left hover:no-underline group-hover:text-primary transition-colors">
                        <div className="flex items-start gap-3 pr-4">
                          <HelpCircle className="w-5 h-5 text-primary/70 mt-0.5 flex-shrink-0" />
                          <span className="font-medium">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="pl-8 text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </Card>
              ))}
            </div>
            
            <div className="space-y-4">
              {faqs.slice(Math.ceil(faqs.length / 2)).map((faq, index) => (
                <Card 
                  key={index + Math.ceil(faqs.length / 2)}
                  className="glass-light hover:glass-medium transition-all duration-300 p-0 rounded-xl border-0 overflow-hidden group"
                >
                  <Accordion 
                    type="single" 
                    collapsible
                    value={openItem}
                    onValueChange={setOpenItem}
                  >
                    <AccordionItem value={`item-${index + Math.ceil(faqs.length / 2)}`} className="border-0">
                      <AccordionTrigger className="px-6 py-4 text-left hover:no-underline group-hover:text-primary transition-colors">
                        <div className="flex items-start gap-3 pr-4">
                          <HelpCircle className="w-5 h-5 text-primary/70 mt-0.5 flex-shrink-0" />
                          <span className="font-medium">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="pl-8 text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Support Links */}
        <div className="mt-16">
          <Card className="glass-light max-w-2xl mx-auto p-8 rounded-xl border-0">
            <p className="text-center text-lg font-medium mb-6">
              Still have questions?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="#" 
                className="flex items-center justify-center gap-3 p-4 rounded-lg glass-light hover:glass-medium transition-all duration-300 group"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="font-medium group-hover:text-primary transition-colors">Join Discord</span>
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center gap-3 p-4 rounded-lg glass-light hover:glass-medium transition-all duration-300 group"
              >
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-medium group-hover:text-primary transition-colors">Read Docs</span>
              </a>
              <a 
                href="mailto:support@subtle.app" 
                className="flex items-center justify-center gap-3 p-4 rounded-lg glass-light hover:glass-medium transition-all duration-300 group"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-medium group-hover:text-primary transition-colors">Email Us</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </AnimatedTransition>
  );
};