import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  ArrowRight,
  Flame,
  Palmtree,
  Camera,
  Heart,
  Smartphone,
  Square,
  Frame,
} from 'lucide-react';
import { LayoutFormat, LayoutTemplate, Photo, StyleVariation, VibeCategory } from '../types/layout';
import { autoAssignPhotos, saveLayoutToStorage } from '../utils/layoutEngine';

interface AiArtDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  onApplyLayout: (layout: LayoutTemplate, assignments: Record<string, string>) => void;
}

const QUICK_VIBE_INSPIRATIONS = [
  {
    icon: Flame,
    label: '3AM Flash Afters',
    category: 'genz_party' as VibeCategory,
    prompt: 'chaotic 3am party dump with flash photography, overlapping tilted polaroids, barcode sticker and neon stars',
  },
  {
    icon: Palmtree,
    label: 'Amalfi Vacation Diary',
    category: 'vacation_diary' as VibeCategory,
    prompt: 'sunny Mediterranean coast trip, massive hero landscape with mini polaroids, passport visa stamp and washi tape',
  },
  {
    icon: Sparkles,
    label: 'Vogue Minimal Editorial',
    category: 'vogue_editorial' as VibeCategory,
    prompt: 'high-fashion avant-garde centerfold with dramatic negative space, off-center hero crop and minimal hairline layout',
  },
  {
    icon: Camera,
    label: '35mm Film Contact Roll',
    category: 'film_archive' as VibeCategory,
    prompt: 'authentic darkroom film contact sheet with frame numbers, orange timestamp and sprocket styling',
  },
  {
    icon: Heart,
    label: 'Scrapbook Keepsake',
    category: 'scrapbook' as VibeCategory,
    prompt: 'art-school scrapbook spread with overlapping memories, washi tape corners and sweet handwritten notes',
  },
];

