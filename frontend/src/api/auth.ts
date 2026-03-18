import { apiClient } from './client'
import type { User } from '../types'

export interface LoginResponse {
  user: User
  token: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/login', { email, password })
  return response.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/logout')
}

export async function me(): Promise<User> {
  const response = await apiClient.get<{ data: User } | User>('/me')
  // Handle both wrapped and unwrapped responses
  const data = response.data
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as { data: User }).data
  }
  return data as User
}
