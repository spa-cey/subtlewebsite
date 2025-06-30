import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/index';
import { authenticateToken, requireAdmin } from '../middleware/index';

const router = Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// GET /admin/stats - Get dashboard statistics
router.get('/stats', async (req: Request, res: Response): Promise<Response> => {
  try {
    // Get user statistics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        lastSignInAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });
    
    const subscriptionStats = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: true
    });

    const subscriptionBreakdown = subscriptionStats.reduce((acc, stat) => {
      acc[stat.subscriptionTier] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    // Get recent activity
    const recentSignups = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    // Mock revenue data (replace with real billing data when available)
    const mockRevenue = {
      mrr: 14995, // $149.95
      totalRevenue: 89970, // $899.70
      activeSubscriptions: subscriptionBreakdown.pro || 0 + subscriptionBreakdown.enterprise || 0
    };

    return res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        new: recentSignups
      },
      subscriptions: subscriptionBreakdown,
      revenue: mockRevenue,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch dashboard statistics',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

// GET /admin/users - List all users with pagination
router.get('/users', async (req: Request, res: Response): Promise<Response> => {
  try {
    const querySchema = z.object({
      page: z.string().transform(val => parseInt(val) || 1).optional().default('1'),
      pageSize: z.string().transform(val => Math.min(parseInt(val) || 25, 100)).optional().default('25'),
      search: z.string().optional(),
      subscriptionTier: z.enum(['free', 'pro', 'enterprise', 'admin']).optional()
    });

    const { page, pageSize, search, subscriptionTier } = querySchema.parse(req.query);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (subscriptionTier) {
      where.subscriptionTier = subscriptionTier;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          subscriptionTier: true,
          emailVerified: true,
          lastSignInAt: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return res.json({
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: error.errors,
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    console.error('List users error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch users',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

// GET /admin/users/:id - Get user details
router.get('/users/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        userActivity: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        adminNotesAsUser: {
          include: {
            admin: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        usageMetrics: {
          orderBy: { createdAt: 'desc' },
          take: 30
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get user details error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user details',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

// PATCH /admin/users/:id - Update user
router.patch('/users/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateSchema = z.object({
      fullName: z.string().optional(),
      subscriptionTier: z.enum(['free', 'pro', 'enterprise', 'admin']).optional(),
      emailVerified: z.boolean().optional()
    });

    const updates = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id },
      data: updates
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        userId: id,
        action: 'UPDATE_USER',
        details: updates,
        ipAddress: req.ip
      }
    });

    return res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update data',
          details: error.errors,
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    console.error('Update user error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

// POST /admin/users/:id/notes - Add admin note
router.post('/users/:id/notes', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const noteSchema = z.object({
      note: z.string().min(1),
      isFlagged: z.boolean().optional().default(false)
    });

    const { note, isFlagged } = noteSchema.parse(req.body);

    const adminNote = await prisma.adminNote.create({
      data: {
        userId: id,
        adminId: req.user!.id,
        note,
        isFlagged
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });

    return res.status(201).json({ note: adminNote });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid note data',
          details: error.errors,
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    console.error('Create admin note error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create note',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

// GET /admin/activity - Get recent admin activity
router.get('/activity', async (req: Request, res: Response): Promise<Response> => {
  try {
    const recentActivity = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });

    return res.json({ activity: recentActivity });
  } catch (error) {
    console.error('Get admin activity error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch activity',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

export default router;