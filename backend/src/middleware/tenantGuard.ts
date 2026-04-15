import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../models/types';
import { UnauthorizedError } from '../utils/errors';

export function tenantGuard(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  if (!req.user || !req.user.tenantId) {
    throw new UnauthorizedError('Tenant não identificado');
  }
  next();
}
