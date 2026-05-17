import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  isInitialized: boolean;
}

interface AppActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setInitialized: (val: boolean) => void;
}

export type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set) => ({
    // Initial State
    theme: 'system',
    sidebarOpen: true,
    isInitialized: false,

    // Actions
    setTheme: (theme) => set({ theme }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setInitialized: (isInitialized) => set({ isInitialized }),
  }))
);
