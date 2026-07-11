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

export const useUIStore = create<UIState>((set) => ({
  useLiveAi: false,
  isMockMode: true, // true = use mock, false = use live Gemini proxy
  isOffline: !navigator.onLine,

  toggleAiMode: () => set((state) => ({
    useLiveAi: !state.useLiveAi,
    isMockMode: state.useLiveAi, // flip together
  })),
  setOfflineState: (val) => set({ isOffline: val }),
}));
