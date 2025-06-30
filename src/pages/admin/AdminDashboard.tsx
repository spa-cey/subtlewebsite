import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Shield,
  Users,
  BarChart3,
  CreditCard,
  Settings,
  ArrowLeft,
  Menu,
  X,
  Home,
  FileText,
  HelpCircle,
  Database
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardOverview from '@/components/admin/DashboardOverview';
import ConfigurationManager from '@/components/admin/config/ConfigurationManager';
import UserManager from '@/components/admin/users/UserManager';
import Analytics from '@/components/admin/analytics/Analytics';
import BillingManager from '@/components/admin/billing/BillingManager';

type AdminModule = 'overview' | 'users' | 'billing' | 'config' | 'analytics' | 'audit' | 'support' | 'content';

interface NavItem {
  id: AdminModule;
  label: string;
  icon: React.ElementType;
  component?: React.ReactNode;
  implemented: boolean;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<AdminModule>('overview');
  const [loading, setLoading] = useState(true);
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
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user has admin subscription tier
    if (user.subscriptionTier !== 'admin') {
      navigate('/');
      return;
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-red-500/10 to-pink-600/10"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </div>
    );
  }

  const currentNavItem = navItems.find(item => item.id === activeModule);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ marginTop: '-1px' }}>
      {/* Background gradient - same as home page */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-red-500/10 to-pink-600/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="relative flex flex-1">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          border-r border-gray-200 dark:border-gray-700 overflow-y-auto
        `}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">System Management</p>
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
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                      : item.implemented
                        ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {!item.implemented && (
                    <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
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
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {currentNavItem?.label || 'Admin Dashboard'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
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
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
              {currentNavItem?.component}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;