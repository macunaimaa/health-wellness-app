import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CheckinRequest } from '../types';
import { createCheckin, getTodayPlan, getCheckinHistory } from '../api/checkin';

export function useTodayPlan() {
  return useQuery({
    queryKey: ['todayPlan'],
    queryFn: getTodayPlan,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckinRequest) => createCheckin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayPlan'] });
      queryClient.invalidateQueries({ queryKey: ['checkinHistory'] });
    },
  });
}

export function useCheckinHistory(limit = 30) {
  return useQuery({
    queryKey: ['checkinHistory', limit],
    queryFn: () => getCheckinHistory({ limit }),
    retry: false,
  });
}
