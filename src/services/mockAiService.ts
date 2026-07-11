import type { Stop, ItineraryDay, PackingItem } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAiService = {
  async streamChat(
    prompt: string, 
    onToken: (token: string) => void
  ): Promise<string> {
    const lower = prompt.toLowerCase();
    let response = '';

    if (lower.includes('kyoto') || lower.includes('japan')) {
      response = `Based on your Travel DNA, here is a curated guide for Kyoto:\n\n1. **Arashiyama Bamboo Grove**: Visit around 07:30 AM to beat the massive crowd. Walk down the scenic Oi River after.\n2. **Kiyomizu-dera**: An iconic wooden temple offering panoramic vistas of Kyoto. Entry is ¥400. Best visited during sunset.\n3. **Culinary Insight**: Taste *Kushikatsu* (deep-fried skewers) in Gion or traditional *Kaiseki* dinner in Pontocho Alley.\n\nWould you like me to build a full itinerary for your Japan trip?`;
    } else if (lower.includes('morocco') || lower.includes('marrakech')) {
      response = `Morocco is an absolute feast for the senses! Here is a curated insight for Marrakech:\n\n*   **Jemaa el-Fnaa**: The heartbeat of the city. Head there around 6 PM when the food stalls light up. Get some fresh orange juice for 10 MAD.\n*   **Le Jardin Majorelle**: Cobalt blue villas surrounded by exotic cacti. You **must** pre-book tickets online (approx. 150 MAD) as they do not sell them at the door.\n*   **Riad Stay**: Avoid corporate hotels. Stay in a traditional Riad inside the Medina for an authentic experience.\n\nLet me know if you need a daily breakdown or packing list!`;
    } else if (lower.includes('packing') || lower.includes('pack')) {
      response = `Here is a custom packing list generated for your travel style:\n\n*   **Clothing**: Lightweight breathable fabrics, comfortable trail runners, light windbreaker for evenings.\n*   **Tech**: Power bank (10,000mAh+), universal plug adapter, noise-canceling headphones.\n*   **Documents**: Passport copies, physical credit cards (not all places accept Apple Pay), medical insurance printout.\n\nI have automatically generated a comprehensive packing checklist for your trip. Check the 'Packing' tab to customize it!`;
    } else if (lower.includes('budget') || lower.includes('cost')) {
      response = `I have analyzed your travel expenses. You are spending approximately **$75/day on Food**, which is 15% under your limit. However, your **Transport expenses are slightly elevated** due to taxi rides. I suggest getting a weekly subway pass which will save you around $40. Keep logging your expenses in the 'Budget' tab to unlock deeper insights!`;
    } else {
      response = `I'd love to help you plan that! As your AI travel brain, I recommend looking at travel logistics, cultural etiquettes, and culinary highlights. Based on your Travel DNA, I suggests spending at least 4-5 days to absorb the local rhythm rather than rushing through the sights.\n\nTell me more about your travel dates, who you are traveling with, and what kind of food you want to eat!`;
    }

    const tokens = response.split(/(\s+)/);
    for (const token of tokens) {
      onToken(token);
      await delay(25 + Math.random() * 30);
    }
    return response;
  },

  async generateItinerary(
    destination: string,
    days: number,
    interests: string[],
    budget: number
  ): Promise<ItineraryDay[]> {
    await delay(1500);
    const itineraryDays: ItineraryDay[] = [];

    for (let i = 1; i <= days; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      const stops: Stop[] = [
        {
          id: `stop-${i}-1`,
          name: `${destination} Landmark Spot`,
          time: '09:30',
          durationMinutes: 90,
          category: interests[0] || 'culture',
          description: `Stunning sightseeing tour at the historical highlights of ${destination}. Recommended for early morning.`,
          estimatedCost: Math.round(budget * 0.05),
          mapsUrl: 'https://maps.google.com'
        },
        {
          id: `stop-${i}-2`,
          name: `Local Traditional Restaurant`,
          time: '12:30',
          durationMinutes: 60,
          category: 'food',
          description: `Excellent regional lunch options, custom tailored to your budget settings.`,
          estimatedCost: Math.round(budget * 0.08),
          mapsUrl: 'https://maps.google.com'
        }
      ];

      itineraryDays.push({
        dayNumber: i,
        date: d.toISOString().split('T')[0],
        location: destination,
        stops
      });
    }

    return itineraryDays;
  },

  async generatePacking(
    destination: string,
    duration: number,
    interests: string[]
  ): Promise<PackingItem[]> {
    console.log("Mock packing for:", destination, "duration:", duration);
    await delay(1200);
    const items: PackingItem[] = [
      { id: 'm-p1', name: 'Passport & Travel Docs', category: 'Documents & Money', quantity: 1, essential: 'essential', reason: 'Basic border requirements.', packed: false },
      { id: 'm-p2', name: 'Travel power adapters', category: 'Electronics', quantity: 1, essential: 'essential', reason: 'Keep travel accessories charged.', packed: false }
    ];

    if (interests.includes('nature') || interests.includes('adventure')) {
      items.push({ id: 'm-p3', name: 'Comfortable trail runners', category: 'Clothing', quantity: 1, essential: 'essential', reason: 'High trekking duration.', packed: false });
    }

    return items;
  }
};
