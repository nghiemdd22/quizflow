import { create } from 'zustand'

interface AuthState {
  accessToken: string | null
  userEmail: string
  userFullName: string
  userRole: string | null
  userId: number | null
  isLoggedIn: boolean
  setAuth: (token: string, email: string, fullName: string, role: string, id: number) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userEmail: '',
  userFullName: '',
  userRole: null,
  userId: null,
  isLoggedIn: false,
  setAuth: (token, email, fullName, role, id) => set({
    accessToken: token,
    userEmail: email,
    userFullName: fullName,
    userRole: role,
    userId: id,
    isLoggedIn: true
  }),
  clearAuth: () => set({
    accessToken: null,
    userEmail: '',
    userFullName: '',
    userRole: null,
    userId: null,
    isLoggedIn: false
  })
}))
