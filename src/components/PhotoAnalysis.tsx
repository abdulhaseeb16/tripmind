// src/components/PhotoAnalysis.tsx
import React, { useState, useRef } from 'react';
import { Camera, RefreshCw, FileText, Check, Plus, AlertCircle, Compass } from 'lucide-react';
import { analyzePhoto } from '../services/geminiService';
import type { PhotoAnalysisResult } from '../services/geminiService';

interface PhotoAnalysisProps {
  onAddStop?: (name: string, description: string) => void;
  onSaveToMemories?: (photoUrl: string, caption: string) => void;
}

export const PhotoAnalysis: React.FC<PhotoAnalysisProps> = ({ onAddStop, onSaveToMemories }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFact, setLoadingFact] = useState('');
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const travelFacts = [
    "Japan has over 5.5 million vending machines, vending everything from hot ramen to umbrellas.",
    "Rome's Trevi Fountain receives over €3,000 in coins daily, which is donated to local charities.",
    "The Amalfi Coast's famous lemons are so sweet you can eat them raw like apples.",
    "Aviation fact: The white trails planes leave behind are actually artificial clouds made of ice crystals."
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64Str: string) => {
    setImageSrc(base64Str);
    setLoading(true);
    setResult(null);

    // Pick a random fun fact to display
    const randomFact = travelFacts[Math.floor(Math.random() * travelFacts.length)];
    setLoadingFact(randomFact);

    try {
      const res = await analyzePhoto(base64Str);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full bg-white border border-brand-muted/10 rounded-card p-4 sm:p-6 shadow-sm">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*"
        capture="environment" // Triggers direct camera on mobile devices
        className="hidden"
      />

      {!imageSrc && (
        <div 
          onClick={triggerUpload}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-brand-muted/20 hover:border-brand-primary/40 rounded-card p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-brand-bg/30 hover:bg-brand-bg/70 min-h-[220px]"
        >
          <div className="h-12 w-12 rounded-full bg-brand-primary/5 text-brand-primary flex items-center justify-center mb-3">
            <Camera className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-brand-dark">Snap or upload a travel photo</p>
          <p className="text-xs text-brand-muted mt-1 text-center max-w-[280px]">
            Drag & drop or tap to upload a landmark, restaurant menu, sign, or booking voucher.
          </p>
        </div>
      )}

      {imageSrc && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left panel - Image preview */}
          <div className="flex-1 max-h-[350px] lg:max-h-[450px] relative rounded-card overflow-hidden bg-brand-muted/10 border border-brand-muted/10 flex items-center justify-center">
            <img src={imageSrc} alt="Preview" className="max-h-full max-w-full object-contain" />
            <button 
              onClick={() => { setImageSrc(null); setResult(null); }}
              className="absolute top-3 right-3 bg-brand-dark/70 hover:bg-brand-dark/95 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow backdrop-blur-sm"
            >
              Reset Camera
            </button>
          </div>

          {/* Right panel - Analysis details */}
          <div className="flex-1 flex flex-col justify-center min-h-[200px]">
            {loading && (
              <div className="flex flex-col items-center text-center p-6 space-y-4">
                <RefreshCw className="h-8 w-8 text-brand-accent animate-spin" />
                <div>
                  <h4 className="font-bold text-brand-dark text-sm sm:text-base">Analyzing photo with Gemini Vision...</h4>
                  <p className="text-xs text-brand-muted mt-1">Generating travel coordinates and briefs.</p>
                </div>
                <div className="p-3 bg-brand-bg border border-brand-primary/5 rounded-lg max-w-sm">
                  <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider text-left mb-1">💡 Travel Trivia</p>
                  <p className="text-xs text-brand-dark leading-relaxed text-left italic">
                    "{loadingFact}"
                  </p>
                </div>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4 animate-fade-in">
                {/* Result header */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-accent uppercase tracking-widest">
                    <span>🧠 AI VISION DECODED</span>
                    <span className="text-[10px] bg-brand-accent/10 px-2 py-0.5 rounded-full font-semibold">{result.type}</span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark mt-1 flex items-center gap-2">
                    {result.identified_as}
                  </h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">{result.description}</p>
                </div>

                {/* Landmark Info */}
                {result.type === 'landmark' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-brand-bg rounded-lg border border-brand-primary/5">
                      <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider">Brief History</h4>
                      <p className="text-xs text-brand-dark/90 leading-relaxed mt-1">{result.history}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">Best Tips & Hacks</h4>
                      <ul className="space-y-1">
                        {result.tips?.map((tip: string, i: number) => (
                          <li key={i} className="text-xs text-brand-muted flex items-start gap-1.5">
                            <span className="text-brand-accent font-bold mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">What's Nearby (Within 500m)</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {result.nearby?.map((item: string, i: number) => (
                          <span key={i} className="text-[10px] font-semibold text-brand-primary bg-brand-primary/5 border border-brand-primary/10 px-2 py-1 rounded-full">
                            📍 {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu Info */}
                {result.type === 'menu' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">Identified Dishes</h4>
                    <div className="space-y-2">
                      {result.dishes?.map((dish: any, i: number) => (
                        <div key={i} className="p-3 bg-brand-bg rounded-lg border border-brand-primary/5 flex justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-brand-dark">{dish.name}</span>
                              {dish.allergen && (
                                <span className="text-[9px] bg-red-50 text-red-600 border border-red-100 font-bold px-1.5 py-0.2 rounded uppercase">
                                  Allergens: {dish.allergen}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-brand-muted leading-tight">{dish.desc}</p>
                            <p className="text-[11px] text-brand-accent font-medium italic">💡 {dish.recommendation}</p>
                          </div>
                          <span className="font-mono font-bold text-xs text-brand-primary whitespace-nowrap">{dish.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document details */}
                {result.type === 'document' && result.document_details && (
                  <div className="space-y-3">
                    <div className="p-3 bg-brand-bg border border-brand-primary/5 rounded-lg flex items-start gap-2.5">
                      <FileText className="h-5 w-5 text-brand-primary mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider">{result.document_details.title}</h4>
                        <ul className="mt-1.5 space-y-1">
                          {result.document_details.extracted_info.map((info: string, i: number) => (
                            <li key={i} className="text-xs text-brand-dark font-medium flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-brand-primary" />
                              <span>{info}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {result.document_details.timeline_impact && (
                      <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2 text-xs text-amber-800">
                        <AlertCircle className="h-4 w-4 text-brand-warning flex-shrink-0" />
                        <span className="font-medium">{result.document_details.timeline_impact}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions bottom */}
                <div className="pt-3 border-t border-brand-muted/10 flex flex-wrap gap-2">
                  {onAddStop && result.type === 'landmark' && (
                    <button 
                      onClick={() => onAddStop(result.identified_as, result.description)}
                      className="py-1.5 px-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-btn text-xs shadow-sm flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add to Trip Stop</span>
                    </button>
                  )}
                  {onSaveToMemories && (
                    <button 
                      onClick={() => onSaveToMemories(imageSrc, `Decoded: ${result.identified_as}`)}
                      className="py-1.5 px-3 bg-brand-accent hover:bg-brand-accent/95 text-white font-bold rounded-btn text-xs shadow-sm flex items-center gap-1"
                    >
                      <Compass className="h-3.5 w-3.5" />
                      <span>Save as Memory</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
