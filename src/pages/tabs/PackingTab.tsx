// src/pages/tabs/PackingTab.tsx
import React, { useState } from 'react';
import { Sparkles, Loader2, CloudRain, Sun, Thermometer, Wind, Plus, Info } from 'lucide-react';
import type { Trip, PackingItem as PackingItemType } from '../../types';
import { PackingItem } from '../../components/PackingItem';
import { generatePackingList } from '../../services/geminiService';
import { useTripStore } from '../../stores/tripStore';

interface PackingTabProps {
  trip: Trip;
  packing: PackingItemType[];
  onTogglePacking: (itemId: string) => void;
  onAddPacking: (name: string, category: string, tag: 'essential' | 'nice-to-have' | 'conditional') => void;
  onDeletePacking: (itemId: string) => void;
}

// Simple weather conditions map based on destination keywords
function estimateWeather(destination: string, startDate: string): { temp: number; condition: string; note: string } {
  const dest = destination.toLowerCase();
  const month = new Date(startDate).getMonth();

  if (dest.includes('japan') || dest.includes('kyoto') || dest.includes('tokyo')) {
    if (month >= 9 && month <= 11) return { temp: 15, condition: 'Crisp & Clear', note: 'Autumn in Japan — light jacket essential, occasional rain' };
    if (month >= 5 && month <= 8) return { temp: 32, condition: 'Hot & Humid', note: 'Summer heat — breathable fabrics, sunscreen, hydration essential' };
    return { temp: 10, condition: 'Cool & Windy', note: 'Spring/Winter — layering recommended' };
  }
  if (dest.includes('iceland') || dest.includes('reykjavik')) {
    return { temp: 4, condition: 'Cold & Windy', note: 'Always pack waterproofs and thermal layers in Iceland' };
  }
  if (dest.includes('thailand') || dest.includes('bali') || dest.includes('singapore')) {
    return { temp: 33, condition: 'Tropical', note: 'Hot and humid year-round — light fabrics, insect repellent essential' };
  }
  if (dest.includes('paris') || dest.includes('london') || dest.includes('amsterdam')) {
    return { temp: 14, condition: 'Mild & Rainy', note: 'European weather is unpredictable — always carry a compact umbrella' };
  }
  return { temp: 22, condition: 'Mild', note: 'Pack versatile layers for varying conditions' };
}

const CATEGORIES = ['Clothing', 'Electronics', 'Documents & Money', 'Toiletries', 'Health & Meds', 'Other'];

const WEATHER_ICONS: Record<string, React.ReactNode> = {
  'Crisp & Clear': <Sun className="h-4 w-4 text-amber-500" />,
  'Hot & Humid': <Thermometer className="h-4 w-4 text-red-500" />,
  'Cool & Windy': <Wind className="h-4 w-4 text-sky-500" />,
  'Cold & Windy': <Wind className="h-4 w-4 text-sky-700" />,
  'Tropical': <Thermometer className="h-4 w-4 text-orange-500" />,
  'Mild & Rainy': <CloudRain className="h-4 w-4 text-blue-500" />,
  'Mild': <Sun className="h-4 w-4 text-amber-400" />,
};

