// src/components/FlightCard.tsx
import React, { useState } from 'react';
import { Plane, Clock, RefreshCw } from 'lucide-react';

export interface FlightInfo {
  flightNumber: string;
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  terminal?: string;
  gate?: string;
  status: 'On Time' | 'Delayed' | 'Scheduled' | 'Boarding';
}

interface FlightCardProps {
  flight?: FlightInfo;
  onTrackerQuery?: (flightNum: string) => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, onTrackerQuery }) => {
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFlight, setActiveFlight] = useState<FlightInfo | null>(flight || {
    flightNumber: 'NH110',
    airline: 'ANA Airways',
    departureAirport: 'LHR',
    arrivalAirport: 'HND',
    departureTime: '19:00',
    arrivalTime: '15:55 (+1)',
    terminal: 'T2',
    gate: '45',
    status: 'On Time'
  });

  const getStatusColor = (status: FlightInfo['status']) => {
    switch (status) {
      case 'On Time':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'Delayed':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'Boarding':
        return 'text-brand-accent bg-orange-50 border-orange-200';
      default:
        return 'text-brand-primary bg-brand-primary/5 border-brand-primary/10';
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    setLoading(true);
    
    // Simulate Aviation Stack API integration
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (onTrackerQuery) {
      onTrackerQuery(queryInput);
    }

    setActiveFlight({
      flightNumber: queryInput.toUpperCase(),
      airline: 'Global Airways',
      departureAirport: 'LHR',
      arrivalAirport: 'HND',
      departureTime: '22:15',
      arrivalTime: '19:25 (+1)',
      terminal: 'T3',
      gate: 'B18',
      status: 'On Time'
    });
    setLoading(false);
  };

  return (
    <div className="bg-white border border-brand-muted/10 rounded-card p-4 shadow-sm w-full">
      <div className="flex items-center justify-between border-b border-brand-muted/5 pb-2.5 mb-3">
        <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
          <Plane className="h-4 w-4 text-brand-primary" />
          <span>Flight Tracker Widget</span>
        </h4>
        <span className="text-[10px] text-brand-muted font-medium">Aviation Stack Live</span>
      </div>

      {activeFlight && !loading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-mono font-bold text-brand-dark block">{activeFlight.flightNumber}</span>
              <span className="text-[10px] text-brand-muted font-semibold uppercase">{activeFlight.airline}</span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusColor(activeFlight.status)}`}>
              {activeFlight.status}
            </span>
          </div>

          <div className="flex items-center justify-between bg-brand-bg/50 p-2.5 rounded-lg border border-brand-muted/5">
            <div className="text-left">
              <span className="text-lg font-black text-brand-dark block font-mono">{activeFlight.departureAirport}</span>
              <span className="text-xs text-brand-muted font-bold flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {activeFlight.departureTime}
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="w-full relative flex items-center justify-center">
                <div className="w-full h-[2px] bg-brand-muted/20"></div>
                <Plane className="h-4.5 w-4.5 text-brand-primary absolute bg-white px-0.5" />
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-brand-dark block font-mono">{activeFlight.arrivalAirport}</span>
              <span className="text-xs text-brand-muted font-bold flex items-center gap-1 justify-end">
                <Clock className="h-3.5 w-3.5" />
                {activeFlight.arrivalTime}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs border-t border-brand-muted/10 pt-3">
            <div>
              <span className="text-[10px] font-bold text-brand-muted uppercase block">Terminal</span>
              <span className="font-mono font-bold text-brand-dark text-sm">{activeFlight.terminal || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-muted uppercase block">Gate</span>
              <span className="font-mono font-bold text-brand-dark text-sm">{activeFlight.gate || 'TBD'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-6">
          <div className="h-5 w-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Query Search */}
      <form onSubmit={handleQuery} className="mt-4 pt-3 border-t border-brand-muted/15 flex gap-2">
        <input 
          type="text" 
          placeholder="Query Flight (e.g. BA227)" 
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          className="flex-1 min-w-0 bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-medium border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="px-3 py-1.5 bg-brand-primary text-white font-bold rounded-btn text-xs hover:bg-brand-primary/95 transition-all flex items-center gap-1 shadow-sm"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Track</span>
        </button>
      </form>
    </div>
  );
};
