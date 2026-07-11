// src/pages/LandingPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Check, Sparkles, Send } from 'lucide-react';
import { streamCompletion } from '../services/geminiService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [demoInput, setDemoInput] = useState('');
  const [demoOutput, setDemoOutput] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [newsEmail, setNewsEmail] = useState('');
  const [newsSubmitted, setNewsSubmitted] = useState(false);

  // Auto-scroll to demo section
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput.trim() || isDemoLoading) return;
    setIsDemoLoading(true);
    setDemoOutput('');

    try {
      await streamCompletion(
        demoInput.trim(),
        "You are TripMind AI. Generate a concise, highly specific 3-sentence travel brief. Include one restaurant recommendation, one hidden gem landmark, and one local tip. Keep it extremely punchy.",
        (token) => {
          setDemoOutput(prev => prev + token);
        }
      );
    } catch (err) {
      setDemoOutput("Couldn't connect to the AI engine. Check your connection.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  const runDemoPrompt = (prompt: string) => {
    setDemoInput(prompt);
    // Submit with a slight delay
    setTimeout(() => {
      const form = document.getElementById('demo-form') as HTMLFormElement;
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  return (
    <div className="bg-brand-bg text-brand-dark min-h-screen font-sans">
      {/* Header bar */}
      <header className="sticky top-0 z-50 glass border-b border-brand-muted/10 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-brand-primary tracking-tight flex items-center gap-1.5 font-display">
            <span>🧠</span> TripMind
          </span>
          <span className="text-[10px] font-bold text-white bg-brand-accent px-2 py-0.5 rounded-full uppercase tracking-wider">AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-xs sm:text-sm font-bold text-brand-primary hover:text-brand-accent transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="text-xs sm:text-sm font-bold bg-brand-primary hover:bg-brand-primary/95 text-white px-4 py-2 rounded-btn shadow-sm transition-all"
          >
            Plan Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden">
        {/* Parallax collage background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-44 h-44 rounded-card overflow-hidden rotate-6 animate-float">
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80" alt="Beach" className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-20 right-10 w-48 h-48 rounded-card overflow-hidden -rotate-6 animate-float" style={{ animationDelay: '1.5s' }}>
            <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80" alt="Temples" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-10 left-20 w-40 h-40 rounded-card overflow-hidden -rotate-3 animate-float" style={{ animationDelay: '3s' }}>
            <img src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=300&q=80" alt="Amalfi" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-20 right-20 w-44 h-44 rounded-card overflow-hidden rotate-12 animate-float" style={{ animationDelay: '0.5s' }}>
            <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=300&q=80" alt="Boats" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl space-y-6">
          <span className="inline-block px-3 py-1 bg-brand-primary/5 text-brand-primary border border-brand-primary/10 rounded-full text-xs font-bold uppercase tracking-widest">
            ✨ Introducing TripMind 2.0
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-brand-dark tracking-tight leading-none font-display">
            Your AI travel brain.
          </h1>
          <p className="text-base sm:text-xl text-brand-muted max-w-2xl mx-auto leading-relaxed">
            Plan trips, decode places, pack smarter — all with one snap or message. One app replacing your guidebook, flight tracker, and planner.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-accent hover:bg-brand-accent/95 text-white rounded-btn text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              Get started free
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            <button 
              onClick={() => scrollToSection('demo')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-brand-muted/20 text-brand-dark rounded-btn text-sm font-bold shadow-sm hover:bg-brand-bg transition-all"
            >
              See how it works
            </button>
          </div>

          {/* Simulated App UI Phone mockup */}
          <div className="pt-12 max-w-sm mx-auto animate-float">
            <div className="border-[8px] border-brand-dark rounded-[36px] bg-brand-bg shadow-2xl overflow-hidden aspect-[9/18]">
              {/* Phone Header */}
              <div className="bg-brand-primary p-3 pt-5 text-white flex items-center justify-between">
                <span className="text-[10px] font-bold">🧠 TripMind App</span>
                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded">Kyoto Trip</span>
              </div>
              {/* Phone Thread */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-end text-left min-h-[300px]">
                <div className="bg-brand-primary text-white p-2.5 rounded-card rounded-tr-none text-[11px] self-end max-w-[85%]">
                  "Give me a 3-day food trip in Tokyo."
                </div>
                <div className="bg-white border border-brand-muted/10 p-2.5 rounded-card rounded-tl-none text-[11px] self-start max-w-[85%] shadow-sm">
                  <div className="font-bold text-brand-accent text-[9px] tracking-wider uppercase mb-1">🧠 TripMind AI</div>
                  <p className="leading-relaxed">
                    Day 1: Sushi breakfast at Tsukiji, explore Shinjuku gardens, and finish with Golden Gai ramen. 🍜
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Strip */}
      <section id="demo" className="bg-white border-y border-brand-muted/10 py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark font-display">Test Drive Your Travel Brain</h2>
            <p className="text-xs sm:text-sm text-brand-muted mt-2">Ask a question below to see Gemini generate a travel brief instantly.</p>
          </div>

          <form id="demo-form" onSubmit={handleDemoSubmit} className="space-y-4">
            <div className="flex bg-brand-bg rounded-card border border-brand-muted/15 p-2 focus-within:border-brand-primary transition-all">
              <input 
                type="text" 
                placeholder="Try: 3 days in London for art lovers, or best pizza near Colosseum..."
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-brand-dark focus:outline-none focus:ring-0 min-w-0"
              />
              <button 
                type="submit"
                disabled={isDemoLoading}
                className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/95 text-white font-bold rounded-btn text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Ask AI</span>
              </button>
            </div>

            {/* Clickable Quick Prompts */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button 
                type="button"
                onClick={() => runDemoPrompt("5 days in Kyoto for a solo foodie")}
                className="text-[11px] font-bold text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 border border-brand-primary/10 px-3 py-1.5 rounded-full transition-all"
              >
                🍱 5 days in Kyoto for a solo foodie
              </button>
              <button 
                type="button"
                onClick={() => runDemoPrompt("What's near Santorini airport?")}
                className="text-[11px] font-bold text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 border border-brand-primary/10 px-3 py-1.5 rounded-full transition-all"
              >
                🇬🇷 What's near Santorini airport?
              </button>
              <button 
                type="button"
                onClick={() => runDemoPrompt("Packing list for a Patagonia trek")}
                className="text-[11px] font-bold text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 border border-brand-primary/10 px-3 py-1.5 rounded-full transition-all"
              >
                🥾 Packing list for a Patagonia trek
              </button>
            </div>
          </form>

          {/* Streaming Result Box */}
          {(isDemoLoading || demoOutput) && (
            <div className="p-4 bg-brand-bg rounded-card border border-brand-primary/10 relative animate-fade-in shadow-inner">
              <div className="absolute top-3 right-4 flex items-center gap-1 text-[9px] font-bold text-brand-accent uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                <span>AI Stream</span>
              </div>
              <div className="text-xs sm:text-sm text-brand-dark leading-relaxed pr-10 whitespace-pre-line font-medium">
                {demoOutput || "Thinking..."}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark font-display">One Brain. Every Feature.</h2>
          <p className="text-sm sm:text-base text-brand-muted max-w-xl mx-auto">Replacing fragmented travel apps with a unified system powered by Gemini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-brand-muted/10 p-6 rounded-card hover:shadow-md transition-shadow space-y-3">
            <span className="text-3xl">📸</span>
            <h3 className="text-base font-bold text-brand-dark">Snap a place</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Take a photo of a restaurant menu, landmark, or handwritten map. Get instant OCR translations and history analysis.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-white border border-brand-muted/10 p-6 rounded-card hover:shadow-md transition-shadow space-y-3">
            <span className="text-3xl">🗓️</span>
            <h3 className="text-base font-bold text-brand-dark">Vibe to itinerary</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Input a short vibe like "3 days slow, local coffee & antique stores". Instantly generates a customized map route.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-white border border-brand-muted/10 p-6 rounded-card hover:shadow-md transition-shadow space-y-3">
            <span className="text-3xl">🧳</span>
            <h3 className="text-base font-bold text-brand-dark">Smart packing</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Auto-generates custom packing lists based on weather conditions (from Open-Meteo) and your travel DNA.
            </p>
          </div>
          {/* Card 4 */}
          <div className="bg-white border border-brand-muted/10 p-6 rounded-card hover:shadow-md transition-shadow space-y-3">
            <span className="text-3xl">💰</span>
            <h3 className="text-base font-bold text-brand-dark">Budget tracker</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Log expenses in multiple currencies. Let AI organize spends, scan receipts, and predict budget trends.
            </p>
          </div>
          {/* Card 5 */}
          <div className="bg-white border border-brand-muted/10 p-6 rounded-card hover:shadow-md transition-shadow space-y-3">
            <span className="text-3xl">🌍</span>
            <h3 className="text-base font-bold text-brand-dark">Offline notes</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              No signal? No problem. Itineraries, bookings, and lists are fully cached in a service worker for offline view.
            </p>
          </div>
          {/* Card 6 */}
          <div className="bg-white border border-brand-muted/10 p-6 rounded-card hover:shadow-md transition-shadow space-y-3">
            <span className="text-3xl">🤝</span>
            <h3 className="text-base font-bold text-brand-dark">Trip sharing</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Invite friends by email, coordinate budgets, and vote on stops with real-time collaborative editing.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white border-y border-brand-muted/10 py-16 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <div className="flex justify-center text-amber-500 gap-1 mb-2">
              <Star className="h-5 w-5 fill-amber-500" />
              <Star className="h-5 w-5 fill-amber-500" />
              <Star className="h-5 w-5 fill-amber-500" />
              <Star className="h-5 w-5 fill-amber-500" />
              <Star className="h-5 w-5 fill-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-brand-dark">Loved by 50,000+ travellers worldwide</h3>
          </div>

          {/* Testimonial horizontal carousel */}
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {[
              { text: "TripMind completely replaced my spreadsheets. The AI budget alerts alone saved me $200 in Paris.", author: "Sarah L.", role: "Solo Explorer" },
              { text: "Snapped a photo of a chaotic menu in Tokyo, and Gemini immediately recommended exactly what to get. Magic.", author: "Haseeb A.", role: "Food Vlogger" },
              { text: "My family trip to Morocco was structured beautifully. The collaborative packing list made packing stress-free.", author: "Marcus K.", role: "Parent of 3" },
              { text: "We offline-saved the Rome itinerary. When cellular coverage failed in the Colosseum, we still had full maps.", author: "Elena R.", role: "Backpacker" },
              { text: "Pro tier pays for itself. The custom Travel DNA generated an itinerary that fit my pacing preferences perfectly.", author: "Tariq M.", role: "Digital Nomad" },
              { text: "Excellent customer service and prompt updates. Very premium editorial look and feel.", author: "Sophia V.", role: "Weekend Traveler" }
            ].map((t, idx) => (
              <div key={idx} className="flex-shrink-0 w-72 bg-brand-bg border border-brand-muted/10 p-5 rounded-card snap-center space-y-2.5">
                <p className="text-xs text-brand-dark leading-relaxed italic">"{t.text}"</p>
                <div>
                  <h5 className="text-xs font-bold text-brand-primary">{t.author}</h5>
                  <p className="text-[10px] text-brand-muted font-medium">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Logo strip */}
          <div className="border-t border-brand-muted/10 pt-8 text-center space-y-4">
            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">As seen in</p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-brand-muted font-bold text-sm tracking-wide">
              <span>Lonely Planet</span>
              <span>Condé Nast Traveller</span>
              <span>TechCrunch</span>
              <span>National Geographic</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 text-center max-w-5xl mx-auto space-y-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark font-display">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center mx-auto text-lg shadow-md">1</div>
            <h4 className="font-bold text-brand-dark text-base">Snap or describe</h4>
            <p className="text-xs text-brand-muted leading-relaxed">
              Upload documents, photos, or type a vibe in plain conversational English.
            </p>
          </div>
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center mx-auto text-lg shadow-md">2</div>
            <h4 className="font-bold text-brand-dark text-base">AI generates plan</h4>
            <p className="text-xs text-brand-muted leading-relaxed">
              Gemini visualizes timelines, packing requirements, budgets, and maps.
            </p>
          </div>
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center mx-auto text-lg shadow-md">3</div>
            <h4 className="font-bold text-brand-dark text-base">Save, share, go</h4>
            <p className="text-xs text-brand-muted leading-relaxed">
              Invite friends, download offline PDF receipts, and travel with peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white border-t border-brand-muted/10 py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-brand-dark font-display">Simple, Transparent Pricing</h2>
            <p className="text-xs sm:text-sm text-brand-muted">Try out the travel assistant free. Upgrade to Pro when you are ready to wander.</p>
            
            {/* Toggle */}
            <div className="flex items-center justify-center gap-3 pt-3">
              <span className={`text-xs font-bold ${!isAnnual ? 'text-brand-primary' : 'text-brand-muted'}`}>Monthly</span>
              <button 
                type="button"
                onClick={() => setIsAnnual(!isAnnual)}
                className="h-6 w-11 bg-brand-primary rounded-full relative flex items-center px-0.5 transition-all"
              >
                <div className={`h-5 w-5 bg-white rounded-full transition-transform shadow ${isAnnual ? 'translate-x-5' : ''}`}></div>
              </button>
              <span className={`text-xs font-bold ${isAnnual ? 'text-brand-primary' : 'text-brand-muted'}`}>
                Annually <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Free tier */}
            <div className="bg-brand-bg border border-brand-muted/10 p-8 rounded-card flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-lg font-bold text-brand-dark">Free Tier</h3>
                <p className="text-xs text-brand-muted mt-1">Basic assistant tools</p>
                <div className="mt-4 flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-black text-brand-dark">$0</span>
                  <span className="text-xs text-brand-muted">/ month</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-brand-dark/95">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-primary" /> 15 AI queries/month</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-primary" /> 2 active trips</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-primary" /> 1 packing list</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-primary" /> Basic budget list (no charts)</li>
                </ul>
              </div>
              <button 
                onClick={() => navigate('/signup')}
                className="w-full py-3 bg-white hover:bg-brand-bg border border-brand-muted/20 text-brand-dark font-bold rounded-btn text-xs shadow-sm transition-all"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro tier */}
            <div className="bg-brand-primary text-white p-8 rounded-card flex flex-col justify-between space-y-6 relative overflow-hidden border border-brand-primary shadow-xl">
              {/* Popular tag */}
              <div className="absolute top-0 right-0 bg-brand-accent text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                Best Value
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Pro Pass</h3>
                <p className="text-xs text-white/70 mt-1">Unlimited travel brain intelligence</p>
                <div className="mt-4 flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-black text-white">{isAnnual ? '$7.99' : '$9.99'}</span>
                  <span className="text-xs text-white/70">/ month</span>
                </div>
                <p className="text-[10px] text-white/50 mt-0.5">{isAnnual && "billed annually ($95.99/year)"}</p>
                <ul className="mt-6 space-y-2.5 text-xs text-white/95">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-accent" /> Unlimited AI queries</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-accent" /> Unlimited trips + packing lists</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-accent" /> AI trip optimization & day regeneration</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-accent" /> Export itineraries & journals to PDF</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-accent" /> Offline mode (fully cached maps)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-accent" /> Supabase Realtime group sharing</li>
                </ul>
              </div>
              <button 
                onClick={() => navigate('/signup?pro=true')}
                className="w-full py-3 bg-brand-accent hover:bg-brand-accent/95 text-white font-bold rounded-btn text-xs shadow-md transition-all uppercase tracking-wider"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="text-xl font-black text-white tracking-tight flex items-center gap-1 font-display">
              🧠 TripMind
            </span>
            <p className="text-xs text-brand-muted/70 leading-relaxed max-w-[200px]">
              AI-first companion that wraps intelligence around every phase of travel: dream, plan, pack, navigate, and reflect.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-4">Company</h5>
            <ul className="space-y-2 text-xs text-brand-muted/70">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-4">Legal</h5>
            <ul className="space-y-2 text-xs text-brand-muted/70">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GDPR Consent</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-4">Join Newsletter</h5>
            {!newsSubmitted ? (
              <form 
                onSubmit={(e) => { e.preventDefault(); setNewsSubmitted(true); }}
                className="flex rounded-btn overflow-hidden border border-white/10"
              >
                <input 
                  type="email" 
                  required
                  placeholder="Enter email"
                  value={newsEmail}
                  onChange={(e) => setNewsEmail(e.target.value)}
                  className="bg-white/5 text-xs text-white px-3 py-2 focus:outline-none min-w-0 flex-1"
                />
                <button type="submit" className="bg-brand-accent text-white px-3 text-xs font-bold hover:bg-brand-accent/90 transition-all">
                  Join
                </button>
              </form>
            ) : (
              <div className="text-xs text-green-400 bg-green-500/10 p-2.5 rounded border border-green-500/20 font-medium">
                🎉 Welcome email sent! Check your inbox.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted/50 gap-4">
          <span>© 2026 TripMind Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Twitter/X</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
