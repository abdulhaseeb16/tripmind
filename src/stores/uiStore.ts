// src/stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  useLiveAi: boolean;
  isOffline: boolean;
  
  // Actions
  toggleAiMode: () => void;
  setOfflineState: (val: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  useLiveAi: false, // Default to mock mode fallback
  isOffline: !navigator.onLine,

  toggleAiMode: () => set((state) => ({ useLiveAi: !state.useLiveAi })),
  setOfflineState: (val) => set({ isOffline: val }),
}));
