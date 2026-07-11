// src/services/geminiService.ts

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isCard?: boolean;
  cardType?: 'itinerary' | 'comparison' | 'budget' | 'photo' | 'alert';
  cardData?: any;
}

// 1. Layered Prompt Builder
export function buildSystemPrompt(
  user: any | null,
  trip: any | null,
  taskContext: string
): string {
  let basePrompt = `You are TripMind AI, an expert travel intelligence assistant. You are warm, knowledgeable, specific, and direct. You never give generic advice — every response is tailored to the user's specific context. You cite practical details: prices, times, distances. You flag important caveats (visa rules change, always verify). You write in short paragraphs and use bullet points only when listing genuine alternatives or steps.\n\n`;

  if (user) {
    const name = user.name || user.user_metadata?.name || 'Traveler';
    const homeCity = user.homeCity || user.user_metadata?.home_city || 'London';
    const travelDNA = user.travelDNA || user.user_metadata?.travel_dna || 'Vibrant explorer';
    const preferredCurrency = user.preferredCurrency || user.user_metadata?.preferred_currency || 'USD';
    const styleTags = user.styleTags || user.user_metadata?.style_tags || [];
    
    basePrompt += `[USER PROFILE]\nName: ${name}\nHome City: ${homeCity}\nTravel DNA: ${travelDNA}\nPreferred Currency: ${preferredCurrency}\nInterests: ${styleTags.join(', ')}\n\n`;
  }

  if (trip) {
    const destinations = trip.destinations || (trip.destination ? [trip.destination] : []);
    const startDate = trip.startDate || trip.start_date || '';
    const endDate = trip.endDate || trip.end_date || '';
    const budgetAmount = trip.budget?.amount || trip.budget || 0;
    const budgetCurrency = trip.budget?.currency || trip.currency || 'USD';
    const groupType = trip.groupType || trip.group_type || 'solo';
    const interests = trip.interests || trip.interest_tags || [];
    
    basePrompt += `[ACTIVE TRIP]\nDestination: ${destinations.join(', ')}\nDuration: ${startDate} to ${endDate}\nBudget: ${budgetAmount} ${budgetCurrency}\nParty: ${groupType}\nInterests: ${interests.join(', ')}\n\n`;
  }

  basePrompt += `[TASK LAYER]\n${taskContext}`;
  return basePrompt;
}

// 2. Client proxy wrapper calling the Supabase Edge Function
export async function streamCompletion(
  systemPrompt: string,
  messages: ChatMessage[],
  onToken: (token: string) => void
): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const userQuery = messages[messages.length - 1]?.content || '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase configuration missing. Falling back to local mock AI service.');
    return mockAiService.streamChat(userQuery, onToken);
  }

  // Format history matching Gemini API shape: contents: [{ role: "user" | "model", parts: [{ text }] }]
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge Function returned error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // Edge function will stream back tokens as simple text chunks or SSE format
        onToken(chunk);
        accumulatedText += chunk;
      }
    }

    return accumulatedText;
  } catch (error) {
    console.warn('AI proxy request failed. Falling back to local mock AI service.', error);
    return mockAiService.streamChat(userQuery, onToken);
  }
}

import { mockAiService } from './mockAiService';

export interface PhotoAnalysisResult {
  identified_as: string;
  type: 'landmark' | 'menu' | 'document' | 'landscape' | 'unknown';
  description: string;
  history?: string;
  tips?: string[];
  nearby?: string[];
  dishes?: { name: string; desc: string; allergen?: string; recommendation: string; price: string }[];
  document_details?: { title: string; extracted_info: string[]; timeline_impact?: string };
}

export async function analyzePhoto(_base64Data: string): Promise<PhotoAnalysisResult> {
  return {
    identified_as: 'Fushimi Inari vermilion gates, Kyoto',
    type: 'landmark',
    description: 'Pathway of torii gates.',
    history: 'Dedicated to Shinto god of rice.',
    tips: ['Hike past the first intersection.'],
    nearby: ['Inari Station (JR Nara line)']
  };
}

export async function generateTravelDNA(answers: any): Promise<string> {
  return `Traveler DNA summary: budget ${answers.budget}, style ${answers.type}.`;
}

export async function generateItinerary(
  destination: string,
  days: number,
  interests: string[],
  budget: number
): Promise<any[]> {
  const mockDays = await mockAiService.generateItinerary(destination, days, interests, budget);
  return mockDays.map(day => ({
    id: `gen-day-${day.dayNumber}`,
    trip_id: 'active',
    day_number: day.dayNumber,
    date: day.date,
    stops: day.stops.map(s => ({
      id: s.id,
      name: s.name,
      time: s.time,
      duration: `${s.durationMinutes} mins`,
      category: s.category,
      description: s.description,
      cost_estimate: s.estimatedCost || 0,
      google_maps_link: s.mapsUrl || ''
    }))
  }));
}

export async function generatePackingList(
  destination: string,
  duration: number,
  interests: string[]
): Promise<any[]> {
  const list = await mockAiService.generatePacking(destination, duration, interests);
  return list.map(item => ({
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    tag: item.essential === 'essential' ? 'Essential' : 'Nice to have',
    packed: item.packed,
    note: item.reason
  }));
}
