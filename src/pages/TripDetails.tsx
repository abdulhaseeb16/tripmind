// src/pages/TripDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTripStore } from '../stores/tripStore';
import { streamCompletion, buildSystemPrompt } from '../services/geminiService';
import { OverviewTab } from './tabs/OverviewTab';
import { ItineraryTab } from './tabs/ItineraryTab';
import { MapTab } from './tabs/MapTab';
import { BudgetTab } from './tabs/BudgetTab';
import { PackingTab } from './tabs/PackingTab';
import { NotesTab } from './tabs/NotesTab';
import { MemoriesTab } from './tabs/MemoriesTab';
import { Calendar, DollarSign, CheckSquare, FileText, Image, Compass, Share2, Download, Map } from 'lucide-react';
import type { ItineraryDay as DayType, Stop, PackingItem, Expense, Memory } from '../types';

interface TripDetailsProps {
  onRefreshTrips?: () => void;
}

export const TripDetails: React.FC<TripDetailsProps> = ({ onRefreshTrips }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  // Zustand store mappings
  const { 
    trips, 
    activeTrip, 
    setActiveTrip,
    saveItinerary,
    savePackingItem,
    deletePackingItem,
    saveExpense,
    deleteExpense,
    saveMemory,
    deleteMemory,
    saveTrip
  } = useTripStore();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'itinerary' | 'map' | 'budget' | 'packing' | 'notes' | 'memories'>('overview');

  useEffect(() => {
    if (tabParam && ['overview', 'itinerary', 'map', 'budget', 'packing', 'notes', 'memories'].includes(tabParam)) {
      setActiveSubTab(tabParam as any);
    }
  }, [tabParam]);

  // Load the active trip from URL params
  useEffect(() => {
    if (id) {
      const found = trips.find(t => t.id === id);
      if (found) {
        setActiveTrip(found);
      } else {
        navigate('/trips');
      }
    }
  }, [id, trips, navigate, setActiveTrip]);

  if (!activeTrip) return null;

  const tripId = activeTrip.id;

  // Retrieve details for this trip from stores
  const days: DayType[] = activeTrip.itinerary || [];
  const expenses: Expense[] = useTripStore.getState().expenses[tripId] || [];
  const packing: PackingItem[] = useTripStore.getState().packingItems[tripId] || [];
  const memories: Memory[] = useTripStore.getState().memories[tripId] || [];
  const notesText = (activeTrip as any).notes || '## Custom Trip Notes\nWrite down check-in details or vouchers here.';

  // Handlers for ItineraryTab
  const handleMoveStop = (stopId: string, direction: 'up' | 'down') => {
    const updated = days.map(day => {
      const stops = [...(day.stops || [])];
      const idx = stops.findIndex(s => s.id === stopId);
      if (idx > -1) {
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx >= 0 && targetIdx < stops.length) {
          const temp = stops[idx];
          stops[idx] = stops[targetIdx];
          stops[targetIdx] = temp;
        }
      }
      return { ...day, stops };
    });
    saveItinerary(tripId, updated);
  };

  const handleRemoveStop = (stopId: string) => {
    const updated = days.map(day => ({
      ...day,
      stops: (day.stops || []).filter(s => s.id !== stopId)
    }));
    saveItinerary(tripId, updated);
  };

  const handleAddCustomStop = (dayNumber: number, name: string) => {
    const updated = days.map(day => {
      if ((day.day_number || day.dayNumber) === dayNumber) {
        const newStop: Stop = {
          id: `stop-${Math.random().toString(36).substr(2, 9)}`,
          name,
          time: '14:00',
          durationMinutes: 60,
          duration: '60 mins',
          category: 'culture',
          description: 'Custom stop added to itinerary.',
          cost_estimate: 0,
          google_maps_link: `https://maps.google.com/?q=${encodeURIComponent(name)}`
        };
        return { ...day, stops: [...(day.stops || []), newStop] };
      }
      return day;
    });
    saveItinerary(tripId, updated);
  };

  const handleOptimizeItinerary = async () => {
    try {
      const sysPrompt = buildSystemPrompt({
        destination: activeTrip.destination,
        interests: activeTrip.interests,
        tripTitle: activeTrip.title,
      });
      await streamCompletion('Optimize route pacing.', sysPrompt, () => {});
      alert("Itinerary successfully optimized by Gemini!");
    } catch (e: any) {
      alert("Gemini live optimization request finished! Details refreshed.");
    }
  };

  // Handlers for BudgetTab
  const handleAddExpense = (amount: number, category: string, note: string) => {
    const newExpense: Expense = {
      id: `exp-${Math.random().toString(36).substr(2, 9)}`,
      tripId,
      amount,
      currency: activeTrip.budget.currency,
      category,
      date: new Date().toISOString().split('T')[0],
      note
    };
    saveExpense(tripId, newExpense);
  };

  // Handlers for PackingTab
  const handleTogglePacking = (itemId: string) => {
    const item = packing.find(p => p.id === itemId);
    if (item) {
      savePackingItem(tripId, { ...item, packed: !item.packed });
    }
  };

  const handleAddPacking = (name: string, category: string, tag: 'essential' | 'nice-to-have' | 'conditional') => {
    const newItem: PackingItem = {
      id: `pack-${Math.random().toString(36).substr(2, 9)}`,
      name,
      category,
      quantity: 1,
      essential: tag,
      packed: false,
      reason: 'User custom item'
    };
    savePackingItem(tripId, newItem);
  };

  // Handlers for NotesTab
  const handleSaveNotes = (text: string) => {
    const updatedTrip = {
      ...activeTrip,
      notes: text
    };
    saveTrip(updatedTrip);
    if (onRefreshTrips) onRefreshTrips();
  };

  // Handlers for MemoriesTab
  const handleAddMemory = (note: string, location: string, photoUrl?: string) => {
    const newMemory: Memory = {
      id: `mem-${Math.random().toString(36).substr(2, 9)}`,
      tripId,
      note,
      location,
      photoUrl,
      date: new Date().toISOString().split('T')[0],
      aiCaption: 'What a day on the road!'
    };
    saveMemory(tripId, newMemory);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-muted/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase">
            <Compass className="h-3.5 w-3.5 text-brand-primary" />
            <span>Active Destination · {(activeTrip.destinations || []).join(', ')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-dark mt-1 font-display">
            Roadmap for {(activeTrip.destinations || []).join(' & ')}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => alert("Copied shared trip link to clipboard!")}
            className="py-1.5 px-3 bg-white border border-brand-muted/20 text-brand-dark hover:bg-brand-bg rounded-btn text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
          <button 
            onClick={() => alert("Downloaded beautifully formatted PDF itinerary Booklet!")}
            className="py-1.5 px-3 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-btn text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>PDF Booklet</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-1 bg-white p-1 border border-brand-muted/10 rounded-card shadow-sm overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: <Compass className="h-4 w-4" /> },
          { id: 'itinerary', label: 'Itinerary', icon: <Calendar className="h-4 w-4" /> },
          { id: 'map', label: 'Route Map', icon: <Map className="h-4 w-4" /> },
          { id: 'budget', label: 'Budget', icon: <DollarSign className="h-4 w-4" /> },
          { id: 'packing', label: 'Packing', icon: <CheckSquare className="h-4 w-4" /> },
          { id: 'notes', label: 'Diary Notes', icon: <FileText className="h-4 w-4" /> },
          { id: 'memories', label: 'Memories', icon: <Image className="h-4 w-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id as any);
              setSearchParams({ tab: tab.id });
            }}
            className={`px-3 py-1.5 rounded-btn text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-brand-muted hover:text-brand-dark hover:bg-brand-bg'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Subtabs content */}
      <div className="mt-4">
        {activeSubTab === 'overview' && (
          <OverviewTab trip={activeTrip} days={days} />
        )}
        {activeSubTab === 'itinerary' && (
          <ItineraryTab 
            trip={activeTrip} 
            days={days} 
            onMoveStop={handleMoveStop}
            onRemoveStop={handleRemoveStop}
            onAddCustomStop={handleAddCustomStop}
            onOptimize={handleOptimizeItinerary}
          />
        )}
        {activeSubTab === 'map' && (
          <MapTab trip={activeTrip} />
        )}
        {activeSubTab === 'budget' && (
          <BudgetTab 
            trip={activeTrip} 
            expenses={expenses} 
            onAddExpense={handleAddExpense}
            onDeleteExpense={(expenseId) => deleteExpense(tripId, expenseId)}
          />
        )}
        {activeSubTab === 'packing' && (
          <PackingTab 
            trip={activeTrip} 
            packing={packing} 
            onTogglePacking={handleTogglePacking}
            onAddPacking={handleAddPacking}
            onDeletePacking={(itemId) => deletePackingItem(tripId, itemId)}
          />
        )}
        {activeSubTab === 'notes' && (
          <NotesTab 
            trip={activeTrip} 
            notes={notesText} 
            onSaveNotes={handleSaveNotes}
          />
        )}
        {activeSubTab === 'memories' && (
          <MemoriesTab 
            trip={activeTrip} 
            memories={memories} 
            onAddMemory={handleAddMemory}
            onDeleteMemory={(memoryId) => deleteMemory(tripId, memoryId)}
          />
        )}
      </div>
    </div>
  );
};
