import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { tenantGuard } from '../middleware/tenantGuard';
import { asyncHandler } from '../utils/helpers';

const router = Router();
const adminController = new AdminController();

router.use(asyncHandler((req, res, next) => authMiddleware(req as any, res, next)));
router.use(asyncHandler((req, res, next) => tenantGuard(req as any, res, next)));
router.use(asyncHandler((req, res, next) => adminOnly(req as any, res, next)));

router.get('/users', asyncHandler((req, res, next) => adminController.listUsers(req as any, res, next)));
router.get('/engagement/summary', asyncHandler((req, res, next) => adminController.engagementSummary(req as any, res, next)));

export default router;
