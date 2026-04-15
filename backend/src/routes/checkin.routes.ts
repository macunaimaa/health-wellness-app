import { Router } from 'express';
import { CheckinController } from '../controllers/checkin.controller';
import { authMiddleware } from '../middleware/auth';
import { tenantGuard } from '../middleware/tenantGuard';
import { asyncHandler } from '../utils/helpers';

const router = Router();
const checkinController = new CheckinController();

router.use(asyncHandler((req, res, next) => authMiddleware(req as any, res, next)));
router.use(asyncHandler((req, res, next) => tenantGuard(req as any, res, next)));

router.post('/checkins', asyncHandler((req, res, next) => checkinController.createCheckin(req as any, res, next)));
router.get('/checkins/today/plan', asyncHandler((req, res, next) => checkinController.getTodayPlan(req as any, res, next)));
router.get('/checkins', asyncHandler((req, res, next) => checkinController.getHistory(req as any, res, next)));

export default router;
