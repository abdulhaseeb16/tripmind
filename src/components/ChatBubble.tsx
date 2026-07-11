// src/components/ChatBubble.tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import type { ChatMessage } from '../services/geminiService';

interface ChatBubbleProps {
  message: ChatMessage;
  onActionClick?: (actionType: string, data: any) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onActionClick }) => {
  const isAi = message.role === 'assistant';

  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    let inList = false;
    const parsedElements: string[] = [];

    for (let line of lines) {
      const trimmed = line.trim();

      // Check for lists
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        if (!inList) {
          parsedElements.push('<ul class="list-disc pl-5 my-2 space-y-1 text-sm sm:text-base">');
          inList = true;
        }
        const itemText = trimmed.substring(2);
        const processedText = itemText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-brand-dark">$1</strong>');
        parsedElements.push(`<li>${processedText}</li>`);
        continue;
      } else {
        if (inList) {
          parsedElements.push('</ul>');
          inList = false;
        }
      }

      // Check for horizontal rule
      if (trimmed === '---') {
        parsedElements.push('<hr class="my-3.5 border-brand-muted/15" />');
        continue;
      }

      // Check for headers
      if (trimmed.startsWith('### ')) {
        const headerText = trimmed.substring(4);
        const processedText = headerText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        parsedElements.push(`<h3 class="font-bold text-brand-dark text-base sm:text-lg mt-4 mb-2">${processedText}</h3>`);
        continue;
      }
      if (trimmed.startsWith('#### ')) {
        const headerText = trimmed.substring(5);
        const processedText = headerText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        parsedElements.push(`<h4 class="font-bold text-brand-primary text-sm sm:text-base mt-3.5 mb-1.5">${processedText}</h4>`);
        continue;
      }

      // Regular paragraph or empty line
      if (trimmed === '') {
        parsedElements.push('<div class="h-2"></div>');
      } else {
        const processedText = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-brand-dark">$1</strong>');
        parsedElements.push(`<p class="mb-2 leading-relaxed text-sm sm:text-base">${processedText}</p>`);
      }
    }

    if (inList) {
      parsedElements.push('</ul>');
    }

    return parsedElements.join('\n');
  };

  return (
    <div className={`flex w-full ${isAi ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}>
      <div className={`max-w-[85%] sm:max-w-[70%] flex gap-3 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm shadow-sm ${
          isAi ? 'bg-brand-primary text-white' : 'bg-brand-accent text-white font-bold'
        }`}>
          {isAi ? '🧠' : 'U'}
        </div>

        {/* Bubble content */}
        <div className="flex flex-col gap-1.5">
          <div className={`p-3.5 rounded-card text-sm sm:text-base leading-relaxed ${
            isAi 
              ? 'bg-white text-brand-dark border border-brand-muted/10 shadow-sm rounded-tl-none' 
              : 'bg-brand-primary text-white shadow rounded-tr-none'
          }`}>
            {/* Parsed Markdown Rendering for AI, secure plain text for User */}
            {isAi ? (
              <div 
                className="break-words text-brand-dark"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
              />
            ) : (
              <div className="whitespace-pre-line break-words text-white">
                {message.content}
              </div>
            )}

            {/* Custom interactive widget if flagged as card data */}
            {message.isCard && message.cardType === 'itinerary' && (
              <div className="mt-3 p-3 bg-brand-bg rounded-lg border border-brand-primary/10 text-brand-dark flex flex-col gap-2">
                <div className="flex items-center gap-1 text-xs font-bold text-brand-primary uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Interactive Day Draft</span>
                </div>
                <p className="text-xs font-medium text-brand-dark">
                  Ready to add this simulated itinerary day directly to your trip schedule?
                </p>
                <button 
                  onClick={() => onActionClick && onActionClick('save_itinerary', message.cardData)}
                  className="py-1.5 px-3 bg-brand-accent hover:bg-brand-accent/95 text-white font-bold rounded-btn text-xs self-start shadow-sm transition-all flex items-center gap-1"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span>Apply Day to Trip</span>
                </button>
              </div>
            )}
          </div>

          {/* Timestamp or visual details */}
          <span className={`text-[10px] text-brand-muted font-medium self-end px-1`}>
            {isAi ? 'TripMind AI' : 'You'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Quick mini component for Plus Icon inside bubble
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
