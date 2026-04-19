import { create } from 'zustand'

export const useCartStore = create((set) => ({
  cart: [],
  addToCart: (item) => set((state) => {
    const existing = state.cart.find(i => i.id === item.id)
    if (existing) {
      return { cart: state.cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) }
    }
    return { cart: [...state.cart, { ...item, qty: 1 }] }
  }),
  updateQty: (itemId, qty) => set((state) => ({
    cart: state.cart.map(i => i.id === itemId ? { ...i, qty } : i)
  })),
  removeFromCart: (itemId) => set((state) => ({
    cart: state.cart.filter(i => i.id !== itemId)
  })),
  clearCart: () => set({ cart: [] })
}))
