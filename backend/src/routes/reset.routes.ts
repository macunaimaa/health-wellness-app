import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tenantGuard } from '../middleware/tenantGuard';
import { asyncHandler } from '../utils/helpers';
import { query } from '../config/database';
import { AuthenticatedRequest } from '../models/types';

const router = Router();

router.use(asyncHandler((req, res, next) => authMiddleware(req as AuthenticatedRequest, res, next)));
router.use(asyncHandler((req, res, next) => tenantGuard(req as AuthenticatedRequest, res, next)));

router.delete('/reset', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, tenantId } = req.user!;

  await query(
    `DELETE FROM recommendation_feedback
     WHERE tenant_id = $1 AND user_id = $2`,
    [tenantId, userId]
  );

  await query(
    `DELETE FROM recommendations
     WHERE tenant_id = $1 AND user_id = $2`,
    [tenantId, userId]
  );

  await query(
    `DELETE FROM daily_checkins
     WHERE tenant_id = $1 AND user_id = $2`,
    [tenantId, userId]
  );

  res.json({ message: 'Dados resetados com sucesso' });
}));

export default router;
