import { Router, Response, Request } from 'express';
import { getDbStatus, seedInitialData } from '../db';
import { verifyToken, requireRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/health
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'StaffSync HRMS MERN API',
    timestamp: new Date().toISOString()
  });
});

// GET /api/system/status
router.get('/status', (req: Request, res: Response) => {
  const status = getDbStatus();
  res.json({
    success: true,
    system: {
      ...status,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version
    }
  });
});

// POST /api/system/seed - Trigger reseed
router.post('/seed', async (req: Request, res: Response) => {
  try {
    await seedInitialData(true);
    res.json({
      success: true,
      message: 'StaffSync database successfully reseeded with sample HR data.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
