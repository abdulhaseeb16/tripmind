// src/pages/tabs/MemoriesTab.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Trip, Memory } from '../../types';
import { MemoryCard } from '../../components/MemoryCard';

interface MemoriesTabProps {
  trip: Trip;
  memories: Memory[];
  onAddMemory: (note: string, location: string, photoUrl?: string) => void;
  onDeleteMemory: (memoryId: string) => void;
}

export const MemoriesTab: React.FC<MemoriesTabProps> = ({
  trip,
  memories,
  onAddMemory,
  onDeleteMemory
}) => {
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    const dests = trip.destinations || [];
    onAddMemory(
      note.trim(),
      location.trim() || dests[0] || 'Kyoto',
      photoUrl.trim() || undefined
    );
    setNote('');
    setLocation('');
    setPhotoUrl('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Memories Grid list */}
      <div className="lg:col-span-2 space-y-4">
        <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">My Photo Journal Logs</h4>
        
        {memories.length === 0 ? (
          <div className="p-8 text-center text-xs text-brand-muted bg-white border border-brand-muted/10 rounded-card">
            No memories saved for this trip yet. Log your first journal card on the sidebar panel.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memories.map(mem => (
              <MemoryCard 
                key={mem.id} 
                // Adapt to older MemoryCard props structure
                memory={{
                  id: mem.id,
                  trip_id: mem.tripId,
                  photo_url: mem.photoUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
                  note: mem.note,
                  location: mem.location,
                  date: mem.date,
                  ai_caption: mem.aiCaption || 'Beautiful snap from the road!'
                } as any} 
                onDelete={() => onDeleteMemory(mem.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right panel: Log memory form */}
      <div className="space-y-6">
        <div className="bg-white border border-brand-muted/10 rounded-card p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">Log Photo Memory Journal</h4>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input 
              type="text" 
              placeholder="Photo URL (e.g. Unsplash link)" 
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full bg-brand-bg px-3 py-2 text-xs border border-brand-muted/20 rounded-btn"
            />
            
            <input 
              type="text" 
              placeholder="Location tag (e.g. Gion district)" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-brand-bg px-3 py-2 text-xs border border-brand-muted/20 rounded-btn"
            />
            
            <textarea 
              placeholder="What made this moment special?..." 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              rows={3}
              className="w-full bg-brand-bg px-3 py-2 text-xs border border-brand-muted/20 rounded-btn focus:outline-none"
            />

            <button 
              type="submit"
              className="w-full bg-brand-primary text-white font-bold py-2 rounded-btn text-xs hover:bg-brand-primary/95 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Save Moment</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
