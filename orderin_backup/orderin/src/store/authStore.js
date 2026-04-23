import { create } from 'zustand'

// Store untuk autentikasi Kasir & Admin (JWT-based)
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('orderin-user') || 'null'),
  
  login: (userData, token) => {
    localStorage.setItem('orderin-token', token)
    localStorage.setItem('orderin-user', JSON.stringify(userData))
    set({ user: userData })
  },

  logout: () => {
    localStorage.removeItem('orderin-token')
    localStorage.removeItem('orderin-user')
    set({ user: null })
  },

  getToken: () => localStorage.getItem('orderin-token')
}))
