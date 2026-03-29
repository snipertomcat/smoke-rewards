import axios from 'axios'

const TOKEN_KEY = 'smoke_rewards_token'

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error.config?.url?.endsWith('/me')
    if (error.response?.status === 401 && !isAuthCheck) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const TOKEN_STORAGE_KEY = TOKEN_KEY
