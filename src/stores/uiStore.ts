// src/stores/uiStore.ts
import { create } from 'zustand';

export interface UIState {
  useLiveAi: boolean;
  isMockMode: boolean; // computed alias — true when NOT using live AI
  isOffline: boolean;

  // Actions
  toggleAiMode: () => void;
  setOfflineState: (val: boolean) => void;
}

const hasApiKey = !!(
  import.meta.env.VITE_ZENMUX_API_KEY || 
  import.meta.env.VITE_GEMINI_API_KEY
);

export const useUIStore = create<UIState>((set) => ({
  useLiveAi: hasApiKey,
  isMockMode: !hasApiKey, // false = use live Gemini/ZenMux API, true = use mock
  isOffline: !navigator.onLine,

  toggleAiMode: () => set((state) => ({
    useLiveAi: !state.useLiveAi,
    isMockMode: state.useLiveAi, // flip together
  })),
  setOfflineState: (val) => set({ isOffline: val }),
}));
