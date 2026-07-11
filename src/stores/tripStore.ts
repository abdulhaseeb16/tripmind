// src/stores/tripStore.ts
import { create } from 'zustand';
import type { Trip, ItineraryDay, PackingItem, Expense, Memory } from '../types';

export interface TripState {
  trips: Trip[];
  activeTrip: Trip | null;
  packingItems: Record<string, PackingItem[]>;
  expenses: Record<string, Expense[]>;
  memories: Record<string, Memory[]>;
  loading: boolean;

  // Actions
  fetchTrips: () => void;
  setActiveTrip: (trip: Trip | null) => void;
  saveTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;
  saveItinerary: (tripId: string, itinerary: ItineraryDay[]) => void;

  // Packing Actions
  fetchPacking: (tripId: string) => PackingItem[];
  savePackingItem: (tripId: string, item: PackingItem) => void;
  addPackingItem: (tripId: string, item: Omit<PackingItem, 'quantity'> & { quantity?: number }) => void;
  deletePackingItem: (tripId: string, itemId: string) => void;

  // Itinerary Convenience
  addCustomStop: (tripId: string, dayIndex: number, stop: any) => void;

  // Expense Actions
  fetchExpenses: (tripId: string) => Expense[];
  saveExpense: (tripId: string, expense: Expense) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;

  // Memory Actions
  fetchMemories: (tripId: string) => Memory[];
  saveMemory: (tripId: string, memory: Memory) => void;
  deleteMemory: (tripId: string, memoryId: string) => void;
}

const TRIPS_KEY = 'tripmind_trips_data';
const PACKING_KEY = 'tripmind_packing_data';
const EXPENSES_KEY = 'tripmind_expenses_data';
const MEMORIES_KEY = 'tripmind_memories_data';

