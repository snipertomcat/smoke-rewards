import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User } from '../types'
import * as authApi from '../api/auth'
import { TOKEN_STORAGE_KEY } from '../api/client'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  )
  const [isLoading, setIsLoading] = useState(true)

  const restoreSession = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!storedToken) {
      setIsLoading(false)
      return
    }
    try {
      const currentUser = await authApi.me()
      setUser(currentUser)
      setToken(storedToken)
    } catch {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
    setToken(response.token)
    setUser(response.user)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.me()
      setUser(currentUser)
    } catch {
      // silently ignore
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors - clear local state regardless
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      setToken(null)
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
