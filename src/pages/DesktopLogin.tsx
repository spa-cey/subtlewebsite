import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DesktopLogin() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const state = searchParams.get("state");
  const redirectUri = searchParams.get("redirect_uri");

  useEffect(() => {
    // Validate parameters
    if (!state || !redirectUri) {
      toast.error("Invalid authentication request");
      navigate("/login");
      return;
    }

    // Validate redirect URI is for Subtle desktop app
    if (!redirectUri.startsWith("subtle://")) {
      toast.error("Invalid redirect URI");
      navigate("/login");
      return;
    }

    // If user is already logged in, redirect immediately
    if (user && session) {
      handleRedirect();
    }
  }, [user, session, state, redirectUri, navigate]);

  const handleRedirect = async () => {
    if (!session?.access_token || !state || !redirectUri) {
      console.error("Missing required data for redirect");
      return;
    }

    setIsRedirecting(true);

    try {
      // Construct the callback URL with token and state
      const callbackUrl = new URL(redirectUri);
      callbackUrl.searchParams.set("token", session.access_token);
      callbackUrl.searchParams.set("state", state);

      // Redirect to the desktop app
      window.location.href = callbackUrl.toString();
    } catch (error) {
      console.error("Error redirecting to desktop app:", error);
      toast.error("Failed to redirect to desktop app");
      setIsRedirecting(false);
    }
  };

  // If not logged in, redirect to login page with return URL
  useEffect(() => {
    if (!user && !session) {
      const returnUrl = encodeURIComponent(window.location.href);
      navigate(`/login?returnUrl=${returnUrl}&desktopAuth=true`);
    }
  }, [user, session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Logging in for Subtle Desktop</CardTitle>
          <CardDescription>
            {isRedirecting 
              ? "Redirecting you back to the desktop app..."
              : "Authenticating your account..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}