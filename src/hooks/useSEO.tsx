import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const useSEO = ({
  title = "Subtle - Stealth Context-Aware AI Assistant for macOS",
  description = "Sophisticated macOS menu bar app with AI-powered assistance through an invisible overlay. Perfect for interviews, sales calls, coding sessions, and everyday productivity.",
  keywords = "macOS, AI assistant, productivity, screen capture, OCR, audio transcription, Azure OpenAI, invisible overlay, stealth mode, developer tools",
  image = "/og-subtle.png",
  url = "https://subtle.app"
}: SEOProps = {}) => {
  useEffect(() => {
    // Update title
    document.title = title;
    
    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'apple-mobile-web-app-title', content: 'Subtle' },
      { name: 'application-name', content: 'Subtle' },
      { name: 'theme-color', content: '#FF6B6B' }
    ];
    
    metaTags.forEach(({ name, property, content }) => {
      const key = name || property;
      let element = document.querySelector(
        name ? `meta[name="${key}"]` : `meta[property="${key}"]`
      );
      
      if (!element) {
        element = document.createElement('meta');
        if (name) element.setAttribute('name', name);
        if (property) element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    });
    
    // Clean up function
    return () => {
      document.title = 'Subtle - Stealth Context-Aware AI Assistant for macOS';
    };
  }, [title, description, keywords, image, url]);
};