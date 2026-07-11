// src/components/PlaceCard.tsx
import React from 'react';
import { Star, MapPin, Plus, Check, Compass } from 'lucide-react';

export interface Place {
  id: string;
  name: string;
  category: string;
  rating: number;
  price_level: string; // $, $$, $$$
  location: string;
  ai_summary: string;
  image_url: string;
}

interface PlaceCardProps {
  place: Place;
  isSaved?: boolean;
  onSaveToggle?: (placeId: string) => void;
  onAddToItinerary?: (place: Place) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ 
  place, 
  isSaved = false, 
  onSaveToggle, 
  onAddToItinerary 
}) => {
  return (
    <div className="group bg-white border border-brand-muted/15 rounded-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Visual cover */}
      <div className="relative h-40 bg-brand-muted/20 overflow-hidden">
        <img 
          src={place.image_url} 
          alt={place.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 bg-brand-dark/70 text-white text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase backdrop-blur-sm">
          {place.category}
        </div>
        
        {place.rating > 0 && (
          <div className="absolute top-2 right-2 bg-white/95 text-brand-dark text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
            <Star className="h-3 w-3 fill-brand-accent text-brand-accent" />
            <span>{place.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h4 className="font-bold text-brand-dark text-base leading-tight">
              {place.name}
            </h4>
            <span className="text-xs font-mono font-bold text-brand-accent whitespace-nowrap">
              {place.price_level}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1 text-xs text-brand-muted">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-brand-primary/50" />
            <span className="truncate">{place.location}</span>
          </div>

          {/* AI Travel Brain Review */}
          <div className="mt-3 p-2.5 bg-brand-bg rounded-lg border border-brand-primary/5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-brand-primary uppercase tracking-wider mb-1">
              <span>🧠</span>
              <span>AI TRAVEL BRAIN</span>
            </div>
            <p className="text-xs text-brand-dark/90 leading-relaxed italic">
              "{place.ai_summary}"
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-4 pt-3 border-t border-brand-muted/10 flex gap-2">
          {onSaveToggle && (
            <button 
              onClick={() => onSaveToggle(place.id)}
              className={`flex-1 py-1.5 px-3 rounded-btn text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                isSaved 
                  ? 'bg-brand-primary/10 text-brand-primary' 
                  : 'bg-brand-bg hover:bg-brand-primary/5 text-brand-dark'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Save Place</span>
                </>
              )}
            </button>
          )}

          {onAddToItinerary && (
            <button 
              onClick={() => onAddToItinerary(place)}
              className="py-1.5 px-3 bg-brand-accent hover:bg-brand-accent/95 text-white rounded-btn text-xs font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-1"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Add to Route</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
