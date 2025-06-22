import { AnimatedTransition } from '@/components/AnimatedTransition';
import { 
  Layers, 
  Box, 
  Database, 
  Cpu, 
  Shield, 
  Zap,
  GitBranch,
  Package,
  Code2,
  Terminal
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ArchitectureSectionProps {
  show: boolean;
}

export const SubtleArchitectureSection = ({ show }: ArchitectureSectionProps) => {
  const architectureLayers = [
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Clean Architecture + MVVM",
      description: "Domain-driven design with clear separation of concerns",
      details: [
        "Domain layer with entities and use cases",
        "Data layer with repository implementations",
        "Presentation layer with SwiftUI views",
        "Dependency injection containers"
      ]
    },
    {
      icon: <Box className="w-6 h-6" />,
      title: "Feature Modules",
      description: "Organized by feature for maintainability",
      details: [
        "Dashboard with metrics",
        "Chat with AI integration",
        "Screen & Audio capture",
        "Knowledge Hub for documents"
      ]
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Management",
      description: "Efficient local storage and caching",
      details: [
        "Core Data for persistence",
        "In-memory caching",
        "Secure keychain storage",
        "Document management"
      ]
    }
  ];

  const technicalSpecs = [
    {
      icon: <Cpu />,
      label: "SwiftUI & Combine",
      description: "Modern reactive UI"
    },
    {
      icon: <Shield />,
      label: "ScreenCaptureKit",
      description: "macOS 14+ screen capture"
    },
    {
      icon: <Zap />,
      label: "Vision Framework",
      description: "On-device OCR"
    },
    {
      icon: <GitBranch />,
      label: "AVFoundation",
      description: "Audio capture & processing"
    },
    {
      icon: <Package />,
      label: "Speech Framework",
      description: "Real-time transcription"
    },
    {
      icon: <Terminal />,
      label: "XcodeGen",
      description: "Reproducible builds"
    }
  ];

  const performanceMetrics = [
    { metric: "OCR Processing", value: "~150ms", description: "Text extraction speed" },
    { metric: "AI Response", value: "<2s", description: "End-to-end latency" },
    { metric: "Screen Capture", value: "2 FPS", description: "When actively monitoring" },
    { metric: "Memory Usage", value: "<200MB", description: "Typical footprint" }
  ];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-4xl font-bold md:text-6xl">
            <span className="text-foreground">Built with</span>{' '}
            <span className="text-primary coral-glow">Excellence</span>
          </h2>
          <p className="text-foreground/70 max-w-3xl text-lg md:text-xl">
            Modern architecture, native performance, and privacy-first design principles.
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {architectureLayers.map((layer, index) => (
            <Card key={index} className="glass-light p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  {layer.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{layer.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{layer.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {layer.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Technical Stack */}
        <Card className="glass-panel p-8 mb-16">
          <h3 className="text-2xl font-semibold mb-8 text-center">Native macOS Technologies</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {technicalSpecs.map((spec, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {spec.icon}
                </div>
                <div>
                  <h4 className="font-medium">{spec.label}</h4>
                  <p className="text-sm text-muted-foreground">{spec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {performanceMetrics.map((metric, index) => (
            <Card key={index} className="glass-light p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{metric.value}</div>
              <h4 className="font-medium mb-1">{metric.metric}</h4>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </Card>
          ))}
        </div>

        {/* Code Example */}
        <Card className="glass-panel p-8">
          <div className="flex items-center gap-3 mb-6">
            <Code2 className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold">Clean Architecture Example</h3>
          </div>
          <div className="bg-black/50 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono">
{`// Domain Layer - Use Case
protocol CaptureScreenUseCase {
    func captureScreen() async throws -> ScreenCapture
}

// Data Layer - Repository Implementation  
final class ScreenCaptureRepository: ScreenCaptureRepositoryProtocol {
    private let captureService: ScreenCaptureService
    
    func capture() async throws -> ScreenCapture {
        let content = try await captureService.captureContent()
        let text = try await visionService.extractText(from: content)
        return ScreenCapture(image: content, extractedText: text)
    }
}

// Presentation Layer - ViewModel
@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var screenCapture: ScreenCapture?
    private let captureScreenUseCase: CaptureScreenUseCase
    
    func captureScreen() async {
        do {
            screenCapture = try await captureScreenUseCase.captureScreen()
        } catch {
            // Handle error
        }
    }
}`}
            </pre>
          </div>
        </Card>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Want to learn more about our architecture?
          </p>
          <div className="flex gap-4 justify-center">
            <Card className="glass-light px-6 py-3 inline-flex items-center gap-2 hover:glass-medium transition-all cursor-pointer">
              <Terminal className="w-5 h-5 text-primary" />
              <span>Technical Documentation</span>
            </Card>
            <Card className="glass-light px-6 py-3 inline-flex items-center gap-2 hover:glass-medium transition-all cursor-pointer">
              <GitBranch className="w-5 h-5 text-primary" />
              <span>API Reference</span>
            </Card>
          </div>
        </div>
      </div>
    </AnimatedTransition>
  );
};