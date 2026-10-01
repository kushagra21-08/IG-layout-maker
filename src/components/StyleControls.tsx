import React from 'react';
import {
  LayoutFormat,
  LayoutTemplate,
  StyleVariation,
} from '../types/layout';
import {
  Smartphone,
  Square,
  Shuffle,
  Sparkles,
  Layers,
  Palette,
  Bookmark,
  Check,
  Type,
  Frame,
} from 'lucide-react';

interface StyleControlsProps {
  layout: LayoutTemplate;
  format: LayoutFormat;
  styleVariation: StyleVariation;
  backgroundColor: string;
  backgroundTexture: 'clean' | 'paper' | 'grain' | 'linen' | 'dark_matte';
  frameColor: string;
  frameWidth: number;
  dropShadow: boolean;
  tapeStyle: 'none' | 'washi_top' | 'corners' | 'polaroid_bottom' | 'pin';
  stickerText: string;
  dateStampText: string;
  handwrittenNoteText: string;
  onUpdateFormat: (format: LayoutFormat) => void;
  onUpdateStyleVariation: (style: StyleVariation) => void;
  onUpdateBackground: (color: string) => void;
  onUpdateTexture: (texture: 'clean' | 'paper' | 'grain' | 'linen' | 'dark_matte') => void;
  onUpdateFrameColor: (color: string) => void;
  onUpdateFrameWidth: (width: number) => void;
  onUpdateDropShadow: (enabled: boolean) => void;
  onUpdateTapeStyle: (tape: 'none' | 'washi_top' | 'corners' | 'polaroid_bottom' | 'pin') => void;
  onUpdateStickerText: (text: string) => void;
  onUpdateDateStampText: (text: string) => void;
  onUpdateHandwrittenNoteText: (text: string) => void;
  onShufflePhotos: () => void;
  onSaveCurrentLayout: () => void;
  saveSuccess?: boolean;
}

const BG_COLOR_PALETTES = [
  { name: 'Warm Cream', hex: '#FAF6F0' },
  { name: 'Oatmeal Paper', hex: '#EBE6DE' },
  { name: 'Matte Black', hex: '#0E0E12' },
  { name: 'Dark Film 35mm', hex: '#161618' },
  { name: 'Studio White', hex: '#FFFFFF' },
  { name: 'Soft Linen', hex: '#F0ECE4' },
  { name: 'Quiet Sage', hex: '#E5EBE6' },
  { name: 'Muted Rose', hex: '#F3E8E6' },
];

