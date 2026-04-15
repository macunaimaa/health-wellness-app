import { Router } from 'express';
import { ReminderController } from '../controllers/reminder.controller';
import { authMiddleware } from '../middleware/auth';
import { tenantGuard } from '../middleware/tenantGuard';
import { asyncHandler } from '../utils/helpers';

const router = Router();
const reminderController = new ReminderController();

router.use(asyncHandler((req, res, next) => authMiddleware(req as any, res, next)));
router.use(asyncHandler((req, res, next) => tenantGuard(req as any, res, next)));

router.get('/reminders', asyncHandler((req, res, next) => reminderController.getReminders(req as any, res, next)));
router.put('/reminders', asyncHandler((req, res, next) => reminderController.updateReminders(req as any, res, next)));

export default router;
