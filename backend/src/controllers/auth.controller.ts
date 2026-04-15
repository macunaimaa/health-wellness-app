import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../models/types';
import { z } from 'zod';

const authService = new AuthService();

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  tenantId: z.string().uuid('Tenant ID inválido'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const body = registerSchema.parse(req.body);
    const result = await authService.register(body, req.requestId!);
    res.status(201).json(result);
  }

  async login(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.password, req.requestId!);
    res.json(result);
  }

  async getMe(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const user = await authService.getMe(req.user!.userId, req.user!.tenantId);
    res.json({ user });
  }
}
