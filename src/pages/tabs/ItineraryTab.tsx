// src/pages/tabs/ItineraryTab.tsx
import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import type { Trip, ItineraryDay as DayType } from '../../types';
import { ItineraryDay } from '../../components/ItineraryDay';

interface ItineraryTabProps {
  trip: Trip;
  days: DayType[];
  onMoveStop: (stopId: string, direction: 'up' | 'down') => void;
  onRemoveStop: (stopId: string) => void;
}

export const ItineraryTab: React.FC<ItineraryTabProps & {
  onAddCustomStop: (dayNumber: number, name: string) => void;
  onOptimize: () => Promise<void>;
}> = ({
  trip,
  days,
  onMoveStop,
  onRemoveStop,
  onAddCustomStop,
  onOptimize
}) => {
  console.log("Itinerary active trip:", trip.id);
  const [optimizing, setOptimizing] = useState(false);
  const [showAddStopModal, setShowAddStopModal] = useState<number | null>(null);
  const [newStopText, setNewStopText] = useState('');

  const handleAIReviewOptimize = async () => {
    setOptimizing(true);
    await onOptimize();
    setOptimizing(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopText.trim() || showAddStopModal === null) return;
    onAddCustomStop(showAddStopModal, newStopText.trim());
    setNewStopText('');
    setShowAddStopModal(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-brand-dark uppercase tracking-wider">Day by Day Schedule timeline</h3>
          <p className="text-[11px] text-brand-muted">Rearrange timeline routes or optimize pacing via Gemini.</p>
        </div>

        <button 
          onClick={handleAIReviewOptimize}
          disabled={optimizing}
          className="py-1.5 px-3 bg-brand-primary text-white hover:bg-brand-primary/95 disabled:opacity-50 text-xs font-bold rounded-btn flex items-center gap-1.5 shadow-sm transition-all animate-pulse"
        >
          {optimizing ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Optimizing Route...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-brand-accent animate-pulse" />
              <span>Optimize Route Pacing</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {days.map(day => (
          <ItineraryDay 
            key={day.day_number || day.dayNumber || Math.random()} 
            // Wrap or cast to ensure backward compatibility with the component's expectations
            day={day as any} 
            onMoveStop={onMoveStop}
            onRemoveStop={onRemoveStop}
            onAddStop={(dayNum) => setShowAddStopModal(dayNum)}
          />
        ))}
      </div>

      {/* Quick stop add inline modal */}
      {showAddStopModal !== null && (
        <div className="fixed inset-0 z-50 bg-brand-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-brand-muted/10 rounded-card p-6 shadow-xl max-w-md w-full space-y-4 animate-fade-in">
            <div>
              <h4 className="font-bold text-sm text-brand-dark">Add stop to Day {showAddStopModal}</h4>
              <p className="text-[11px] text-brand-muted mt-0.5">Let Gemini lookup coordinates or add a custom name.</p>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <input 
                type="text" 
                placeholder="Search place name (e.g. Fushimi Inari-taisha)..." 
                value={newStopText}
                onChange={(e) => setNewStopText(e.target.value)}
                required
                autoFocus
                className="w-full bg-brand-bg px-3 py-2 text-xs border border-brand-muted/20 rounded-btn"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddStopModal(null)}
                  className="px-3 py-1.5 border border-brand-muted/20 text-brand-dark text-xs font-bold rounded-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary text-white text-xs font-bold rounded-btn"
                >
                  Save Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
