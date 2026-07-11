// src/pages/MyTrips.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRight, RefreshCw } from 'lucide-react';
import { useTripStore } from '../stores/tripStore';
import type { Trip, ItineraryDay } from '../types';
import { generateItinerary, generatePackingList } from '../services/geminiService';
import { TripCard } from '../components/TripCard';

interface MyTripsProps {
  trips: Trip[];
  onRefreshTrips: () => void;
  onSelectTrip: (tripId: string) => void;
}

export const MyTrips: React.FC<MyTripsProps> = ({ trips, onRefreshTrips, onSelectTrip }) => {
  const navigate = useNavigate();
  const storeSaveTrip = useTripStore(state => state.saveTrip);
  const storeSaveItinerary = useTripStore(state => state.saveItinerary);
  const storeSavePacking = useTripStore(state => state.savePackingItem);
  const storeDeleteTrip = useTripStore(state => state.deleteTrip);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'draft' | 'shared' | 'all'>('all');
  const [searchVal, setSearchVal] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  // New Trip Creation state
  const [wizardStep, setWizardStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [triviaFact, setTriviaFact] = useState('');
  const [newTripData, setNewTripData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    type: 'Solo',
    budget: 1200,
    currency: 'USD',
    interests: [] as string[],
    aiDraft: true
  });

  const travelTrivia = [
    "Gemini is plotting local restaurants based on your custom Travel DNA...",
    "Open-Meteo is retrieving historical seasonal averages for travel dates...",
    "Sourcing scenic walking routes and cultural heritage highlights...",
    "Allocating default category budgets from our digital travel database..."
  ];

  const handleInterestSelect = (tag: string) => {
    setNewTripData(prev => {
      const interests = prev.interests.includes(tag)
        ? prev.interests.filter(t => t !== tag)
        : [...prev.interests, tag];
      return { ...prev, interests };
    });
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    // Pick random fact for build screen
    setTriviaFact(travelTrivia[Math.floor(Math.random() * travelTrivia.length)]);

    // Simulate itinerary builder via Gemini
    const tripId = `trip-${Math.random().toString(36).substr(2, 9)}`;
    const coverUrl = newTripData.destination.toLowerCase().includes('tokyo') || newTripData.destination.toLowerCase().includes('japan')
      ? 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80';

    const newTrip: Trip = {
      id: tripId,
      user_id: 'user-123',
      userId: 'user-123',
      title: newTripData.title || `Vibe in ${newTripData.destination}`,
      destination: newTripData.destination,
      destinations: [newTripData.destination],
      start_date: newTripData.startDate || new Date().toISOString().split('T')[0],
      startDate: newTripData.startDate || new Date().toISOString().split('T')[0],
      end_date: newTripData.endDate || new Date().toISOString().split('T')[0],
      endDate: newTripData.endDate || new Date().toISOString().split('T')[0],
      budget: { amount: newTripData.budget, currency: newTripData.currency },
      currency: newTripData.currency,
      group_type: newTripData.type,
      groupType: newTripData.type.toLowerCase() as any,
      interest_tags: newTripData.interests.length > 0 ? newTripData.interests : ['culture'],
      interests: newTripData.interests.length > 0 ? newTripData.interests : ['culture'],
      is_pro: false,
      status: 'upcoming',
      cover_url: coverUrl,
      coverPhotoUrl: coverUrl,
      created_at: new Date().toISOString(),
      trip_summary: `Custom designed ${newTripData.type.toLowerCase()} trip. Focuses on ${newTripData.interests.join(', ')}.`
    };

    try {
      // 1. Save trip
      storeSaveTrip(newTrip);

      // 2. Generate itinerary draft if enabled
      if (newTripData.aiDraft) {
        const daysCount = Math.max(1, Math.ceil(
          (new Date(newTrip.end_date || '').getTime() - new Date(newTrip.start_date || '').getTime()) / (1000 * 60 * 60 * 24)
        ) + 1);

        const generatedDays = await generateItinerary(
          newTrip.destination || '',
          daysCount,
          newTrip.interest_tags || [],
          newTrip.budget.amount
        );

        // Map trip_id correctly
        const formattedDays: ItineraryDay[] = generatedDays.map((day: any) => ({
          ...day,
          trip_id: tripId
        }));
        
        storeSaveItinerary(tripId, formattedDays);

        // Generate default packing list
        const packingItems = await generatePackingList(
          newTrip.destination || '',
          daysCount,
          newTrip.interest_tags || []
        );
        packingItems.forEach((item: any) => {
          storeSavePacking(tripId, {
            id: `pack-${Math.random().toString(36).substr(2, 9)}`,
            trip_id: tripId,
            name: item.name || '',
            category: item.category || 'Clothing',
            quantity: item.quantity || 1,
            essential: item.tag === 'Essential' ? 'essential' : 'nice-to-have',
            packed: false,
            reason: item.note || ''
          });
        });
      }

      onRefreshTrips();
      onSelectTrip(tripId);
      navigate(`/trips/${tripId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
      setShowWizard(false);
      setWizardStep(1);
    }
  };

  // Filter and Search logic
  const filteredTrips = trips.filter(t => {
    const matchesSearch = (t.title || '').toLowerCase().includes(searchVal.toLowerCase()) || 
                          (t.destination || '').toLowerCase().includes(searchVal.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return t.status === filter && matchesSearch;
  });

  const handleDeleteTrip = (id: string) => {
    storeDeleteTrip(id);
    onRefreshTrips();
  };

  return (
    <div className="space-y-6">
      {/* Wizard loading screen */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-brand-bg flex flex-col items-center justify-center p-6 space-y-4">
          <RefreshCw className="h-10 w-10 text-brand-accent animate-spin" />
          <div className="text-center">
            <h3 className="text-xl font-extrabold text-brand-dark font-display">Building your trip...</h3>
            <p className="text-xs text-brand-muted mt-1">Gemini AI is structuring your coordinates</p>
          </div>
          <div className="p-4 bg-white border border-brand-muted/10 rounded-card max-w-sm shadow-md mt-6">
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest block mb-1">🗺️ Trip Generator Progress</span>
            <p className="text-xs text-brand-dark leading-relaxed italic">
              "{triviaFact}"
            </p>
          </div>
        </div>
      )}

      {/* Main List view */}
      {!showWizard && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-brand-dark font-display">My Trip Portfolio</h2>
              <p className="text-xs sm:text-sm text-brand-muted mt-0.5">Explore active itineraries, travel templates, and archives.</p>
            </div>
            <button 
              onClick={() => setShowWizard(true)}
              className="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-btn text-xs shadow flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Trip</span>
            </button>
          </div>

          {/* Filtering bar Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-brand-muted/10 rounded-card shadow-sm">
            <div className="flex bg-brand-bg rounded-btn px-2.5 py-1.5 border border-brand-muted/15 w-full sm:w-64 focus-within:border-brand-primary transition-all">
              <Search className="h-4 w-4 text-brand-muted flex-shrink-0 mr-2 mt-0.5" />
              <input 
                type="text" 
                placeholder="Search trip title or city..." 
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-transparent text-xs text-brand-dark focus:outline-none w-full font-medium"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'past', label: 'Past' },
                { id: 'draft', label: 'Draft' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setFilter(opt.id as any)}
                  className={`px-3 py-1.5 rounded-btn text-[11px] font-bold border transition-all ${
                    filter === opt.id 
                      ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' 
                      : 'bg-transparent border-transparent text-brand-muted hover:text-brand-dark hover:bg-brand-bg'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trips Display Grid */}
          {filteredTrips.length === 0 ? (
            <div className="py-16 text-center bg-white border border-brand-muted/10 rounded-card shadow-sm space-y-3">
              <span className="text-4xl">🗺️</span>
              <div>
                <h4 className="font-bold text-sm text-brand-dark">No trips found matching filter</h4>
                <p className="text-xs text-brand-muted mt-0.5">Start a new draft itinerary with the builder wizard.</p>
              </div>
              <button 
                onClick={() => setShowWizard(true)}
                className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/95 text-white font-bold rounded-btn text-xs mt-2"
              >
                Launch Creator Wizard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map(trip => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  onSelect={(id) => {
                    onSelectTrip(trip.id);
                    navigate(`/trips/${id}`);
                  }}
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step by Step Creator Wizard Modal Card */}
      {showWizard && (
        <div className="max-w-xl mx-auto bg-white border border-brand-muted/10 rounded-card p-6 sm:p-8 shadow-lg space-y-6 animate-fade-in">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-brand-muted uppercase">
              <span>Trip Creator Wizard</span>
              <span>Step {wizardStep} of 5</span>
            </div>
            <div className="w-full bg-brand-bg h-1 rounded-full overflow-hidden mt-1 mb-6">
              <div 
                className="bg-brand-primary h-full transition-all duration-300"
                style={{ width: `${wizardStep * 20}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleCreateTrip} className="space-y-4">
            {/* Step 1: Destination & Title */}
            {wizardStep === 1 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-brand-dark font-display">Where are you heading?</h3>
                <div>
                  <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Destination City/Region</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Kyoto, Japan or Amalfi Coast, Italy"
                    value={newTripData.destination}
                    onChange={(e) => setNewTripData(prev => ({ ...prev, destination: e.target.value, title: `${e.target.value} Exploration` }))}
                    className="w-full bg-brand-bg px-3 py-2 text-xs font-medium border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Trip Name/Title</label>
                  <input 
                    type="text" 
                    required
                    value={newTripData.title}
                    onChange={(e) => setNewTripData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-brand-bg px-3 py-2 text-xs font-medium border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Dates */}
            {wizardStep === 2 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-brand-dark font-display">When are you traveling?</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Start Date</label>
                    <input 
                      type="date" 
                      required
                      value={newTripData.startDate}
                      onChange={(e) => setNewTripData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full bg-brand-bg px-3 py-2 text-xs font-medium border border-brand-muted/20 rounded-btn focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">End Date</label>
                    <input 
                      type="date" 
                      required
                      value={newTripData.endDate}
                      onChange={(e) => setNewTripData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full bg-brand-bg px-3 py-2 text-xs font-medium border border-brand-muted/20 rounded-btn focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Trip Type */}
            {wizardStep === 3 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-brand-dark font-display">What is the group style?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Solo', 'Couple', 'Family', 'Group'].map(opt => (
                    <button 
                      key={opt}
                      type="button"
                      onClick={() => setNewTripData(prev => ({ ...prev, type: opt }))}
                      className={`p-4 border rounded-card text-left transition-all ${
                        newTripData.type === opt 
                          ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-bold' 
                          : 'border-brand-muted/20 hover:border-brand-muted/40 text-brand-dark'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Budget & Currency */}
            {wizardStep === 4 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-brand-dark font-display">Set your target budget limit:</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Currency</label>
                    <select
                      value={newTripData.currency}
                      onChange={(e) => setNewTripData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full bg-brand-bg px-2 py-2 text-xs font-bold border border-brand-muted/20 rounded-btn"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Total Budget</label>
                    <input 
                      type="number" 
                      required
                      value={newTripData.budget}
                      onChange={(e) => setNewTripData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-brand-bg px-3 py-2 text-xs font-medium border border-brand-muted/20 rounded-btn focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Interests & AI Toggle */}
            {wizardStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-brand-dark font-display">Pick interests & initialize:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['food', 'culture', 'nature', 'adventure', 'relaxation'].map(tag => {
                    const selected = newTripData.interests.includes(tag);
                    return (
                      <button 
                        key={tag}
                        type="button"
                        onClick={() => handleInterestSelect(tag)}
                        className={`py-2 px-3 border rounded-full text-xs font-bold transition-all text-center ${
                          selected 
                            ? 'bg-brand-primary text-white border-brand-primary' 
                            : 'bg-transparent border-brand-muted/20 text-brand-muted hover:text-brand-dark'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-brand-muted/15 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">🧠 AI Build First Draft</span>
                    <span className="text-[10px] text-brand-muted block">Gemini will auto-structure daily stops</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setNewTripData(prev => ({ ...prev, aiDraft: !prev.aiDraft }))}
                    className={`h-6 w-11 rounded-full px-0.5 flex items-center transition-all ${
                      newTripData.aiDraft ? 'bg-brand-accent' : 'bg-brand-muted/30'
                    }`}
                  >
                    <div className={`h-5 w-5 bg-white rounded-full shadow transition-transform ${newTripData.aiDraft ? 'translate-x-5' : ''}`}></div>
                  </button>
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-brand-muted/10">
              <button 
                type="button"
                onClick={() => { setShowWizard(false); setWizardStep(1); }}
                className="text-xs text-brand-muted hover:text-brand-dark transition-colors font-bold"
              >
                Cancel
              </button>

              <div className="flex gap-2">
                {wizardStep > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setWizardStep(wizardStep - 1)}
                    className="px-4 py-2 border border-brand-muted/20 text-brand-dark rounded-btn text-xs font-bold hover:bg-brand-bg transition-all"
                  >
                    Back
                  </button>
                )}
                {wizardStep < 5 ? (
                  <button 
                    type="button" 
                    onClick={() => setWizardStep(wizardStep + 1)}
                    disabled={
                      (wizardStep === 1 && !newTripData.destination) ||
                      (wizardStep === 2 && (!newTripData.startDate || !newTripData.endDate))
                    }
                    className="px-5 py-2.5 bg-brand-primary text-white rounded-btn text-xs font-bold hover:bg-brand-primary/95 disabled:opacity-50 transition-all flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent/95 text-white font-bold rounded-btn text-xs shadow transition-all"
                  >
                    Generate Trip
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