export const AiArtDirectorModal: React.FC<AiArtDirectorModalProps> = ({
  isOpen,
  onClose,
  photos,
  onApplyLayout,
}) => {
  const [vibePrompt, setVibePrompt] = useState(
    'chaotic 3am party dump with flash photography and tilted polaroids'
  );
  const [selectedCategory, setSelectedCategory] = useState<VibeCategory>('genz_party');
  const [format, setFormat] = useState<LayoutFormat>('story');
  const [styleType, setStyleType] = useState<StyleVariation>('bordered');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLayout, setGeneratedLayout] = useState<LayoutTemplate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedLayout(null);

    try {
      const response = await fetch('/api/generate-ai-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vibePrompt,
          photoCount: Math.min(Math.max(photos.length, 2), 6),
          format,
          styleType,
          vibeCategory: selectedCategory,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate layout');
      }

      const l = data.layout;
      const templ: LayoutTemplate = {
        id: `ai-direct-${Date.now()}`,
        name: l.title || 'AI Art-Directed Layout',
        format: l.format || format,
        styleType: l.styleType || styleType,
        vibeCategory: l.vibeCategory || selectedCategory,
        photoCount: l.slots?.length || photos.length,
        backgroundColor: l.backgroundColor || '#0F0F12',
        backgroundTexture: 'paper',
        frameColor: l.frameColor || '#FFFFFF',
        frameWidth: l.frameWidth || 9,
        gap: 0,
        dropShadow: l.dropShadow ?? true,
        tapeStyle: l.tapeStyle || 'washi_top',
        stickerText: l.stickerText || 'AFTER HOURS // 03:42',
        captionVibe: l.vibeDescription || 'art directed',
        dateStamp: l.dateStamp || "'26 10 01",
        handwrittenNote: l.handwrittenNote || 'favorite night ✨',
        handwrittenPosition: { x: 14, y: 92, rotation: -3 },
        stickers:
          selectedCategory === 'genz_party'
            ? [
                { id: 's1', type: 'barcode', x: 74, y: 86, rotation: 0 },
                { id: 's2', type: 'star', x: 82, y: 12, rotation: 10, color: '#E29D72' },
              ]
            : selectedCategory === 'vacation_diary'
            ? [
                { id: 's3', type: 'stamp', x: 76, y: 10, rotation: 8, text: 'PASSPORT' },
              ]
            : [],
        slots: (l.slots || []).map((s: any, idx: number) => ({
          id: s.id || `slot-${idx + 1}`,
          x: Math.max(0, Math.min(95, s.x)),
          y: Math.max(0, Math.min(95, s.y)),
          width: Math.max(12, Math.min(95, s.width)),
          height: Math.max(12, Math.min(95, s.height)),
          rotation: s.rotation || 0,
          zIndex: s.zIndex || idx + 1,
          borderRadius: s.borderRadius ?? 2,
          aspectRatio: s.aspectRatio || 'portrait',
          isHero: Boolean(s.isHero),
          captionHint: s.captionHint,
        })),
        isCustomOrExtracted: true,
      };

      setGeneratedLayout(templ);
    } catch (err: any) {
      console.error('AI Layout error:', err);
      setErrorMsg(err.message || 'Error communicating with AI Art Director');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentAssignments = generatedLayout
    ? autoAssignPhotos(generatedLayout.slots, photos)
    : {};

  const handleApply = () => {
    if (!generatedLayout) return;
    saveLayoutToStorage(generatedLayout);
    onApplyLayout(generatedLayout, currentAssignments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#19191E] border border-[#2B2B33] rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-[#282830] flex items-center justify-between bg-[#151518]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E29D72] to-[#E76F51] text-[#121214] flex items-center justify-center shadow-md">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                <span>AI Art Director</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#E29D72]/15 text-[#E29D72] border border-[#E29D72]/30">
                  Designed, not tiled
                </span>
              </h2>
              <p className="text-xs text-[#9E9EA7]">
                Prompt Gemini to compose intentional asymmetrical layouts, hero frames, and party/vacation vibes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9E9EA7] hover:text-white hover:bg-[#25252D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Quick Inspirations */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#8C8C96] uppercase tracking-wider block">
              1. Choose a Curated Aesthetic Vibe
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_VIBE_INSPIRATIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedCategory === item.category;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setSelectedCategory(item.category);
                      setVibePrompt(item.prompt);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'bg-[#E29D72]/15 border-[#E29D72] text-white shadow-sm'
                        : 'bg-[#151518] border-[#292933] text-[#A0A0AA] hover:text-white hover:border-[#3D3D48]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#E29D72] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold block leading-tight">
                        {item.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vibe Prompt Input */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#8C8C96] uppercase tracking-wider block">
              2. Describe your Outing or Specific Art-Direction
            </span>
            <textarea
              rows={2}
              value={vibePrompt}
              onChange={(e) => setVibePrompt(e.target.value)}
              placeholder="e.g. 3am flash rave party with tilted overlapping polaroids and barcode stickers"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#2D2D37] text-white text-xs focus:border-[#E29D72] focus:outline-none"
            />
          </div>

          {/* Format & Style Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#8C8C96] uppercase tracking-wider block">
                Format
              </span>
              <div className="grid grid-cols-3 gap-1 bg-[#141417] p-1 rounded-xl border border-[#2C2C35] text-xs">
                <button
                  onClick={() => setFormat('story')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${
                    format === 'story'
                      ? 'bg-[#E29D72] text-[#121214]'
                      : 'text-[#9E9EA7] hover:text-white'
                  }`}
                >
                  Story (9:16)
                </button>
                <button
                  onClick={() => setFormat('square')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${
                    format === 'square'
                      ? 'bg-[#E29D72] text-[#121214]'
                      : 'text-[#9E9EA7] hover:text-white'
                  }`}
                >
                  Square (1:1)
                </button>
                <button
                  onClick={() => setFormat('portrait_feed')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${
                    format === 'portrait_feed'
                      ? 'bg-[#E29D72] text-[#121214]'
                      : 'text-[#9E9EA7] hover:text-white'
                  }`}
                >
                  Feed (4:5)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#8C8C96] uppercase tracking-wider block">
                Style Variation
              </span>
              <div className="grid grid-cols-2 gap-1 bg-[#141417] p-1 rounded-xl border border-[#2C2C35] text-xs">
                <button
                  onClick={() => setStyleType('bordered')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${
                    styleType === 'bordered'
                      ? 'bg-[#E29D72] text-[#121214]'
                      : 'text-[#9E9EA7] hover:text-white'
                  }`}
                >
                  Bordered (Tape/Stickers)
                </button>
                <button
                  onClick={() => setStyleType('borderless')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${
                    styleType === 'borderless'
                      ? 'bg-[#E29D72] text-[#121214]'
                      : 'text-[#9E9EA7] hover:text-white'
                  }`}
                >
                  Borderless Minimal
                </button>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E29D72] to-[#E76F51] hover:opacity-95 text-[#121214] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#E29D72]/20 disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#121214] border-t-transparent rounded-full animate-spin" />
                <span>Art Directing Layout with Gemini 3.8 Flash...</span>
              </div>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Direct Custom Layout for My {photos.length} Photos</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedLayout && (
            <div className="bg-[#141418] border border-[#292934] rounded-2xl p-4 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {generatedLayout.name}
                  </h3>
                  <p className="text-xs text-[#9E9EA7]">
                    {generatedLayout.captionVibe} • {generatedLayout.slots.length} photo slots
                  </p>
                </div>
                <button
                  onClick={handleApply}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E29D72] to-[#E76F51] text-[#121214] font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-[#E29D72]/20"
                >
                  <span>Apply & Open in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mini Preview Frame */}
              <div className="flex items-center justify-center p-3 bg-black/40 rounded-xl">
                <div
                  className={`relative w-full max-w-[240px] rounded-xl overflow-hidden shadow-2xl border border-[#33333E] ${
                    generatedLayout.format === 'story'
                      ? 'aspect-[9/16]'
                      : generatedLayout.format === 'square'
                      ? 'aspect-square'
                      : 'aspect-[4/5]'
                  }`}
                  style={{ backgroundColor: generatedLayout.backgroundColor }}
                >
                  {generatedLayout.slots.map((slot) => {
                    const photoId = currentAssignments[slot.id];
                    const photo = photos.find((p) => p.id === photoId);
                    const isBordered = generatedLayout.styleType === 'bordered';
                    const frameW = isBordered ? Math.max(generatedLayout.frameWidth * 0.45, 3) : 0;
                    return (
                      <div
                        key={slot.id}
                        className="absolute"
                        style={{
                          left: `${slot.x}%`,
                          top: `${slot.y}%`,
                          width: `${slot.width}%`,
                          height: `${slot.height}%`,
                          transform: `rotate(${slot.rotation || 0}deg)`,
                          zIndex: slot.zIndex || 1,
                        }}
                      >
                        <div
                          className="w-full h-full flex flex-col overflow-hidden shadow-sm"
                          style={{
                            backgroundColor: isBordered ? generatedLayout.frameColor || '#FFF' : 'transparent',
                            padding: `${frameW}px`,
                            borderRadius: `${slot.borderRadius || 2}px`,
                          }}
                        >
                          <div className="w-full flex-1 overflow-hidden bg-[#24242A]">
                            {photo ? (
                              <img src={photo.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#33333C]" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Handwritten note preview */}
                  {generatedLayout.handwrittenNote && (
                    <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                      <span className="text-[10px] font-['Caveat'] text-[#FAF5EE] drop-shadow">
                        {generatedLayout.handwrittenNote}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
