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
      preview: {
        type: 'visual',
        content: (
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Mock screen */}
                <div className="w-64 h-48 bg-background/50 rounded-lg border border-border/50">
                  <div className="p-4">
                    <div className="h-2 bg-muted/50 rounded mb-2 w-3/4"></div>
                    <div className="h-2 bg-muted/50 rounded mb-2 w-full"></div>
                    <div className="h-2 bg-muted/50 rounded mb-2 w-2/3"></div>
                  </div>
                </div>
                {/* Invisible overlay */}
                <div className="absolute -top-4 -right-4 w-48 h-32 glass-medium rounded-lg border-2 border-primary/50 border-dashed p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <EyeOff className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">Hidden Layer</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    AI assistance only visible to you
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Screen Recording</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Overlay Hidden</span>
                </div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      icon: <MonitorSmartphone className="w-6 h-6" />,
      title: "Screen Capture & OCR",
      description: "Real-time screen monitoring with Vision framework text extraction.",
      preview: {
        type: 'code',
        content: (
          <div className="space-y-4">
            <div className="bg-background/50 rounded-lg p-4 font-mono text-sm">
              <div className="text-primary mb-2">{"// Vision Framework OCR"}</div>
              <div className="text-muted-foreground">
                let request = VNRecognizeTextRequest()<br/>
                request.recognitionLevel = .accurate<br/>
                request.usesLanguageCorrection = true<br/>
                <br/>
                <span className="text-green-500">{"// Processing: 150ms avg"}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">2 FPS</div>
                <div className="text-xs text-muted-foreground">Capture Rate</div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Audio Transcription",
      description: "Live audio capture with Speech framework transcription.",
      preview: {
        type: 'audio',
        content: (
          <div className="space-y-4">
            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-medium">Recording Active</span>
              </div>
              <div className="space-y-2">
                {[40, 60, 45, 70, 35, 55, 40].map((height, i) => (
                  <div key={i} className="flex items-end gap-1" style={{ height: '40px' }}>
                    {[...Array(20)].map((_, j) => (
                      <div
                        key={j}
                        className="flex-1 bg-primary/30 rounded-t"
                        style={{
                          height: `${Math.random() * height}%`,
                          animation: `pulse ${1 + Math.random()}s ease-in-out infinite`
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background/50 rounded-lg p-3 font-mono text-sm">
              <span className="text-muted-foreground">"</span>
              <span className="text-primary">Real-time transcription with 95% accuracy...</span>
              <span className="text-muted-foreground">"</span>
            </div>
          </div>
        )
      }
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Azure OpenAI Integration",
      description: "Streaming AI responses with GPT-4 and image analysis.",
      preview: {
        type: 'ai',
        content: (
          <div className="space-y-4">
            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-primary" />
                <span className="font-medium">GPT-4 Turbo</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="text-primary font-medium">&lt; 2s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Context Window</span>
                  <span className="text-primary font-medium">128K</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vision Support</span>
                  <span className="text-primary font-medium">✓</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-lg blur-xl"></div>
              <div className="relative bg-background/50 rounded-lg p-3 font-mono text-sm">
                <span className="text-primary">Streaming response...</span>
                <span className="animate-pulse">▊</span>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "AI Personas",
      description: "5 specialized assistants for different tasks and contexts.",
      preview: {
        type: 'personas',
        content: (
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'General', icon: '🌐', desc: 'Balanced assistance' },
              { name: 'Technical', icon: '💻', desc: 'Code & development' },
              { name: 'Creative', icon: '🎨', desc: 'Design & writing' },
              { name: 'Business', icon: '💼', desc: 'Professional tasks' },
              { name: 'Research', icon: '🔬', desc: 'Academic & analysis' }
            ].map((persona, i) => (
              <div key={persona.name} className={`bg-background/50 rounded-lg p-3 border transition-all ${i === 0 ? 'border-primary/50 bg-primary/5' : 'border-transparent'}`}>
                <div className="text-2xl mb-1">{persona.icon}</div>
                <div className="font-medium text-sm">{persona.name}</div>
                <div className="text-xs text-muted-foreground">{persona.desc}</div>
              </div>
            ))}
          </div>
        )
      }
    },
    {
      icon: <Keyboard className="w-6 h-6" />,
      title: "Global Hotkeys",
      description: "⌘⇧Space for overlay toggle, ⌘⇧S for screenshot capture.",
      preview: {
        type: 'hotkeys',
        content: (
          <div className="space-y-4">
            <div className="bg-background/50 rounded-lg p-6">
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 text-xs font-medium bg-background rounded border border-border">⌘</kbd>
                    <kbd className="px-2 py-1 text-xs font-medium bg-background rounded border border-border">⇧</kbd>
                    <kbd className="px-2 py-1 text-xs font-medium bg-background rounded border border-border">Space</kbd>
                  </div>
                  <span className="text-sm text-muted-foreground">Toggle Overlay</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 text-xs font-medium bg-background rounded border border-border">⌘</kbd>
                    <kbd className="px-2 py-1 text-xs font-medium bg-background rounded border border-border">⇧</kbd>
                    <kbd className="px-2 py-1 text-xs font-medium bg-background rounded border border-border">S</kbd>
                  </div>
                  <span className="text-sm text-muted-foreground">Screenshot</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 text-xs font-medium bg-background rounded border border-border">⌘</kbd>
                    <kbd className="px-2 py-1 text-xs font-medium bg-background rounded border border-border">⇧</kbd>
                    <kbd className="px-2 py-1 text-xs font-medium bg-background rounded border border-border">A</kbd>
                  </div>
                  <span className="text-sm text-muted-foreground">Audio Toggle</span>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              System-wide shortcuts • Works in any app
            </div>
          </div>
        )
      }
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Knowledge Hub",
      description: "Document management for PDFs and text files.",
      preview: {
        type: 'docs',
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/50 rounded-lg p-4 border border-dashed border-primary/30">
                <FileText className="w-8 h-8 text-primary/50 mx-auto mb-2" />
                <div className="text-xs text-center text-muted-foreground">Drop PDFs here</div>
              </div>
              <div className="bg-background/50 rounded-lg p-4 border border-dashed border-primary/30">
                <FileText className="w-8 h-8 text-primary/50 mx-auto mb-2" />
                <div className="text-xs text-center text-muted-foreground">Drop TXT here</div>
              </div>
            </div>
            <div className="space-y-2">
              {['Project Brief.pdf', 'Meeting Notes.txt', 'API Documentation.pdf'].map((file) => (
                <div key={file} className="bg-background/50 rounded p-2 flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="flex-1">{file}</span>
                  <span className="text-xs text-muted-foreground">Indexed</span>
                </div>
              ))}
            </div>
          </div>
        )
      }
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Local processing, no telemetry, secure credential storage.",
      preview: {
        type: 'privacy',
        content: (
          <div className="space-y-4">
            <div className="bg-background/50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Keychain Storage</div>
                    <div className="text-xs text-muted-foreground">Encrypted credentials</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Local Processing</div>
                    <div className="text-xs text-muted-foreground">No cloud dependency</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <EyeOff className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Zero Telemetry</div>
                    <div className="text-xs text-muted-foreground">No tracking or analytics</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "High Performance",
      description: "150ms OCR, <2s AI responses, 2 FPS screen capture.",
      preview: {
        type: 'performance',
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">150ms</div>
                <div className="text-xs text-muted-foreground">OCR Speed</div>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <Brain className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">&lt;2s</div>
                <div className="text-xs text-muted-foreground">AI Response</div>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <MonitorSmartphone className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">2 FPS</div>
                <div className="text-xs text-muted-foreground">Capture Rate</div>
              </div>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">CPU Usage</span>
                <span className="text-primary">~5%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        )
      }
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
          {/* Feature list */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  activeFeature === index 
                    ? 'glass-medium border-primary/50 coral-glow' 
                    : 'glass-light hover:glass-medium'
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    activeFeature === index ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary/70'
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Feature preview */}
          <div className="glass-panel rounded-xl p-6 h-[600px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <div className="relative h-full animate-fade-in" key={activeFeature}>
              {activeFeature !== null && features[activeFeature].preview.content}
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