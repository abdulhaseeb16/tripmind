// src/components/PhotoAnalysis.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  Camera, Upload, RefreshCw, Landmark, BookOpen, FileText,
  MapPin, Clock, Lightbulb, Star, AlertTriangle, Plus,
  Heart, Loader2, ChevronDown, ChevronUp, Image
} from 'lucide-react';
import { analyzePhoto } from '../services/geminiService';
import type { PhotoAnalysisResult } from '../services/geminiService';

interface PhotoAnalysisProps {
  onAddStop?: (name: string, description: string) => void;
  onSaveToMemories?: (photoUrl: string, caption: string) => void;
}

const TRAVEL_FACTS = [
  "Japan has over 5.5 million vending machines — selling everything from ramen to umbrellas.",
  "Rome's Trevi Fountain collects over €3,000 in coins daily, all donated to local charities.",
  "The Amalfi Coast's famous sfusato lemons are so sweet locals eat them raw like apples.",
  "The world's longest commercial flight is Singapore to New York — 18+ hours nonstop.",
  "Bhutan measures progress by Gross National Happiness, not GDP.",
  "Iceland's Blue Lagoon is actually a man-made byproduct of a geothermal power plant.",
];

const TYPE_ICONS = {
  landmark: <Landmark className="h-4 w-4" />,
  menu: <BookOpen className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  landscape: <Image className="h-4 w-4" />,
  unknown: <Camera className="h-4 w-4" />,
};

const TYPE_COLORS = {
  landmark: 'text-brand-primary bg-brand-primary/8 border-brand-primary/20',
  menu: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  document: 'text-amber-700 bg-amber-50 border-amber-200',
  landscape: 'text-sky-700 bg-sky-50 border-sky-200',
  unknown: 'text-brand-muted bg-brand-bg border-brand-muted/20',
};

// ─── Sub-renderers ────────────────────────────────────────────────────────────

