// src/services/supabaseClient.ts

// Dynamic mock storage helper
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Define local high-fidelity state interfaces
export interface Profile {
  id: string;
  name: string;
  avatar: string;
  home_city: string;
  home_airport: string;
  travel_dna: string;
  preferred_currency: string;
  is_pro: boolean;
}

export interface Stop {
  id: string;
  name: string;
  time: string;
  duration: string;
  category: string; // food, culture, adventure, nature, logistics, etc.
  description: string;
  cost_estimate: number;
  google_maps_link: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  stops: Stop[];
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  group_type: string;
  interest_tags: string[];
  is_pro: boolean;
  status: 'upcoming' | 'past' | 'draft' | 'shared';
  cover_url: string;
  created_at: string;
  trip_summary?: string;
  notes?: string;
}

export interface PackingItem {
  id: string;
  trip_id: string;
  name: string;
  category: string;
  quantity: number;
  note?: string;
  tag: 'Essential' | 'Nice to have' | 'Optional';
  packed: boolean;
  weight?: number; // in grams
}

export interface Expense {
  id: string;
  trip_id: string;
  amount: number;
  category: string; // Flights, Accommodation, Food, Transport, Activities, Shopping, Emergency
  date: string;
  note?: string;
  receipt_url?: string;
}

export interface Memory {
  id: string;
  trip_id: string;
  photo_url: string;
  note: string;
  location: string;
  date: string;
  caption_suggestion?: string;
}

// In-Memory/LocalStorage database implementation
class MockDatabase {
  private getTrips(): Trip[] {
    return getStorageItem<Trip[]>('tripmind_trips', [
      {
        id: '1',
        user_id: 'user-123',
        title: 'Kyoto Autumn Vibe',
        destination: 'Kyoto, Japan',
        start_date: '2026-10-12',
        end_date: '2026-10-18',
        budget: 1500,
        currency: 'USD',
        group_type: 'Solo',
        interest_tags: ['food', 'culture', 'nature'],
        is_pro: false,
        status: 'upcoming',
        cover_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        created_at: new Date().toISOString(),
        trip_summary: 'A relaxing trip focused on autumn foliage, Buddhist temples, and authentic ramen/sushi culinary trails.'
      },
      {
        id: '2',
        user_id: 'user-123',
        title: 'Amalfi Coastal Route',
        destination: 'Amalfi Coast, Italy',
        start_date: '2026-05-01',
        end_date: '2026-05-08',
        budget: 3200,
        currency: 'EUR',
        group_type: 'Couple',
        interest_tags: ['culture', 'beaches', 'relaxation'],
        is_pro: true,
        status: 'past',
        cover_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
        created_at: new Date().toISOString(),
        trip_summary: 'Scenic exploration of Positano, Ravello, and Sorrento. Includes local lemon farms and private boat tours.'
      }
    ]);
  }

  private saveTrips(trips: Trip[]) {
    setStorageItem('tripmind_trips', trips);
  }

  private getItineraries(): ItineraryDay[] {
    return getStorageItem<ItineraryDay[]>('tripmind_itineraries', [
      {
        id: 'day-1',
        trip_id: '1',
        day_number: 1,
        date: '2026-10-12',
        stops: [
          {
            id: 'stop-1',
            name: 'Kinkaku-ji (Golden Pavilion)',
            time: '09:00',
            duration: '1.5 hrs',
            category: 'culture',
            description: 'Stunning Zen Buddhist temple covered in gold leaf. Reflections on the Kyoko-chi pond are mesmerizing in the morning light.',
            cost_estimate: 500,
            google_maps_link: 'https://maps.google.com/?q=Kinkaku-ji'
          },
          {
            id: 'stop-2',
            name: 'Nishiki Market Culinary Tour',
            time: '12:30',
            duration: '2 hrs',
            category: 'food',
            description: 'Taste local Kyoto specialities like baby octopus skewers, match ice cream, soy donuts, and fresh sashimi.',
            cost_estimate: 2500,
            google_maps_link: 'https://maps.google.com/?q=Nishiki+Market'
          },
          {
            id: 'stop-3',
            name: 'Gion District Evening Stroll',
            time: '18:00',
            duration: '2.5 hrs',
            category: 'culture',
            description: 'Walk through historic streets lined with wooden machiya houses. You might spot geiko or maiko on their way to appointments.',
            cost_estimate: 0,
            google_maps_link: 'https://maps.google.com/?q=Gion'
          }
        ]
      },
      {
        id: 'day-2',
        trip_id: '1',
        day_number: 2,
        date: '2026-10-13',
        stops: [
          {
            id: 'stop-4',
            name: 'Fushimi Inari-taisha Shrine',
            time: '07:00',
            duration: '3 hrs',
            category: 'nature',
            description: 'Early morning hike through thousands of vermilion torii gates up Mount Inari. Peaceful forest trail with stunning city views.',
            cost_estimate: 0,
            google_maps_link: 'https://maps.google.com/?q=Fushimi+Inari'
          },
          {
            id: 'stop-5',
            name: 'Tofu Kaiseki Lunch at Yudofu Sagano',
            time: '12:30',
            duration: '1.5 hrs',
            category: 'food',
            description: 'Exquisite multi-course Yudofu (boiled tofu) lunch set in a beautiful bamboo garden setting.',
            cost_estimate: 4000,
            google_maps_link: 'https://maps.google.com/?q=Yudofu+Sagano'
          }
        ]
      }
    ]);
  }

