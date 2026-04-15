import client from './client';
import type { Profile, CreateProfileRequest } from '../types';

export async function getProfile(): Promise<Profile> {
  const response = await client.get<Profile>('/profile');
  return response.data;
}

export async function createProfile(data: CreateProfileRequest): Promise<Profile> {
  const response = await client.post<Profile>('/profile', data);
  return response.data;
}

export async function updateProfile(data: Partial<CreateProfileRequest>): Promise<Profile> {
  const response = await client.put<Profile>('/profile', data);
  return response.data;
}
