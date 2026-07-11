// src/pages/tabs/MapTab.tsx
import React from 'react';
import { Map } from 'lucide-react';
import type { Trip } from '../../types';

interface MapTabProps {
  trip: Trip;
}

export const MapTab: React.FC<MapTabProps> = ({ trip }) => {
  const dests = trip.destinations || [];
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h3 className="text-sm sm:text-base font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
          <Map className="h-4.5 w-4.5 text-brand-primary" />
          <span>Interactive Route Mapping</span>
        </h3>
        <p className="text-[11px] text-brand-muted mt-0.5">Connected map points showing daily transit pathways for {dests[0] || 'your destination'}.</p>
      </div>

      {/* Premium visual representation of route map */}
      <div className="h-96 w-full rounded-card border border-brand-muted/15 bg-[#E8ECEF] relative overflow-hidden flex items-center justify-center shadow-inner">
        <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(#b1b8be_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
        
        {/* Route paths connecting stops */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none z-10">
          <path 
            d="M 100 200 Q 250 100 400 250 T 700 150" 
            fill="none" 
            stroke="#3730A3" 
            strokeWidth="4" 
            strokeDasharray="8,6"
            className="animate-pulse"
          />
        </svg>

        {/* Simulated interactive map markers */}
        <div className="absolute top-[200px] left-[100px] z-20 group">
          <div className="h-6 w-6 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center text-[10px] shadow border-2 border-white hover:scale-110 transition-transform cursor-pointer">1</div>
          <div className="absolute top-7 -left-6 bg-brand-dark text-white text-[9px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Start Point</div>
        </div>

        <div className="absolute top-[100px] left-[280px] z-20 group">
          <div className="h-6 w-6 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center text-[10px] shadow border-2 border-white hover:scale-110 transition-transform cursor-pointer">2</div>
          <div className="absolute top-7 -left-12 bg-brand-dark text-white text-[9px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Midway Stops</div>
        </div>

        <div className="absolute top-[250px] left-[400px] z-20 group">
          <div className="h-6 w-6 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center text-[10px] shadow border-2 border-white hover:scale-110 transition-transform cursor-pointer">3</div>
          <div className="absolute top-7 -left-10 bg-brand-dark text-white text-[9px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Evening Sunset Spot</div>
        </div>

        {/* Live GPS locator mock overlay */}
        <div className="absolute bottom-5 right-5 bg-white p-3 rounded-card border border-brand-muted/15 shadow flex items-center gap-2.5 z-30">
          <div className="h-3 w-3 bg-brand-accent rounded-full animate-ping"></div>
          <span className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">GPS Signal Connected</span>
        </div>

        {/* Offline notification badge */}
        <div className="absolute top-5 left-5 bg-brand-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow z-30">
          🗺️ Map caches saved offline
        </div>
      </div>
    </div>
  );
};