const LandmarkResult: React.FC<{ result: PhotoAnalysisResult; onAddStop?: (n: string, d: string) => void }> = ({ result, onAddStop }) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="space-y-4">
      {/* Core info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {result.coordinates && (
          <div className="flex items-start gap-2 p-3 bg-brand-bg rounded-lg border border-brand-muted/10">
            <MapPin className="h-4 w-4 text-brand-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">Coordinates</p>
              <p className="text-xs font-mono font-bold text-brand-dark mt-0.5">{result.coordinates}</p>
            </div>
          </div>
        )}
        {result.bestVisitTime && (
          <div className="flex items-start gap-2 p-3 bg-brand-bg rounded-lg border border-brand-muted/10">
            <Clock className="h-4 w-4 text-brand-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">Best Time to Visit</p>
              <p className="text-xs font-bold text-brand-dark mt-0.5">{result.bestVisitTime}</p>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-brand-dark leading-relaxed">{result.description}</p>

      {/* History toggle */}
      {result.history && (
        <div className="border border-brand-muted/10 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowHistory(h => !h)}
            className="w-full flex items-center justify-between p-3 bg-brand-bg hover:bg-brand-primary/5 transition-colors text-xs font-bold text-brand-dark"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-brand-primary" />
              Historical Context
            </span>
            {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showHistory && (
            <div className="px-3 pb-3 pt-1 bg-white text-xs text-brand-dark leading-relaxed border-t border-brand-muted/10">
              {result.history}
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      {result.tips && result.tips.length > 0 && (
        <div>
          <h5 className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-2 flex items-center gap-1">
            <Lightbulb className="h-3.5 w-3.5 text-brand-accent" /> Insider Tips
          </h5>
          <ul className="space-y-1.5">
            {result.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-brand-dark">
                <span className="mt-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-[9px] font-bold shrink-0">{i + 1}</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nearby */}
      {result.nearby && result.nearby.length > 0 && (
        <div>
          <h5 className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-2 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-brand-primary" /> Nearby Access Points
          </h5>
          <div className="flex flex-wrap gap-2">
            {result.nearby.map((n, i) => (
              <span key={i} className="text-[10px] px-2 py-1 bg-brand-primary/5 text-brand-primary border border-brand-primary/15 rounded-full font-medium">{n}</span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {onAddStop && (
        <button
          onClick={() => onAddStop(result.identified_as, result.description)}
          className="w-full sm:w-auto flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-btn text-xs font-bold hover:bg-brand-primary/95 transition-all shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Add to Itinerary
        </button>
      )}
    </div>
  );
};

const MenuResult: React.FC<{ result: PhotoAnalysisResult }> = ({ result }) => (
  <div className="space-y-3">
    <p className="text-xs text-brand-muted">{result.description}</p>
    {result.dishes && result.dishes.length > 0 && (
      <div className="space-y-2.5">
        {result.dishes.map((dish, i) => (
          <div key={i} className="p-3 bg-white border border-brand-muted/10 rounded-lg shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h5 className="text-xs font-bold text-brand-dark">{dish.name}</h5>
                <p className="text-[11px] text-brand-muted mt-0.5 leading-relaxed">{dish.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-sm font-black text-brand-dark">{dish.price}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="h-2.5 w-2.5" />{dish.recommendation}
              </span>
              {dish.allergen && (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="h-2.5 w-2.5" />{dish.allergen}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const DocumentResult: React.FC<{ result: PhotoAnalysisResult }> = ({ result }) => (
  <div className="space-y-3">
    {result.document_details && (
      <>
        <h5 className="text-xs font-bold text-brand-dark">{result.document_details.title}</h5>
        <ul className="space-y-1.5">
          {result.document_details.extracted_info.map((info, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-brand-dark bg-brand-bg rounded p-2 border border-brand-muted/10">
              <span className="text-brand-primary font-bold shrink-0">›</span> {info}
            </li>
          ))}
        </ul>
        {result.document_details.timeline_impact && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p><span className="font-bold">Trip Impact:</span> {result.document_details.timeline_impact}</p>
          </div>
        )}
      </>
    )}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export const PhotoAnalysis: React.FC<PhotoAnalysisProps> = ({ onAddStop, onSaveToMemories }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFact, setLoadingFact] = useState('');
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (base64Str: string) => {
    setImageSrc(base64Str);
    setResult(null);
    setLoading(true);
    setLoadingFact(TRAVEL_FACTS[Math.floor(Math.random() * TRAVEL_FACTS.length)]);
    try {
      const analysisResult = await analyzePhoto(base64Str);
      setResult(analysisResult);
    } catch (err) {
      console.error('Photo analysis error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) processImage(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) processImage(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setResult(null);
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Upload Panel */}
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !imageSrc && fileInputRef.current?.click()}
          className={`relative min-h-[280px] rounded-card border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
            ${dragOver ? 'border-brand-primary bg-brand-primary/5 scale-[1.01]' : 'border-brand-muted/25 bg-brand-bg hover:border-brand-primary/50 hover:bg-brand-primary/3'}`}
        >
          {imageSrc ? (
            <>
              <img
                src={imageSrc}
                alt="Uploaded travel photo"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {loading && (
                <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6">
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                  <p className="text-white text-xs font-bold text-center">Analyzing with Gemini Vision...</p>
                  <p className="text-white/70 text-[10px] text-center italic max-w-[240px] leading-relaxed">"{loadingFact}"</p>
                </div>
              )}
              {!loading && result && (
                <div className="absolute bottom-3 right-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-brand-dark rounded-full text-[10px] font-bold shadow-md hover:bg-white transition-all"
                  >
                    <RefreshCw className="h-3 w-3" /> New Scan
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-8 space-y-3">
              <div className="h-16 w-16 mx-auto rounded-full bg-brand-primary/10 flex items-center justify-center">
                <Camera className="h-8 w-8 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-dark">Drop a travel photo here</p>
                <p className="text-xs text-brand-muted mt-1">Landmark, restaurant menu, or hotel document</p>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-brand-primary text-white rounded-btn text-xs font-bold hover:bg-brand-primary/95 transition-all shadow-sm"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload Photo
                </button>
              </div>
              <p className="text-[10px] text-brand-muted">JPG, PNG, WEBP supported</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Save to memories CTA */}
        {result && imageSrc && onSaveToMemories && (
          <button
            onClick={() => onSaveToMemories(imageSrc, result.identified_as)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-brand-muted/20 bg-white hover:bg-brand-bg text-brand-dark rounded-btn text-xs font-bold transition-all shadow-sm"
          >
            <Heart className="h-3.5 w-3.5 text-brand-accent" />
            Save to Trip Memories
          </button>
        )}
      </div>

      {/* Right: Analysis Results */}
      <div className="space-y-4">
        {!result && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-brand-bg rounded-card border border-brand-muted/10 min-h-[280px]">
            <div className="h-14 w-14 rounded-full bg-brand-primary/8 flex items-center justify-center mb-3">
              <Landmark className="h-7 w-7 text-brand-primary/50" />
            </div>
            <p className="text-xs font-bold text-brand-muted">Analysis results will appear here</p>
            <p className="text-[11px] text-brand-muted/70 mt-1 max-w-[200px] leading-relaxed">Upload any travel photo for instant AI-powered identification and tips</p>
          </div>
        )}

        {loading && !result && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-brand-bg rounded-card border border-brand-muted/10 min-h-[280px] space-y-3">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
            <p className="text-xs font-bold text-brand-dark">Running Gemini Vision Analysis...</p>
          </div>
        )}

        {result && !loading && (
          <div className="bg-white border border-brand-muted/10 rounded-card shadow-sm overflow-hidden animate-fade-in">
            {/* Header */}
            <div className={`flex items-center gap-2.5 px-4 py-3 border-b border-brand-muted/10 ${TYPE_COLORS[result.type]}`}>
              {TYPE_ICONS[result.type]}
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">Identified As</p>
                <p className="text-xs font-black truncate">{result.identified_as}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${TYPE_COLORS[result.type]}`}>
                {result.type}
              </span>
            </div>

            {/* Body */}
            <div className="p-4">
              {result.type === 'landmark' && <LandmarkResult result={result} onAddStop={onAddStop} />}
              {result.type === 'menu' && <MenuResult result={result} />}
              {result.type === 'document' && <DocumentResult result={result} />}
              {result.type === 'landscape' && (
                <div className="space-y-2">
                  <p className="text-xs text-brand-dark leading-relaxed">{result.description}</p>
                  {onAddStop && (
                    <button
                      onClick={() => onAddStop(result.identified_as, result.description)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-btn text-xs font-bold hover:bg-brand-primary/95 transition-all shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add to Itinerary
                    </button>
                  )}
                </div>
              )}
              {result.type === 'unknown' && (
                <p className="text-xs text-brand-muted py-4 text-center">
                  Could not identify the travel subject. Try a clearer photo of a landmark, menu, or document.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
