import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/index';
import { authenticateToken, requireAdmin } from '../middleware/index';

const router = Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Validation schema
const billingQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional().default('1'),
  pageSize: z.string().transform(val => Math.min(parseInt(val) || 25, 100)).optional().default('25'),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional()
});

// GET /admin/users/:id/billing - Get user billing history
router.get('/users/:id/billing', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { page, pageSize, status } = billingQuerySchema.parse(req.query);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
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

    // Since we don't have a billing table yet, we'll return mock data
    // In a real implementation, this would query the billing/transactions table
    const mockBillingHistory = [
      {
        id: 'bill_1',
        amount: 2999,
        currency: 'USD',
        status: 'completed',
        description: 'Pro subscription - Monthly',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'bill_2',
        amount: 2999,
        currency: 'USD',
        status: 'completed',
        description: 'Pro subscription - Monthly',
        createdAt: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'bill_3',
        amount: 2999,
        currency: 'USD',
        status: 'pending',
        description: 'Pro subscription - Monthly',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Filter by status if provided
    let filteredHistory = mockBillingHistory;
    if (status) {
      filteredHistory = mockBillingHistory.filter(bill => bill.status === status);
    }

    // Apply pagination
    const skip = (page - 1) * pageSize;
    const paginatedHistory = filteredHistory.slice(skip, skip + pageSize);
    const total = filteredHistory.length;
    const totalPages = Math.ceil(total / pageSize);

    // Calculate summary
    const totalAmount = filteredHistory.reduce((sum, bill) => {
      return bill.status === 'completed' ? sum + bill.amount : sum;
    }, 0);
    
    const pendingAmount = filteredHistory.reduce((sum, bill) => {
      return bill.status === 'pending' ? sum + bill.amount : sum;
    }, 0);

    return res.json({
      billingHistory: paginatedHistory,
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      },
      summary: {
        totalAmount: totalAmount / 100, // Convert cents to dollars
        totalTransactions: filteredHistory.filter(b => b.status === 'completed').length,
        pendingAmount: pendingAmount / 100
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.errors,
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    console.error('Get user billing error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

export { router as adminBillingRouter };