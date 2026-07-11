// src/types/index.ts
import { z } from 'zod';

// Zod Schemas supporting both spec models for robust compatibility
export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  homeCity: z.string(),
  homeAirport: z.string().optional(),
  preferredCurrency: z.string(),
  travelDNA: z.string().optional(),
  styleTags: z.array(z.string()),
  isPro: z.boolean(),
});

export const StopSchema = z.object({
  id: z.string(),
  name: z.string(),
  time: z.string(),
  durationMinutes: z.number().optional(),
  duration: z.string().optional(), // backward compatibility
  category: z.string(),
  description: z.string(),
  estimatedCost: z.number().optional(),
  cost_estimate: z.number().optional(), // backward compatibility
  mapsUrl: z.string().optional(),
  google_maps_link: z.string().optional(), // backward compatibility
});

export const ItineraryDaySchema = z.object({
  id: z.string().optional(),
  trip_id: z.string().optional(),
  dayNumber: z.number().optional(),
  day_number: z.number().optional(), // backward compatibility
  date: z.string(),
  location: z.string().optional(),
  stops: z.array(StopSchema),
});

export const TripSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  user_id: z.string(), // compatibility - non-optional
  title: z.string(),
  destination: z.string(), // compatibility - non-optional
  destinations: z.array(z.string()),
  startDate: z.string().optional(),
  start_date: z.string(), // compatibility - non-optional
  endDate: z.string().optional(),
  end_date: z.string(), // compatibility - non-optional
  groupType: z.enum(['solo', 'couple', 'family', 'group']).optional(),
  group_type: z.string(), // compatibility - non-optional
  budget: z.any(), // compatibility - non-optional
  currency: z.string(), // compatibility - non-optional
  interests: z.array(z.string()),
  interest_tags: z.array(z.string()), // compatibility - non-optional
  status: z.enum(['upcoming', 'past', 'draft', 'shared']), // compatibility - non-optional
  coverPhotoUrl: z.string().optional(),
  cover_url: z.string(), // compatibility - non-optional
  notes: z.string().optional(), // compatibility
  trip_summary: z.string().optional(), // compatibility
  is_pro: z.boolean(), // compatibility - non-optional
  created_at: z.string(), // compatibility - non-optional
  itinerary: z.array(ItineraryDaySchema).optional(),
});

export const PackingItemSchema = z.object({
  id: z.string(),
  trip_id: z.string().optional(),
  name: z.string(),
  category: z.string(),
  quantity: z.number(),
  essential: z.any().optional(),
  tag: z.string().optional(),
  reason: z.string().optional(),
  note: z.string().optional(),
  packed: z.boolean(),
});

export const ExpenseSchema = z.object({
  id: z.string(),
  tripId: z.string().optional(),
  trip_id: z.string().optional(),
  amount: z.number(),
  currency: z.string(),
  category: z.string(),
  date: z.string(),
  note: z.string().optional(),
  receiptPhotoUrl: z.string().optional(),
});

export const MemorySchema = z.object({
  id: z.string(),
  tripId: z.string().optional(),
  trip_id: z.string().optional(),
  photoUrl: z.string().optional(),
  photo_url: z.string().optional(),
  note: z.string().optional(),
  voiceTranscript: z.string().optional(),
  location: z.string().optional(),
  date: z.string(),
  aiCaption: z.string().optional(),
  ai_caption: z.string().optional(),
});

// TypeScript Types Derived from Zod Schemas
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Stop = z.infer<typeof StopSchema>;
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;
export type Trip = z.infer<typeof TripSchema>;
export type PackingItem = z.infer<typeof PackingItemSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type Memory = z.infer<typeof MemorySchema>;
