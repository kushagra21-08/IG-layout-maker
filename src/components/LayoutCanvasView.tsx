import React, { useState } from 'react';
import {
  LayoutTemplate,
  Photo,
  Slot,
  SlotTransform,
  StyleVariation,
} from '../types/layout';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  Move,
  RefreshCw,
  Image as ImageIcon,
  Check,
  X,
} from 'lucide-react';

interface LayoutCanvasViewProps {
  layout: LayoutTemplate;
  photos: Photo[];
  slotAssignments: Record<string, string>;
  slotTransforms: Record<string, SlotTransform>;
  styleVariation: StyleVariation;
  backgroundColor: string;
  backgroundTexture: 'clean' | 'paper' | 'grain' | 'linen' | 'dark_matte';
  frameColor: string;
  frameWidth: number;
  dropShadow: boolean;
  tapeStyle: 'none' | 'washi_top' | 'corners' | 'polaroid_bottom' | 'pin';
  stickerText?: string;
  dateStampText?: string;
  handwrittenNoteText?: string;
  onAssignPhoto: (slotId: string, photoId: string) => void;
  onUpdateTransform: (slotId: string, transform: Partial<SlotTransform>) => void;
  onSelectSlot?: (slot: Slot) => void;
}

export const LayoutCanvasView: React.FC<LayoutCanvasViewProps> = ({
  layout,
  photos,
  slotAssignments,
  slotTransforms,
  styleVariation,
  backgroundColor,
  backgroundTexture,
  frameColor,
  frameWidth,
  dropShadow,
  tapeStyle,
  stickerText,
  dateStampText,
  handwrittenNoteText = layout.handwrittenNote,
  onAssignPhoto,
  onUpdateTransform,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [swapPickerSlotId, setSwapPickerSlotId] = useState<string | null>(null);

  const photoMap = new Map<string, Photo>();
  photos.forEach((p) => photoMap.set(p.id, p));

  // Determine aspect ratio class
  const getAspectClass = () => {
    switch (layout.format) {
      case 'story':
        return 'aspect-[9/16] max-h-[720px]';
      case 'square':
        return 'aspect-square max-h-[620px]';
      case 'portrait_feed':
        return 'aspect-[4/5] max-h-[680px]';
      case 'landscape':
        return 'aspect-[16/9] max-h-[500px]';
      default:
        return 'aspect-[9/16] max-h-[720px]';
    }
  };

  const isBordered = styleVariation === 'bordered';
  const isDarkBg =
    backgroundColor === '#121214' ||
    backgroundColor === '#161618' ||
    backgroundColor === '#0F0F11';
  const textColor = isDarkBg ? '#FFFFFF' : '#18181B';
  const subtextColor = isDarkBg ? '#A1A1AA' : '#71717A';

  const selectedSlot = layout.slots.find((s) => s.id === selectedSlotId);
  const activeTransform = selectedSlotId
    ? slotTransforms[selectedSlotId] || { zoom: 1, panX: 0, panY: 0 }
    : { zoom: 1, panX: 0, panY: 0 };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Canvas Frame Container */}
      <div
        className={`relative w-full max-w-[420px] sm:max-w-[480px] md:max-w-[510px] mx-auto rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-[#2D2D35] select-none ${getAspectClass()}`}
        style={{
          backgroundColor,
        }}
      >
        {/* Subtle Paper Texture Layer */}
        {(backgroundTexture === 'paper' || backgroundTexture === 'grain') && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply"
            style={{
              backgroundImage: `radial-gradient(${isDarkBg ? '#333' : '#999'} 1px, transparent 0)`,
              backgroundSize: '8px 8px',
            }}
          />
        )}
        {backgroundTexture === 'linen' && (
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`,
              backgroundSize: '6px 6px',
            }}
          />
        )}

        {/* Outer Editorial Margin & Japanese Crosshairs when Bordered */}
        {isBordered && (
          <div className="absolute inset-3 border border-black/10 dark:border-white/10 pointer-events-none rounded-lg">
            <span className="absolute -top-1 -left-1 text-[10px] leading-none text-black/30 dark:text-white/30 font-mono">
              +
            </span>
            <span className="absolute -top-1 -right-1 text-[10px] leading-none text-black/30 dark:text-white/30 font-mono">
              +
            </span>
            <span className="absolute -bottom-1 -left-1 text-[10px] leading-none text-black/30 dark:text-white/30 font-mono">
              +
            </span>
            <span className="absolute -bottom-1 -right-1 text-[10px] leading-none text-black/30 dark:text-white/30 font-mono">
              +
            </span>
          </div>
        )}

        {/* Top Aesthetic Stamp / Badge */}
        {stickerText && (
          <div className="absolute top-4 left-5 z-20 pointer-events-none">
            <span
              className="text-[10px] font-mono tracking-widest uppercase font-semibold px-2 py-0.5 rounded backdrop-blur-xs"
              style={{ color: textColor }}
            >
              {stickerText}
            </span>
          </div>
        )}

        {/* Bottom Date / Vibe Stamp */}
        {(dateStampText || layout.captionVibe) && (
          <div className="absolute bottom-4 right-5 z-20 pointer-events-none text-right">
            <span
              className="text-[9px] font-mono tracking-wider uppercase font-medium"
              style={{ color: subtextColor }}
            >
              {dateStampText}
              {layout.captionVibe ? ` • ${layout.captionVibe}` : ''}
            </span>
          </div>
        )}

        {/* Film Sprocket Holes along margins (if 35mm film layout) */}
        {layout.filmSprockets && (
          <>
            <div className="absolute top-0 bottom-0 left-2 w-3 flex flex-col justify-around py-4 z-10 pointer-events-none opacity-20">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="w-2.5 h-3.5 rounded-xs bg-white border border-white/20" />
              ))}
            </div>
            <div className="absolute top-0 bottom-0 right-2 w-3 flex flex-col justify-around py-4 z-10 pointer-events-none opacity-20">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="w-2.5 h-3.5 rounded-xs bg-white border border-white/20" />
              ))}
            </div>
          </>
        )}

        {/* Decorative Stickers (Stars, Barcodes, Stamps, Hearts) */}
        {layout.stickers?.map((stk) => (
          <div
            key={stk.id}
            className="absolute z-25 pointer-events-none select-none transition-transform"
            style={{
              left: `${stk.x}%`,
              top: `${stk.y}%`,
              transform: `translate(-50%, -50%) rotate(${stk.rotation || 0}deg)`,
            }}
          >
            {stk.type === 'star' && (
              <span className="text-lg leading-none" style={{ color: stk.color || '#E29D72' }}>
                ✦
              </span>
            )}
            {stk.type === 'heart' && (
              <span className="text-base leading-none" style={{ color: stk.color || '#E76F51' }}>
                ♥
              </span>
            )}
            {stk.type === 'smile' && (
              <span className="text-base leading-none" style={{ color: stk.color || '#F4A261' }}>
                ☺
              </span>
            )}
            {stk.type === 'barcode' && (
              <div className="bg-white/95 px-2 py-0.5 rounded shadow-sm flex flex-col items-center">
                <div className="flex gap-[1.5px] h-3.5 items-center">
                  {Array.from({ length: 16 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-full bg-black ${idx % 3 === 0 ? 'w-1' : 'w-0.5'}`}
                    />
                  ))}
                </div>
                <span className="text-[6px] font-mono text-black font-semibold mt-0.5">
                  {stk.text || '98014-RAVE'}
                </span>
              </div>
            )}
            {stk.type === 'stamp' && (
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#D7553C]/80 text-[#D7553C] flex items-center justify-center text-[7px] font-mono font-bold uppercase p-0.5 text-center leading-tight rotate-[-6deg]">
                {stk.text || 'PASSPORT'}
              </div>
            )}
          </div>
        ))}

        {/* Handwritten Scribble Note */}
        {handwrittenNoteText && (
          <div
            className="absolute z-30 pointer-events-none select-none"
            style={{
              left: `${layout.handwrittenPosition?.x || 14}%`,
              top: `${layout.handwrittenPosition?.y || 92}%`,
              transform: `rotate(${layout.handwrittenPosition?.rotation || -3}deg)`,
            }}
          >
            <span
              className="text-xl sm:text-2xl font-['Caveat'] tracking-wide drop-shadow-md"
              style={{ color: isDarkBg ? '#FAF5EE' : '#1C1C20' }}
            >
              {handwrittenNoteText}
            </span>
          </div>
        )}

        {/* Slots Container */}
        <div className="absolute inset-0">
          {layout.slots.map((slot) => {
            const assignedPhotoId = slotAssignments[slot.id];
            const photo = assignedPhotoId ? photoMap.get(assignedPhotoId) : null;
            const isSelected = selectedSlotId === slot.id;
            const transform = slotTransforms[slot.id] || { zoom: 1, panX: 0, panY: 0 };
            const effectiveBorder = isBordered ? Math.max(frameWidth, 6) : 0;
            const hasPolaroidChin =
              isBordered &&
              (tapeStyle === 'polaroid_bottom' || Boolean(slot.captionHint));

            return (
              <div
                key={slot.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSlotId(isSelected ? null : slot.id);
                }}
                className={`absolute transition-transform duration-150 cursor-pointer group ${
                  isSelected ? 'ring-2 ring-[#E29D72] ring-offset-2 ring-offset-black/40' : ''
                }`}
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  width: `${slot.width}%`,
                  height: `${slot.height}%`,
                  transform: `rotate(${slot.rotation || 0}deg)`,
                  zIndex: isSelected ? 30 : slot.zIndex || 1,
                }}
              >
                {/* Outer Frame Wrapper */}
                <div
                  className={`w-full h-full relative flex flex-col transition-all ${
                    dropShadow ? (isBordered ? 'shadow-xl' : 'shadow-md') : ''
                  }`}
                  style={{
                    backgroundColor: isBordered ? frameColor || '#FFFFFF' : 'transparent',
                    padding: `${effectiveBorder}px`,
                    borderRadius: `${(slot.borderRadius || 3) + (isBordered ? 2 : 0)}px`,
                  }}
                >
                  {/* Washi Tape Strip at Top */}
                  {isBordered && tapeStyle === 'washi_top' && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#EBE2D4]/90 shadow-sm border border-[#D5C9B5]/60 z-20 pointer-events-none rotate-[-1deg]"
                      style={{ borderRadius: '1px' }}
                    />
                  )}

                  {/* Corner Tape Strips */}
                  {isBordered && tapeStyle === 'corners' && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-6 h-3 bg-[#E0D5C3]/85 rotate-[-45deg] z-20 pointer-events-none shadow-xs" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-3 bg-[#E0D5C3]/85 rotate-[-45deg] z-20 pointer-events-none shadow-xs" />
                    </>
                  )}

                  {/* Inner Photo Image Slot */}
                  <div
                    className="relative w-full flex-1 overflow-hidden bg-[#24242A]"
                    style={{
                      borderRadius: `${slot.borderRadius || 0}px`,
                    }}
                  >
                    {photo ? (
                      <div
                        className="w-full h-full relative"
                        style={{
                          transform: `scale(${transform.zoom || 1}) translate(${transform.panX || 0}%, ${transform.panY || 0}%)`,
                          transformOrigin: 'center center',
                          transition: 'transform 0.05s linear',
                        }}
                      >
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      </div>
                    ) : (
                      /* Empty Slot State */
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#25252A]/80 text-[#8C8C96] hover:text-[#E29D72] transition-colors">
                        <ImageIcon className="w-5 h-5 mb-1 opacity-70" />
                        <span className="text-[10px] font-medium leading-tight">
                          Tap to place photo
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay with Quick Swap Icon */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSwapPickerSlotId(slot.id);
                        }}
                        className="px-2.5 py-1 rounded-md bg-black/80 hover:bg-[#E29D72] text-white hover:text-[#121214] text-[10px] font-medium backdrop-blur-xs flex items-center gap-1 transition-all shadow-md"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Swap Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* Polaroid Chin / Caption Hint */}
                  {hasPolaroidChin && (
                    <div className="pt-1.5 pb-0.5 px-1 text-center shrink-0">
                      <p className="text-xs font-['Caveat'] font-semibold text-[#3A3A3D] truncate tracking-wide">
                        {slot.captionHint || dateStampText || 'outing dump'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Slot Adjustments Toolbar (Zoom / Pan / Swap) */}
      {selectedSlot && (
        <div className="w-full max-w-[510px] mt-4 bg-[#1E1E24] border border-[#2F2F38] rounded-xl p-3 shadow-lg flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                Slot Controls ({selectedSlot.aspectRatio || 'frame'})
              </span>
              {slotAssignments[selectedSlot.id] && (
                <span className="text-[10px] font-mono text-[#E29D72] bg-[#E29D72]/15 px-1.5 py-0.5 rounded">
                  Photo active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSwapPickerSlotId(selectedSlot.id)}
                className="text-xs font-medium px-2 py-1 rounded bg-[#2D2D36] hover:bg-[#383844] text-[#E0E0E6] flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3 text-[#E29D72]" />
                <span>Swap Photo</span>
              </button>
              <button
                onClick={() => setSelectedSlotId(null)}
                className="text-[#9999A5] hover:text-white p-1"
                title="Close controls"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Zoom & Pan Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Zoom */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-[#A0A0AB]">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" /> Zoom
                </span>
                <span className="font-mono">{Math.round(activeTransform.zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={activeTransform.zoom}
                onChange={(e) =>
                  onUpdateTransform(selectedSlot.id, {
                    zoom: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-[#E29D72] h-1.5 bg-[#2B2B33] rounded-lg cursor-pointer"
              />
            </div>

            {/* Pan X */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-[#A0A0AB]">
                <span className="flex items-center gap-1">
                  <Move className="w-3 h-3" /> Pan X
                </span>
                <span className="font-mono">{activeTransform.panX}%</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                step="1"
                value={activeTransform.panX}
                onChange={(e) =>
                  onUpdateTransform(selectedSlot.id, {
                    panX: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-[#E29D72] h-1.5 bg-[#2B2B33] rounded-lg cursor-pointer"
              />
            </div>

            {/* Pan Y */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-[#A0A0AB]">
                <span className="flex items-center gap-1">
                  <Move className="w-3 h-3 rotate-90" /> Pan Y
                </span>
                <span className="font-mono">{activeTransform.panY}%</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                step="1"
                value={activeTransform.panY}
                onChange={(e) =>
                  onUpdateTransform(selectedSlot.id, {
                    panY: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-[#E29D72] h-1.5 bg-[#2B2B33] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Photo Swap Picker Popover */}
      {swapPickerSlotId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C22] border border-[#2E2E38] rounded-2xl p-5 max-w-lg w-full max-h-[80vh] flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Choose Photo for Slot
                </h3>
                <p className="text-xs text-[#9E9EA7]">
                  Select any photo from your outing dump to assign to this position
                </p>
              </div>
              <button
                onClick={() => setSwapPickerSlotId(null)}
                className="p-1 rounded-lg text-[#9E9EA7] hover:text-white hover:bg-[#282832]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 overflow-y-auto pr-1 py-1">
              {photos.map((p) => {
                const isCurrent = slotAssignments[swapPickerSlotId] === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onAssignPhoto(swapPickerSlotId, p.id);
                      setSwapPickerSlotId(null);
                    }}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                      isCurrent
                        ? 'border-[#E29D72] ring-2 ring-[#E29D72]/30'
                        : 'border-[#2F2F39] hover:border-white'
                    }`}
                  >
                    <img
                      src={p.url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-[#E29D72]/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white drop-shadow" />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] font-mono text-white px-1 rounded uppercase">
                      {p.aspectRatio[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
