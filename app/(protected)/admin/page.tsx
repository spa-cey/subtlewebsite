'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext-nextjs';
import DashboardOverview from '@/components/admin/DashboardOverview';
import UserManager from '@/components/admin/UserManager';
import BillingManager from '@/components/admin/BillingManager';
import ConfigurationManager from '@/components/admin/ConfigurationManager';
import Analytics from '@/components/admin/Analytics';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield,
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  AlertCircle,
  Menu,
  X,
  ArrowLeft,
  FileText,
  HelpCircle,
  Database,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminModule = 'overview' | 'users' | 'billing' | 'config' | 'analytics' | 'audit' | 'support' | 'content';

interface NavItem {
  id: AdminModule;
  label: string;
  icon: React.ElementType;
  component?: React.ReactNode;
  implemented: boolean;
}

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState<AdminModule>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: Home,
      component: <DashboardOverview />,
      implemented: true
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      component: <UserManager />,
      implemented: true
    },
    {
      id: 'billing',
      label: 'Subscriptions & Billing',
      icon: CreditCard,
      component: <BillingManager />,
      implemented: true
    },
    {
      id: 'config',
      label: 'System Configuration',
      icon: Settings,
      component: <ConfigurationManager />,
      implemented: true
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      component: <Analytics />,
      implemented: true
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: FileText,
      implemented: false
    },
    {
      id: 'support',
      label: 'Support Tools',
      icon: HelpCircle,
      implemented: false
    },
    {
      id: 'content',
      label: 'Content Management',
      icon: Database,
      implemented: false
    },
  ];

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentNavItem = navItems.find(item => item.id === activeModule);

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-background border rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-background/95 backdrop-blur-sm",
        "transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        "border-r overflow-y-auto",
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <p className="text-sm text-muted-foreground">System Management</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.implemented) {
                    setActiveModule(item.id);
                    setSidebarOpen(false);
                  }
                }}
                disabled={!item.implemented}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : item.implemented
                      ? 'hover:bg-accent'
                      : 'text-muted-foreground cursor-not-allowed'
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {!item.implemented && (
                  <span className="ml-auto text-xs bg-muted px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {currentNavItem?.label || 'Admin Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {activeModule === 'overview' && 'Monitor system health and key metrics'}
              {activeModule === 'users' && 'Manage user accounts and permissions'}
              {activeModule === 'billing' && 'Handle subscriptions and billing'}
              {activeModule === 'config' && 'Configure system settings'}
              {activeModule === 'analytics' && 'View detailed analytics and reports'}
              {activeModule === 'audit' && 'Review system audit logs'}
              {activeModule === 'support' && 'Access support tools and utilities'}
              {activeModule === 'content' && 'Manage content and resources'}
            </p>
          </div>

          {/* Module Content */}
          <div className="bg-background/95 backdrop-blur-sm rounded-xl shadow-xl border">
            {currentNavItem?.component}
          </div>
        </div>
      </main>
    </div>
  );
}