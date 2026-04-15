import { Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { CheckinRepository } from '../repositories/checkin.repository';
import { RecommendationRepository } from '../repositories/recommendation.repository';
import { AuthenticatedRequest } from '../models/types';
import { z } from 'zod';

const userRepo = new UserRepository();
const checkinRepo = new CheckinRepository();
const recommendationRepo = new RecommendationRepository();

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export class AdminController {
  async listUsers(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const query = listUsersQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    const [users, total] = await Promise.all([
      userRepo.findAllByTenant(req.user!.tenantId, query.limit, offset),
      userRepo.countByTenant(req.user!.tenantId),
    ]);

    res.json({
      data: users,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    });
  }

  async engagementSummary(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const tenantId = req.user!.tenantId;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers30d,
      totalCheckins30d,
      totalCheckins7d,
      recommendationsByStatus,
    ] = await Promise.all([
      userRepo.countByTenant(tenantId),
      checkinRepo.countByTenantSince(tenantId, thirtyDaysAgo),
      checkinRepo.totalCountByTenantSince(tenantId, thirtyDaysAgo),
      checkinRepo.totalCountByTenantSince(tenantId, sevenDaysAgo),
      recommendationRepo.countByStatus(tenantId, thirtyDaysAgo),
    ]);

    res.json({
      totalUsers,
      activeUsers30d,
      totalCheckins30d,
      totalCheckins7d,
      recommendationsByStatus,
      engagementRate: totalUsers > 0 ? ((activeUsers30d / totalUsers) * 100).toFixed(1) : '0',
    });
  }
}
