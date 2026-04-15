import { CheckinRepository } from '../repositories/checkin.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { DailyCheckinRow } from '../models/types';

const checkinRepo = new CheckinRepository();
const auditRepo = new AuditRepository();

export class CheckinService {
  async upsertCheckin(data: {
    tenantId: string;
    userId: string;
    checkinDate: string;
    energyLevel: number;
    stressLevel: number;
    sleepQuality: number;
    availableMinutes?: number;
    contextType?: string;
    locationContextJson?: Record<string, unknown>;
    mealWindowsJson?: unknown[];
    equipmentAccessJson?: string[];
    notesOptional?: string;
  }, requestId: string): Promise<DailyCheckinRow> {
    const existing = await checkinRepo.findByUserAndDate(data.userId, data.tenantId, data.checkinDate);

    const checkin = await checkinRepo.upsert(data);

    await auditRepo.create({
      tenantId: data.tenantId,
      userIdOptional: data.userId,
      entityType: 'daily_checkin',
      entityId: checkin.id,
      action: existing ? 'update' : 'create',
      beforeJson: existing ? existing as unknown as Record<string, unknown> : undefined,
      afterJson: checkin as unknown as Record<string, unknown>,
      requestId,
    });

    return checkin;
  }

  async getToday(userId: string, tenantId: string): Promise<DailyCheckinRow | null> {
    return checkinRepo.findToday(userId, tenantId);
  }

  async getRecent(userId: string, tenantId: string, days: number = 7): Promise<DailyCheckinRow[]> {
    return checkinRepo.findRecentByUser(userId, tenantId, days);
  }
}
