import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // User statistics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        lastSignInAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      },
    });
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    });
    const newUsersLastMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Subscription statistics
    const subscriptionCounts = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: true,
    });

    const subscriptionStats = subscriptionCounts.reduce((acc, curr) => {
      acc[curr.subscriptionTier || 'free'] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    // Revenue calculations (mock data for demo)
    const monthlyRevenue = {
      mrr: (subscriptionStats.basic || 0) * 10 + 
           (subscriptionStats.pro || 0) * 20 + 
           (subscriptionStats.enterprise || 0) * 100,
      growth: 15.3, // Mock growth percentage
    };

    // System health (mock data)
    const systemHealth = {
      apiUptime: 99.9,
      avgResponseTime: 145, // ms
      errorRate: 0.02, // percentage
    };

    // Recent activity (mock data)
    const recentActivity = {
      signups: newUsersThisMonth,
      apiCalls: Math.floor(Math.random() * 10000) + 5000,
      aiTokensUsed: Math.floor(Math.random() * 1000000) + 500000,
    };

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          growth: newUsersLastMonth > 0 
            ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
            : 'N/A',
        },
        subscriptions: subscriptionStats,
        revenue: monthlyRevenue,
        systemHealth,
        recentActivity,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin statistics',
      },
      { status: 500 }
    );
  }
}