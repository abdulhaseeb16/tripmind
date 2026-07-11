// src/components/MemoryCard.tsx
import React from 'react';
import { MapPin, Calendar, Trash2, Lightbulb } from 'lucide-react';
import type { Memory } from '../services/supabaseClient';

interface MemoryCardProps {
  memory: Memory;
  onDelete?: (memoryId: string) => void;
  onSuggestCaption?: (memoryId: string) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onDelete, onSuggestCaption }) => {
  return (
    <div className="bg-white border border-brand-muted/10 rounded-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group animate-fade-in break-inside-avoid mb-4">
      {/* Image visual */}
      <div className="relative overflow-hidden bg-brand-muted/15 min-h-[160px] max-h-[300px]">
        <img 
          src={memory.photo_url} 
          alt="Memory moment" 
          className="w-full object-cover group-hover:scale-103 transition-transform duration-500 max-h-[300px]"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 bg-brand-dark/70 text-white text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase backdrop-blur-sm flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{memory.location}</span>
        </div>
      </div>

      {/* Note description details */}
      <div className="p-4 space-y-3">
        <p className="text-xs sm:text-sm text-brand-dark leading-relaxed">
          {memory.note}
        </p>

        {/* AI Suggested Caption block */}
        {memory.caption_suggestion && (
          <div className="p-2 bg-brand-bg rounded border border-brand-accent/10 flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider block">AI Suggested Caption</span>
              <p className="text-[11px] text-brand-dark font-medium italic mt-0.5">
                "{memory.caption_suggestion}"
              </p>
            </div>
          </div>
        )}

        {/* Footer date & actions */}
        <div className="flex items-center justify-between border-t border-brand-muted/5 pt-3 text-brand-muted">
          <span className="text-[10px] font-medium flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {memory.date}
          </span>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {onSuggestCaption && !memory.caption_suggestion && (
              <button
                onClick={() => onSuggestCaption(memory.id)}
                className="p-1 hover:bg-brand-primary/5 text-brand-primary rounded transition-colors text-[10px] font-bold flex items-center gap-0.5"
                title="Get AI Caption"
              >
                🧠 Caption
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(memory.id)}
                className="p-1 hover:bg-red-50 text-brand-muted hover:text-brand-danger rounded transition-colors"
                title="Delete Memory"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
