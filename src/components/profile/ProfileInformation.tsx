import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Calendar, Clock, Camera, Loader2 } from 'lucide-react';

interface ProfileFormData {
  full_name: string;
  email: string;
}

export function ProfileInformation() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
    email: user?.email || '',
  });

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        email: formData.email,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No user data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                  alt={formData.full_name} 
                />
                <AvatarFallback className="text-lg">
                  {getInitials(formData.full_name)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                disabled={isLoading}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{formData.full_name}</h3>
              <p className="text-muted-foreground">{formData.email}</p>
              {user.email_confirmed_at && (
                <Badge variant="secondary" className="mt-1">
                  <Mail className="h-3 w-3 mr-1" />
                  Email Verified
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Editable Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="px-3 py-2 bg-muted rounded-md">
                    {formData.full_name || 'Not set'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter your email address"
                  />
                ) : (
                  <div className="px-3 py-2 bg-muted rounded-md flex items-center gap-2">
                    {formData.email}
                    {user.email_confirmed_at && (
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
              <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm">
                {user.id}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
              <div className="px-3 py-2 bg-muted rounded-md flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(user.created_at)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Last Sign In</Label>
              <div className="px-3 py-2 bg-muted rounded-md flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatDate(user.last_sign_in_at)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email Confirmed</Label>
              <div className="px-3 py-2 bg-muted rounded-md">
                {user.email_confirmed_at ? formatDate(user.email_confirmed_at) : 'Not confirmed'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}