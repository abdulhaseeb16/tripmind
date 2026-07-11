// src/components/PackingItem.tsx
import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';
import type { PackingItem as PackingType } from '../services/supabaseClient';

interface PackingItemProps {
  item: PackingType;
  onToggle: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
}

export const PackingItem: React.FC<PackingItemProps> = ({ item, onToggle, onDelete }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Set tag pill colors
  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Essential':
        return 'text-red-700 bg-red-50 border-red-100';
      case 'Nice to have':
        return 'text-brand-primary bg-brand-primary/5 border-brand-primary/10';
      default:
        return 'text-brand-muted bg-brand-bg border-brand-muted/10';
    }
  };

  return (
    <div className={`flex items-center justify-between p-2.5 bg-white border border-brand-muted/5 rounded-lg shadow-sm hover:border-brand-primary/20 transition-all ${
      item.packed ? 'opacity-65' : ''
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        {/* Custom interactive checkbox */}
        <input 
          type="checkbox" 
          checked={item.packed} 
          onChange={() => onToggle(item.id)}
          className="h-4.5 w-4.5 rounded border-brand-muted/30 text-brand-primary focus:ring-brand-primary cursor-pointer transition-colors"
        />

        <div className="min-w-0">
          <p className={`text-xs sm:text-sm font-semibold text-brand-dark truncate ${
            item.packed ? 'line-through text-brand-muted' : ''
          }`}>
            {item.name} {item.quantity > 1 && <span className="text-[10px] font-bold text-brand-primary font-mono ml-1">x{item.quantity}</span>}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider bg-brand-bg px-1.5 py-0.2 rounded border border-brand-muted/5">
              {item.category}
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${getTagColor(item.tag)}`}>
              {item.tag}
            </span>
            {item.note && (
              <span className="text-[10px] text-brand-muted italic truncate max-w-[120px] sm:max-w-[200px]">
                ({item.note})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 relative">
        {/* Why this Tooltip trigger */}
        <button 
          onClick={() => setShowTooltip(!showTooltip)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="p-1 text-brand-muted hover:text-brand-primary transition-colors"
          title="AI Reasoning"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {showTooltip && (
          <div className="absolute right-0 bottom-7 bg-brand-dark text-white text-[11px] leading-relaxed p-2.5 rounded-lg shadow-lg max-w-[220px] z-50 animate-fade-in border border-white/10">
            <div className="flex items-center gap-1 font-bold text-brand-accent uppercase tracking-wider mb-1">
              <Info className="h-3.5 w-3.5" />
              <span>AI Packing Brain</span>
            </div>
            <span>
              {item.tag === 'Essential' 
                ? 'Required for basic trip activities, legal compliance, or personal safety. Invaluable for the duration.' 
                : 'Useful addition recommended by Gemini to enhance comfort or convenience during planned day stops.'}
            </span>
          </div>
        )}

        {onDelete && (
          <button 
            onClick={() => onDelete(item.id)}
            className="p-1 text-brand-muted hover:text-brand-danger transition-colors"
            title="Delete"
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
};

// Mini Trash Icon for reuse
const TrashIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
