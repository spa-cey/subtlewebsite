import { Router } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';
import adminConfigRoutes from './admin-config';
import aiRoutes from './ai';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/admin', adminConfigRoutes);
router.use('/ai', aiRoutes);

// API root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Subtle Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      ai: '/api/ai',
      health: '/api/health'
    }
  });
});

export default router;