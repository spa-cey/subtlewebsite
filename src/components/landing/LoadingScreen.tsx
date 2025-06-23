
export const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="relative flex items-center justify-center w-full h-full">
          <img 
            src="/Subtle_LOGO-nobackground.png" 
            alt="Subtle" 
            className="w-16 h-16 animate-pulse"
          />
        </div>
      </div>
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-primary">Subtle</span>
        </h2>
        <p className="text-muted-foreground animate-pulse">Initializing invisible intelligence...</p>
      </div>
    </div>
  );
};