// Helper load/saves
const loadLocal = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const saveLocal = <T>(key: string, val: T): void => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const useTripStore = create<TripState>((set, get) => {
  // Setup default mock trip for instant demo
  const initialTrips = loadLocal<Trip[]>(TRIPS_KEY, [
    {
      id: '1',
      userId: 'user-123',
      user_id: 'user-123',
      title: 'Autumn Vibe in Kyoto',
      destination: 'Kyoto, Japan',
      destinations: ['Kyoto, Japan'],
      startDate: '2026-10-12',
      start_date: '2026-10-12',
      endDate: '2026-10-18',
      end_date: '2026-10-18',
      groupType: 'solo',
      group_type: 'solo',
      budget: { amount: 1500, currency: 'USD' },
      currency: 'USD',
      interests: ['food', 'culture', 'nature'],
      interest_tags: ['food', 'culture', 'nature'],
      status: 'upcoming',
      is_pro: true,
      created_at: '2026-07-11T12:00:00Z',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      cover_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      itinerary: [
        {
          dayNumber: 1,
          date: '2026-10-12',
          location: 'Kyoto',
          stops: [
            {
              id: 'stop-1',
              name: 'Kinkaku-ji (Golden Pavilion)',
              time: '09:00',
              durationMinutes: 90,
              category: 'culture',
              description: 'Stunning Zen Buddhist temple covered in gold leaf. Reflections on the Kyoko-chi pond are beautiful in the morning light.',
              estimatedCost: 500,
              mapsUrl: 'https://maps.google.com/?q=Kinkaku-ji'
            },
            {
              id: 'stop-2',
              name: 'Nishiki Market Culinary Tour',
              time: '12:30',
              durationMinutes: 120,
              category: 'food',
              description: 'Taste local Kyoto specialities like baby octopus skewers, match ice cream, and fresh sashimi.',
              estimatedCost: 2500,
              mapsUrl: 'https://maps.google.com/?q=Nishiki+Market'
            }
          ]
        }
      ]
    }
  ]);

  if (!localStorage.getItem(TRIPS_KEY)) {
    saveLocal(TRIPS_KEY, initialTrips);
  }

  const initialPacking = loadLocal<Record<string, PackingItem[]>>(PACKING_KEY, {
    '1': [
      { id: 'p1', name: 'Comfortable walking shoes', category: 'Clothing', quantity: 1, essential: 'essential', packed: true, reason: 'Lots of walking at shrines.' },
      { id: 'p2', name: 'Universal power plug adapter', category: 'Electronics', quantity: 1, essential: 'essential', packed: false, reason: 'Japan uses A/B flat plugs.' }
    ]
  });

  if (!localStorage.getItem(PACKING_KEY)) {
    saveLocal(PACKING_KEY, initialPacking);
  }

  const initialExpenses = loadLocal<Record<string, Expense[]>>(EXPENSES_KEY, {
    '1': [
      { id: 'e1', tripId: '1', amount: 80, currency: 'USD', category: 'Food', date: '2026-10-12', note: 'Dinner at Ryokan' },
      { id: 'e2', tripId: '1', amount: 20, currency: 'USD', category: 'Transport', date: '2026-10-12', note: 'Subway ticket pass' }
    ]
  });

  if (!localStorage.getItem(EXPENSES_KEY)) {
    saveLocal(EXPENSES_KEY, initialExpenses);
  }

  const initialMemories = loadLocal<Record<string, Memory[]>>(MEMORIES_KEY, {});

  return {
    trips: initialTrips,
    activeTrip: initialTrips[0] || null,
    packingItems: initialPacking,
    expenses: initialExpenses,
    memories: initialMemories,
    loading: false,

    fetchTrips: () => {
      const list = loadLocal<Trip[]>(TRIPS_KEY, []);
      set({ trips: list });
    },

    setActiveTrip: (trip) => {
      set({ activeTrip: trip });
    },

    saveTrip: (trip) => {
      const currentTrips = get().trips;
      const idx = currentTrips.findIndex(t => t.id === trip.id);
      let updated: Trip[];
      if (idx > -1) {
        updated = [...currentTrips];
        updated[idx] = trip;
      } else {
        updated = [trip, ...currentTrips];
      }
      saveLocal(TRIPS_KEY, updated);
      set({ trips: updated, activeTrip: trip });
    },

    deleteTrip: (tripId) => {
      const filtered = get().trips.filter(t => t.id !== tripId);
      saveLocal(TRIPS_KEY, filtered);
      set({ 
        trips: filtered, 
        activeTrip: get().activeTrip?.id === tripId ? (filtered[0] || null) : get().activeTrip 
      });
    },

    saveItinerary: (tripId, itinerary) => {
      const currentTrips = get().trips;
      const updated = currentTrips.map(t => {
        if (t.id === tripId) {
          return { ...t, itinerary };
        }
        return t;
      });
      saveLocal(TRIPS_KEY, updated);
      set({ 
        trips: updated, 
        activeTrip: get().activeTrip?.id === tripId ? { ...get().activeTrip!, itinerary } : get().activeTrip 
      });
    },

    fetchPacking: (tripId) => {
      return get().packingItems[tripId] || [];
    },

    savePackingItem: (tripId, item) => {
      const current = { ...get().packingItems };
      const items = current[tripId] ? [...current[tripId]] : [];
      const idx = items.findIndex(i => i.id === item.id);
      if (idx > -1) {
        items[idx] = item;
      } else {
        items.push(item);
      }
      current[tripId] = items;
      saveLocal(PACKING_KEY, current);
      set({ packingItems: current });
    },

    deletePackingItem: (tripId, itemId) => {
      const current = { ...get().packingItems };
      if (current[tripId]) {
        current[tripId] = current[tripId].filter(i => i.id !== itemId);
        saveLocal(PACKING_KEY, current);
        set({ packingItems: current });
      }
    },

    // Convenience alias used by PackingTab and PhotoAI
    addPackingItem: (tripId, item) => {
      const fullItem = { ...item, quantity: item.quantity ?? 1, packed: (item as any).packed ?? false } as PackingItem;
      const current = { ...get().packingItems };
      const items = current[tripId] ? [...current[tripId]] : [];
      items.push(fullItem);
      current[tripId] = items;
      saveLocal(PACKING_KEY, current);
      set({ packingItems: current });
    },

    // Convenience to push a stop into a specific day of the active trip
    addCustomStop: (tripId, dayIndex, stop) => {
      const state = get();
      const trip = state.trips.find(t => t.id === tripId);
      if (!trip || !trip.itinerary) return;
      const updatedItinerary = trip.itinerary.map((day, i) => {
        if (i === dayIndex) {
          return { ...day, stops: [...day.stops, stop] };
        }
        return day;
      });
      get().saveItinerary(tripId, updatedItinerary);
    },

    fetchExpenses: (tripId) => {
      return get().expenses[tripId] || [];
    },

    saveExpense: (tripId, expense) => {
      const current = { ...get().expenses };
      const items = current[tripId] ? [...current[tripId]] : [];
      const idx = items.findIndex(i => i.id === expense.id);
      if (idx > -1) {
        items[idx] = expense;
      } else {
        items.push(expense);
      }
      current[tripId] = items;
      saveLocal(EXPENSES_KEY, current);
      set({ expenses: current });
    },

    deleteExpense: (tripId, expenseId) => {
      const current = { ...get().expenses };
      if (current[tripId]) {
        current[tripId] = current[tripId].filter(e => e.id !== expenseId);
        saveLocal(EXPENSES_KEY, current);
        set({ expenses: current });
      }
    },

    fetchMemories: (tripId) => {
      return get().memories[tripId] || [];
    },

    saveMemory: (tripId, memory) => {
      const current = { ...get().memories };
      const items = current[tripId] ? [...current[tripId]] : [];
      const idx = items.findIndex(i => i.id === memory.id);
      if (idx > -1) {
        items[idx] = memory;
      } else {
        items.unshift(memory);
      }
      current[tripId] = items;
      saveLocal(MEMORIES_KEY, current);
      set({ memories: current });
    },

    deleteMemory: (tripId, memoryId) => {
      const current = { ...get().memories };
      if (current[tripId]) {
        current[tripId] = current[tripId].filter(m => m.id !== memoryId);
        saveLocal(MEMORIES_KEY, current);
        set({ memories: current });
      }
    }
  };
});
