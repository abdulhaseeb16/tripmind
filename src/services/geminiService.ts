// src/services/geminiService.ts
import { useUIStore } from '../stores/uiStore';
import { mockAiService } from './mockAiService';

const PROXY_URL = '/functions/v1/ai-proxy';

// Shared chat message type used across the app
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isCard?: boolean;
  cardType?: 'itinerary' | 'weather' | 'packing';
  cardData?: any;
}

export function buildSystemPrompt(context: {
  destination?: string;
  interests?: string[];
  tripTitle?: string;
}): string {
  const parts = [
    'You are TripMind, an expert AI travel companion for the modern traveller.',
    'You give concise, practical, vivid travel advice. Respond in markdown when formatting helps.',
    context.tripTitle && `Active trip: ${context.tripTitle}.`,
    context.destination && `Destination: ${context.destination}.`,
    context.interests?.length && `Traveler interests: ${context.interests.join(', ')}.`,
  ].filter(Boolean);

  return parts.join('\n');
}

export async function streamCompletion(
  userQuery: string,
  systemPrompt: string,
  onToken: (token: string) => void
): Promise<string> {
  const { isMockMode } = useUIStore.getState();

  if (isMockMode) {
    return mockAiService.streamChat(userQuery, onToken);
  }

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('supabase_token') || 'anon'}`,
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userQuery }] }
        ],
        generationConfig: { temperature: 0.85, maxOutputTokens: 2048 },
      }),
    });

    if (!response.ok || !response.body) throw new Error(`Proxy responded ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
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

// ─── Photo Analysis ─────────────────────────────────────────────────────────

export interface PhotoAnalysisResult {
  identified_as: string;
  type: 'landmark' | 'menu' | 'document' | 'landscape' | 'unknown';
  description: string;
  history?: string;
  tips?: string[];
  nearby?: string[];
  dishes?: { name: string; desc: string; allergen?: string; recommendation: string; price: string }[];
  document_details?: { title: string; extracted_info: string[]; timeline_impact?: string };
  coordinates?: string;
  bestVisitTime?: string;
}

const MOCK_PHOTO_RESULTS: Record<string, PhotoAnalysisResult> = {
  landmark: {
    identified_as: 'Fushimi Inari-taisha, Kyoto, Japan',
    type: 'landmark',
    description: 'Iconic Shinto shrine famous for its thousands of vermilion torii gates winding through forest trails on Mount Inari.',
    history: 'Founded in 711 AD, Fushimi Inari is dedicated to Inari, the god of rice, sake, fertility and industry. Merchants historically donated torii gates as offerings.',
    tips: [
      'Hike past the first plateau for fewer crowds',
      'Arrive before 7am or after 6pm for atmospheric solitude',
      'The full summit hike (4km) takes 2–3 hours round trip',
      'Free admission — open 24 hours'
    ],
    nearby: ['Inari Station (JR Nara line — 5 min walk)', 'Tofuku-ji Temple (15 min walk)', 'Fushimi sake district (20 min bus)'],
    coordinates: '34.9671° N, 135.7727° E',
    bestVisitTime: 'Dawn or dusk for golden light through the gates'
  },
  menu: {
    identified_as: 'Japanese Restaurant Menu — Ramen & Izakaya',
    type: 'menu',
    description: 'Traditional Japanese izakaya menu featuring various ramen styles, grilled skewers, and sake selections.',
    dishes: [
      { name: 'Tonkotsu Ramen', desc: 'Rich pork bone broth, chashu pork, soft-boiled egg, nori', allergen: 'Gluten, Soy, Egg', recommendation: '★★★★★ Must try', price: '¥980' },
      { name: 'Shoyu Ramen', desc: 'Soy-based clear broth with chicken, menma bamboo shoots', allergen: 'Gluten, Soy', recommendation: '★★★★☆ Lighter option', price: '¥850' },
      { name: 'Yakitori Moriawase', desc: '6-piece assorted grilled chicken skewers, tare or shio', allergen: 'Gluten', recommendation: '★★★★☆ Great for sharing', price: '¥600' },
      { name: 'Edamame', desc: 'Salted steamed soybeans', allergen: 'Soy', recommendation: '★★★☆☆ Classic starter', price: '¥300' }
    ]
  },
  document: {
    identified_as: 'Hotel Booking Confirmation',
    type: 'document',
    description: 'Official booking confirmation document for accommodation.',
    document_details: {
      title: 'Hotel Reservation — Kyoto Ryokan',
      extracted_info: [
        'Check-in: October 12, 2026 (after 15:00)',
        'Check-out: October 15, 2026 (before 11:00)',
        'Booking Reference: KYO-2026-8841',
        'Room Type: Traditional Tatami Suite',
        'Includes: Breakfast & Dinner (kaiseki)',
        'Cancellation: Free until Oct 10'
      ],
      timeline_impact: 'Aligns with Day 1–3 of your Kyoto itinerary. Checkout on Day 4 before heading to Nara.'
    }
  }
};

