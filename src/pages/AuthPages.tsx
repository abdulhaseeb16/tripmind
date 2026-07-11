// src/pages/AuthPages.tsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockAuth } from '../services/supabaseClient';
import { generateTravelDNA } from '../services/geminiService';
import { ArrowRight, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';

export const AuthPages: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSignUpDefault = window.location.pathname.includes('signup');
  const proParam = searchParams.get('pro') === 'true';

  const [isSignUp, setIsSignUp] = useState(isSignUpDefault);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  // Onboarding Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({
    budget: '',
    party: '',
    interests: [] as string[],
    pace: '',
    type: ''
  });
  const [dnaLoading, setDnaLoading] = useState(false);
  const [generatedDna, setGeneratedDna] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isSignUp) {
      if (!name) {
        setError('Please enter your name.');
        return;
      }
      // Simulate account registration
      mockAuth.login(email, name);
      if (proParam) {
        mockAuth.updateMetadata({ is_pro: true });
      }
      setShowQuiz(true); // Fire Travel DNA Onboarding Quiz
    } else {
      // Simulate Log In
      const session = mockAuth.getSession();
      if (session.user) {
        // Use existing user or login with email matching name
        const matchName = email.split('@')[0];
        mockAuth.login(email, matchName.charAt(0).toUpperCase() + matchName.slice(1));
      }
      navigate('/dashboard');
    }
  };

  const handleInterestSelect = (tag: string) => {
    setQuizAnswers(prev => {
      const interests = prev.interests.includes(tag)
        ? prev.interests.filter(t => t !== tag)
        : [...prev.interests, tag];
      return { ...prev, interests };
    });
  };

  const handleQuizNext = async () => {
    if (quizStep < 5) {
      setQuizStep(quizStep + 1);
    } else {
      // Generate Travel DNA via Gemini
      setDnaLoading(true);
      try {
        const dnaSummary = await generateTravelDNA(quizAnswers);
        setGeneratedDna(dnaSummary);
        mockAuth.updateMetadata({
          travel_dna: dnaSummary,
          preferred_currency: quizAnswers.budget === 'Luxury' ? 'USD' : 'EUR'
        });
        setQuizStep(6); // Final success layout
      } catch (err) {
        console.error(err);
      } finally {
        setDnaLoading(false);
      }
    }
  };

  const skipQuiz = () => {
    mockAuth.updateMetadata({
      travel_dna: 'Couples traveler who prefers mid-range budgets and balanced schedules.'
    });
    navigate('/dashboard');
  };

  return (
    <div className="bg-brand-bg text-brand-dark min-h-screen flex items-center justify-center p-4">
      {/* Auth Screen Card */}
      {!showQuiz ? (
        <div className="bg-white border border-brand-muted/10 p-6 sm:p-8 rounded-card shadow-lg max-w-md w-full space-y-6">
          <div className="text-center space-y-1">
            <span className="text-3xl">🧠</span>
            <h2 className="text-2xl font-black text-brand-dark font-display">
              {isSignUp ? 'Create your travel brain' : 'Log in to TripMind'}
            </h2>
            <p className="text-xs text-brand-muted">
              {isSignUp ? 'Set up your AI companion in minutes' : 'Access your itineraries and memories'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-brand-danger text-xs font-semibold rounded border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Haseeb"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-bg px-3 py-2 text-xs font-medium border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary"
                />
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-bg px-3 py-2 text-xs font-medium border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-brand-muted uppercase block mb-1">Password</label>
              <input 
                type="password" 
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-bg px-3 py-2 text-xs font-medium border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-btn text-xs sm:text-sm shadow flex items-center justify-center gap-1.5 transition-all"
            >
              <span>{isSignUp ? 'Sign Up' : 'Log In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Social Sign-In buttons */}
          <div className="relative flex items-center justify-center py-2 text-brand-muted text-[10px] uppercase font-bold">
            <div className="absolute left-0 right-0 h-[1px] bg-brand-muted/10 z-0"></div>
            <span className="relative bg-white px-3 z-10">Or Continue With</span>
          </div>

          <button 
            type="button" 
            onClick={() => {
              mockAuth.login('google-oauth@gmail.com', 'Google User');
              navigate('/dashboard');
            }}
            className="w-full py-2.5 bg-white border border-brand-muted/20 text-brand-dark hover:bg-brand-bg text-xs font-bold rounded-btn shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google Account</span>
          </button>

          {/* Toggle link */}
          <p className="text-center text-xs text-brand-muted">
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand-primary font-bold hover:underline"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      ) : (
        /* Onboarding Flow Quiz card */
        <div className="bg-white border border-brand-muted/10 p-6 sm:p-8 rounded-card shadow-lg max-w-lg w-full space-y-6 animate-fade-in">
          {quizStep <= 5 && (
            <div>
              {/* Quiz progress indicator */}
              <div className="flex justify-between items-center text-[10px] font-bold text-brand-muted uppercase">
                <span>Travel DNA Quiz</span>
                <span>Step {quizStep} of 5</span>
              </div>
              <div className="w-full bg-brand-bg h-1 rounded-full overflow-hidden mt-1 mb-6">
                <div 
                  className="bg-brand-accent h-full transition-all duration-300"
                  style={{ width: `${quizStep * 20}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Step 1: Budget */}
          {quizStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-brand-dark font-display">What is your typical budget style?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Backpacker', 'Mid-range', 'Luxury', 'Depends on the trip'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setQuizAnswers(prev => ({ ...prev, budget: opt }))}
                    className={`p-4 border rounded-card text-left transition-all ${
                      quizAnswers.budget === opt 
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-bold' 
                        : 'border-brand-muted/20 hover:border-brand-muted/40 text-brand-dark'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Party */}
          {quizStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-brand-dark font-display">Who do you usually travel with?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Solo', 'Partner / Couple', 'Friends Group', 'Family'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setQuizAnswers(prev => ({ ...prev, party: opt }))}
                    className={`p-4 border rounded-card text-left transition-all ${
                      quizAnswers.party === opt 
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-bold' 
                        : 'border-brand-muted/20 hover:border-brand-muted/40 text-brand-dark'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {quizStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-brand-dark font-display">Select your top travel interests:</h3>
              <p className="text-xs text-brand-muted">You can select multiple interests.</p>
              <div className="grid grid-cols-2 gap-3">
                {['Food', 'Nature & Parks', 'Culture & History', 'Nightlife', 'Adventure', 'Relaxation'].map(opt => {
                  const selected = quizAnswers.interests.includes(opt.toLowerCase());
                  return (
                    <button 
                      key={opt}
                      onClick={() => handleInterestSelect(opt.toLowerCase())}
                      className={`p-4 border rounded-card text-left transition-all ${
                        selected 
                          ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-bold' 
                          : 'border-brand-muted/20 hover:border-brand-muted/40 text-brand-dark'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Pace */}
          {quizStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-brand-dark font-display">What kind of pace do you prefer?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Packed itinerary', 'Balanced', 'Slow travel'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setQuizAnswers(prev => ({ ...prev, pace: opt }))}
                    className={`p-4 border rounded-card text-center transition-all ${
                      quizAnswers.pace === opt 
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-bold' 
                        : 'border-brand-muted/20 hover:border-brand-muted/40 text-brand-dark'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Destination Type */}
          {quizStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-brand-dark font-display">What is your dream destination type?</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Beach', 'Mountains', 'Cities', 'Countryside', 'Mix'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setQuizAnswers(prev => ({ ...prev, type: opt }))}
                    className={`p-4 border rounded-card text-left transition-all ${
                      quizAnswers.type === opt 
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-bold' 
                        : 'border-brand-muted/20 hover:border-brand-muted/40 text-brand-dark'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Quiz success layout */}
          {quizStep === 6 && (
            <div className="space-y-6 text-center py-6 animate-fade-in">
              <div className="mx-auto h-16 w-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-brand-dark font-display">Your Travel DNA is Ready!</h3>
                <div className="p-4 bg-brand-bg rounded-card border border-brand-primary/10 text-xs sm:text-sm text-brand-dark leading-relaxed font-semibold italic">
                  "{generatedDna}"
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/trips/new')}
                  className="w-full py-3 bg-brand-accent hover:bg-brand-accent/95 text-white font-bold rounded-btn text-xs sm:text-sm shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Build First Trip Now</span>
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="text-xs text-brand-primary font-bold hover:underline"
                >
                  Go to Dashboard Instead
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls bottom */}
          {quizStep <= 5 && (
            <div className="flex items-center justify-between pt-4 border-t border-brand-muted/10">
              <button 
                onClick={skipQuiz}
                className="text-xs text-brand-muted hover:text-brand-dark transition-colors font-bold"
              >
                Skip Quiz
              </button>

              <div className="flex gap-2">
                {quizStep > 1 && (
                  <button 
                    onClick={() => setQuizStep(quizStep - 1)}
                    className="px-4 py-2 border border-brand-muted/20 text-brand-dark rounded-btn text-xs font-bold hover:bg-brand-bg transition-all"
                  >
                    Back
                  </button>
                )}
                <button 
                  onClick={handleQuizNext}
                  disabled={
                    dnaLoading ||
                    (quizStep === 1 && !quizAnswers.budget) ||
                    (quizStep === 2 && !quizAnswers.party) ||
                    (quizStep === 3 && quizAnswers.interests.length === 0) ||
                    (quizStep === 4 && !quizAnswers.pace) ||
                    (quizStep === 5 && !quizAnswers.type)
                  }
                  className="px-5 py-2.5 bg-brand-primary text-white rounded-btn text-xs font-bold hover:bg-brand-primary/95 disabled:opacity-50 transition-all flex items-center gap-1"
                >
                  {dnaLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{quizStep === 5 ? 'Analyze DNA' : 'Next'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
