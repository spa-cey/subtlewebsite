
import React from 'react';
import { ExternalLink, Mail, Plus, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ProfileCard: React.FC = () => {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="glass-panel rounded-xl p-6 text-center">
          <div className="text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Please sign in to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const joinDate = formatDate(user.created_at);
  const isEmailVerified = !!user.email_confirmed_at;
  const userBio = user.user_metadata?.bio;
  const userLocation = user.user_metadata?.location;
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="glass-panel rounded-xl p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-light">{getInitials(displayName)}</span>
          )}
        </div>
        
        <h2 className="text-2xl font-semibold mt-4">{displayName}</h2>
        
        <div className="flex items-center justify-center mt-2 gap-2">
          <Mail size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground">{userEmail}</span>
          {isEmailVerified && (
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full" title="Email verified" />
          )}
        </div>
        
        {userBio && (
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            {userBio}
          </p>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          {userLocation && <div>📍 {userLocation}</div>}
          <div>📅 Member since {joinDate}</div>
        </div>
        
        {/* Placeholder for social links */}
        <div className="flex justify-center gap-3 mt-6">
          <div className="text-sm text-muted-foreground">
            Social links will be available in future updates
          </div>
        </div>
      </div>
      
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Projects</h3>
          <button className="inline-flex items-center gap-1 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Plus size={16} />
          </button>
        </div>
        
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Project management features will be available in future updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
