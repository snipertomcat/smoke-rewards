import { apiClient } from './client'
import type { Statistics, TopCustomer, PurchaseTrend } from '../types'

export async function getSummary(): Promise<Statistics> {
  const response = await apiClient.get<{ data: Statistics }>('/statistics')
  return response.data.data
}

export async function getTopCustomers(limit = 10): Promise<TopCustomer[]> {
  const response = await apiClient.get<{ data: TopCustomer[] }>('/statistics/top-customers', {
    params: { limit },
  })
  return response.data.data
}

export async function getPurchaseTrend(months = 6): Promise<PurchaseTrend[]> {
  const response = await apiClient.get<{ data: PurchaseTrend[] }>('/statistics/purchase-trend', {
    params: { months },
  })
  return response.data.data
}
