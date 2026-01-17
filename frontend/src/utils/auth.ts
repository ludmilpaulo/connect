// Authentication utility functions

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  user_type: 'student' | 'teacher' | 'admin'
  phone?: string
  avatar?: string
  date_joined: string
  is_superuser?: boolean
}

export interface AuthTokens {
  access: string
  refresh: string
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh_token')
}

export const saveTokens = (tokens: AuthTokens) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('access_token', tokens.access)
  localStorage.setItem('refresh_token', tokens.refresh)
}

export const removeTokens = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

export const saveUser = (user: User) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(user))
}

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const isAuthenticated = (): boolean => {
  return getToken() !== null
}

export const isStudent = (): boolean => {
  const user = getUser()
  return user?.user_type === 'student'
}

export const isTeacher = (): boolean => {
  const user = getUser()
  return user?.user_type === 'teacher'
}

export const isAdmin = (): boolean => {
  const user = getUser()
  return user?.user_type === 'admin' || user?.is_superuser === true
}
