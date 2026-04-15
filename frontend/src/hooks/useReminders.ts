import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ReminderConfig } from '../types';
import { getReminders, updateReminders, getTenants, getAdminUsers, getAdminStats } from '../api/reminders';

export function useReminders() {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: getReminders,
    retry: false,
  });
}

export function useUpdateReminders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ReminderConfig>) => updateReminders(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
    retry: false,
  });
}

export function useAdminUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['adminUsers', page, limit],
    queryFn: () => getAdminUsers({ page, limit }),
    retry: false,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
    retry: false,
  });
}
