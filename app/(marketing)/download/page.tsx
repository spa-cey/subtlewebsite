'use client';

import { useState, useEffect } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Apple, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Shield, 
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DownloadPage() {
  const [loading, setLoading] = useState(true);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const showContent = useAnimateIn(false, 300);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    setDownloadStarted(true);
    // In a real app, this would trigger the actual download
    window.open('https://download.gosubtle.app/mac/latest', '_blank');
  };

  const systemRequirements = [
    { icon: Monitor, label: 'macOS 13.0 or later', detail: 'Ventura, Sonoma, or newer' },
    { icon: Cpu, label: 'Apple Silicon or Intel', detail: 'M1/M2/M3 or Intel processor' },
    { icon: HardDrive, label: '500MB free space', detail: 'For app and local models' },
    { icon: Shield, label: 'Security & Privacy', detail: 'Screen recording permission required' },
  ];

  const features = [
    'AI-powered screen understanding',
    'Natural language commands',
    'Privacy-first design',
    'Works with any application',
    'No internet required for basic features',
    'Automatic updates',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Download className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing download...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>
      
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <Apple className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">Download</span>{' '}
            <span className="text-primary coral-glow">Subtle for macOS</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            The AI assistant that sees what you see and helps you work smarter.
          </p>
          
          {downloadStarted && (
            <Alert className="max-w-md mx-auto mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your download should start automatically. If it doesn't,{' '}
                <a href="https://download.gosubtle.app/mac/latest" className="text-primary hover:underline">
                  click here
                </a>.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-4 justify-center items-center">
            <Button size="lg" onClick={handleDownload} className="coral-glow">
              <Download className="mr-2 h-5 w-5" />
              Download for macOS
            </Button>
            <Badge variant="secondary" className="py-2 px-4">
              Version 1.0.0 • 45 MB
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Free tier includes 5 pro responses per day
          </p>
        </div>

        {/* System Requirements */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>System Requirements</CardTitle>
              <CardDescription>Make sure your Mac meets these requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemRequirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      <req.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{req.label}</p>
                      <p className="text-sm text-muted-foreground">{req.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
              <CardDescription>Everything you need to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Installation Instructions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>Get up and running in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-medium mb-2">Download & Install</h4>
                <p className="text-sm text-muted-foreground">
                  Open the downloaded DMG file and drag Subtle to your Applications folder
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-medium mb-2">Grant Permissions</h4>
                <p className="text-sm text-muted-foreground">
                  Allow screen recording in System Settings → Privacy & Security
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-medium mb-2">Start Using</h4>
                <p className="text-sm text-muted-foreground">
                  Press Cmd+Space+S to activate Subtle anywhere
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Privacy First:</strong> Subtle processes everything locally on your Mac. 
            Screen content is never sent to our servers without your explicit permission.
          </AlertDescription>
        </Alert>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Need help getting started?
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/docs">
                View Documentation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/support">
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}