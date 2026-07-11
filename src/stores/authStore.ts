// src/stores/authStore.ts
import { create } from 'zustand';
import type { UserProfile } from '../types';

interface AuthState {
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const STORAGE_KEY = 'tripmind_user_profile';

export const useAuthStore = create<AuthState>((set) => {
  // Load profile from localStorage initially
  const stored = localStorage.getItem(STORAGE_KEY);
  const initialProfile = stored ? JSON.parse(stored) : {
    id: 'user-123',
    name: 'Haseeb',
    homeCity: 'London',
    homeAirport: 'LHR',
    preferredCurrency: 'USD',
    travelDNA: 'Solo cultural explorer focused on local culinary traditions, deep historical architecture, and scenic natural walks.',
    styleTags: ['solo', 'culture', 'food'],
    isPro: true,
  };

  if (!stored && initialProfile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProfile));
  }

  return {
    profile: initialProfile,
    loading: false,
    login: (email, name) => {
      console.log("User email logged in:", email);
      const newProfile: UserProfile = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name,
        homeCity: 'London',
        homeAirport: 'LHR',
        preferredCurrency: 'USD',
        travelDNA: '',
        styleTags: [],
        isPro: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      set({ profile: newProfile });
    },
    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({ profile: null });
    },
    updateProfile: (updates) => {
      set((state) => {
        if (!state.profile) return state;
        const newProfile = { ...state.profile, ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
        return { profile: newProfile };
      });
    },
  };
});