export const PackingTab: React.FC<PackingTabProps> = ({
  trip,
  packing,
  onTogglePacking,
  onAddPacking,
  onDeletePacking,
}) => {
  const { addPackingItem } = useTripStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Clothing');
  const [tag, setTag] = useState<'essential' | 'nice-to-have' | 'conditional'>('essential');
  const [generating, setGenerating] = useState(false);
  const [generationDone, setGenerationDone] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const dest = trip.destination || trip.destinations[0] || 'your destination';
  const startDate = trip.start_date || trip.startDate || new Date().toISOString();
  const weather = estimateWeather(dest, startDate);

  const packedCount = packing.filter(p => p.packed).length;
  const totalCount = packing.length;
  const progressPct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPacking(name.trim(), category, tag);
    setName('');
  };

  const handleGenerateAI = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const days = Math.max(3, 7);
      const items = await generatePackingList(
        dest,
        days,
        trip.interests || [],
        weather.note
      );
      items.forEach((item: any) => {
        addPackingItem(trip.id, {
          id: `ai-pack-${Date.now()}-${Math.random()}`,
          name: item.name,
          category: item.category,
          quantity: item.quantity || 1,
          tag: item.tag,
          packed: false,
          note: item.note,
        });
      });
      setGenerationDone(true);
    } catch (err) {
      console.error('Generate packing error', err);
    } finally {
      setGenerating(false);
    }
  };

  // Filter packing items
  const allCategories = ['All', ...Array.from(new Set(packing.map(p => p.category)))];
  const filteredPacking = activeFilter === 'All' ? packing : packing.filter(p => p.category === activeFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Weather Banner */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 border border-brand-primary/15 rounded-card">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-12 w-12 rounded-xl bg-white border border-brand-muted/15 shadow-sm flex items-center justify-center text-2xl">
            {WEATHER_ICONS[weather.condition] || <Sun className="h-6 w-6 text-amber-400" />}
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Weather Forecast for {dest}</p>
            <p className="text-sm font-black text-brand-dark mt-0.5">{weather.condition} · {weather.temp}°C</p>
            <p className="text-[11px] text-brand-muted mt-0.5 leading-relaxed max-w-sm">{weather.note}</p>
          </div>
        </div>
        <button
          onClick={handleGenerateAI}
          disabled={generating}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-btn text-xs font-bold hover:bg-brand-primary/95 transition-all shadow-sm disabled:opacity-70 whitespace-nowrap"
        >
          {generating ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating...</>
          ) : (
            <><Sparkles className="h-3.5 w-3.5" />{generationDone ? 'Regenerate AI List' : 'AI-Generate My List'}</>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-brand-dark">{packedCount} of {totalCount} items packed</span>
            <span className={`font-black ${progressPct === 100 ? 'text-emerald-600' : 'text-brand-primary'}`}>{progressPct}%</span>
          </div>
          <div className="h-2 w-full bg-brand-bg rounded-full overflow-hidden border border-brand-muted/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-primary to-brand-accent'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {progressPct === 100 && (
            <p className="text-xs font-bold text-emerald-600 text-center py-1">✅ All packed! You're ready to go.</p>
          )}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Checklist */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category filter chips */}
          {allCategories.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                    activeFilter === cat
                      ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                      : 'bg-white text-brand-muted border-brand-muted/20 hover:border-brand-primary/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Item list */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredPacking.length === 0 ? (
              <div className="py-12 text-center text-brand-muted">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-brand-primary/30" />
                <p className="text-xs font-bold">No items yet</p>
                <p className="text-[11px] mt-1 max-w-[220px] mx-auto">Click "AI-Generate My List" for weather-adaptive suggestions, or add items manually.</p>
              </div>
            ) : (
              filteredPacking.map(item => (
                <div key={item.id} className="relative group">
                  <PackingItem
                    item={{
                      id: item.id,
                      name: item.name,
                      category: item.category,
                      quantity: item.quantity,
                      tag: (item.tag as string) || (item.essential === 'essential' ? 'Essential' : 'Nice to have'),
                      packed: item.packed,
                      note: item.note || item.reason,
                    } as any}
                    onToggle={() => onTogglePacking(item.id)}
                    onDelete={() => onDeletePacking(item.id)}
                  />
                  {(item.note || item.reason) && (
                    <button
                      className="absolute right-10 top-1/2 -translate-y-1/2 text-brand-muted/40 hover:text-brand-primary transition-colors opacity-0 group-hover:opacity-100"
                      onMouseEnter={() => setShowTooltip(item.id)}
                      onMouseLeave={() => setShowTooltip(null)}
                      title={item.note || item.reason}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {showTooltip === item.id && (item.note || item.reason) && (
                    <div className="absolute right-8 bottom-full mb-1 z-10 bg-brand-dark text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg max-w-[200px] leading-relaxed">
                      {item.note || item.reason}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Add form */}
        <div className="space-y-4">
          <div className="bg-white border border-brand-muted/10 rounded-card p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-brand-primary" />
              Add Custom Item
            </h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Item name (e.g. Rain poncho)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-brand-bg px-3 py-2 text-xs border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary/50 focus:bg-white transition-all"
              />

              <div>
                <label className="text-[9px] font-bold text-brand-muted uppercase block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-bold border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary/50"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-brand-muted uppercase block mb-1">Importance</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value as any)}
                  className="w-full bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-bold border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary/50"
                >
                  <option value="essential">Essential</option>
                  <option value="nice-to-have">Nice to have</option>
                  <option value="conditional">Conditional</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary text-white font-bold py-2 rounded-btn text-xs hover:bg-brand-primary/95 transition-all shadow-sm"
              >
                Add Item
              </button>
            </form>
          </div>

          {/* Quick stats */}
          {totalCount > 0 && (
            <div className="bg-white border border-brand-muted/10 rounded-card p-4 shadow-sm space-y-2">
              <h5 className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Packing Summary</h5>
              {['Clothing', 'Electronics', 'Documents & Money', 'Toiletries'].map(cat => {
                const catItems = packing.filter(p => p.category === cat);
                const catPacked = catItems.filter(p => p.packed).length;
                return catItems.length > 0 ? (
                  <div key={cat} className="flex items-center justify-between text-[11px]">
                    <span className="text-brand-muted">{cat}</span>
                    <span className={`font-bold ${catPacked === catItems.length ? 'text-emerald-600' : 'text-brand-dark'}`}>
                      {catPacked}/{catItems.length}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
