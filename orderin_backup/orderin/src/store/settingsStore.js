import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const themePresets = {
  emerald: {
    primary: '#4edea3',
    primaryContainer: '#10b981',
    secondary: '#68dba9',
    name: 'Emerald (Default)'
  },
  ruby: {
    primary: '#ff897d',
    primaryContainer: '#e11d48',
    secondary: '#ffb4ab',
    name: 'Ruby Red'
  },
  sapphire: {
    primary: '#82b1ff',
    primaryContainer: '#2563eb',
    secondary: '#abc7ff',
    name: 'Sapphire Blue'
  },
  amber: {
    primary: '#ffd833',
    primaryContainer: '#d97706',
    secondary: '#ffe264',
    name: 'Amber Gold'
  }
}

export const useSettingsStore = create(
  persist(
    (set) => ({
      cafeName: 'Orderin',
      cafeLogo: null,
      themeId: 'emerald',
      themeMode: 'dark',
      updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings }))
    }),
    {
      name: 'orderin-settings',
    }
  )
)
