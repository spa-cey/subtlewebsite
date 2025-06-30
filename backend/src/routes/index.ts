import { Router } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// API root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Subtle Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

export default router;