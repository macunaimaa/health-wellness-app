import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeedbackRequest } from '../types';

export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FeedbackRequest }) => Promise.resolve({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayPlan'] });
    },
  });
}

export function useRegenerateRecommendations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkinId: string) => Promise.resolve({ checkinId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayPlan'] });
    },
  });
}
