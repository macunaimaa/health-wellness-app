import client from './client';
import type { CheckinRequest, Checkin, PlanResponse } from '../types';

export async function createCheckin(data: CheckinRequest): Promise<Checkin> {
  const response = await client.post<Checkin>('/checkins', data);
  return response.data;
}

export async function getTodayPlan(): Promise<PlanResponse> {
  const response = await client.get<PlanResponse>('/checkins/today/plan');
  return response.data;
}

export async function getCheckinHistory(params?: {
  page?: number;
  limit?: number;
}): Promise<Checkin[]> {
  const response = await client.get<Checkin[]>('/checkins', { params });
  return response.data;
}
