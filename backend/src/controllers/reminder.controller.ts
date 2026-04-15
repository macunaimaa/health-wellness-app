import { Response, NextFunction } from 'express';
import { ReminderService } from '../services/reminder.service';
import { AuthenticatedRequest } from '../models/types';

const reminderService = new ReminderService();

export class ReminderController {
  async getReminders(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const rows = await reminderService.getReminders(req.user!.userId, req.user!.tenantId);
    const config: Record<string, boolean> = {
      hydration: false,
      movement: false,
      meal: false,
      recovery: false,
      workout: false,
    };
    for (const row of rows) {
      const key = row.reminder_type as string;
      if (key in config) {
        config[key] = row.active;
      }
    }
    res.json(config);
  }

  async updateReminders(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const body = req.body;
    const types = ['hydration', 'movement', 'meal', 'recovery', 'workout'];
    const reminders = types.map(type => ({
      reminderType: type,
      scheduleJson: { times: ['09:00'] },
      active: !!body[type],
    }));

    await reminderService.updateReminders(
      req.user!.userId,
      req.user!.tenantId,
      reminders,
      req.requestId!,
    );

    const config: Record<string, boolean> = {};
    for (const r of reminders) {
      config[r.reminderType] = r.active;
    }
    res.json(config);
  }
}
