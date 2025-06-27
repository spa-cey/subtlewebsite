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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const state = searchParams.get("state");
  const redirectUri = searchParams.get("redirect_uri");
  const email = searchParams.get("email");

  useEffect(() => {
    console.log('[DesktopLogin] Parameters:', { state, redirectUri, email, hasUser: !!user, hasSession: !!session });
    
    // Validate parameters
    if (!state || !redirectUri) {
      console.error('[DesktopLogin] Missing required parameters');
      setErrorMessage("Invalid authentication request - missing parameters");
      toast.error("Invalid authentication request");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    // Validate redirect URI is for Subtle desktop app
    if (!redirectUri.startsWith("subtle://")) {
      console.error('[DesktopLogin] Invalid redirect URI:', redirectUri);
      setErrorMessage("Invalid redirect URI - must be subtle:// scheme");
      toast.error("Invalid redirect URI");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    // If user is already logged in, redirect immediately
    if (user && session) {
      console.log('[DesktopLogin] User authenticated, redirecting to desktop app');
      handleRedirect();
    }
  }, [user, session, state, redirectUri, email, navigate]);

  const handleRedirect = async () => {
    if (!session?.access_token || !state || !redirectUri) {
      console.error("[DesktopLogin] Missing required data for redirect:", {
        hasAccessToken: !!session?.access_token,
        hasState: !!state,
        hasRedirectUri: !!redirectUri
      });
      setErrorMessage("Missing authentication data");
      return;
    }

    setIsRedirecting(true);

    try {
      // Construct the callback URL with token and state
      const callbackUrl = new URL(redirectUri);
      callbackUrl.searchParams.set("token", session.access_token);
      callbackUrl.searchParams.set("state", state);

      console.log('[DesktopLogin] Redirecting to:', callbackUrl.toString());

      // Small delay to ensure UI updates
      setTimeout(() => {
        window.location.href = callbackUrl.toString();
      }, 500);
    } catch (error) {
      console.error("Error redirecting to desktop app:", error);
      setErrorMessage("Failed to redirect to desktop app");
      toast.error("Failed to redirect to desktop app");
      setIsRedirecting(false);
    }
  };

  // If not logged in, redirect to login page with return URL
  useEffect(() => {
    if (!user && !session && !errorMessage) {
      console.log('[DesktopLogin] No user session, redirecting to login');
      const returnUrl = encodeURIComponent(window.location.href);
      let loginUrl = `/login?returnUrl=${returnUrl}&desktopAuth=true`;
      if (email) {
        loginUrl += `&email=${encodeURIComponent(email)}`;
      }
      navigate(loginUrl);
    }
  }, [user, session, navigate, email, errorMessage]);

  const getStatusMessage = () => {
    if (errorMessage) {
      return errorMessage;
    }
    if (isRedirecting) {
      return "Redirecting you back to the desktop app...";
    }
    if (user && session) {
      return "Authentication successful, preparing redirect...";
    }
    return "Authenticating your account...";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Subtle Desktop Authentication</CardTitle>
          <CardDescription>
            {getStatusMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {errorMessage ? (
            <div className="text-center">
              <div className="text-red-500 mb-2">❌</div>
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            </div>
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}