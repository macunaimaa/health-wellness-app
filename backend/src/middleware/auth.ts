import { Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest } from '../models/types';

// Auth desativada: injeta usuário demo em todas as requisições
export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  req.user = {
    userId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    tenantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    role: 'admin',
  };
  next();
}

export function adminOnly(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenError('Acesso restrito a administradores');
  }
  next();
}
