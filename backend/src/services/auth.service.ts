import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/user.repository';
import { ProfileRepository } from '../repositories/profile.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { env } from '../config/env';
import { UserRow } from '../models/types';

const userRepo = new UserRepository();
const profileRepo = new ProfileRepository();
const auditRepo = new AuditRepository();

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    tenantId: string;
  }, requestId: string) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email já cadastrado');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await userRepo.create({
      tenantId: data.tenantId,
      email: data.email,
      passwordHash,
      fullName: data.fullName,
    });

    await profileRepo.create({
      tenantId: data.tenantId,
      userId: user.id,
    });

    await auditRepo.create({
      tenantId: data.tenantId,
      userIdOptional: user.id,
      entityType: 'user',
      entityId: user.id,
      action: 'register',
      requestId,
    });

    const token = this.generateToken(user);

    return {
      user: this.formatUserResponse(user),
      token,
    };
  }

  async login(email: string, password: string, requestId: string) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Conta desativada');
    }

    await userRepo.updateLastSeen(user.id);

    await auditRepo.create({
      tenantId: user.tenant_id,
      userIdOptional: user.id,
      entityType: 'user',
      entityId: user.id,
      action: 'login',
      requestId,
    });

    const profile = await profileRepo.findByUserId(user.id, user.tenant_id);
    const token = this.generateToken(user);

    return {
      user: this.formatUserResponse(user, profile),
      token,
    };
  }

  async getMe(userId: string, tenantId: string) {
    const user = await userRepo.findById(userId, tenantId);
    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    const profile = await profileRepo.findByUserId(userId, tenantId);

    return this.formatUserResponse(user, profile);
  }

  private formatUserResponse(user: UserRow, profile: any = null) {
    return {
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
      tenantId: user.tenant_id,
      profileComplete: !!(profile && profile.primary_goal),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  private generateToken(user: UserRow): string {
    return jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}
