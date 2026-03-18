import { apiClient } from './client'
import type { PaginatedResponse } from '../types'

export interface StaffMember {
  id: number
  name: string
  email: string
  role: 'admin' | 'staff'
  created_at: string
}

export interface StaffStats extends StaffMember {
  customers_registered: number
  purchases_recorded: number
  revenue_recorded: string
  adjustments_recorded: number
  last_sale_at: string | null
}

export interface CreateStaffData {
  name: string
  email: string
  password: string
  role: 'admin' | 'staff'
}

export interface UpdateStaffData {
  name?: string
  email?: string
  password?: string
  role?: 'admin' | 'staff'
}

export async function list(params?: { search?: string; per_page?: number; page?: number }): Promise<PaginatedResponse<StaffMember>> {
  const response = await apiClient.get<PaginatedResponse<StaffMember>>('/staff', { params })
  return response.data
}

export async function getStats(): Promise<StaffStats[]> {
  const response = await apiClient.get<{ data: StaffStats[] }>('/staff/stats')
  return response.data.data
}

export async function create(data: CreateStaffData): Promise<StaffMember> {
  const response = await apiClient.post<{ data: StaffMember }>('/staff', data)
  return response.data.data
}

export async function update(id: number, data: UpdateStaffData): Promise<StaffMember> {
  const response = await apiClient.put<{ data: StaffMember }>(`/staff/${id}`, data)
  return response.data.data
}

export async function remove(id: number): Promise<void> {
  await apiClient.delete(`/staff/${id}`)
}
