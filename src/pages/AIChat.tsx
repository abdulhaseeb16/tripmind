// src/pages/AIChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, RefreshCw, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { mockAuth, mockDb } from '../services/supabaseClient';
import type { Trip } from '../types';
import { streamCompletion, buildSystemPrompt } from '../services/geminiService';
import type { ChatMessage } from '../services/geminiService';
import { ChatBubble } from '../components/ChatBubble';

interface AIChatProps {
  activeTrip: Trip | null;
}

export const AIChat: React.FC<AIChatProps> = ({ activeTrip }) => {
  const session = mockAuth.getSession();
  void session; // keep session available for display logic

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Hello! I've loaded your Travel DNA context. How can I help you plan your travel details today?` }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showContext, setShowContext] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  // Exracted context entities
  const [entities, setEntities] = useState({
    destination: activeTrip ? activeTrip.destination : 'Kyoto, Japan',
    dates: activeTrip ? `${activeTrip.start_date} to ${activeTrip.end_date}` : 'Not set',
    budget: activeTrip 
      ? (typeof (activeTrip.budget as any) === 'object' && (activeTrip.budget as any) !== null 
          ? `${(activeTrip.budget as any).amount ?? ''} ${(activeTrip.budget as any).currency ?? activeTrip.currency ?? 'USD'}` 
          : `${activeTrip.budget} ${activeTrip.currency ?? 'USD'}`) 
      : 'Flexible',
    interests: activeTrip ? activeTrip.interest_tags : ['food', 'culture']
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    const newMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, newMsg]);
    setInputVal('');
    setIsGenerating(true);

    // Dynamic entity extraction mock simulation based on message keywords
    const lower = text.toLowerCase();
    if (lower.includes('budget') || lower.includes('cost') || lower.includes('spend')) {
      const budgetMatch = lower.match(/\b\d+\b/);
      if (budgetMatch) {
        setEntities(prev => ({ ...prev, budget: `$${budgetMatch[0]}` }));
      }
    }
    if (lower.includes('days') || lower.includes('week') || lower.includes('date')) {
      setEntities(prev => ({ ...prev, dates: 'Oct 12 - Oct 18, 2026' }));
    }

    // Build system prompt context
    const sysPrompt = buildSystemPrompt({
      destination: activeTrip?.destination || 'your destination',
      interests: activeTrip?.interests || [],
      tripTitle: activeTrip?.title || 'your trip',
    });

    let streamBuffer = '';
    const tempAiMsg: ChatMessage = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, tempAiMsg]);

    try {
      await streamCompletion(inputVal.trim(), sysPrompt, (token) => {
        streamBuffer += token;
        setMessages(prev => {
          const list = [...prev];
          if (list.length > 0) {
            list[list.length - 1] = {
              role: 'assistant',
              content: streamBuffer,
              // If it has day references, attach it as a card type
              isCard: streamBuffer.toLowerCase().includes('day 1') || streamBuffer.toLowerCase().includes('itinerary'),
              cardType: streamBuffer.toLowerCase().includes('day 1') ? 'itinerary' : undefined,
              cardData: {
                title: 'AI Suggested Itinerary Stop',
                time: '09:00',
                duration: '2 hours',
                category: 'culture',
                description: 'Explore local historical highlights.'
              }
            };
          }
          return list;
        });
      });
    } catch (e) {
      setMessages(prev => {
        const list = [...prev];
        if (list.length > 0) {
          list[list.length - 1] = { role: 'assistant', content: "An error occurred generating response. Please check your token quota." };
        }
        return list;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActionClick = (actionType: string, data: any) => {
    if (actionType === 'save_itinerary' && activeTrip) {
      // Save simulated stop to active trip day 1
      const currentDays = mockDb.fetchItinerary(activeTrip.id);
      if (currentDays.length > 0) {
        const stop = {
          id: `ai-chat-${Math.random()}`,
          name: data.title || 'AI Added Attraction',
          time: data.time || '10:00',
          duration: data.duration || '2 hrs',
          category: data.category || 'culture',
          description: data.description || 'Added directly from AI Chat conversation.',
          cost_estimate: 0,
          google_maps_link: 'https://maps.google.com'
        };
        currentDays[0].stops.push(stop as any);
        mockDb.saveItineraryDays(activeTrip.id, currentDays);
        alert('Applied successfully! Check your Trip Timeline.');
      } else {
        alert('Create a trip itinerary day timeline first in My Trips.');
      }
    }
  };

  const triggerVoiceInput = () => {
    // Standard SpeechRecognition API check
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome/Safari.");
      return;
    }
    
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'en-US';
    setIsRecording(true);

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputVal(transcript);
    };

    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    rec.start();
  };

  return (
    <div className="flex h-[80vh] border border-brand-muted/10 bg-white rounded-card overflow-hidden shadow-sm">
      {/* 1. Left Sidebar: Chat History list */}
      {showHistory && (
        <div className="hidden sm:flex flex-col w-56 border-r border-brand-muted/10 bg-brand-bg/20 flex-shrink-0">
          <div className="p-3 border-b border-brand-muted/5 font-bold text-xs uppercase tracking-wider text-brand-primary">
            Chat Channels
          </div>
          <div className="p-2 space-y-1 overflow-y-auto flex-1">
            {[
              { id: '1', name: 'Kyoto autumn itinerary', preview: 'Explore bamboo trails...' },
              { id: '2', name: 'Morocco transport tips', preview: 'Salerno to Positano boat...' },
              { id: '3', name: 'Travel DNA profiling', preview: 'Solo culinary explorer...' }
            ].map(c => (
              <button 
                key={c.id} 
                className="w-full text-left p-2 rounded-btn hover:bg-brand-bg text-xs space-y-0.5"
              >
                <div className="font-bold text-brand-dark truncate">{c.name}</div>
                <div className="text-[10px] text-brand-muted truncate">{c.preview}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Main Chat Panel */}
      <div className="flex-1 flex flex-col justify-between min-w-0 bg-white h-full relative">
        {/* Chat Top bar controls */}
        <div className="p-3 border-b border-brand-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className="p-1 hover:bg-brand-bg rounded"
              title="Toggle Channels"
            >
              📖
            </button>
            <span className="text-xs sm:text-sm font-bold text-brand-dark">AI Travel Agent Agent</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setShowContext(!showContext)} 
              className="p-1.5 hover:bg-brand-bg rounded"
              title="Context Details"
            >
              {showContext ? <PanelRightClose className="h-4 w-4 text-brand-primary" /> : <PanelRightOpen className="h-4 w-4 text-brand-primary" />}
            </button>
          </div>
        </div>

        {/* Messaging Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <ChatBubble key={idx} message={msg} onActionClick={handleActionClick} />
          ))}
          {isGenerating && (
            <div className="flex justify-start items-center gap-2 text-xs text-brand-muted animate-pulse pl-12">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Gemini is generating response...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Follow Up Suggested Pills */}
        {!isGenerating && messages.length > 1 && (
          <div className="px-4 py-2 flex flex-wrap gap-2 justify-center border-t border-brand-muted/5 bg-brand-bg/10">
            <button 
              onClick={() => handleSend("Suggest three dinner spots in Kyoto.")}
              className="text-[10px] font-bold text-brand-primary bg-white border border-brand-primary/10 rounded-full px-3 py-1 shadow-sm hover:bg-brand-bg"
            >
              🍱 Dinner spots
            </button>
            <button 
              onClick={() => handleSend("Do I need a visa for Japan?")}
              className="text-[10px] font-bold text-brand-primary bg-white border border-brand-primary/10 rounded-full px-3 py-1 shadow-sm hover:bg-brand-bg"
            >
              🛂 Visa Rules
            </button>
            <button 
              onClick={() => handleSend("Create a complete packing list.")}
              className="text-[10px] font-bold text-brand-primary bg-white border border-brand-primary/10 rounded-full px-3 py-1 shadow-sm hover:bg-brand-bg"
            >
              🧳 Packing checklist
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
          className="p-3 border-t border-brand-muted/10 flex items-center gap-2 bg-white"
        >
          <button 
            type="button" 
            onClick={triggerVoiceInput}
            className={`p-2 rounded-full border transition-all ${
              isRecording 
                ? 'bg-red-500 text-white border-red-500 animate-pulse' 
                : 'bg-brand-bg border-brand-muted/20 text-brand-dark hover:bg-brand-primary/5'
            }`}
            title="Speak Prompt"
          >
            <Mic className="h-4.5 w-4.5" />
          </button>

          <input 
            type="text" 
            placeholder={activeTrip ? `Ask about ${activeTrip.destination}...` : 'Type a travel query...'}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isGenerating}
            className="flex-1 bg-brand-bg text-xs sm:text-sm text-brand-dark px-3 py-2 border border-brand-muted/25 rounded-btn focus:outline-none focus:border-brand-primary"
          />

          <button 
            type="submit"
            disabled={!inputVal.trim() || isGenerating}
            className="p-2 bg-brand-primary text-white hover:bg-brand-primary/95 disabled:opacity-50 rounded-full shadow transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* 3. Right Sidebar: Collapsible Context Panel */}
      {showContext && (
        <div className="hidden lg:flex flex-col w-64 border-l border-brand-muted/10 bg-brand-bg/15 p-4 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">AI Context Panel</h4>
            <p className="text-[10px] text-brand-muted mt-0.5">Entities parsed from conversation memory</p>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-2.5 bg-white rounded border border-brand-muted/5 shadow-sm">
              <span className="text-[9px] font-bold text-brand-muted uppercase block">Destination</span>
              <span className="font-bold text-brand-dark">{entities.destination}</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-brand-muted/5 shadow-sm">
              <span className="text-[9px] font-bold text-brand-muted uppercase block">Travel Dates</span>
              <span className="font-bold text-brand-dark">{entities.dates}</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-brand-muted/5 shadow-sm">
              <span className="text-[9px] font-bold text-brand-muted uppercase block">Expected Budget</span>
              <span className="font-bold text-brand-dark">{entities.budget}</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-brand-muted/5 shadow-sm">
              <span className="text-[9px] font-bold text-brand-muted uppercase block">Dna Interests</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {entities.interests.map(t => (
                  <span key={t} className="text-[9px] font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full uppercase">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-muted/10">
            <p className="text-[10px] text-brand-muted leading-relaxed">
              💡 Gemini actively feeds user Travel DNA profiling info to system guidelines on each request context block.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
