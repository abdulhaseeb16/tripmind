// src/stores/chatStore.ts
import { create } from 'zustand';
import type { ChatMessage } from '../services/geminiService';

interface ChatState {
  messages: ChatMessage[];
  isGenerating: boolean;
  history: { id: string; name: string; preview: string }[];
  
  // Actions
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (content: string, isCard?: boolean, cardType?: any, cardData?: any) => void;
  setGenerating: (val: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    { role: 'assistant', content: `Hello! I've loaded your Travel DNA context. How can I help you plan your travel details today?` }
  ],
  isGenerating: false,
  history: [
    { id: '1', name: 'Kyoto autumn itinerary', preview: 'Explore bamboo trails...' },
    { id: '2', name: 'Morocco transport tips', preview: 'Salerno to Positano boat...' },
    { id: '3', name: 'Travel DNA profiling', preview: 'Solo culinary explorer...' }
  ],

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  
  updateLastMessage: (content, isCard, cardType, cardData) => set((state) => {
    const list = [...state.messages];
    if (list.length > 0) {
      list[list.length - 1] = {
        ...list[list.length - 1],
        content,
        isCard,
        cardType,
        cardData
      };
    }
    return { messages: list };
  }),

  setGenerating: (val) => set({ isGenerating: val }),
  
  clearMessages: () => set({
    messages: [
      { role: 'assistant', content: 'Context reset. How can I help you map coordinates today?' }
    ]
  }),
}));
