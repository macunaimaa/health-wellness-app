import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth';
import { tenantGuard } from '../middleware/tenantGuard';
import { asyncHandler } from '../utils/helpers';

const router = Router();
const profileController = new ProfileController();

router.use(asyncHandler((req, res, next) => authMiddleware(req as any, res, next)));
router.use(asyncHandler((req, res, next) => tenantGuard(req as any, res, next)));

router.get('/profile', asyncHandler((req, res, next) => profileController.getProfile(req as any, res, next)));
router.post('/profile', asyncHandler((req, res, next) => profileController.createProfile(req as any, res, next)));
router.put('/profile', asyncHandler((req, res, next) => profileController.updateProfile(req as any, res, next)));

export default router;
