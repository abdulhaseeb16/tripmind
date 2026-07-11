// src/pages/AIChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, RefreshCw, PanelRightClose, PanelRightOpen, Plus, Trash2 } from 'lucide-react';
import { mockAuth, mockDb } from '../services/supabaseClient';
import type { Trip } from '../types';
import { streamCompletion, buildSystemPrompt } from '../services/geminiService';
import type { ChatMessage } from '../services/geminiService';
import { ChatBubble } from '../components/ChatBubble';
import { useChatStore } from '../stores/chatStore';

interface AIChatProps {
  activeTrip: Trip | null;
}

export const AIChat: React.FC<AIChatProps> = ({ activeTrip }) => {
  const session = mockAuth.getSession();
  void session; // keep session available for display logic

  const {
    channels,
    activeChannelId,
    isGenerating,
    switchChannel,
    createNewChannel,
    deleteChannel,
    addMessage,
    updateLastMessage,
    setGenerating
  } = useChatStore();

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];
  const messages = activeChannel.messages;

  const [inputVal, setInputVal] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  const [showContext, setShowContext] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  // Custom modal states
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteChannelTarget, setDeleteChannelTarget] = useState<{ id: string; name: string } | null>(null);
  
  // Extracted context entities
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

    const userText = text.trim();
    const newMsg: ChatMessage = { role: 'user', content: userText };
    addMessage(newMsg);
    setInputVal('');
    setGenerating(true);

    // Dynamic entity extraction mock simulation based on message keywords
    const lower = userText.toLowerCase();
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
    addMessage(tempAiMsg);

    try {
      await streamCompletion(userText, sysPrompt, (token) => {
        streamBuffer += token;
        const lowercaseBuffer = streamBuffer.toLowerCase();
        const hasItinerary = lowercaseBuffer.includes('day 1') || lowercaseBuffer.includes('itinerary');
        
        updateLastMessage(
          streamBuffer,
          hasItinerary,
          hasItinerary ? 'itinerary' : undefined,
          hasItinerary ? {
            title: 'AI Suggested Itinerary Stop',
            time: '09:00',
            duration: '2 hours',
            category: 'culture',
            description: 'Explore local historical highlights.'
          } : undefined
        );
      });
    } catch (e) {
      updateLastMessage("An error occurred generating response. Please check your token quota.");
    } finally {
      setGenerating(false);
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

  const handleCreateNewChannel = () => {
    setShowNewChannelModal(true);
  };

  return (
    <div className="flex h-[80vh] border border-brand-muted/10 bg-white rounded-card overflow-hidden shadow-sm">
      {/* 1. Left Sidebar: Chat History list */}
      {showHistory && (
        <div className="hidden sm:flex flex-col w-56 border-r border-brand-muted/10 bg-brand-bg/20 flex-shrink-0">
          <div className="p-3 border-b border-brand-muted/5 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-brand-primary">
            <span>Channels</span>
            <button 
              onClick={handleCreateNewChannel}
              className="p-1 hover:bg-brand-primary/10 rounded text-brand-primary transition-colors flex items-center gap-0.5"
              title="Create New Channel"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto flex-1">
            {channels.map(c => (
              <div 
                key={c.id} 
                className={`group flex items-center justify-between p-2 rounded-btn transition-colors hover:bg-brand-bg text-xs ${
                  c.id === activeChannelId ? 'bg-brand-bg font-bold border-l-2 border-brand-primary' : ''
                }`}
              >
                <button 
                  onClick={() => switchChannel(c.id)}
                  className="flex-1 text-left min-w-0 mr-1"
                >
                  <div className="font-bold text-brand-dark truncate">{c.name}</div>
                  <div className="text-[10px] text-brand-muted truncate mt-0.5">{c.preview}</div>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteChannelTarget({ id: c.id, name: c.name });
                    setShowDeleteModal(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-500 rounded transition-opacity"
                  title="Delete Chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
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
              className="p-1.5 hover:bg-brand-bg rounded"
              title="Toggle Channels"
            >
              📖
            </button>
            <span className="text-xs sm:text-sm font-bold text-brand-dark">{activeChannel.name}</span>
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
        {!isGenerating && messages.length > 0 && (
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
      {/* Custom Dialog Modals */}
      {showNewChannelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-card p-5 max-w-sm w-full mx-4 shadow-xl border border-brand-muted/10">
            <h3 className="font-bold text-brand-dark text-base mb-3">Create New Chat</h3>
            <input 
              type="text" 
              placeholder="e.g. Europe trip budget planning" 
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              className="w-full bg-brand-bg text-sm text-brand-dark px-3 py-2 border border-brand-muted/25 rounded-btn focus:outline-none focus:border-brand-primary mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newChannelName.trim()) {
                  createNewChannel(newChannelName.trim());
                  setShowNewChannelModal(false);
                  setNewChannelName('');
                }
              }}
            />
            <div className="flex justify-end gap-2 text-xs font-bold">
              <button 
                onClick={() => {
                  setShowNewChannelModal(false);
                  setNewChannelName('');
                }}
                className="px-3 py-2 border border-brand-muted/20 hover:bg-brand-bg rounded-btn text-brand-muted"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newChannelName.trim()) {
                    createNewChannel(newChannelName.trim());
                    setShowNewChannelModal(false);
                    setNewChannelName('');
                  }
                }}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-btn shadow-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deleteChannelTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-card p-5 max-w-sm w-full mx-4 shadow-xl border border-brand-muted/10">
            <h3 className="font-bold text-brand-dark text-base mb-2">Delete Chat Session?</h3>
            <p className="text-xs text-brand-muted mb-4">
              Are you sure you want to permanently delete <strong className="text-brand-dark">"{deleteChannelTarget.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 text-xs font-bold">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteChannelTarget(null);
                }}
                className="px-3 py-2 border border-brand-muted/20 hover:bg-brand-bg rounded-btn text-brand-muted"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  deleteChannel(deleteChannelTarget.id);
                  setShowDeleteModal(false);
                  setDeleteChannelTarget(null);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-btn shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
