// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, MessageSquare, Compass, CheckSquare, BarChart3, Image, Settings, Sparkles, Plus, User, Menu, X, LogOut, Camera } from 'lucide-react';
import { mockAuth } from '../services/supabaseClient';
import type { Trip } from '../types';
import { TripCard } from '../components/TripCard';
import { WeatherWidget } from '../components/WeatherWidget';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  activeTrip: Trip | null;
  onTripChange: (trip: Trip | null) => void;
  trips: Trip[];
}

export const DashboardLayout: React.FC<SidebarProps & { children: React.ReactNode }> = ({
  onTabChange,
  activeTrip,
  onTripChange,
  trips,
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = mockAuth.getSession();
  const user = session.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Derive active tab from current route pathname
  const path = location.pathname;
  let activeTab = 'home';
  if (path.startsWith('/chat')) activeTab = 'chat';
  else if (path.startsWith('/photo')) activeTab = 'photo';
  else if (path.startsWith('/trips')) activeTab = 'trips';
  else if (path.startsWith('/discover')) activeTab = 'discover';
  else if (path.startsWith('/memories')) activeTab = 'memories';
  else if (path.startsWith('/settings')) activeTab = 'settings';
  else if (path.startsWith('/dashboard')) activeTab = 'home';

  const handleNavClick = (tabId: string, isMobile = false) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    if (isMobile) {
      setMobileMenuOpen(false);
    }
    if (tabId === 'packing' || tabId === 'budget') {
      if (activeTrip) {
        navigate(`/trips/${activeTrip.id}?tab=${tabId}`);
      } else {
        navigate('/trips');
      }
    } else {
      navigate(`/${tabId === 'home' ? 'dashboard' : tabId}`);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home className="h-4.5 w-4.5" /> },
    { id: 'trips', label: 'My Trips', icon: <Calendar className="h-4.5 w-4.5" /> },
    { id: 'chat', label: 'AI Chat', icon: <MessageSquare className="h-4.5 w-4.5" /> },
    { id: 'photo', label: 'Photo AI', icon: <Camera className="h-4.5 w-4.5" /> },
    { id: 'discover', label: 'Discover', icon: <Compass className="h-4.5 w-4.5" /> },
    { id: 'packing', label: 'Packing', icon: <CheckSquare className="h-4.5 w-4.5" /> },
    { id: 'budget', label: 'Budget', icon: <BarChart3 className="h-4.5 w-4.5" /> },
    { id: 'memories', label: 'Memories', icon: <Image className="h-4.5 w-4.5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4.5 w-4.5" /> },
  ];

  const handleLogout = () => {
    mockAuth.logout();
    navigate('/');
  };

  return (
    <div className="bg-brand-bg text-brand-dark min-h-screen flex flex-col md:flex-row relative">
      {/* Mobile Top Navigation */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-brand-muted/10 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
          <span className="text-lg font-black text-brand-primary tracking-tight font-display">🧠 TripMind</span>
        </div>
        <div className="flex items-center gap-2">
          {user.user_metadata.is_pro && (
            <span className="text-[9px] font-black text-white bg-brand-accent px-2 py-0.5 rounded-full tracking-wider uppercase">Pro</span>
          )}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-brand-dark"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Persistent Left Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white border-r border-brand-muted/10 h-screen sticky top-0 p-5 z-30">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 border-b border-brand-muted/5 pb-4">
            <span className="text-xl font-extrabold text-brand-primary tracking-tight font-display">🧠 TripMind</span>
            {user.user_metadata.is_pro && (
              <span className="text-[9px] font-black text-white bg-gradient-to-r from-brand-accent to-amber-500 px-2 py-0.5 rounded-full tracking-wider">PRO</span>
            )}
          </div>

          {/* Active Trip Selector Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-brand-muted uppercase tracking-widest block">Active Trip Context</label>
            <select
              value={activeTrip?.id || ''}
              onChange={(e) => {
                const selected = trips.find(t => t.id === e.target.value) || null;
                onTripChange(selected);
              }}
              className="w-full bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-bold border border-brand-muted/15 rounded-btn focus:outline-none focus:border-brand-primary"
            >
              <option value="">No Active Trip Selected</option>
              {trips.map(trip => (
                <option key={trip.id} value={trip.id}>
                  ✈️ {trip.title}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-btn text-xs font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-brand-primary text-white shadow-sm' 
                    : 'text-brand-muted hover:text-brand-dark hover:bg-brand-bg'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer profile widget */}
        <div className="border-t border-brand-muted/10 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img src={user.user_metadata.avatar} alt="Avatar" className="h-8 w-8 rounded-full border border-brand-muted/10 bg-brand-bg" />
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-brand-dark truncate leading-tight">{user.user_metadata.name}</h5>
              <span className="text-[10px] text-brand-muted truncate block">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded-full hover:bg-red-50 text-brand-muted hover:text-brand-danger transition-all"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-brand-dark/50 backdrop-blur-sm">
          <aside className="w-64 bg-white h-full p-5 flex flex-col justify-between animate-slide-in shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-brand-muted/10 pb-4">
                <span className="text-lg font-black text-brand-primary tracking-tight font-display">🧠 TripMind Menu</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id, true)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-bold transition-all ${
                      activeTab === item.id 
                        ? 'bg-brand-primary text-white shadow-sm' 
                        : 'text-brand-muted hover:text-brand-dark hover:bg-brand-bg'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full py-2 bg-red-50 text-brand-danger hover:bg-red-100 font-bold rounded-btn text-xs flex items-center justify-center gap-1 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="flex-1 p-4 sm:p-6 pb-20 md:pb-6 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>

      {/* Mobile Sticky Bottom Tab Bar (as per mobile-first user experience guidelines) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-muted/10 py-1.5 px-4 flex items-center justify-between z-40 shadow-lg">
        {[
          { id: 'home', label: 'Home', icon: <Home className="h-5 w-5" />, route: '/dashboard' },
          { id: 'chat', label: 'Chat', icon: <MessageSquare className="h-5 w-5" />, route: '/chat' },
          { id: 'photo', label: 'Camera', icon: <Camera className="h-6 w-6" />, route: '/photo' },
          { id: 'trips', label: 'Trips', icon: <Calendar className="h-5 w-5" />, route: '/trips' },
          { id: 'settings', label: 'Profile', icon: <User className="h-5 w-5" />, route: '/settings' },
        ].map(b => (
          <button
            key={b.id}
            onClick={() => {
              if (onTabChange) {
                onTabChange(b.id);
              }
              navigate(b.route);
            }}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
              activeTab === b.id ? 'text-brand-primary' : 'text-brand-muted'
            }`}
          >
            {b.icon}
            <span>{b.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// Home Tab Main Page content
export const DashboardHomeTab: React.FC<{
  trips: Trip[];
  activeTrip: Trip | null;
  onSelectTrip: (tripId: string) => void;
  onQuickTab: (tab: string) => void;
}> = ({ trips, activeTrip, onSelectTrip, onQuickTab }) => {
  const navigate = useNavigate();
  const session = mockAuth.getSession();
  const user = session.user;

  // Curate mock recommended destinations based on travel style
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    // Generate simple customized suggestions
    const travelDna = user?.user_metadata?.travel_dna?.toLowerCase() || '';
    if (travelDna.includes('culinary') || travelDna.includes('food')) {
      setRecommendations([
        { city: 'Oaxaca, Mexico', vibe: 'Epicenter of Mole and Mezcal', cover: 'https://images.unsplash.com/photo-1512813583145-acaa5400ae3e?auto=format&fit=crop&w=300&q=80' },
        { city: 'Lyon, France', vibe: 'Gastronomical capital with historic traboules', cover: 'https://images.unsplash.com/photo-1528659616231-10c71a3962d3?auto=format&fit=crop&w=300&q=80' }
      ]);
    } else {
      setRecommendations([
        { city: 'Santorini, Greece', vibe: 'Clifftop sunset views & Aegean waves', cover: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=300&q=80' },
        { city: 'Reykjavik, Iceland', vibe: 'Geothermal hot springs & volcanic trails', cover: 'https://images.unsplash.com/photo-1504829857797-ddff28127792?auto=format&fit=crop&w=300&q=80' }
      ]);
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* User Greeting Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-primary to-brand-primary/85 text-white p-6 rounded-card shadow-sm border border-brand-primary/10">
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black font-display">
            Good morning, {user?.user_metadata?.name || 'Traveler'}. Ready to plan something?
          </h2>
          <p className="text-xs text-white/80 max-w-xl leading-relaxed">
            Your travel brain is active. You have {trips.length} active destinations plotted on your roadmap.
          </p>
        </div>
        <button 
          onClick={() => navigate('/trips/new')}
          className="self-start sm:self-center px-4 py-2.5 bg-brand-accent hover:bg-brand-accent/95 text-white font-bold rounded-btn text-xs flex items-center gap-1.5 shadow-md transition-all whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>New Trip Draft</span>
        </button>
      </div>

      {/* Quick Actions Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button 
          onClick={() => { onQuickTab('chat'); navigate('/chat'); }}
          className="p-4 bg-white border border-brand-muted/10 rounded-card text-left hover:border-brand-primary/45 transition-all shadow-sm flex items-start gap-3.5 group"
        >
          <div className="h-10 w-10 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary text-lg">💬</div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-dark group-hover:text-brand-primary transition-colors">Chat with AI Brain</h4>
            <p className="text-[11px] text-brand-muted mt-0.5">Stream live itineraries and logistics</p>
          </div>
        </button>

        <button 
          onClick={() => { onQuickTab('photo'); navigate('/photo'); }}
          className="p-4 bg-white border border-brand-muted/10 rounded-card text-left hover:border-brand-primary/45 transition-all shadow-sm flex items-start gap-3.5 group"
        >
          <div className="h-10 w-10 bg-brand-accent/5 rounded-full flex items-center justify-center text-brand-accent text-lg">📸</div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-dark group-hover:text-brand-accent transition-colors">Camera Visual AI</h4>
            <p className="text-[11px] text-brand-muted mt-0.5">Upload photos of landmarks or menus</p>
          </div>
        </button>

        <button 
          onClick={() => { onQuickTab('discover'); navigate('/discover'); }}
          className="p-4 bg-white border border-brand-muted/10 rounded-card text-left hover:border-brand-primary/45 transition-all shadow-sm flex items-start gap-3.5 group"
        >
          <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-lg">🌍</div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-dark group-hover:text-emerald-700 transition-colors">Discover Vibe Feed</h4>
            <p className="text-[11px] text-brand-muted mt-0.5">Gemini curated hidden gems</p>
          </div>
        </button>
      </div>

      {/* Main Grid Content - Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Trips scroll & recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Trips */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-brand-dark uppercase tracking-wider">Active & Upcoming Trips</h3>
            {trips.length === 0 ? (
              <div className="p-8 text-center bg-white border border-brand-muted/10 rounded-card shadow-sm text-xs text-brand-muted">
                No upcoming trips planned. Let's create your first draft itinerary!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trips.map(trip => (
                  <TripCard 
                    key={trip.id} 
                    trip={trip} 
                    onSelect={(id) => {
                      onSelectTrip(trip.id);
                      navigate(`/trips/${id}`);
                    }} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Travel DNA Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center gap-1 text-sm font-bold text-brand-primary uppercase tracking-wider">
              <Sparkles className="h-4.5 w-4.5 text-brand-accent animate-pulse" />
              <span>Recommended Destinations for You</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((rec, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(`/discover`)}
                  className="bg-white border border-brand-muted/10 rounded-card overflow-hidden hover:shadow shadow-sm transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-32 bg-brand-muted/10 overflow-hidden relative">
                    <img src={rec.cover} alt={rec.city} className="w-full h-full object-cover group-hover:scale-103 transition-all" />
                    <div className="absolute inset-0 bg-brand-dark/30"></div>
                    <span className="absolute bottom-2 left-2 text-xs font-bold text-white drop-shadow">{rec.city}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] text-brand-muted font-bold uppercase tracking-wider">Vibe Profile</p>
                    <p className="text-xs text-brand-dark mt-0.5 leading-relaxed italic">"{rec.vibe}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 col: Live Widgets & weather */}
        <div className="space-y-6">
          {/* Weather forecasting Widget */}
          {activeTrip && (
            <WeatherWidget destination={activeTrip.destination || activeTrip.destinations[0] || 'Kyoto'} />
          )}

          {/* Recent AI Chats */}
          <div className="bg-white border border-brand-muted/10 rounded-card p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">Recent AI Insights</h4>
            <div className="space-y-2">
              {[
                { title: 'Visa entry guide to Japan', preview: 'Verify with the consulate before travel...', time: '2 hours ago' },
                { title: 'Kyoto packing list checklist', preview: 'Umbrella and waterproof trail runners...', time: '1 day ago' },
                { title: 'Best ramen spots in Gion', preview: 'Menya Inoichi, arrive 30 mins before...', time: '3 days ago' }
              ].map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => { onQuickTab('chat'); navigate('/chat'); }}
                  className="p-2.5 hover:bg-brand-bg rounded-lg border border-brand-muted/5 transition-all cursor-pointer flex justify-between items-start gap-2"
                >
                  <div>
                    <h5 className="font-bold text-[11px] text-brand-dark">{c.title}</h5>
                    <p className="text-[10px] text-brand-muted line-clamp-1 mt-0.5">{c.preview}</p>
                  </div>
                  <span className="text-[9px] text-brand-muted/70 font-mono whitespace-nowrap mt-0.5">{c.time}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => { onQuickTab('chat'); navigate('/chat'); }}
              className="w-full text-center text-[10px] font-bold text-brand-primary hover:underline block pt-2 border-t border-brand-muted/5"
            >
              Open Active Conversations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
