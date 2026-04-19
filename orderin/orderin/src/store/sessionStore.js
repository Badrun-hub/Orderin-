import { create } from 'zustand'

export const useSessionStore = create((set) => ({
  session: null,
  currentOrderId: null, // Track the active order ID for the customer
  setSession: (sessionData) => set({ session: sessionData }),
  setOrderId: (id) => set({ currentOrderId: id }),
  clearSession: () => set({ session: null, currentOrderId: null })
}))