export const StyleControls: React.FC<StyleControlsProps> = ({
  layout,
  format,
  styleVariation,
  backgroundColor,
  backgroundTexture,
  frameColor,
  frameWidth,
  dropShadow,
  tapeStyle,
  stickerText,
  dateStampText,
  handwrittenNoteText,
  onUpdateFormat,
  onUpdateStyleVariation,
  onUpdateBackground,
  onUpdateTexture,
  onUpdateFrameColor,
  onUpdateFrameWidth,
  onUpdateDropShadow,
  onUpdateTapeStyle,
  onUpdateStickerText,
  onUpdateDateStampText,
  onUpdateHandwrittenNoteText,
  onShufflePhotos,
  onSaveCurrentLayout,
  saveSuccess,
}) => {
  return (
    <div className="bg-[#18181D] rounded-2xl border border-[#272730] p-4.5 space-y-5">
      {/* Quick Action: Shuffle & Save */}
      <div className="flex items-center gap-2">
        <button
          onClick={onShufflePhotos}
          className="flex-1 py-2 px-3 rounded-xl bg-[#23232A] hover:bg-[#2F2F39] text-white border border-[#30303B] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <Shuffle className="w-3.5 h-3.5 text-[#E29D72]" />
          <span>Shuffle Photos</span>
        </button>

        <button
          onClick={onSaveCurrentLayout}
          className="py-2 px-3 rounded-xl bg-[#23232A] hover:bg-[#2F2F39] text-[#D1D1D8] border border-[#30303B] text-xs font-medium flex items-center gap-1.5 transition-all"
          title="Save this layout structure for future photo dumps"
        >
          {saveSuccess ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Bookmark className="w-3.5 h-3.5 text-[#E29D72]" />
          )}
          <span>{saveSuccess ? 'Saved' : 'Save Layout'}</span>
        </button>
      </div>

      {/* 1. Format Switcher (Stories vs Square vs Feed) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#8C8C96] uppercase tracking-wider block">
          Canvas Format
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onUpdateFormat('story')}
            className={`py-2 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all border ${
              format === 'story'
                ? 'bg-[#E29D72] text-[#121214] border-[#E29D72] shadow-sm font-semibold'
                : 'bg-[#1E1E24] text-[#A0A0AA] border-[#2C2C35] hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Story (9:16)</span>
          </button>

          <button
            onClick={() => onUpdateFormat('square')}
            className={`py-2 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all border ${
              format === 'square'
                ? 'bg-[#E29D72] text-[#121214] border-[#E29D72] shadow-sm font-semibold'
                : 'bg-[#1E1E24] text-[#A0A0AA] border-[#2C2C35] hover:text-white'
            }`}
          >
            <Square className="w-4 h-4" />
            <span>Square (1:1)</span>
          </button>

          <button
            onClick={() => onUpdateFormat('portrait_feed')}
            className={`py-2 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all border ${
              format === 'portrait_feed'
                ? 'bg-[#E29D72] text-[#121214] border-[#E29D72] shadow-sm font-semibold'
                : 'bg-[#1E1E24] text-[#A0A0AA] border-[#2C2C35] hover:text-white'
            }`}
          >
            <Frame className="w-4 h-4" />
            <span>Feed (4:5)</span>
          </button>
        </div>
      </div>

      {/* 2. Style Variation (Bordered vs Borderless) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#8C8C96] uppercase tracking-wider block">
          Aesthetic Style Variation
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdateStyleVariation('bordered')}
            className={`p-2.5 rounded-xl text-left border transition-all ${
              styleVariation === 'bordered'
                ? 'bg-[#E29D72]/15 border-[#E29D72] text-white shadow-sm'
                : 'bg-[#1E1E24] border-[#2C2C35] text-[#9E9EA7] hover:border-[#40404C]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">
                Bordered & Graphics
              </span>
              {styleVariation === 'bordered' && (
                <div className="w-2 h-2 rounded-full bg-[#E29D72]" />
              )}
            </div>
            <p className="text-[10px] text-[#8E8E98] leading-tight">
              Polaroid frames, washi tape, stamps, subtle shadows
            </p>
          </button>

          <button
            onClick={() => onUpdateStyleVariation('borderless')}
            className={`p-2.5 rounded-xl text-left border transition-all ${
              styleVariation === 'borderless'
                ? 'bg-[#E29D72]/15 border-[#E29D72] text-white shadow-sm'
                : 'bg-[#1E1E24] border-[#2C2C35] text-[#9E9EA7] hover:border-[#40404C]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">
                Borderless Minimal
              </span>
              {styleVariation === 'borderless' && (
                <div className="w-2 h-2 rounded-full bg-[#E29D72]" />
              )}
            </div>
            <p className="text-[10px] text-[#8E8E98] leading-tight">
              Sleek magazine cuts, flush negative margins, no decorations
            </p>
          </button>
        </div>
      </div>

      {/* 3. Background Palette */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-[#8C8C96] uppercase tracking-wider block">
            Background Color
          </label>
          <span className="text-[10px] font-mono text-[#777]">{backgroundColor}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {BG_COLOR_PALETTES.map((color) => {
            const isSelected = backgroundColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                onClick={() => onUpdateBackground(color.hex)}
                className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                  isSelected
                    ? 'border-[#E29D72] scale-110 shadow-md ring-2 ring-[#E29D72]/30'
                    : 'border-[#3D3D48] hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      color.hex === '#FFFFFF' || color.hex === '#FAF6F0' || color.hex === '#EBE6DE'
                        ? 'text-black'
                        : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Background Texture */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#8C8C96] uppercase tracking-wider block">
          Paper / Material Texture
        </label>
        <div className="grid grid-cols-4 gap-1.5 text-[11px]">
          {(['clean', 'paper', 'grain', 'linen'] as const).map((tex) => (
            <button
              key={tex}
              onClick={() => onUpdateTexture(tex)}
              className={`py-1.5 px-2 rounded-lg capitalize border font-medium transition-all ${
                backgroundTexture === tex
                  ? 'bg-[#2E2E39] text-[#E29D72] border-[#E29D72]'
                  : 'bg-[#1E1E24] text-[#8E8E98] border-[#2C2C35] hover:text-white'
              }`}
            >
              {tex}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Border Details (Only when styleVariation === 'bordered') */}
      {styleVariation === 'bordered' && (
        <div className="space-y-3 pt-2 border-t border-[#25252D]">
          <label className="text-[11px] font-semibold text-[#8C8C96] uppercase tracking-wider block">
            Border & Polaroid Accents
          </label>

          {/* Tape Style Switcher */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              onClick={() => onUpdateTapeStyle('washi_top')}
              className={`py-1.5 px-2 rounded-lg border font-medium transition-all ${
                tapeStyle === 'washi_top'
                  ? 'bg-[#2E2E39] text-[#E29D72] border-[#E29D72]'
                  : 'bg-[#1E1E24] text-[#8E8E98] border-[#2C2C35] hover:text-white'
              }`}
            >
              Washi Tape
            </button>
            <button
              onClick={() => onUpdateTapeStyle('corners')}
              className={`py-1.5 px-2 rounded-lg border font-medium transition-all ${
                tapeStyle === 'corners'
                  ? 'bg-[#2E2E39] text-[#E29D72] border-[#E29D72]'
                  : 'bg-[#1E1E24] text-[#8E8E98] border-[#2C2C35] hover:text-white'
              }`}
            >
              Corner Tape
            </button>
            <button
              onClick={() => onUpdateTapeStyle('none')}
              className={`py-1.5 px-2 rounded-lg border font-medium transition-all ${
                tapeStyle === 'none'
                  ? 'bg-[#2E2E39] text-[#E29D72] border-[#E29D72]'
                  : 'bg-[#1E1E24] text-[#8E8E98] border-[#2C2C35] hover:text-white'
              }`}
            >
              Clean Frame
            </button>
          </div>

          {/* Frame Width Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-[#A0A0AB]">
              <span>Frame Border Width</span>
              <span className="font-mono">{frameWidth}px</span>
            </div>
            <input
              type="range"
              min="4"
              max="20"
              step="1"
              value={frameWidth}
              onChange={(e) => onUpdateFrameWidth(parseInt(e.target.value, 10))}
              className="w-full accent-[#E29D72] h-1.5 bg-[#2B2B33] rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 6. Aesthetic Text Stamps */}
      <div className="space-y-2 pt-2 border-t border-[#25252D]">
        <label className="text-[11px] font-semibold text-[#8C8C96] uppercase tracking-wider block">
          Editorial Text & Date Stamps
        </label>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[10px] text-[#8A8A94] block mb-1">
              Top Stamp Label
            </span>
            <input
              type="text"
              value={stickerText}
              onChange={(e) => onUpdateStickerText(e.target.value)}
              placeholder="e.g. ARCHIVE // 04, OUTING DUMP"
              className="w-full px-3 py-1.5 rounded-xl bg-[#141417] border border-[#2D2D37] text-white text-xs font-mono focus:border-[#E29D72] focus:outline-none"
            />
          </div>

          <div>
            <span className="text-[10px] text-[#8A8A94] block mb-1">
              Date & Location Tag
            </span>
            <input
              type="text"
              value={dateStampText}
              onChange={(e) => onUpdateDateStampText(e.target.value)}
              placeholder="e.g. OCT 2026 • TOKYO"
              className="w-full px-3 py-1.5 rounded-xl bg-[#141417] border border-[#2D2D37] text-white text-xs font-mono focus:border-[#E29D72] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#8A8A94]">
                Handwritten Note Scribble
              </span>
              <span className="text-[9px] font-mono text-[#E29D72]">cursive</span>
            </div>
            <input
              type="text"
              value={handwrittenNoteText}
              onChange={(e) => onUpdateHandwrittenNoteText(e.target.value)}
              placeholder="e.g. don't let the music stop ✨"
              className="w-full px-3 py-1.5 rounded-xl bg-[#141417] border border-[#2D2D37] text-white text-xs font-['Caveat'] text-sm focus:border-[#E29D72] focus:outline-none"
            />
            {/* Quick Note Suggestions */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {[
                "don't let the music stop ✨",
                'sun-kissed & salty 🌊',
                'can we relive this? 🫧',
                'chaotic 3am camera dump',
                'nobody was sober lol',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onUpdateHandwrittenNoteText(suggestion)}
                  className="px-2 py-0.5 rounded-md bg-[#22222A] hover:bg-[#2E2E38] text-[10px] text-[#B0B0BA] font-['Caveat'] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
