// src/pages/Discover.tsx
import React, { useState } from 'react';
import { Compass, Sparkles, Filter } from 'lucide-react';

export const Discover: React.FC = () => {
  const [activeVibe, setActiveVibe] = useState('All');
  
  const destinations = [
    { city: 'Kyoto, Japan', vibe: 'Cultural', tags: ['temples', 'culinary'], cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80', pitch: 'Stunning bamboo forests, ancient gold shrines, and traditional matcha tasting trails.' },
    { city: 'Amalfi Coast, Italy', vibe: 'Romantic', tags: ['coastal', 'luxury'], cover: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=80', pitch: 'Precipitous cliffs dotted with colorful villas cascading down into deep turquoise waters.' },
    { city: 'Oaxaca, Mexico', vibe: 'Food-focused', tags: ['mole', 'mezcal'], cover: 'https://images.unsplash.com/photo-1512813583145-acaa5400ae3e?auto=format&fit=crop&w=400&q=80', pitch: 'Vibrant markets, colonial squares, and the absolute culinary heart of indigenous craft gastronomy.' },
    { city: 'Reykjavik, Iceland', vibe: 'Adventure', tags: ['glaciers', 'waterfalls'], cover: 'https://images.unsplash.com/photo-1504829857797-ddff28127792?auto=format&fit=crop&w=400&q=80', pitch: 'Otherworldly black sand beaches, steaming geothermal fissures, and dancing aurora borealis.' },
    { city: 'Marrakech, Morocco', vibe: 'Adventure', tags: ['souks', 'desert'], cover: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=400&q=80', pitch: 'Intricate mosaic riads, sensory market mazes, and stargazing trails across red dunes.' },
    { city: 'Santorini, Greece', vibe: 'Romantic', tags: ['islands', 'relaxation'], cover: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=400&q=80', pitch: 'Pristine whitewashed architecture overlooking volcanic craters and spectacular Aegean sunsets.' }
  ];

  const filtered = activeVibe === 'All' 
    ? destinations 
    : destinations.filter(d => d.vibe.toLowerCase() === activeVibe.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-dark font-display flex items-center gap-2">
            <Compass className="h-6 w-6 text-brand-primary" />
            <span>AI Discover Inspiration</span>
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Gemini analyzed travel databases to curate hidden gems customized for your profile.
          </p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex bg-white p-3 border border-brand-muted/10 rounded-card shadow-sm overflow-x-auto gap-2 items-center">
        <Filter className="h-4 w-4 text-brand-muted mr-2 flex-shrink-0" />
        {['All', 'Romantic', 'Adventure', 'Cultural', 'Food-focused'].map(vibe => (
          <button
            key={vibe}
            onClick={() => setActiveVibe(vibe)}
            className={`px-3 py-1 text-xs font-bold rounded-btn transition-all ${
              activeVibe === vibe 
                ? 'bg-brand-primary text-white' 
                : 'bg-brand-bg hover:bg-brand-primary/5 text-brand-muted'
            }`}
          >
            {vibe}
          </button>
        ))}
      </div>

      {/* Destination Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((d, idx) => (
          <div key={idx} className="bg-white border border-brand-muted/10 rounded-card overflow-hidden hover:shadow shadow-sm transition-all group flex flex-col justify-between">
            <div className="h-44 bg-brand-muted/15 overflow-hidden relative">
              <img src={d.cover} alt={d.city} className="w-full h-full object-cover group-hover:scale-103 transition-transform" />
              <div className="absolute top-2 left-2 bg-brand-dark/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {d.vibe}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-base text-brand-dark">{d.city}</h4>
                <p className="text-xs text-brand-muted leading-relaxed mt-1.5 italic">
                  "{d.pitch}"
                </p>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {d.tags.map(t => (
                  <span key={t} className="text-[9px] font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full uppercase">
                    #{t}
                  </span>
                ))}
              </div>

              <button 
                onClick={() => alert(`Starting customized AI itinerary for ${d.city}! Redirecting to wizard...`)}
                className="w-full py-2 bg-brand-accent hover:bg-brand-accent/95 text-white font-bold rounded-btn text-xs mt-3 flex items-center justify-center gap-1 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Clone Starter Route</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
