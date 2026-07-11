// src/pages/PhotoAI.tsx
import React, { useState } from 'react';
import { History, Trash2 } from 'lucide-react';
import { PhotoAnalysis } from '../components/PhotoAnalysis';
import { mockDb } from '../services/supabaseClient';
import type { Memory, Trip } from '../services/supabaseClient';

interface PhotoAIProps {
  activeTrip: Trip | null;
}

export const PhotoAI: React.FC<PhotoAIProps> = ({ activeTrip }) => {
  const [recentScans, setRecentScans] = useState<any[]>([
    { id: 'rs1', name: 'Kyoto Ryokan Confirmation', date: '2 hours ago', type: 'document' },
    { id: 'rs2', name: 'Fushimi Inari Torii', date: '1 day ago', type: 'landmark' },
    { id: 'rs3', name: 'Gion Ramen Wood Menu', date: '3 days ago', type: 'menu' }
  ]);

  const handleAddStop = (name: string, description: string) => {
    if (!activeTrip) {
      alert("Please select or create an active trip context first to add stops!");
      return;
    }
    const currentDays = mockDb.fetchItinerary(activeTrip.id);
    if (currentDays.length > 0) {
      currentDays[0].stops.push({
        id: `photo-stop-${Math.random()}`,
        name,
        time: '14:30',
        duration: '1.5 hrs',
        category: 'culture',
        description,
        cost_estimate: 0,
        google_maps_link: `https://maps.google.com/?q=${encodeURIComponent(name)}`
      });
      mockDb.saveItineraryDays(activeTrip.id, currentDays);
      alert(`Applied "${name}" to your Day 1 itinerary!`);
    } else {
      alert("Create an itinerary day timeline first in My Trips.");
    }
  };

  const handleSaveToMemories = (photoUrl: string, caption: string) => {
    if (!activeTrip) {
      alert("Select an active trip context to save memory photos!");
      return;
    }
    const mem: Memory = {
      id: `photo-mem-${Math.random()}`,
      trip_id: activeTrip.id,
      photo_url: photoUrl,
      note: 'Captured and decoded with TripMind Photo AI.',
      location: activeTrip.destination,
      date: new Date().toISOString().split('T')[0],
      caption_suggestion: caption
    };
    mockDb.saveMemory(mem);
    alert("Saved successfully to your Trip Memories!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-brand-dark font-display flex items-center gap-2">
          <span>📸</span> Gemini Vision Assistant
        </h2>
        <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
          Snap landmarks, translated menus, or hotel confirmations to automatically add coordinates and details to your dashboard.
        </p>
      </div>

      <PhotoAnalysis 
        onAddStop={handleAddStop}
        onSaveToMemories={handleSaveToMemories}
      />

      {/* Recent Scans list */}
      <div className="bg-white border border-brand-muted/10 rounded-card p-4 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
          <History className="h-4 w-4 text-brand-primary" />
          <span>Recent Camera Scans</span>
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {recentScans.map(scan => (
            <div key={scan.id} className="p-3 bg-brand-bg/50 border border-brand-muted/5 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-brand-dark block">{scan.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-bold uppercase bg-brand-primary/5 text-brand-primary px-1.5 py-0.2 rounded border border-brand-primary/10">
                    {scan.type}
                  </span>
                  <span className="text-[10px] text-brand-muted">{scan.date}</span>
                </div>
              </div>
              <button 
                onClick={() => setRecentScans(prev => prev.filter(s => s.id !== scan.id))}
                className="text-brand-muted hover:text-brand-danger transition-colors p-1"
                title="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
