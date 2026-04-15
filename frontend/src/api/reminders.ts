import client from './client';
import type { ReminderConfig, Tenant, PaginatedResponse, User, AdminStats } from '../types';

export async function getReminders(): Promise<ReminderConfig> {
  const response = await client.get<ReminderConfig>('/reminders');
  return response.data;
}

export async function updateReminders(data: Partial<ReminderConfig>): Promise<ReminderConfig> {
  const response = await client.put<ReminderConfig>('/reminders', data);
  return response.data;
}

export async function getTenants(): Promise<Tenant[]> {
  const response = await client.get<Tenant[]>('/tenants');
  return response.data;
}

export async function getAdminUsers(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<User>> {
  const response = await client.get<PaginatedResponse<User>>('/admin/users', { params });
  return response.data;
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await client.get<AdminStats>('/admin/stats');
  return response.data;
}
