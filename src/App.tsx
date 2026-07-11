// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPages } from './pages/AuthPages';
import { DashboardLayout, DashboardHomeTab } from './pages/Dashboard';
import { AIChat } from './pages/AIChat';
import { PhotoAI } from './pages/PhotoAI';
import { MyTrips } from './pages/MyTrips';
import { TripDetails } from './pages/TripDetails';
import { Discover } from './pages/Discover';
import { Memories } from './pages/Memories';
import { Settings } from './pages/Settings';
import { TestAI } from './pages/TestAI';

import { useTripStore } from './stores/tripStore';

function App() {
  const { trips, activeTrip, setActiveTrip, fetchTrips } = useTripStore();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const refreshTripsList = () => {
    fetchTrips();
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication & Onboarding Quiz Routes */}
        <Route path="/login" element={<AuthPages />} />
        <Route path="/signup" element={<AuthPages />} />

        {/* Authenticated Dashboard Sub-routes */}
        <Route 
          path="/dashboard" 
          element={
            <DashboardLayout 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              activeTrip={activeTrip} 
              onTripChange={setActiveTrip}
              trips={trips}
            >
              <DashboardHomeTab 
                trips={trips} 
                activeTrip={activeTrip}
                onSelectTrip={(tripId) => setActiveTrip(trips.find(t => t.id === tripId) || null)}
                onQuickTab={setActiveTab}
              />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/chat" 
          element={
            <DashboardLayout 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              activeTrip={activeTrip} 
              onTripChange={setActiveTrip}
              trips={trips}
            >
              <AIChat activeTrip={activeTrip} />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/photo" 
          element={
            <DashboardLayout 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              activeTrip={activeTrip} 
              onTripChange={setActiveTrip}
              trips={trips}
            >
              <PhotoAI activeTrip={activeTrip} />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/trips" 
          element={
            <DashboardLayout 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              activeTrip={activeTrip} 
              onTripChange={setActiveTrip}
              trips={trips}
            >
              <MyTrips 
                trips={trips} 
                onRefreshTrips={refreshTripsList} 
                onSelectTrip={(tripId) => setActiveTrip(trips.find(t => t.id === tripId) || null)} 
              />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/trips/:id" 
          element={
            <DashboardLayout 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              activeTrip={activeTrip} 
              onTripChange={setActiveTrip}
              trips={trips}
            >
              <TripDetails onRefreshTrips={refreshTripsList} />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/discover" 
          element={
            <DashboardLayout 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              activeTrip={activeTrip} 
              onTripChange={setActiveTrip}
              trips={trips}
            >
              <Discover />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/memories" 
          element={
            <DashboardLayout 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              activeTrip={activeTrip} 
              onTripChange={setActiveTrip}
              trips={trips}
            >
              <Memories />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <DashboardLayout 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              activeTrip={activeTrip} 
              onTripChange={setActiveTrip}
              trips={trips}
            >
              <Settings />
            </DashboardLayout>
          } 
        />

        <Route path="/test-ai" element={<TestAI />} />

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
