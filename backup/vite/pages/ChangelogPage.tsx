import { useAnimateIn } from '@/lib/animations';

const ChangelogPage = () => {
  const animateIn = useAnimateIn();

  const releases = [
    {
      version: "1.2.0",
      date: "2024-01-15",
      type: "Feature Release",
      changes: [
        "Added new AI model with improved accuracy",
        "Enhanced privacy controls",
        "Performance optimizations",
        "Bug fixes and stability improvements"
      ]
    },
    {
      version: "1.1.2",
      date: "2024-01-02",
      type: "Bug Fix",
      changes: [
        "Fixed memory leak in background processing",
        "Improved error handling",
        "Updated security protocols"
      ]
    },
    {
      version: "1.1.0",
      date: "2023-12-15",
      type: "Feature Release",
      changes: [
        "Added stealth mode enhancements",
        "New keyboard shortcuts",
        "Improved integration with macOS",
        "Enhanced user interface"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16" {...animateIn}>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Changelog
          </h1>
          <p className="text-xl text-muted-foreground">
            Stay updated with the latest changes and improvements to Subtle
          </p>
        </div>

        <div className="space-y-8">
          {releases.map((release, index) => (
            <div 
              key={release.version} 
              className="border border-border rounded-lg p-6"
              {...animateIn}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-2xl font-semibold text-foreground">
                  v{release.version}
                </h2>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {release.type}
                </span>
                <span className="text-muted-foreground">{release.date}</span>
              </div>
              
              <ul className="space-y-2">
                {release.changes.map((change, changeIndex) => (
                  <li key={changeIndex} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChangelogPage;