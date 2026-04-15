import client from './client';
import type { Recommendation, FeedbackRequest } from '../types';

export async function getRecommendations(checkinId: string): Promise<Recommendation[]> {
  const response = await client.get<Recommendation[]>(`/recommendations/checkin/${checkinId}`);
  return response.data;
}

export async function submitFeedback(
  recommendationId: string,
  data: FeedbackRequest
): Promise<Recommendation> {
  const response = await client.put<Recommendation>(
    `/recommendations/${recommendationId}/feedback`,
    data
  );
  return response.data;
}

export async function regenerateRecommendations(checkinId: string): Promise<Recommendation[]> {
  const response = await client.post<Recommendation[]>(
    `/recommendations/checkin/${checkinId}/regenerate`
  );
  return response.data;
}
