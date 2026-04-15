import axios from 'axios';
import { API_URL } from '../utils/constants';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

const authClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await authClient.post<AuthResponse>('/auth/login', data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await authClient.post<AuthResponse>('/auth/register', data);
  return response.data;
}

export async function getMe(): Promise<AuthResponse> {
  const token = localStorage.getItem('token');
  const response = await authClient.get<AuthResponse>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
