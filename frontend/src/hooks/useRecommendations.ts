import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeedbackRequest } from '../types';
import { submitFeedback, regenerateRecommendations } from '../api/recommendations';

export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FeedbackRequest }) => submitFeedback(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayPlan'] });
    },
  });
}

export function useRegenerateRecommendations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkinId: string) => regenerateRecommendations(checkinId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayPlan'] });
    },
  });
}
