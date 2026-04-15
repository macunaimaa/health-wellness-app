import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';
import { authMiddleware } from '../middleware/auth';
import { tenantGuard } from '../middleware/tenantGuard';
import { asyncHandler } from '../utils/helpers';

const router = Router();
const recommendationController = new RecommendationController();

router.use(asyncHandler((req, res, next) => authMiddleware(req as any, res, next)));
router.use(asyncHandler((req, res, next) => tenantGuard(req as any, res, next)));

router.get('/recommendations/checkin/:checkinId', asyncHandler((req, res, next) => recommendationController.getByCheckin(req as any, res, next)));
router.put('/recommendations/:id/feedback', asyncHandler((req, res, next) => recommendationController.submitFeedback(req as any, res, next)));
router.post('/recommendations/checkin/:checkinId/regenerate', asyncHandler((req, res, next) => recommendationController.regenerate(req as any, res, next)));

export default router;