  private saveItineraries(itineraries: ItineraryDay[]) {
    setStorageItem('tripmind_itineraries', itineraries);
  }

  private getPackingItems(): PackingItem[] {
    return getStorageItem<PackingItem[]>('tripmind_packing', [
      { id: 'p1', trip_id: '1', name: 'Comfortable walking shoes', category: 'Clothing', quantity: 1, note: 'Trekking through temple stairs', tag: 'Essential', packed: true, weight: 600 },
      { id: 'p2', trip_id: '1', name: 'Japan Rail Pass / IC Card', category: 'Documents & Money', quantity: 1, note: 'Saved on phone wallet', tag: 'Essential', packed: true, weight: 10 },
      { id: 'p3', trip_id: '1', name: 'Camera & extra batteries', category: 'Electronics', quantity: 1, note: 'Foliage shots', tag: 'Nice to have', packed: false, weight: 800 },
      { id: 'p4', trip_id: '1', name: 'Light jacket/windbreaker', category: 'Clothing', quantity: 1, note: 'Kyoto gets cool in the evenings', tag: 'Essential', packed: false, weight: 400 },
      { id: 'p5', trip_id: '1', name: 'Travel power adapter', category: 'Electronics', quantity: 1, note: 'US to JP format (2-pin flat)', tag: 'Essential', packed: true, weight: 80 }
    ]);
  }

  private savePackingItems(items: PackingItem[]) {
    setStorageItem('tripmind_packing', items);
  }

  private getExpenses(): Expense[] {
    return getStorageItem<Expense[]>('tripmind_expenses', [
      { id: 'e1', trip_id: '1', amount: 80, category: 'Food', date: '2026-10-12', note: 'Sushi restaurant dinner' },
      { id: 'e2', trip_id: '1', amount: 35, category: 'Transport', date: '2026-10-12', note: 'IC Card Top-up' },
      { id: 'e3', trip_id: '1', amount: 450, category: 'Accommodation', date: '2026-10-11', note: 'Ryokan Deposit' },
      { id: 'e4', trip_id: '1', amount: 15, category: 'Activities', date: '2026-10-13', note: 'Temple Entry Tickets' }
    ]);
  }

  private saveExpenses(expenses: Expense[]) {
    setStorageItem('tripmind_expenses', expenses);
  }

  private getMemories(): Memory[] {
    return getStorageItem<Memory[]>('tripmind_memories', [
      {
        id: 'm1',
        trip_id: '1',
        photo_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        note: 'Stumbling upon Gion streets just as the sun set. Absolutely magical light.',
        location: 'Gion District, Kyoto',
        date: '2026-10-12',
        caption_suggestion: 'Golden hour wandering in old Kyoto ⛩️✨'
      }
    ]);
  }

  private saveMemories(memories: Memory[]) {
    setStorageItem('tripmind_memories', memories);
  }

  // PUBLIC APIs for Local Database
  public fetchTrips(): Trip[] {
    return this.getTrips();
  }

