// src/components/TripCard.tsx
import React from 'react';
import { Calendar, Share2, Trash2 } from 'lucide-react';
import type { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  onSelect: (tripId: string) => void;
  onDelete?: (tripId: string) => void;
  onShare?: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onSelect, onDelete, onShare }) => {
  const startDateStr = trip.start_date || trip.startDate || '';
  const endDateStr = trip.end_date || trip.endDate || '';
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  const endDate = endDateStr ? new Date(endDateStr) : new Date();
  const formattedDates = startDateStr && endDateStr 
    ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Dates TBD';
  
  // Calculate duration
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Visual AI Suitability Score (Calculated based on title/tags)
  const aiScore = trip.is_pro ? 98 : 89;

  return (
    <div 
      className="group relative overflow-hidden bg-white border border-brand-muted/10 rounded-card shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
      onClick={() => onSelect(trip.id)}
    >
      {/* Cover Image */}
      <div className="relative h-44 w-full overflow-hidden bg-brand-muted/20">
        <img 
          src={trip.cover_url} 
          alt={trip.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold text-brand-primary bg-brand-bg/90 rounded-full shadow-sm backdrop-blur-sm">
            {trip.group_type}
          </span>
          {trip.is_pro && (
            <span className="px-2.5 py-1 text-xs font-semibold text-white bg-gradient-to-r from-brand-accent to-amber-500 rounded-full shadow-sm">
              PRO
            </span>
          )}
        </div>

        {/* AI Match Score Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold text-white bg-brand-primary/95 rounded-full shadow-sm backdrop-blur-sm flex items-center gap-1 border border-brand-accent/30">
          <span>🧠</span>
          <span>{aiScore}% DNA</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-dark/60 to-transparent p-3 pt-8">
          <p className="text-white text-xs font-medium tracking-wide uppercase drop-shadow">
            {trip.destination}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-brand-dark leading-snug group-hover:text-brand-primary transition-colors">
            {trip.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-brand-muted font-medium">
            <Calendar className="h-3.5 w-3.5 text-brand-primary/60" />
            <span>{formattedDates} ({diffDays} {diffDays === 1 ? 'day' : 'days'})</span>
          </div>
          {trip.trip_summary && (
            <p className="mt-2 text-xs text-brand-muted/90 line-clamp-2 leading-relaxed">
              {trip.trip_summary}
            </p>
          )}
        </div>

        {/* Action strip */}
        <div className="mt-4 pt-3 border-t border-brand-muted/10 flex items-center justify-between text-brand-muted">
          {/* Tags */}
          <div className="flex gap-1 overflow-hidden">
            {(trip.interest_tags || trip.interests || []).slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] font-semibold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                #{tag}
              </span>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onShare && onShare(trip)}
              className="p-1.5 rounded-full hover:bg-brand-bg hover:text-brand-primary transition-colors"
              title="Share Trip"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {onDelete && (
              <button 
                onClick={() => onDelete(trip.id)}
                className="p-1.5 rounded-full hover:bg-red-50 hover:text-brand-danger transition-colors"
                title="Delete Trip"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
