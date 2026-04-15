import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateProfileRequest, Profile } from '../types';
import { mockProfile } from '../mockData';

// DEMO MODE: Dados mockados para funcionar sem backend
const mockProfileQuery = (): Promise<Profile> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(mockProfile), 200);
  });

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: mockProfileQuery,
    retry: false,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfileRequest) => Promise.resolve(mockProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateProfileRequest>) => Promise.resolve({ ...mockProfile, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