export async function analyzePhoto(base64Data: string): Promise<PhotoAnalysisResult> {
  const { isMockMode } = useUIStore.getState();

  if (isMockMode) {
    // Return random mock result to demonstrate all three types
    const types = ['landmark', 'menu', 'document'] as const;
    const randomType = types[Math.floor(Math.random() * types.length)];
    await new Promise(r => setTimeout(r, 1500)); // Simulate loading
    return MOCK_PHOTO_RESULTS[randomType];
  }

  try {
    // Strip the data URL prefix to get pure base64
    const pureBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const mimeType = base64Data.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('supabase_token') || 'anon'}`,
        'X-Request-Type': 'vision',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            {
              inline_data: { mime_type: mimeType, data: pureBase64 }
            },
            {
              text: `Analyze this travel photo and return a detailed JSON object. Determine if it is a "landmark", "menu", "document", "landscape", or "unknown".

For landmark: include identified_as, type, description, history, tips (array), nearby (array), coordinates, bestVisitTime.
For menu: include identified_as, type, description, dishes array with {name, desc, allergen, recommendation, price}.
For document: include identified_as, type, description, document_details with {title, extracted_info array, timeline_impact}.

Respond with ONLY valid JSON, no markdown fences.`
            }
          ]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) throw new Error(`Vision proxy error: ${response.status}`);
    const text = await response.text();

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as PhotoAnalysisResult;
    }
    throw new Error('No valid JSON in vision response');
  } catch (err) {
    console.warn('Vision analysis failed, using mock result', err);
    return MOCK_PHOTO_RESULTS['landmark'];
  }
}

// ─── Travel DNA ──────────────────────────────────────────────────────────────

export async function generateTravelDNA(answers: Record<string, string>): Promise<string> {
  return `Explorer DNA: ${answers.budget || 'balanced'} budget traveler who loves ${answers.type || 'cultural'} experiences.`;
}

// ─── Itinerary Generator ─────────────────────────────────────────────────────

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

// ─── Packing List Generator ──────────────────────────────────────────────────

export async function generatePackingList(
  destination: string,
  duration: number,
  interests: string[],
  weatherNote?: string
): Promise<any[]> {
  const list = await mockAiService.generatePacking(destination, duration, interests);
  const weatherItems = weatherNote?.toLowerCase().includes('rain') || weatherNote?.toLowerCase().includes('cold')
    ? [
        { name: 'Compact Umbrella', category: 'Clothing', quantity: 1, tag: 'Essential', packed: false, note: `Recommended: ${weatherNote}` },
        { name: 'Waterproof Layer', category: 'Clothing', quantity: 1, tag: 'Essential', packed: false, note: 'Weather-adaptive suggestion' }
      ]
    : [];

  return [
    ...weatherItems,
    ...list.map(item => ({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      tag: item.essential === 'essential' ? 'Essential' : 'Nice to have',
      packed: item.packed,
      note: item.reason
    }))
  ];
}
