// src/components/ItineraryDay.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Clock, DollarSign, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import type { ItineraryDay as DayType } from '../services/supabaseClient';

interface ItineraryDayProps {
  day: DayType;
  onMoveStop?: (stopId: string, direction: 'up' | 'down') => void;
  onRemoveStop?: (stopId: string) => void;
  onAddStop?: (dayNumber: number) => void;
}

export const ItineraryDay: React.FC<ItineraryDayProps> = ({ 
  day, 
  onMoveStop, 
  onRemoveStop, 
  onAddStop 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Helper to resolve category icons
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food': return '🍜';
      case 'culture': return '⛩️';
      case 'nature': return '🌲';
      case 'adventure': return '🧗';
      case 'logistics': return '✈️';
      default: return '📍';
    }
  };

  const getDayOfWeek = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="border border-brand-muted/10 bg-white rounded-card overflow-hidden shadow-sm mb-4 transition-all">
      {/* Header Bar */}
      <div 
        className="px-4 py-3 bg-brand-bg flex items-center justify-between cursor-pointer border-b border-brand-muted/5 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-brand-primary text-white font-bold rounded-lg flex items-center justify-center text-sm shadow-sm">
            D{day.day_number}
          </div>
          <div>
            <h4 className="font-bold text-brand-dark text-sm sm:text-base leading-tight">
              Day {day.day_number} · {getDayOfWeek(day.date)}
            </h4>
            <p className="text-[11px] text-brand-muted font-medium">
              {day.stops.length} stops planned
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAddStop && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddStop(day.day_number);
              }}
              className="p-1.5 hover:bg-brand-primary/5 text-brand-primary rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Stop</span>
            </button>
          )}
          {isOpen ? <ChevronUp className="h-4.5 w-4.5 text-brand-muted" /> : <ChevronDown className="h-4.5 w-4.5 text-brand-muted" />}
        </div>
      </div>

      {/* Timeline Stops Container */}
      {isOpen && (
        <div className="p-4 relative">
          {day.stops.length === 0 ? (
            <div className="py-6 text-center text-xs text-brand-muted">
              No stops scheduled yet. Click "Add Stop" to let Gemini build it!
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-[2px] before:bg-brand-primary/10">
              {day.stops.map((stop, idx) => (
                <div key={stop.id} className="relative pl-10 flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                  {/* Timeline Node */}
                  <div className="absolute left-[8px] top-1 h-5 w-5 rounded-full bg-white border-2 border-brand-primary shadow-sm flex items-center justify-center text-[10px] z-10">
                    {getCategoryIcon(stop.category)}
                  </div>

                  {/* Stop Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stop.time} ({stop.duration})
                      </span>
                      {stop.cost_estimate > 0 ? (
                        <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <DollarSign className="h-3 w-3" />
                          {stop.cost_estimate}
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-brand-muted bg-brand-bg px-2 py-0.5 rounded-full">
                          Free Entry
                        </span>
                      )}
                    </div>
                    <h5 className="mt-1 text-sm font-bold text-brand-dark group-hover:text-brand-primary transition-colors flex items-center gap-1.5">
                      {stop.name}
                    </h5>
                    <p className="mt-1.5 text-xs text-brand-muted leading-relaxed max-w-2xl">
                      {stop.description}
                    </p>
                    {stop.google_maps_link && (
                      <a 
                        href={stop.google_maps_link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-brand-accent hover:underline"
                      >
                        <MapPin className="h-3 w-3" />
                        <span>Navigate in Maps</span>
                      </a>
                    )}
                  </div>

                  {/* Action Reordering tools */}
                  <div className="flex items-center gap-1 self-start sm:self-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    {onMoveStop && (
                      <>
                        <button
                          onClick={() => onMoveStop(stop.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-brand-muted hover:text-brand-primary disabled:opacity-30 rounded hover:bg-brand-bg transition-colors"
                          title="Move Stop Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onMoveStop(stop.id, 'down')}
                          disabled={idx === day.stops.length - 1}
                          className="p-1 text-brand-muted hover:text-brand-primary disabled:opacity-30 rounded hover:bg-brand-bg transition-colors"
                          title="Move Stop Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    {onRemoveStop && (
                      <button
                        onClick={() => onRemoveStop(stop.id)}
                        className="p-1 text-brand-muted hover:text-brand-danger rounded hover:bg-red-50 transition-colors"
                        title="Remove Stop"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
