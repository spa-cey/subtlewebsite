import { AnimatedTransition } from '@/components/AnimatedTransition';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from '@/components/ui/card';

interface FAQSectionProps {
  show: boolean;
}

export const SubtleFAQSection = ({ show }: FAQSectionProps) => {
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
      question: "Do I need my own OpenAI API key?",
      answer: "Yes, currently you need an Azure OpenAI endpoint and API key. This ensures your data stays private and you have full control over costs. We're exploring options for a managed service in the future."
    },
    {
      question: "Is my data private and secure?",
      answer: "Absolutely. Subtle processes everything locally by default. No telemetry or analytics are collected. Your Azure OpenAI credentials are stored securely in the macOS keychain, and all API calls go directly from your Mac to Azure."
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
      question: "Is Subtle open source?",
      answer: "Yes! Subtle is fully open source under the MIT license. You can view the source code, contribute improvements, or even fork it for your own needs. We believe in transparency and community-driven development."
    },
    {
      question: "How do I install and set up Subtle?",
      answer: "Simply download Subtle from our GitHub releases, drag it to your Applications folder, and launch it. You'll go through a quick onboarding to grant necessary permissions and configure your Azure OpenAI settings. The whole process takes under 5 minutes."
    },
    {
      question: "What's the pricing model?",
      answer: "Subtle is free during the beta period. You only pay for your own Azure OpenAI API usage. We're considering a freemium model for the future with optional premium features, but the core app will always have a free tier."
    }
  ];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center gap-4 mb-12 text-center">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">Frequently Asked</span>{' '}
            <span className="text-primary coral-glow">Questions</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            Everything you need to know about Subtle and how it works.
          </p>
        </div>

        <Card className="glass-panel max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-left hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="#" 
              className="text-primary hover:underline"
            >
              Join our Discord
            </a>
            <span className="text-muted-foreground">•</span>
            <a 
              href="#" 
              className="text-primary hover:underline"
            >
              Check the docs
            </a>
            <span className="text-muted-foreground">•</span>
            <a 
              href="mailto:support@subtle.app" 
              className="text-primary hover:underline"
            >
              Email support
            </a>
          </div>
        </div>
      </div>
    </AnimatedTransition>
  );
};