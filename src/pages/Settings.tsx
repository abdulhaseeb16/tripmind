// src/pages/Settings.tsx
import React, { useState } from 'react';
import { mockAuth } from '../services/supabaseClient';
import { Settings as SettingsIcon, Shield, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const session = mockAuth.getSession();
  const user = session.user;

  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [homeCity, setHomeCity] = useState(user?.user_metadata?.home_city || 'London');
  const [preferredCurrency, setPreferredCurrency] = useState(user?.user_metadata?.preferred_currency || 'USD');
  const [dnaText, setDnaText] = useState(user?.user_metadata?.travel_dna || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    mockAuth.updateMetadata({
      name,
      home_city: homeCity,
      preferred_currency: preferredCurrency,
      travel_dna: dnaText
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClearMemory = () => {
    if (window.confirm("Are you sure you want to reset Gemini AI's memory of your travel style and preferences?")) {
      setDnaText('Flexible explorer, open to all budgets and destination suggestions.');
      mockAuth.updateMetadata({
        travel_dna: 'Flexible explorer, open to all budgets and destination suggestions.'
      });
      alert('AI Travel DNA cache successfully cleared!');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-brand-dark font-display flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-brand-primary" />
          <span>Profile Configuration Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
          Manage currency symbols, home airport triggers, GDPR options, and Gemini's active memory logs.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-brand-muted/10 p-6 rounded-card shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-brand-bg px-3 py-2 text-xs font-semibold border border-brand-muted/20 rounded-btn focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Home Location City</label>
            <input 
              type="text" 
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              required
              className="w-full bg-brand-bg px-3 py-2 text-xs font-semibold border border-brand-muted/20 rounded-btn focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Default Currency Symbol</label>
            <select
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value)}
              className="w-full bg-brand-bg px-2.5 py-2 text-xs font-bold border border-brand-muted/20 rounded-btn"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Pro Account Status</label>
            <div className="bg-brand-bg/50 px-3 py-2 border border-brand-muted/10 rounded-btn text-xs font-bold text-brand-primary flex items-center justify-between">
              <span>{user.user_metadata.is_pro ? 'PRO SUBSCRIPTION ACTIVE' : 'FREE ACCOUNT'}</span>
              {!user.user_metadata.is_pro && (
                <button 
                  type="button" 
                  onClick={() => { mockAuth.updateMetadata({ is_pro: true }); alert('Upgraded to Pro!'); window.location.reload(); }}
                  className="text-[10px] text-white bg-brand-accent px-2 py-0.5 rounded font-black uppercase"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Travel DNA text */}
        <div>
          <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">AI Travel DNA Profile</label>
          <textarea
            value={dnaText}
            onChange={(e) => setDnaText(e.target.value)}
            className="w-full min-h-[80px] p-3 bg-brand-bg text-xs border border-brand-muted/20 rounded-btn font-semibold italic focus:outline-none"
          />
          <span className="text-[10px] text-brand-muted leading-relaxed block mt-1">
            This DNA block is injected into the Gemini API system instructions context parameters to tailor itineraries to your style.
          </span>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3 pt-3 border-t border-brand-muted/10">
          <button 
            type="submit" 
            className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold rounded-btn shadow transition-all flex items-center gap-1.5"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Saved Settings!</span>
              </>
            ) : (
              <span>Save Configurations</span>
            )}
          </button>

          <button 
            type="button" 
            onClick={handleClearMemory}
            className="px-4 py-2.5 border border-brand-muted/20 hover:bg-red-50 hover:text-brand-danger text-brand-dark text-xs font-bold rounded-btn transition-all flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset AI Memory</span>
          </button>
        </div>
      </form>

      {/* GDPR Data exporter */}
      <div className="bg-white border border-brand-muted/10 p-5 rounded-card shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="h-4.5 w-4.5 text-brand-primary" />
            <span>GDPR Compliance & Security</span>
          </h4>
          <p className="text-[10px] text-brand-muted mt-0.5">Download full database snapshots or request account erasure</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button 
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", "tripmind_user_data.json");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="py-1.5 px-3 bg-brand-bg hover:bg-brand-primary/5 text-brand-dark border border-brand-muted/20 font-bold rounded-btn"
          >
            Export All Data JSON
          </button>
          <button 
            onClick={() => {
              if (window.confirm("WARNING: Are you sure you want to permanently erase your profile and all trip database logs?")) {
                localStorage.clear();
                alert("Account deleted.");
                window.location.href = "/";
              }
            }}
            className="py-1.5 px-3 bg-red-50 text-brand-danger border border-red-100 hover:bg-red-100 font-bold rounded-btn flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Erase Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
