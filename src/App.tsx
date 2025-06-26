
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "./pages/Index";
import WhyPage from "./pages/WhyPage";
import HowPage from "./pages/HowPage";
import FeaturesPage from "./pages/FeaturesPage";
import DownloadPage from "./pages/DownloadPage";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Import from "./pages/Import";
import SearchPage from "./pages/SearchPage";
import Settings from "./pages/Settings";
import ManagePage from "./pages/ManagePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DesktopLogin from "./pages/DesktopLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ErrorBoundary } from "./components/ErrorBoundary";


const queryClient = new QueryClient();

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="transition-opacity duration-300 animate-fade-in">
      {children}
    </div>
  );
};

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <PageTransition>
            <Index />
          </PageTransition>
        } 
      />
      <Route 
        path="/why" 
        element={
          <PageTransition>
            <WhyPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/how" 
        element={
          <PageTransition>
            <HowPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/features" 
        element={
          <PageTransition>
            <FeaturesPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/download" 
        element={
          <PageTransition>
            <DownloadPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/manage" 
        element={
          <PageTransition>
            <ManagePage />
          </PageTransition>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PageTransition>
            <Profile />
          </PageTransition>
        } 
      />
      <Route 
        path="/import" 
        element={
          <PageTransition>
            <Import />
          </PageTransition>
        } 
      />
      <Route 
        path="/search" 
        element={
          <PageTransition>
            <SearchPage />
          </PageTransition>
        } 
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <PageTransition>
              <Settings />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route 
        path="/login" 
        element={
          <PageTransition>
            <Login />
          </PageTransition>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PageTransition>
            <Signup />
          </PageTransition>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth/callback"
        element={
          <PageTransition>
            <AuthCallback />
          </PageTransition>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PageTransition>
            <ForgotPassword />
          </PageTransition>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PageTransition>
            <ResetPassword />
          </PageTransition>
        }
      />
      <Route
        path="/auth/desktop-login"
        element={
          <PageTransition>
            <DesktopLogin />
          </PageTransition>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <PageTransition>
              <AdminDashboard />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <PageTransition>
            <NotFound />
          </PageTransition>
        }
      />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <AppRoutes />
                </main>
                <Footer />
              </div>
            </BrowserRouter>
            <Analytics />
            <SpeedInsights />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
