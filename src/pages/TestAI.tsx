// src/pages/TestAI.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { streamCompletion, buildSystemPrompt } from '../services/geminiService';
import { mockAiService } from '../services/mockAiService';
import { RefreshCw, Play, ShieldAlert, Sparkles, Home } from 'lucide-react';

export const TestAI: React.FC = () => {
  const navigate = useNavigate();
  const { useLiveAi, toggleAiMode } = useUIStore();
  const { profile } = useAuthStore();
  
  const [prompt, setPrompt] = useState('Suggest a 3-day itinerary for Kyoto, Japan.');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setOutput('');
    setError('');

    try {
      if (useLiveAi) {
        // Live Mode (using edge function proxy)
        const sysPrompt = buildSystemPrompt(
          profile,
          null,
          "Generate a highly specific travel overview. Stream it back."
        );
        await streamCompletion(
          sysPrompt,
          [{ role: 'user', content: prompt }],
          (token) => {
            setOutput(prev => prev + token);
          }
        );
      } else {
        // Mock Mode
        await mockAiService.streamChat(prompt, (token) => {
          setOutput(prev => prev + token);
        });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during streaming.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-bg text-brand-dark min-h-screen p-4 sm:p-8 flex flex-col justify-between">
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-muted/15 pb-4">
          <h2 className="text-xl font-black text-brand-primary flex items-center gap-2 font-display">
            <span>🧠</span> TripMind AI Test Ground
          </h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-white border border-brand-muted/20 hover:bg-brand-bg text-brand-dark rounded-btn shadow-sm transition-all"
            title="Go to Dashboard"
          >
            <Home className="h-4 w-4" />
          </button>
        </div>

        {/* Toggle Panel */}
        <div className="p-4 bg-white border border-brand-muted/10 rounded-card shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-brand-dark block">AI Execution Path</span>
              <span className="text-[10px] text-brand-muted block">Choose between mock simulations and live proxy endpoints.</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${!useLiveAi ? 'text-brand-primary' : 'text-brand-muted'}`}>Mock Mode</span>
              <button 
                type="button" 
                onClick={toggleAiMode}
                className={`h-6 w-11 rounded-full px-0.5 flex items-center transition-all ${
                  useLiveAi ? 'bg-brand-accent' : 'bg-brand-primary'
                }`}
              >
                <div className={`h-5 w-5 bg-white rounded-full shadow transition-transform ${useLiveAi ? 'translate-x-5' : ''}`}></div>
              </button>
              <span className={`text-xs font-bold ${useLiveAi ? 'text-brand-accent font-black' : 'text-brand-muted'}`}>Live Proxy</span>
            </div>
          </div>

          {useLiveAi && (
            <div className="p-2.5 bg-amber-50 border border-amber-100 text-amber-800 rounded-lg text-[10px] font-medium flex items-start gap-1.5 leading-relaxed">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Make sure your local Vite environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are set in a `.env` file, and your Deno Supabase Edge Function has `GEMINI_API_KEY` set.
              </span>
            </div>
          )}
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handleTest} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Enter Test Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              rows={3}
              className="w-full bg-white px-3 py-2 text-xs border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-btn text-xs shadow flex items-center justify-center gap-1.5 transition-all"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{loading ? 'Streaming tokens...' : 'Send Test request'}</span>
          </button>
        </form>

        {/* Error panel */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-brand-danger text-xs font-semibold rounded">
            ⚠️ {error}
          </div>
        )}

        {/* Stream Box */}
        {(loading || output) && (
          <div className="p-4 bg-white border border-brand-primary/10 rounded-card relative shadow-inner">
            <div className="absolute top-3 right-4 flex items-center gap-1 text-[9px] font-bold text-brand-accent uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              <span>Streaming Output</span>
            </div>
            <div className="text-xs text-brand-dark leading-relaxed font-mono whitespace-pre-wrap pt-2">
              {output || "Waiting for stream connection..."}
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[10px] text-brand-muted pt-6">
        Exit Criteria: verify streamed tokens render token-by-token with no keys visible in network headers.
      </div>
    </div>
  );
};
