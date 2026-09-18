import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, convexMutation, setAuthToken } from '../api/client'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        try {
          const result = await convexMutation(api.auth.login, { email, password })
          setAuthToken(result.token)
          set({ user: result.user, token: result.token })
          return { ok: true, user: result.user }
        } catch (error) {
          return { ok: false, error: error.message || 'Invalid email or password.' }
        }
      },
      logout: () => {
        const token = get().token
        if (token) {
          convexMutation(api.auth.logout, { token }).catch(() => {})
        }
        setAuthToken(null)
        set({ user: null, token: null })
      },
      updateProfile: async (patch) => {
        const result = await convexMutation(api.auth.updateProfile, patch)
        set({ user: result.user })
        return result.user
      },
      updatePassword: async (payload) => {
        await convexMutation(api.auth.updatePassword, payload)
      },
    }),
    {
      name: 'stayhub-auth',
      onRehydrateStorage: () => (state) => {
        setAuthToken(state?.token || null)
      },
    },
  ),
)
