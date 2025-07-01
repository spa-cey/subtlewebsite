import { SubtleFeaturesSection } from '@/components/landing/SubtleFeaturesSection';
import { useAnimateIn } from '@/lib/animations';
import { useSEO } from '@/hooks/useSEO';

const FeaturesPage = () => {
  useSEO({
    title: "Features - Subtle AI Assistant for macOS",
    description: "Explore Subtle's powerful features: invisible overlay, real-time OCR, audio transcription, Azure OpenAI integration, and more."
  });
  
  const showContent = useAnimateIn(true, 300);

  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        <SubtleFeaturesSection show={showContent} />
      </div>
    </div>
  );
};

export default FeaturesPage;