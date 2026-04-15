import { ProfileRepository } from '../repositories/profile.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { UserProfileRow } from '../models/types';
import { NotFoundError } from '../utils/errors';

const profileRepo = new ProfileRepository();
const auditRepo = new AuditRepository();

export class ProfileService {
  async getProfile(userId: string, tenantId: string): Promise<UserProfileRow> {
    const profile = await profileRepo.findByUserId(userId, tenantId);
    if (!profile) {
      throw new NotFoundError('Perfil não encontrado');
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    tenantId: string,
    data: Partial<{
      ageRange: string;
      biologicalSexOptional: string;
      heightCmOptional: number;
      weightKgOptional: number;
      fitnessLevel: string;
      travelFrequency: string;
      primaryGoal: string;
      secondaryGoalsJson: string[];
      dietaryPreferencesJson: string[];
      dietaryRestrictionsJson: string[];
      physicalLimitationsJson: string[];
      preferredWorkoutTypesJson: string[];
      preferredMealStyleJson: string;
      sleepGoalHoursOptional: number;
    }>,
    requestId: string
  ): Promise<UserProfileRow> {
    const before = await profileRepo.findByUserId(userId, tenantId);
    if (!before) {
      throw new NotFoundError('Perfil não encontrado');
    }

    const after = await profileRepo.update(userId, tenantId, data);
    if (!after) {
      throw new NotFoundError('Erro ao atualizar perfil');
    }

    await auditRepo.create({
      tenantId,
      userIdOptional: userId,
      entityType: 'user_profile',
      entityId: before.id,
      action: 'update',
      beforeJson: before as unknown as Record<string, unknown>,
      afterJson: after as unknown as Record<string, unknown>,
      requestId,
    });

    return after;
  }
}
