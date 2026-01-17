'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User, getToken, getUser, removeTokens, saveTokens, saveUser, isAuthenticated } from '@/utils/auth'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const token = getToken()
    const storedUser = getUser()
    
    if (token && storedUser) {
      setUser(storedUser)
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
      username,
      password
    })
    
    saveTokens(response.data.tokens)
    saveUser(response.data.user)
    setUser(response.data.user)
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.access}`
  }

  const register = async (data: any) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register/`, data)
    
    saveTokens(response.data.tokens)
    saveUser(response.data.user)
    setUser(response.data.user)
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.access}`
  }

  const logout = () => {
    removeTokens()
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
    router.push('/login')
  }

  const refreshUser = async () => {
    try {
      const token = getToken()
      if (!token) return

      const response = await axios.get(`${API_BASE_URL}/auth/me/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      saveUser(response.data)
      setUser(response.data)
    } catch (error) {
      console.error('Error refreshing user:', error)
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
