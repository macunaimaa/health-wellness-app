import { ReminderRepository } from '../repositories/reminder.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { ReminderRow } from '../models/types';

const reminderRepo = new ReminderRepository();
const auditRepo = new AuditRepository();

export class ReminderService {
  async getReminders(userId: string, tenantId: string): Promise<ReminderRow[]> {
    return reminderRepo.findByUser(userId, tenantId);
  }

  async updateReminders(
    userId: string,
    tenantId: string,
    reminders: Array<{
      reminderType: string;
      scheduleJson: Record<string, unknown>;
      channel?: string;
      active?: boolean;
    }>,
    requestId: string
  ): Promise<ReminderRow[]> {
    const before = await reminderRepo.findByUser(userId, tenantId);

    const result = await reminderRepo.upsertMany(userId, tenantId, reminders);

    await auditRepo.create({
      tenantId,
      userIdOptional: userId,
      entityType: 'reminders',
      entityId: userId,
      action: 'update',
      beforeJson: { reminders: before } as unknown as Record<string, unknown>,
      afterJson: { reminders: result } as unknown as Record<string, unknown>,
      requestId,
    });

    return result;
  }
}
