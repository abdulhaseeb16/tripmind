// src/pages/tabs/PackingTab.tsx
import React, { useState } from 'react';
import type { Trip, PackingItem as PackingItemType } from '../../types';
import { PackingItem } from '../../components/PackingItem';

interface PackingTabProps {
  trip: Trip;
  packing: PackingItemType[];
  onTogglePacking: (itemId: string) => void;
  onAddPacking: (name: string, category: string, tag: 'essential' | 'nice-to-have' | 'conditional') => void;
  onDeletePacking: (itemId: string) => void;
}

export const PackingTab: React.FC<PackingTabProps> = ({
  trip,
  packing,
  onTogglePacking,
  onAddPacking,
  onDeletePacking
}) => {
  console.log("Packing active trip:", trip.id);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Clothing');
  const [tag, setTag] = useState<'essential' | 'nice-to-have' | 'conditional'>('essential');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPacking(name.trim(), category, tag);
    setName('');
  };

  const packedCount = packing.filter(p => p.packed).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Left panel: item checklist list */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-muted/10 pb-2">
          <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">AI Generated Packing Checklist</h4>
          <span className="text-xs font-bold text-brand-primary">
            {packedCount} of {packing.length} packed
          </span>
        </div>

        <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
          {packing.length === 0 ? (
            <p className="text-xs text-brand-muted text-center py-8">No packing items found. Add custom items on the side panel.</p>
          ) : (
            packing.map(item => (
              <PackingItem 
                key={item.id} 
                // Typecast or adapt wrapper to support component's old structure
                item={{
                  id: item.id,
                  name: item.name,
                  category: item.category,
                  quantity: item.quantity,
                  tag: item.essential === 'essential' ? 'Essential' : item.essential === 'nice-to-have' ? 'Nice to have' : 'Conditional',
                  packed: item.packed,
                  note: item.reason
                } as any} 
                onToggle={() => onTogglePacking(item.id)}
                onDelete={() => onDeletePacking(item.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right panel: quick add */}
      <div className="space-y-6">
        <div className="bg-white border border-brand-muted/10 rounded-card p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">Add Custom Packing Item</h4>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input 
              type="text" 
              placeholder="Item name (e.g. Rain poncho)" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-brand-bg px-3 py-2 text-xs border border-brand-muted/20 rounded-btn"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold text-brand-muted uppercase block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-bold border border-brand-muted/20 rounded-btn"
                >
                  {['Clothing', 'Electronics', 'Documents & Money', 'Toiletries', 'Health & Meds', 'Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-brand-muted uppercase block mb-1">Importance</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value as any)}
                  className="w-full bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-bold border border-brand-muted/20 rounded-btn"
                >
                  <option value="essential">Essential</option>
                  <option value="nice-to-have">Nice to have</option>
                  <option value="conditional">Conditional</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-brand-primary text-white font-bold py-2 rounded-btn text-xs hover:bg-brand-primary/95 transition-all shadow-sm"
            >
              Add Item
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
