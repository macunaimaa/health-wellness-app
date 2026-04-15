import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../utils/helpers';

const router = Router();
const authController = new AuthController();

router.post('/register', asyncHandler((req, res, next) => authController.register(req as any, res, next)));
router.post('/login', asyncHandler((req, res, next) => authController.login(req as any, res, next)));
router.get('/me', authMiddleware, asyncHandler((req, res, next) => authController.getMe(req as any, res, next)));

export default router;
