// src/pages/Memories.tsx
import React, { useState, useEffect } from 'react';
import { Image, Sparkles, BookOpen } from 'lucide-react';
import { mockDb } from '../services/supabaseClient';
import type { Memory } from '../services/supabaseClient';
import { MemoryCard } from '../components/MemoryCard';

export const Memories: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [recap, setRecap] = useState('');
  const [loadingRecap, setLoadingRecap] = useState(false);

  useEffect(() => {
    // Load memories across all active trips
    const trips = mockDb.fetchTrips();
    let allMems: Memory[] = [];
    trips.forEach(t => {
      allMems = [...allMems, ...mockDb.fetchMemories(t.id)];
    });
    setMemories(allMems);
  }, []);

  const handleSuggestCaption = (memoryId: string) => {
    const updatedMems = memories.map(mem => {
      if (mem.id === memoryId) {
        return {
          ...mem,
          caption_suggestion: 'Lost in the magic of wandering Gion streets ⛩️✨'
        };
      }
      return mem;
    });
    setMemories(updatedMems);
  };

  const handleGenerateRecap = async () => {
    setLoadingRecap(true);
    // Simulate Gemini writing a beautiful story
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRecap("Trip Recap: A golden voyage through historic Kyoto districts. From early morning temple walks dodging tourists at Fushimi Inari, to taste tests of black garlic tonkotsu ramen sets and traditional Gion alleyways. A successful solo explore merging active pacing with local culinary checkpoints.");
    setLoadingRecap(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-dark font-display flex items-center gap-2">
            <Image className="h-6 w-6 text-brand-primary" />
            <span>Travel Memory Journal</span>
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Automatic timeline compilation of note reviews and camera captures logged on-trip.
          </p>
        </div>

        <button 
          onClick={handleGenerateRecap}
          disabled={loadingRecap || memories.length === 0}
          className="px-4 py-2 bg-brand-primary text-white font-bold rounded-btn text-xs hover:bg-brand-primary/95 shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-40"
        >
          <Sparkles className="h-4 w-4 text-brand-accent animate-pulse" />
          <span>Generate Story Recap</span>
        </button>
      </div>

      {recap && (
        <div className="bg-white border border-brand-accent/25 p-5 rounded-card shadow-sm space-y-3 animate-fade-in">
          <h3 className="text-xs font-bold text-brand-accent uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>AI Story Journal Recap</span>
          </h3>
          <p className="text-xs sm:text-sm text-brand-dark leading-relaxed italic">
            "{recap}"
          </p>
        </div>
      )}

      {memories.length === 0 ? (
        <div className="py-20 text-center bg-white border border-brand-muted/10 rounded-card shadow-sm space-y-3">
          <span className="text-4xl">📸</span>
          <div>
            <h4 className="font-bold text-sm text-brand-dark">No memories logged yet</h4>
            <p className="text-xs text-brand-muted mt-0.5">Log camera snapshots or voice captures during active trip tabs.</p>
          </div>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {memories.map(mem => (
            <MemoryCard 
              key={mem.id} 
              memory={mem} 
              onDelete={(id) => {
                mockDb.deleteMemory(id);
                // Reload list
                const trips = mockDb.fetchTrips();
                let allMems: Memory[] = [];
                trips.forEach(t => {
                  allMems = [...allMems, ...mockDb.fetchMemories(t.id)];
                });
                setMemories(allMems);
              }}
              onSuggestCaption={handleSuggestCaption}
            />
          ))}
        </div>
      )}
    </div>
  );
};
