import { apiClient } from './client'
import type { Customer, PaginatedResponse } from '../types'

export interface CustomerListParams {
  search?: string
  per_page?: number
  page?: number
}

export interface CreateCustomerData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  rfid_uid?: string
}

export interface UpdateCustomerData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  rfid_uid?: string
}

export async function list(params?: CustomerListParams): Promise<PaginatedResponse<Customer>> {
  const response = await apiClient.get<PaginatedResponse<Customer>>('/customers', { params })
  return response.data
}

export async function get(id: number): Promise<Customer> {
  const response = await apiClient.get<{ data: Customer } | Customer>(`/customers/${id}`)
  const data = response.data
  if (data && typeof data === 'object' && 'data' in data && !('id' in data)) {
    return (data as { data: Customer }).data
  }
  return data as Customer
}

export async function create(data: CreateCustomerData): Promise<Customer> {
  const response = await apiClient.post<{ data: Customer } | Customer>('/customers', data)
  const result = response.data
  if (result && typeof result === 'object' && 'data' in result && !('id' in result)) {
    return (result as { data: Customer }).data
  }
  return result as Customer
}

export async function update(id: number, data: UpdateCustomerData): Promise<Customer> {
  const response = await apiClient.put<{ data: Customer } | Customer>(`/customers/${id}`, data)
  const result = response.data
  if (result && typeof result === 'object' && 'data' in result && !('id' in result)) {
    return (result as { data: Customer }).data
  }
  return result as Customer
}

export async function remove(id: number): Promise<void> {
  await apiClient.delete(`/customers/${id}`)
}

export async function lookupByRfid(uid: string): Promise<Customer> {
  const response = await apiClient.get<{ data: Customer } | Customer>(
    `/customers/lookup/${uid}`
  )
  const data = response.data
  if (data && typeof data === 'object' && 'data' in data && !('id' in data)) {
    return (data as { data: Customer }).data
  }
  return data as Customer
}
