import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) =>
        set({
          user: userData,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      syncToken: (token) =>
        set((state) => ({
          token,
          isAuthenticated: !!token,
          user: token ? state.user : null,
        })),
    }),
    {
      name: 'auth-storage'
    }
  )
)

// Keep authStore.token in sync when axiosInstance refreshes or clears the token
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'token') {
      useAuthStore.getState().syncToken(e.newValue);
    }
  });
}

export default useAuthStore