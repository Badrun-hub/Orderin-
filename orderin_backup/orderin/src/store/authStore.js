import { create } from 'zustand'

// Store untuk autentikasi Kasir & Admin
export const useAuthStore = create((set) => ({
  user: null, // Contoh: { id: 'kas1', name: 'Althea', role: 'kasir' }
  
  login: (userData) => set({ user: userData }),
  logout: () => set({ user: null })
}))
