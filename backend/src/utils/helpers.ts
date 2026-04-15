import { Request, Response, NextFunction } from 'express';

export function parseJsonField<T>(value: unknown): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value as T;
    }
  }
  return value as T;
}

export function formatDateForDb(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

type Handler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export function asyncHandler(fn: Handler): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