  public saveTrip(trip: Trip): Trip {
    const trips = this.getTrips();
    const existingIndex = trips.findIndex(t => t.id === trip.id);
    if (existingIndex > -1) {
      trips[existingIndex] = trip;
    } else {
      trips.unshift(trip);
    }
    this.saveTrips(trips);
    return trip;
  }

  public deleteTrip(tripId: string): void {
    const trips = this.getTrips().filter(t => t.id !== tripId);
    this.saveTrips(trips);
  }

  public fetchItinerary(tripId: string): ItineraryDay[] {
    return this.getItineraries().filter(it => it.trip_id === tripId).sort((a,b) => a.day_number - b.day_number);
  }

  public saveItineraryDays(tripId: string, days: ItineraryDay[]): void {
    let itineraries = this.getItineraries().filter(it => it.trip_id !== tripId);
    itineraries = [...itineraries, ...days];
    this.saveItineraries(itineraries);
  }

  public fetchPacking(tripId: string): PackingItem[] {
    return this.getPackingItems().filter(p => p.trip_id === tripId);
  }

  public savePacking(item: PackingItem): PackingItem {
    const items = this.getPackingItems();
    const idx = items.findIndex(p => p.id === item.id);
    if (idx > -1) {
      items[idx] = item;
    } else {
      items.push(item);
    }
    this.savePackingItems(items);
    return item;
  }

  public deletePacking(itemId: string): void {
    const items = this.getPackingItems().filter(p => p.id !== itemId);
    this.savePackingItems(items);
  }

  public fetchExpenses(tripId: string): Expense[] {
    return this.getExpenses().filter(e => e.trip_id === tripId);
  }

  public saveExpense(expense: Expense): Expense {
    const expenses = this.getExpenses();
    const idx = expenses.findIndex(e => e.id === expense.id);
    if (idx > -1) {
      expenses[idx] = expense;
    } else {
      expenses.push(expense);
    }
    this.saveExpenses(expenses);
    return expense;
  }

  public deleteExpense(expenseId: string): void {
    const expenses = this.getExpenses().filter(e => e.id !== expenseId);
    this.saveExpenses(expenses);
  }

  public fetchMemories(tripId: string): Memory[] {
    return this.getMemories().filter(m => m.trip_id === tripId);
  }

  public saveMemory(memory: Memory): Memory {
    const memories = this.getMemories();
    const idx = memories.findIndex(m => m.id === memory.id);
    if (idx > -1) {
      memories[idx] = memory;
    } else {
      memories.unshift(memory);
    }
    this.saveMemories(memories);
    return memory;
  }

  public deleteMemory(memoryId: string): void {
    const memories = this.getMemories().filter(m => m.id !== memoryId);
    this.saveMemories(memories);
  }
}

export const mockDb = new MockDatabase();

// Authentication State
export interface UserSession {
  user: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
      avatar: string;
      is_pro: boolean;
      travel_dna?: string;
      home_city?: string;
      home_airport?: string;
      preferred_currency?: string;
    };
  } | null;
}

class MockAuth {
  public getSession(): UserSession {
    const user = getStorageItem<any>('tripmind_user', {
      id: 'user-123',
      email: 'haseeb@tripmind.ai',
      user_metadata: {
        name: 'Haseeb',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Haseeb',
        is_pro: true,
        travel_dna: 'Solo cultural explorer focused on local culinary traditions, deep historical architecture, and scenic natural walks.',
        home_city: 'London',
        home_airport: 'LHR',
        preferred_currency: 'USD'
      }
    });
    return { user };
  }

  public updateMetadata(metadata: Partial<{
    name: string;
    avatar: string;
    is_pro: boolean;
    travel_dna?: string;
    home_city?: string;
    home_airport?: string;
    preferred_currency?: string;
  }>): void {
    const session = this.getSession();
    if (session.user) {
      session.user.user_metadata = {
        ...session.user.user_metadata,
        ...metadata
      };
      setStorageItem('tripmind_user', session.user);
    }
  }

  public logout(): void {
    localStorage.removeItem('tripmind_user');
  }

  public login(email: string, name: string): UserSession {
    const user = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email,
      user_metadata: {
        name,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
        is_pro: false,
        travel_dna: '',
        home_city: 'London',
        home_airport: 'LHR',
        preferred_currency: 'USD'
      }
    };
    setStorageItem('tripmind_user', user);
    return { user };
  }
}

export const mockAuth = new MockAuth();
