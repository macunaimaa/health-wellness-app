import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../models/types';
import { generateRequestId, logger } from '../utils/logger';

export function requestLogger(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const requestId = generateRequestId();
  req.requestId = requestId;

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      tenantId: req.user?.tenantId,
      userId: req.user?.userId,
      ip: req.ip,
    });
  });

  next();
}
