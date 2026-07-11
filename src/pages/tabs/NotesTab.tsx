// src/pages/tabs/NotesTab.tsx
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import type { Trip } from '../../types';

interface NotesTabProps {
  trip: Trip;
  notes: string;
  onSaveNotes: (notes: string) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  trip,
  notes,
  onSaveNotes
}) => {
  console.log("Notes active trip:", trip.id);
  const [text, setText] = useState(notes);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(notes);
  }, [notes]);

  const handleSave = () => {
    setSaving(true);
    onSaveNotes(text);
    setTimeout(() => setSaving(false), 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Editor Panel */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-muted/10 pb-2">
          <div>
            <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">Markdown Editor Log</h4>
            <p className="text-[10px] text-brand-muted">Write check-in vouchers, transport timetables, or journal outlines.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="py-1.5 px-3 bg-brand-primary text-white hover:bg-brand-primary/95 text-xs font-bold rounded-btn flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Saving...' : 'Save Diary'}</span>
          </button>
        </div>

        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="## Custom Trip Notes...&#10;Write check-in vouchers, transport timetables, or journal outlines."
          rows={14}
          className="w-full bg-white p-4 text-xs font-mono border border-brand-muted/20 rounded-card focus:outline-none focus:border-brand-primary leading-relaxed shadow-inner"
        />
      </div>

      {/* Right panel: Markdown render helper */}
      <div className="bg-white border border-brand-muted/10 rounded-card p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">Editor Guide</h4>
        <div className="text-xs text-brand-muted space-y-3 leading-relaxed">
          <p>This editor supports basic Markdown syntax:</p>
          <div className="space-y-1 font-mono text-[10px] bg-brand-bg p-2.5 rounded border border-brand-muted/10">
            <div># Header Title</div>
            <div>## Subtitle</div>
            <div>**Bold text**</div>
            <div>* Bullet item</div>
          </div>
          <p>Your notes are cached locally for offline reads.</p>
        </div>
      </div>
    </div>
  );
};
