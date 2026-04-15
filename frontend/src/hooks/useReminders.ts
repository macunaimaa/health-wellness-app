import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ReminderConfig, Tenant } from '../types';
import { mockReminders, mockAdminStats } from '../mockData';

// DEMO MODE: Dados mockados para funcionar sem backend
const mockRemindersQuery = () =>
  new Promise<typeof mockReminders>((resolve) => {
    setTimeout(() => resolve(mockReminders), 200);
  });

const mockTenants: Tenant[] = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Demo Corp', slug: 'demo-corp' },
];

const mockTenantsQuery = () =>
  new Promise<typeof mockTenants>((resolve) => {
    setTimeout(() => resolve(mockTenants), 200);
  });

const mockAdminStatsQuery = () =>
  new Promise<typeof mockAdminStats>((resolve) => {
    setTimeout(() => resolve(mockAdminStats), 200);
  });

export function useReminders() {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: mockRemindersQuery,
    retry: false,
  });
}

export function useUpdateReminders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ReminderConfig>) => Promise.resolve(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: mockTenantsQuery,
    retry: false,
  });
}

export function useAdminUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['adminUsers', page, limit],
    queryFn: () => Promise.resolve({ data: [], total: 0, page, limit, totalPages: 0 }),
    retry: false,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: mockAdminStatsQuery,
    retry: false,
  });
}
