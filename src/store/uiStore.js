import { create } from 'zustand'

export const useUiStore = create((set, get) => ({
  sidebarOpen: false,
  searchOpen: false,
  notificationsOpen: false,
  toasts: [],
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
  pushToast: (message, type = 'success') => {
    const id = `t_${Date.now()}`
    set({ toasts: [...get().toasts, { id, message, type }] })
    setTimeout(() => {
      set({ toasts: get().toasts.filter((toast) => toast.id !== id) })
    }, 4000)
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}))
