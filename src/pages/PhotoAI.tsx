// src/pages/PhotoAI.tsx
import React, { useState } from 'react';
import { History, Trash2, Camera, Landmark, BookOpen, FileText, Image } from 'lucide-react';
import { PhotoAnalysis } from '../components/PhotoAnalysis';
import { useTripStore } from '../stores/tripStore';
import type { Trip } from '../types';

interface PhotoAIProps {
  activeTrip: Trip | null;
}

const SCAN_TYPE_ICONS: Record<string, React.ReactNode> = {
  document: <FileText className="h-3.5 w-3.5" />,
  landmark: <Landmark className="h-3.5 w-3.5" />,
  menu: <BookOpen className="h-3.5 w-3.5" />,
  landscape: <Image className="h-3.5 w-3.5" />,
  unknown: <Camera className="h-3.5 w-3.5" />,
};

const SCAN_TYPE_COLORS: Record<string, string> = {
  document: 'text-amber-700 bg-amber-50 border-amber-200',
  landmark: 'text-brand-primary bg-brand-primary/5 border-brand-primary/15',
  menu: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  landscape: 'text-sky-700 bg-sky-50 border-sky-200',
  unknown: 'text-brand-muted bg-brand-bg border-brand-muted/20',
};

export const PhotoAI: React.FC<PhotoAIProps> = ({ activeTrip }) => {
  const { addCustomStop, saveMemory } = useTripStore();

  const [recentScans, setRecentScans] = useState<{ id: string; name: string; date: string; type: string }[]>([
    { id: 'rs1', name: 'Kyoto Ryokan Confirmation', date: '2 hours ago', type: 'document' },
    { id: 'rs2', name: 'Fushimi Inari Torii', date: '1 day ago', type: 'landmark' },
    { id: 'rs3', name: 'Gion Ramen Wood Menu', date: '3 days ago', type: 'menu' },
  ]);

  const handleAddStop = (name: string, description: string) => {
    if (!activeTrip) {
      alert('Please select or create an active trip context first to add stops!');
      return;
    }
    addCustomStop(activeTrip.id, 1, {
      id: `photo-stop-${Date.now()}`,
      name,
      time: '14:30',
      category: 'culture',
      description,
      estimatedCost: 0,
      mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(name)}`,
    });

    // Add to recent scans
    setRecentScans(prev => [
      { id: `scan-${Date.now()}`, name, date: 'just now', type: 'landmark' },
      ...prev.slice(0, 4)
    ]);
    alert(`✅ "${name}" added to your Day 1 itinerary!`);
  };

  const handleSaveToMemories = (photoUrl: string, caption: string) => {
    if (!activeTrip) {
      alert('Select an active trip context to save memory photos!');
      return;
    }
    saveMemory(activeTrip.id, {
      id: `photo-mem-${Date.now()}`,
      tripId: activeTrip.id,
      photoUrl,
      note: 'Captured and decoded with TripMind Photo AI.',
      location: activeTrip.destination,
      date: new Date().toISOString().split('T')[0],
      aiCaption: caption,
    });

    setRecentScans(prev => [
      { id: `scan-${Date.now()}`, name: caption, date: 'just now', type: 'landmark' },
      ...prev.slice(0, 4)
    ]);
    alert('💾 Saved successfully to your Trip Memories!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-dark font-display flex items-center gap-2.5">
            <span className="h-9 w-9 bg-brand-primary/10 rounded-xl flex items-center justify-center text-xl">📸</span>
            Gemini Vision Assistant
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5 ml-11">
            Snap landmarks, menus, or hotel confirmations — AI reads them instantly.
          </p>
        </div>
        {activeTrip && (
          <div className="ml-11 sm:ml-0 px-3 py-1.5 bg-brand-primary/8 border border-brand-primary/20 text-brand-primary text-[10px] font-bold rounded-full flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
            Active: {activeTrip.title}
          </div>
        )}
      </div>

      {/* Main analysis widget */}
      <div className="bg-white border border-brand-muted/10 rounded-card p-5 shadow-sm">
        <PhotoAnalysis
          onAddStop={handleAddStop}
          onSaveToMemories={handleSaveToMemories}
        />
      </div>

      {/* Recent Scans list */}
      <div className="bg-white border border-brand-muted/10 rounded-card p-4 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
          <History className="h-4 w-4 text-brand-primary" />
          <span>Recent Camera Scans</span>
          <span className="ml-auto text-[10px] text-brand-muted font-normal normal-case">This session</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {recentScans.map(scan => (
            <div key={scan.id} className="p-3 bg-brand-bg/50 border border-brand-muted/5 rounded-lg flex items-center justify-between hover:border-brand-primary/20 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center border shrink-0 ${SCAN_TYPE_COLORS[scan.type] || SCAN_TYPE_COLORS['unknown']}`}>
                  {SCAN_TYPE_ICONS[scan.type] || SCAN_TYPE_ICONS['unknown']}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-brand-dark block truncate">{scan.name}</span>
                  <span className="text-[10px] text-brand-muted">{scan.date}</span>
                </div>
              </div>
              <button
                onClick={() => setRecentScans(prev => prev.filter(s => s.id !== scan.id))}
                className="text-brand-muted hover:text-red-500 transition-colors p-1 shrink-0 ml-1"
                title="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Banner */}
      <div className="bg-gradient-to-r from-brand-primary/8 to-brand-accent/8 border border-brand-primary/15 rounded-card p-4">
        <h5 className="text-xs font-bold text-brand-dark mb-2">📡 What TripMind Vision Can Identify</h5>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-brand-muted">
          {[
            { icon: '🏯', label: 'Landmarks & architecture' },
            { icon: '🍜', label: 'Restaurant menus (any language)' },
            { icon: '📄', label: 'Hotel & flight confirmations' },
            { icon: '🗺️', label: 'Maps & signage' },
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span>{tip.icon}</span>
              <span>{tip.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
