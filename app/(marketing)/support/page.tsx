'use client';

import { useState, useEffect } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { SubtleFAQSection } from '@/components/landing/SubtleFAQSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  ArrowRight, 
  LifeBuoy, 
  MessageCircle, 
  Mail, 
  FileText, 
  Users, 
  ExternalLink,
  HelpCircle,
  Book,
  Shield,
  Activity
} from 'lucide-react';

export default function SupportPage() {
  const [loading, setLoading] = useState(true);
  const showHero = useAnimateIn(false, 300);
  const showResources = useAnimateIn(false, 600);
  const showContact = useAnimateIn(false, 900);
  const showFAQ = useAnimateIn(false, 1200);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LifeBuoy className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading support...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`pt-24 pb-16 px-4 transition-all duration-1000 ${showHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <LifeBuoy className="h-16 w-16 text-primary mx-auto mb-4" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            How can we help you?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Get the support you need to make the most of Subtle. From getting started to advanced features, we're here to help.
          </p>
        </div>
      </section>

      {/* Help Resources */}
      <section className={`py-16 px-4 transition-all duration-1000 delay-300 ${showResources ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Support Resources</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers quickly with our comprehensive help resources
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Getting Started */}
            <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <Book className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Getting Started</h3>
              <p className="text-sm text-muted-foreground mb-4">
                New to Subtle? Learn the basics and get up and running quickly.
              </p>
              <Link href="/features" className="text-primary hover:underline text-sm font-medium">
                View Features Guide <ArrowRight className="h-3 w-3 inline ml-1" />
              </Link>
            </div>

            {/* Documentation */}
            <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Documentation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive guides and API references for developers.
              </p>
              <Link href="/features" className="text-primary hover:underline text-sm font-medium">
                Browse Docs <ArrowRight className="h-3 w-3 inline ml-1" />
              </Link>
            </div>

            {/* System Status */}
            <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">System Status</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Check the current status of all Subtle services.
              </p>
              <a 
                href="https://status.gosubtle.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm font-medium"
              >
                View Status <ExternalLink className="h-3 w-3 inline ml-1" />
              </a>
            </div>

            {/* Security */}
            <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Security & Privacy</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Learn about our security practices and privacy policies.
              </p>
              <Link href="/features" className="text-primary hover:underline text-sm font-medium">
                Security Info <ArrowRight className="h-3 w-3 inline ml-1" />
              </Link>
            </div>

            {/* Community */}
            <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join our Discord community to connect with other users.
              </p>
              <a 
                href="https://discord.gg/subtle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm font-medium"
              >
                Join Discord <ExternalLink className="h-3 w-3 inline ml-1" />
              </a>
            </div>

            {/* Troubleshooting */}
            <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Troubleshooting</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Common issues and solutions to get you back on track.
              </p>
              <Link href="#faq" className="text-primary hover:underline text-sm font-medium">
                View FAQ <ArrowRight className="h-3 w-3 inline ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className={`py-16 px-4 bg-muted/30 transition-all duration-1000 delay-600 ${showContact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Need Direct Support?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Email Support */}
            <div className="p-6 rounded-lg border bg-card">
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get help via email. We typically respond within 24 hours.
              </p>
              <Button asChild className="w-full">
                <a href="mailto:support@gosubtle.app">
                  Contact Support
                </a>
              </Button>
            </div>

            {/* Community Discord */}
            <div className="p-6 rounded-lg border bg-card">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Community Discord</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join our community for quick answers and discussions.
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href="https://discord.gg/subtle" target="_blank" rel="noopener noreferrer">
                  Join Discord <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro tip:</strong> Before reaching out, check our FAQ below for quick answers to common questions.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        id="faq"
        className={`py-16 px-4 transition-all duration-1000 delay-900 ${showFAQ ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Quick answers to the most common questions about Subtle
            </p>
          </div>
          <SubtleFAQSection />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Download Subtle and experience the power of invisible AI assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/download">
                Download Subtle <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}