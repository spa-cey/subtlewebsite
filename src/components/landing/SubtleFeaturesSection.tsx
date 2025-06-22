import { useState } from 'react';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { 
  Eye, 
  EyeOff, 
  Mic, 
  MonitorSmartphone, 
  Brain, 
  Users, 
  Shield, 
  Zap, 
  FileText,
  Keyboard,
  Cloud,
  Lock
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FeatureSectionProps {
  show: boolean;
}

export const SubtleFeaturesSection = ({ show }: FeatureSectionProps) => {
  const [activeFeature, setActiveFeature] = useState<number | null>(0);

  const features = [
    {
      icon: <EyeOff className="w-6 h-6" />,
      title: "Invisible Overlay",
      description: "NSPanel excluded from screen capture & sharing. Collapsible to ghost bar mode.",
      details: "The overlay window is completely invisible to screen recording and sharing applications, ensuring your AI assistance remains private during meetings and presentations."
    },
    {
      icon: <MonitorSmartphone className="w-6 h-6" />,
      title: "Screen Capture & OCR",
      description: "Real-time screen monitoring with Vision framework text extraction.",
      details: "Captures your screen content in real-time using ScreenCaptureKit and extracts text with Apple's Vision framework for context-aware assistance."
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Audio Transcription",
      description: "Live audio capture with Speech framework transcription.",
      details: "Records and transcribes audio in real-time using AVAudioEngine and Apple's Speech framework, perfect for meetings and conversations."
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Azure OpenAI Integration",
      description: "Streaming AI responses with GPT-4 and image analysis.",
      details: "Seamlessly integrates with Azure OpenAI for powerful AI capabilities, including streaming responses and screenshot analysis."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "AI Personas",
      description: "5 specialized assistants for different tasks and contexts.",
      details: "Choose from General, Technical, Creative, Business, or Research personas, each optimized for specific types of assistance."
    },
    {
      icon: <Keyboard className="w-6 h-6" />,
      title: "Global Hotkeys",
      description: "⌘⇧Space for overlay toggle, ⌘⇧S for screenshot capture.",
      details: "System-wide keyboard shortcuts for instant access to Subtle's features without interrupting your workflow."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Knowledge Hub",
      description: "Document management for PDFs and text files.",
      details: "Upload and manage documents to enhance AI context. Support for PDFs and text files with future RAG integration."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Local processing, no telemetry, secure credential storage.",
      details: "All processing happens locally by default. No analytics or telemetry. Your credentials are stored securely in the macOS keychain."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "High Performance",
      description: "150ms OCR, <2s AI responses, 2 FPS screen capture.",
      details: "Optimized for speed with minimal system impact. Fast OCR processing and efficient resource usage."
    }
  ];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">Powerful Features,</span>{' '}
            <span className="text-primary coral-glow">Invisible Interface</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            Everything you need for AI-powered productivity, designed to be completely invisible to others.
          </p>
        </div>

        {/* Feature showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Feature details */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  activeFeature === index 
                    ? 'glass-medium border-primary/50 coral-glow' 
                    : 'glass-light hover:glass-medium'
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg transition-colors ${
                    activeFeature === index ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary/70'
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Feature preview */}
          <div className="glass-panel rounded-xl p-8 flex items-center justify-center min-h-[500px]">
            <div className="text-center space-y-6 animate-fade-in" key={activeFeature}>
              <div className="w-24 h-24 mx-auto p-6 rounded-2xl bg-primary/10 text-primary">
                {activeFeature !== null && features[activeFeature].icon}
              </div>
              <h3 className="text-2xl font-bold">
                {activeFeature !== null && features[activeFeature].title}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                {activeFeature !== null && features[activeFeature].details}
              </p>
            </div>
          </div>
        </div>

        {/* Additional highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-light p-6 text-center">
            <Cloud className="w-12 h-12 text-primary mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Clean Architecture</h4>
            <p className="text-sm text-muted-foreground">
              MVVM pattern with dependency injection for maintainable code
            </p>
          </Card>
          <Card className="glass-light p-6 text-center">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Secure by Design</h4>
            <p className="text-sm text-muted-foreground">
              Permission-aware architecture with secure credential storage
            </p>
          </Card>
          <Card className="glass-light p-6 text-center">
            <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Native Performance</h4>
            <p className="text-sm text-muted-foreground">
              Built with SwiftUI and native macOS frameworks
            </p>
          </Card>
        </div>
      </div>
    </AnimatedTransition>
  );
};