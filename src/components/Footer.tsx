import { Github, Twitter, MessageCircle, FileText, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    product: [
      { label: 'Features', href: '/features' },
      { label: 'Download', href: '/download' },
      { label: 'Changelog', href: '#' },
      { label: 'Roadmap', href: '#' },
    ],
    developers: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'SDK', href: '#' },
      { label: 'Integrations', href: '#' },
    ],
    company: [
      { label: 'About', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Security', href: '#' },
    ],
    support: [
      { label: 'Help Center', href: '#' },
      { label: 'Discord Community', href: '#', external: true },
      { label: 'Email Support', href: 'mailto:support@subtle.app' },
      { label: 'FAQ', href: '#' },
    ],
  };

  return (
    <footer className="border-t border-border/50 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/Subtle_LOGO-nobackground.png" alt="Subtle" className="w-10 h-10" />
              <span className="font-bold text-xl">Subtle</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Stealth AI assistant for macOS. Invisible to everyone but you.
            </p>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links sections */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:col-span-4">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="font-semibold text-sm uppercase tracking-wider mb-3 text-foreground/80">
                  {category}
                </h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                      >
                        {link.label}
                        {link.external && <ExternalLink className="h-3 w-3" />}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50 pt-8">
          {/* Bottom section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>© {currentYear} Subtle. All rights reserved.</span>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Privacy First</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>Secure by Design</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Built with</span>
              <span className="text-primary">♥</span>
              <span className="text-muted-foreground">for productivity</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;