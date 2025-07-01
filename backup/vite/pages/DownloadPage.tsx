import { SubtleInstallSection } from '@/components/landing/SubtleInstallSection';
import { useAnimateIn } from '@/lib/animations';
import { useSEO } from '@/hooks/useSEO';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Github, FileText, Shield } from 'lucide-react';

const DownloadPage = () => {
  useSEO({
    title: "Download Subtle - Stealth AI Assistant for macOS",
    description: "Download Subtle for macOS 13.0+. Free during beta. Get invisible AI assistance for interviews, coding, and productivity."
  });
  
  const showContent = useAnimateIn(true, 300);

  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        {/* Quick download section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 md:text-6xl">
            <span className="text-foreground">Download</span>{' '}
            <span className="text-primary coral-glow">Subtle</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Get started with the stealth AI assistant that only you can see.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-xl px-8 py-6 coral-glow">
              <Download className="mr-2 w-5 h-5" />
              Download Latest (v0.1.0-beta)
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 glass-light hover:glass-medium">
              <Github className="mr-2 w-5 h-5" />
              View on GitHub
            </Button>
          </div>
        </div>

        {/* Version info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          <Card className="glass-light p-6 text-center">
            <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Verified Build</h3>
            <p className="text-sm text-muted-foreground">
              Signed and notarized by Apple
            </p>
          </Card>
          <Card className="glass-light p-6 text-center">
            <FileText className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Release Notes</h3>
            <p className="text-sm text-muted-foreground">
              See what's new in this version
            </p>
          </Card>
          <Card className="glass-light p-6 text-center">
            <Download className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Previous Versions</h3>
            <p className="text-sm text-muted-foreground">
              Download older releases
            </p>
          </Card>
        </div>

        {/* Installation guide */}
        <SubtleInstallSection show={showContent} />
      </div>
    </div>
  );
};

export default DownloadPage;