// src/pages/tabs/OverviewTab.tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import type { Trip, ItineraryDay } from '../../types';
import { WeatherWidget } from '../../components/WeatherWidget';

interface OverviewTabProps {
  trip: Trip;
  days: ItineraryDay[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ trip, days }) => {
  const totalStops = days.reduce((acc, curr) => acc + (curr.stops?.length || 0), 0);
  const dests = trip.destinations || [];
  const interestsList = trip.interests || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
        {/* Visual Cover */}
        <div className="h-64 rounded-card overflow-hidden bg-brand-muted/20 relative shadow-inner">
          <img 
            src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'} 
            alt={dests.join(', ')} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-brand-dark/40"></div>
          <div className="absolute bottom-5 left-5 text-white">
            <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest block">Active Roadmap</span>
            <h3 className="text-xl sm:text-2xl font-black mt-1 leading-tight">{dests.join(' & ')}</h3>
            <p className="text-xs text-white/80 font-medium flex items-center gap-1.5 mt-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{trip.startDate} to {trip.endDate}</span>
            </p>
          </div>
        </div>

        {/* AI written summary */}
        <div className="bg-white border border-brand-muted/10 p-5 rounded-card shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
            <span>🧠 AI Destination Brief Summary</span>
          </h4>
          <p className="text-xs sm:text-sm text-brand-dark leading-relaxed italic">
            "Welcome to {dests.join(', ')}! Structured for a {trip.groupType} trip focused on {interestsList.join(', ')}. Check out your dynamic schedules, weather grids, and coordinates in the panels."
          </p>
        </div>
      </div>

      {/* Right sidebar: weather & stats */}
      <div className="space-y-6">
        <WeatherWidget destination={dests[0] || 'Kyoto'} />
        
        {/* Quick stats checklist */}
        <div className="bg-white border border-brand-muted/10 rounded-card p-4 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">Trip Stats Details</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-brand-muted/5 font-semibold text-brand-dark">
              <span className="text-brand-muted">Target Budget</span>
              <span>{trip.budget.currency} {trip.budget.amount}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-brand-muted/5 font-semibold text-brand-dark">
              <span className="text-brand-muted">Allocated Stops</span>
              <span>{totalStops} stops</span>
            </div>
            <div className="flex justify-between py-1 border-b border-brand-muted/5 font-semibold text-brand-dark">
              <span className="text-brand-muted">Group Style</span>
              <span>{trip.groupType} group</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
