import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CheckinRequest, PlanResponse, Checkin } from '../types';
import { mockCheckin, mockRecommendations } from '../mockData';

// DEMO MODE: Dados mockados para funcionar sem backend
const mockPlanResponse: PlanResponse = {
  checkin: mockCheckin,
  recommendations: mockRecommendations,
};

const mockPlanQuery = () =>
  new Promise<PlanResponse>((resolve) => {
    setTimeout(() => resolve(mockPlanResponse), 300);
  });

const mockCreateCheckin = (data: CheckinRequest): Promise<Checkin> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...mockCheckin, ...data, id: crypto.randomUUID() });
    }, 300);
  });

const mockHistory: Checkin[] = [mockCheckin];

const mockHistoryQuery = (): Promise<Checkin[]> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(mockHistory), 200);
  });

export function useTodayPlan() {
  return useQuery({
    queryKey: ['todayPlan'],
    queryFn: mockPlanQuery,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mockCreateCheckin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayPlan'] });
      queryClient.invalidateQueries({ queryKey: ['checkinHistory'] });
    },
  });
}

export function useCheckinHistory(limit = 30) {
  return useQuery({
    queryKey: ['checkinHistory', limit],
    queryFn: mockHistoryQuery,
    retry: false,
  });
}
