// supabase/functions/ai-proxy/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response('Server configuration missing: GEMINI_API_KEY', {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }

    const { contents, systemInstruction } = await req.json();

    // 2. Query Gemini streaming endpoint
    // Standard Gemini 1.5 Flash streaming model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction,
        generationConfig: {
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(`Gemini API Error: ${err}`, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }

    // 3. Pipe the stream directly back to client
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    (async () => {
      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Standard streamGenerateContent returns JSON arrays/objects representing parts
          // Let's parse complete JSON snippets or stream raw chunks back
          const lines = buffer.split('\n');
          // Keep the last incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                // If it starts with a comma or square bracket due to JSON array streaming, clean it
                let cleanLine = line.trim();
                if (cleanLine.startsWith(',')) cleanLine = cleanLine.substring(1).trim();
                if (cleanLine.startsWith('[')) cleanLine = cleanLine.substring(1).trim();
                if (cleanLine.endsWith(']')) cleanLine = cleanLine.substring(0, cleanLine.length - 1).trim();

                const parsed = JSON.parse(cleanLine);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (text) {
                  await writer.write(encoder.encode(text));
                }
              } catch (e) {
                // If line isn't valid JSON, append back to buffer to parse with next chunks
                buffer = line + '\n' + buffer;
              }
            }
          }
        }
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    return new Response(error.message || 'Internal Server Error', {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  }
});
