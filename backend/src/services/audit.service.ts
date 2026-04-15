import { AuditRepository } from '../repositories/audit.repository';

const auditRepo = new AuditRepository();

export class AuditService {
  static async log(data: {
    tenantId: string;
    userId?: string;
    entityType: string;
    entityId: string;
    action: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    requestId: string;
  }) {
    return auditRepo.create({
      tenantId: data.tenantId,
      userIdOptional: data.userId,
      entityType: data.entityType,
      entityId: data.entityId,
      action: data.action,
      beforeJson: data.before,
      afterJson: data.after,
      requestId: data.requestId,
    });
  }
}
