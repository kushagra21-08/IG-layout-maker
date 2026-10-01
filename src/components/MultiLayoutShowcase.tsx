import React, { useState } from 'react';
import {
  LayoutFormat,
  LayoutTemplate,
  Photo,
  SlotTransform,
  StyleVariation,
} from '../types/layout';
import {
  Sparkles,
  Shuffle,
  Eye,
  Sliders,
  Check,
  Smartphone,
  Square,
  Layers,
  CheckSquare,
} from 'lucide-react';
import { autoAssignPhotos, shuffleAssignments } from '../utils/layoutEngine';

interface MultiLayoutShowcaseProps {
  layouts: LayoutTemplate[];
  photos: Photo[];
  activeLayoutId: string;
  onSelectLayout: (layout: LayoutTemplate, customAssignments?: Record<string, string>) => void;
  onQuickExport: (layout: LayoutTemplate, assignments: Record<string, string>) => void;
  onOpenArtDirector: () => void;
}

export const MultiLayoutShowcase: React.FC<MultiLayoutShowcaseProps> = ({
  layouts,
  photos,
  activeLayoutId,
  onSelectLayout,
  onQuickExport,
  onOpenArtDirector,
}) => {
  const [formatFilter, setFormatFilter] = useState<'all' | LayoutFormat>('all');
  const [styleFilter, setStyleFilter] = useState<'all' | StyleVariation>('all');
  const [vibeFilter, setVibeFilter] = useState<'all' | LayoutTemplate['vibeCategory']>('all');
  const [shuffleKey, setShuffleKey] = useState(0);

  const photoMap = new Map<string, Photo>();
  photos.forEach((p) => photoMap.set(p.id, p));

  // Filter layouts
  const filteredLayouts = layouts.filter((layout) => {
    if (formatFilter !== 'all' && layout.format !== formatFilter) return false;
    if (styleFilter !== 'all' && layout.styleType !== styleFilter) return false;
    if (vibeFilter !== 'all' && layout.vibeCategory !== vibeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Control bar: Filters & Shuffle */}
      <div className="bg-[#18181D] rounded-2xl border border-[#282830] p-4 flex flex-col gap-4">
        {/* Row 1: Vibe Categories */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-mono text-[#8C8C96] uppercase mr-1">
              Aesthetic Vibe:
            </span>
            <button
              onClick={() => setVibeFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                vibeFilter === 'all'
                  ? 'bg-[#E29D72] text-[#121214] font-semibold shadow-sm'
                  : 'bg-[#222228] text-[#A0A0AB] hover:text-white border border-[#2D2D35]'
              }`}
            >
              All Vibes
            </button>
            <button
              onClick={() => setVibeFilter('genz_party')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                vibeFilter === 'genz_party'
                  ? 'bg-[#E29D72] text-[#121214] font-semibold shadow-sm'
                  : 'bg-[#222228] text-[#A0A0AB] hover:text-white border border-[#2D2D35]'
              }`}
            >
              <span>🔥 Gen-Z Party & Flash</span>
            </button>
            <button
              onClick={() => setVibeFilter('vacation_diary')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                vibeFilter === 'vacation_diary'
                  ? 'bg-[#E29D72] text-[#121214] font-semibold shadow-sm'
                  : 'bg-[#222228] text-[#A0A0AB] hover:text-white border border-[#2D2D35]'
              }`}
            >
              <span>🌴 Vacation Diary</span>
            </button>
            <button
              onClick={() => setVibeFilter('vogue_editorial')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                vibeFilter === 'vogue_editorial'
                  ? 'bg-[#E29D72] text-[#121214] font-semibold shadow-sm'
                  : 'bg-[#222228] text-[#A0A0AB] hover:text-white border border-[#2D2D35]'
              }`}
            >
              <span>🍸 Vogue Editorial</span>
            </button>
            <button
              onClick={() => setVibeFilter('film_archive')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                vibeFilter === 'film_archive'
                  ? 'bg-[#E29D72] text-[#121214] font-semibold shadow-sm'
                  : 'bg-[#222228] text-[#A0A0AB] hover:text-white border border-[#2D2D35]'
              }`}
            >
              <span>🎞️ 35mm Film</span>
            </button>
            <button
              onClick={() => setVibeFilter('scrapbook')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                vibeFilter === 'scrapbook'
                  ? 'bg-[#E29D72] text-[#121214] font-semibold shadow-sm'
                  : 'bg-[#222228] text-[#A0A0AB] hover:text-white border border-[#2D2D35]'
              }`}
            >
              <span>💌 Scrapbook Taped</span>
            </button>
          </div>

          {/* AI Art Director Quick Trigger */}
          <button
            onClick={onOpenArtDirector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E29D72]/20 to-[#E76F51]/20 hover:from-[#E29D72]/30 hover:to-[#E76F51]/30 text-[#E29D72] border border-[#E29D72]/40 text-xs font-semibold transition-all shadow-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Custom Vibe with AI</span>
          </button>
        </div>

        {/* Row 2: Format & Style Filters + Shuffle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#26262E]">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Format selector */}
            <div className="flex items-center gap-1 bg-[#222228] p-1 rounded-xl border border-[#2E2E36] text-xs">
              <button
                onClick={() => setFormatFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  formatFilter === 'all'
                    ? 'bg-[#E29D72] text-[#121214]'
                    : 'text-[#9E9EA7] hover:text-white'
                }`}
              >
                All Formats
              </button>
              <button
                onClick={() => setFormatFilter('story')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  formatFilter === 'story'
                    ? 'bg-[#E29D72] text-[#121214]'
                    : 'text-[#9E9EA7] hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Stories (9:16)</span>
              </button>
              <button
                onClick={() => setFormatFilter('square')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  formatFilter === 'square'
                    ? 'bg-[#E29D72] text-[#121214]'
                    : 'text-[#9E9EA7] hover:text-white'
                }`}
              >
                <Square className="w-3 h-3" />
                <span>Square (1:1)</span>
              </button>
              <button
                onClick={() => setFormatFilter('portrait_feed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  formatFilter === 'portrait_feed'
                    ? 'bg-[#E29D72] text-[#121214]'
                    : 'text-[#9E9EA7] hover:text-white'
                }`}
              >
                Feed (4:5)
              </button>
            </div>

            {/* Style selector */}
            <div className="flex items-center gap-1 bg-[#222228] p-1 rounded-xl border border-[#2E2E36] text-xs">
              <button
                onClick={() => setStyleFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  styleFilter === 'all'
                    ? 'bg-[#E29D72] text-[#121214]'
                    : 'text-[#9E9EA7] hover:text-white'
                }`}
              >
                Both Styles
              </button>
              <button
                onClick={() => setStyleFilter('bordered')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  styleFilter === 'bordered'
                    ? 'bg-[#E29D72] text-[#121214]'
                    : 'text-[#9E9EA7] hover:text-white'
                }`}
              >
                Bordered & Tape
              </button>
              <button
                onClick={() => setStyleFilter('borderless')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  styleFilter === 'borderless'
                    ? 'bg-[#E29D72] text-[#121214]'
                    : 'text-[#9E9EA7] hover:text-white'
                }`}
              >
                Borderless Minimal
              </button>
            </div>
          </div>

          {/* Shuffle Photo Combinations */}
          <button
            onClick={() => setShuffleKey((k) => k + 1)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#25252E] hover:bg-[#30303B] text-white border border-[#353540] text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm shrink-0"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#E29D72]" />
            <span>Shuffle Photo Combinations</span>
          </button>
        </div>
      </div>

      {/* Grid of Layout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredLayouts.map((layout) => {
          const isSelected = activeLayoutId === layout.id;
          // Compute assignment with shuffle key
          const assignments = shuffleKey > 0
            ? shuffleAssignments(layout.slots, photos)
            : autoAssignPhotos(layout.slots, photos);

          const isBordered = layout.styleType === 'bordered';
          const isDarkBg =
            layout.backgroundColor === '#121214' ||
            layout.backgroundColor === '#161618' ||
            layout.backgroundColor === '#0F0F11';

          return (
            <div
              key={layout.id + shuffleKey}
              onClick={() => onSelectLayout(layout, assignments)}
              className={`group flex flex-col bg-[#19191E] rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer hover:border-[#E29D72]/60 hover:shadow-xl hover:shadow-[#E29D72]/5 ${
                isSelected
                  ? 'border-[#E29D72] ring-2 ring-[#E29D72]/20'
                  : 'border-[#26262E]'
              }`}
            >
              {/* Card Header */}
              <div className="p-3.5 pb-2 flex items-center justify-between border-b border-[#24242C]">
                <div>
                  <h3 className="text-xs font-semibold text-white truncate max-w-[170px]">
                    {layout.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-mono uppercase text-[#A0A0AA]">
                      {layout.format === 'story'
                        ? '9:16 Story'
                        : layout.format === 'square'
                        ? '1:1 Square'
                        : '4:5 Feed'}
                    </span>
                    <span className="text-[10px] text-[#555]">•</span>
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.2 rounded ${
                        isBordered
                          ? 'bg-[#E29D72]/15 text-[#E29D72]'
                          : 'bg-[#33333E] text-[#B0B0BB]'
                      }`}
                    >
                      {isBordered ? 'Bordered' : 'Borderless'}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-[#8C8C96] bg-[#222228] px-2 py-0.5 rounded-full border border-[#2D2D35]">
                  {layout.slots.length} Slots
                </span>
              </div>

              {/* Layout Preview Container */}
              <div className="p-3 flex items-center justify-center bg-[#131316]">
                <div
                  className={`relative w-full rounded-xl overflow-hidden shadow-md transition-transform group-hover:scale-[1.01] ${
                    layout.format === 'story'
                      ? 'aspect-[9/16] max-h-[360px]'
                      : layout.format === 'square'
                      ? 'aspect-square max-h-[300px]'
                      : 'aspect-[4/5] max-h-[340px]'
                  }`}
                  style={{
                    backgroundColor: layout.backgroundColor,
                  }}
                >
                  {/* Subtle Stamp in corner */}
                  {layout.stickerText && (
                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                      <span
                        className="text-[7px] font-mono uppercase tracking-wider"
                        style={{ color: isDarkBg ? '#DDD' : '#333' }}
                      >
                        {layout.stickerText}
                      </span>
                    </div>
                  )}

                  {/* Render slots */}
                  {layout.slots.map((slot) => {
                    const assignedPhotoId = assignments[slot.id];
                    const photo = assignedPhotoId ? photoMap.get(assignedPhotoId) : null;
                    const effectiveBorder = isBordered ? Math.max(layout.frameWidth * 0.45, 3) : 0;
                    const hasChin = isBordered && (layout.tapeStyle === 'polaroid_bottom' || Boolean(slot.captionHint));

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
                          className={`w-full h-full flex flex-col overflow-hidden ${
                            layout.dropShadow ? 'shadow-sm' : ''
                          }`}
                          style={{
                            backgroundColor: isBordered ? layout.frameColor || '#FFF' : 'transparent',
                            padding: `${effectiveBorder}px`,
                            borderRadius: `${slot.borderRadius || 1}px`,
                          }}
                        >
                          <div className="w-full flex-1 overflow-hidden bg-[#26262B]">
                            {photo ? (
                              <img
                                src={photo.url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#33333A]" />
                            )}
                          </div>
                          {hasChin && (
                            <div className="h-2 flex items-center justify-center">
                              <span className="text-[6px] italic text-[#555] truncate max-w-[90%]">
                                {slot.captionHint || 'dump'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Handwritten note preview on card */}
                  {layout.handwrittenNote && (
                    <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                      <span className="text-[8px] font-['Caveat'] text-white drop-shadow">
                        {layout.handwrittenNote}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 pt-2 flex items-center justify-between bg-[#19191E] border-t border-[#24242C] mt-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLayout(layout, assignments);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#E29D72] hover:text-[#FFA97B] transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Customize</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickExport(layout, assignments);
                  }}
                  className="px-2.5 py-1 rounded-md bg-[#25252E] hover:bg-[#32323D] text-[#D1D1D8] text-[11px] font-medium transition-colors"
                >
                  Quick Export
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
