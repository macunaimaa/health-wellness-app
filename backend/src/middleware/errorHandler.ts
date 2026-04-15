import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
    return;
  }

  if (err.name === 'ZodError') {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Dados inválidos',
      details: (err as unknown as { errors: unknown[] }).errors,
    });
    return;
  }

  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'InternalServerError',
    message: 'Erro interno do servidor',
  });
}
