import React, { useState, useEffect } from 'react';
import {
  LayoutFormat,
  LayoutTemplate,
  Photo,
  Slot,
  SlotTransform,
  StyleVariation,
  VibeCategory,
} from './types/layout';
import { PRESET_LAYOUTS } from './data/presetLayouts';
import { SAMPLE_PHOTO_DUMPS } from './data/samplePhotos';
import {
  autoAssignPhotos,
  convertStyleVariation,
  getSavedLayouts,
  saveLayoutToStorage,
  shuffleAssignments,
} from './utils/layoutEngine';
import { Header } from './components/Header';
import { PhotoDumpUploader } from './components/PhotoDumpUploader';
import { LayoutCanvasView } from './components/LayoutCanvasView';
import { MultiLayoutShowcase } from './components/MultiLayoutShowcase';
import { StyleControls } from './components/StyleControls';
import { PinterestExtractorModal } from './components/PinterestExtractorModal';
import { SavedLayoutsModal } from './components/SavedLayoutsModal';
import { ExportModal } from './components/ExportModal';
import { AiArtDirectorModal } from './components/AiArtDirectorModal';
import {
  Sparkles,
  Smartphone,
  Square,
  Frame,
  Layers,
  Shuffle,
  Download,
  Wand2,
  ChevronRight,
  BookOpen,
  Flame,
  Palmtree,
  Camera,
  Heart,
} from 'lucide-react';

export default function App() {
  // 1. Photos state: Initialize with Party Dump sample for Gen-Z energy!
  const [photos, setPhotos] = useState<Photo[]>(SAMPLE_PHOTO_DUMPS.genz_party.photos);

  // 2. Active Layout state (Default: 3AM Afters Flash Pile)
  const [allLayouts, setAllLayouts] = useState<LayoutTemplate[]>(PRESET_LAYOUTS);
  const [currentLayout, setCurrentLayout] = useState<LayoutTemplate>(PRESET_LAYOUTS[0]);
  const [slotAssignments, setSlotAssignments] = useState<Record<string, string>>({});
  const [slotTransforms, setSlotTransforms] = useState<Record<string, SlotTransform>>({});

  // 3. Customization & Styling state
  const [format, setFormat] = useState<LayoutFormat>(PRESET_LAYOUTS[0].format);
  const [styleVariation, setStyleVariation] = useState<StyleVariation>(PRESET_LAYOUTS[0].styleType);
  const [backgroundColor, setBackgroundColor] = useState<string>(PRESET_LAYOUTS[0].backgroundColor);
  const [backgroundTexture, setBackgroundTexture] = useState<'clean' | 'paper' | 'grain' | 'linen' | 'dark_matte'>('dark_matte');
  const [frameColor, setFrameColor] = useState<string>(PRESET_LAYOUTS[0].frameColor);
  const [frameWidth, setFrameWidth] = useState<number>(PRESET_LAYOUTS[0].frameWidth || 9);
  const [dropShadow, setDropShadow] = useState<boolean>(true);
  const [tapeStyle, setTapeStyle] = useState<'none' | 'washi_top' | 'corners' | 'polaroid_bottom' | 'pin'>('washi_top');
  const [stickerText, setStickerText] = useState<string>(PRESET_LAYOUTS[0].stickerText || 'AFTERS // 03:42 AM');
  const [dateStampText, setDateStampText] = useState<string>(PRESET_LAYOUTS[0].dateStamp || "'26 10 01");
  const [handwrittenNoteText, setHandwrittenNoteText] = useState<string>(
    PRESET_LAYOUTS[0].handwrittenNote || "don't let the music stop ✨"
  );

  // 4. Navigation & Modals
  const [activeTab, setActiveTab] = useState<'editor' | 'showcase'>('editor');
  const [activeVibeCategory, setActiveVibeCategory] = useState<'all' | VibeCategory>('all');
  const [isArtDirectorOpen, setIsArtDirectorOpen] = useState(false);
  const [isExtractorOpen, setIsExtractorOpen] = useState(false);
  const [isSavedLayoutsOpen, setIsSavedLayoutsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Merge saved layouts from localStorage on mount
  useEffect(() => {
    const saved = getSavedLayouts();
    if (saved.length > 0) {
      setAllLayouts([...saved, ...PRESET_LAYOUTS]);
    }
  }, []);

  // Update assignments whenever layout or photos change
  useEffect(() => {
    if (photos.length > 0 && currentLayout.slots.length > 0) {
      const newAssignments: Record<string, string> = {};
      const photoIds = new Set(photos.map((p) => p.id));

      currentLayout.slots.forEach((slot) => {
        if (slotAssignments[slot.id] && photoIds.has(slotAssignments[slot.id])) {
          newAssignments[slot.id] = slotAssignments[slot.id];
        }
      });

      const missingSlots = currentLayout.slots.filter((s) => !newAssignments[s.id]);
      if (missingSlots.length > 0) {
        const generated = autoAssignPhotos(currentLayout.slots, photos);
        setSlotAssignments({ ...generated, ...newAssignments });
      } else {
        setSlotAssignments(newAssignments);
      }
    }
  }, [currentLayout.id, photos]);

  // Handler: Select Layout
  const handleSelectLayout = (
    layout: LayoutTemplate,
    customAssignments?: Record<string, string>
  ) => {
    setCurrentLayout(layout);
    setFormat(layout.format);
    setStyleVariation(layout.styleType);
    setBackgroundColor(layout.backgroundColor);
    setBackgroundTexture(layout.backgroundTexture || 'clean');
    setFrameColor(layout.frameColor);
    setFrameWidth(layout.frameWidth);
    setDropShadow(layout.dropShadow);
    setTapeStyle(layout.tapeStyle || 'none');
    setStickerText(layout.stickerText || 'ARCHIVE // 01');
    setDateStampText(layout.dateStamp || "'26 10 01");
    setHandwrittenNoteText(layout.handwrittenNote || '');
    setSlotTransforms({});

    if (customAssignments) {
      setSlotAssignments(customAssignments);
    } else {
      setSlotAssignments(autoAssignPhotos(layout.slots, photos));
    }
  };

  // Handler: Quick Export from Showcase
  const handleQuickExport = (
    layout: LayoutTemplate,
    assignments: Record<string, string>
  ) => {
    handleSelectLayout(layout, assignments);
    setIsExportOpen(true);
  };

  // Handler: Shuffle Photos in Current Layout
  const handleShuffleCurrent = () => {
    const newAssignments = shuffleAssignments(currentLayout.slots, photos);
    setSlotAssignments(newAssignments);
  };

  // Handler: Add Photos
  const handleAddPhotos = (newPhotos: Photo[]) => {
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  // Handler: Remove Photo
  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Handler: Clear All Photos
  const handleClearAll = () => {
    setPhotos([]);
    setSlotAssignments({});
  };

  // Handler: Load Sample Outing Dump
  const handleLoadSample = (key: string) => {
    const sample = SAMPLE_PHOTO_DUMPS[key];
    if (sample) {
      setPhotos(sample.photos);
    }
  };

  // Handler: Toggle Style Variation (Bordered vs Borderless)
  const handleUpdateStyleVariation = (targetStyle: StyleVariation) => {
    setStyleVariation(targetStyle);
    if (targetStyle === 'bordered') {
      setFrameWidth(frameWidth > 0 ? frameWidth : 9);
      setFrameColor('#FFFFFF');
      setDropShadow(true);
      if (tapeStyle === 'none') setTapeStyle('washi_top');
      if (backgroundColor === '#0F0F12') setBackgroundColor('#0E0E11');
    } else {
      setFrameWidth(0);
      setFrameColor('transparent');
      setDropShadow(false);
      setTapeStyle('none');
      if (backgroundColor === '#FAF6F0') setBackgroundColor('#0F0F12');
    }
  };

  // Handler: Change Canvas Format (Story 9:16 vs Square 1:1 vs Feed 4:5)
  const handleUpdateFormat = (newFormat: LayoutFormat) => {
    setFormat(newFormat);
    const candidate =
      allLayouts.find((l) => l.format === newFormat && l.styleType === styleVariation) ||
      allLayouts.find((l) => l.format === newFormat);

    if (candidate) {
      handleSelectLayout(candidate);
    } else {
      setCurrentLayout((prev) => ({ ...prev, format: newFormat }));
    }
  };

  // Handler: Save current layout
  const handleSaveCurrentLayout = () => {
    const toSave: LayoutTemplate = {
      ...currentLayout,
      id: `custom-${Date.now()}`,
      name: `${currentLayout.name} (Custom)`,
      format,
      styleType: styleVariation,
      vibeCategory: currentLayout.vibeCategory || 'genz_party',
      backgroundColor,
      backgroundTexture,
      frameColor,
      frameWidth,
      dropShadow,
      tapeStyle,
      stickerText,
      dateStamp: dateStampText,
      handwrittenNote: handwrittenNoteText,
      isCustomOrExtracted: true,
    };
    saveLayoutToStorage(toSave);
    setAllLayouts((prev) => [toSave, ...prev]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Handler: Apply AI Generated or Pinterest Extracted Layout
  const handleApplyCustomLayout = (
    layout: LayoutTemplate,
    assignments: Record<string, string>
  ) => {
    setAllLayouts((prev) => [layout, ...prev]);
    handleSelectLayout(layout, assignments);
    setActiveTab('editor');
  };

  const filteredRibbonLayouts = allLayouts.filter((l) => {
    if (l.format !== format) return false;
    if (activeVibeCategory !== 'all' && l.vibeCategory !== activeVibeCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#111113] text-[#E4E4E7] flex flex-col font-sans">
      {/* Top Global Navigation Bar */}
      <Header
        photoCount={photos.length}
        onOpenArtDirector={() => setIsArtDirectorOpen(true)}
        onOpenExtractor={() => setIsExtractorOpen(true)}
        onOpenSavedLayouts={() => setIsSavedLayoutsOpen(true)}
        onExport={() => setIsExportOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Photo Dump Uploader / Bar */}
        <PhotoDumpUploader
          photos={photos}
          onAddPhotos={handleAddPhotos}
          onRemovePhoto={handleRemovePhoto}
          onClearAll={handleClearAll}
          onLoadSample={handleLoadSample}
        />

        {/* TAB 1: STUDIO EDITOR VIEW */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* Quick Layout Ribbon Switcher with Vibe Categories */}
            <div className="bg-[#17171C] rounded-2xl border border-[#272730] p-3 space-y-2.5">
              {/* Vibe filter row */}
              <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 border-b border-[#25252D]">
                <div className="flex items-center gap-1.5 text-xs shrink-0">
                  <span className="text-[10px] font-mono text-[#8E8E98] uppercase mr-1">
                    Vibe:
                  </span>
                  <button
                    onClick={() => setActiveVibeCategory('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      activeVibeCategory === 'all'
                        ? 'bg-[#E29D72] text-[#121214] font-semibold'
                        : 'text-[#A0A0AA] hover:text-white bg-[#202026]'
                    }`}
                  >
                    All Vibes
                  </button>
                  <button
                    onClick={() => setActiveVibeCategory('genz_party')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      activeVibeCategory === 'genz_party'
                        ? 'bg-[#E29D72] text-[#121214] font-semibold'
                        : 'text-[#A0A0AA] hover:text-white bg-[#202026]'
                    }`}
                  >
                    <Flame className="w-3 h-3 text-[#E29D72]" />
                    <span>Gen-Z Party</span>
                  </button>
                  <button
                    onClick={() => setActiveVibeCategory('vacation_diary')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      activeVibeCategory === 'vacation_diary'
                        ? 'bg-[#E29D72] text-[#121214] font-semibold'
                        : 'text-[#A0A0AA] hover:text-white bg-[#202026]'
                    }`}
                  >
                    <Palmtree className="w-3 h-3 text-[#E29D72]" />
                    <span>Vacation Diary</span>
                  </button>
                  <button
                    onClick={() => setActiveVibeCategory('vogue_editorial')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      activeVibeCategory === 'vogue_editorial'
                        ? 'bg-[#E29D72] text-[#121214] font-semibold'
                        : 'text-[#A0A0AA] hover:text-white bg-[#202026]'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-[#E29D72]" />
                    <span>Vogue Editorial</span>
                  </button>
                  <button
                    onClick={() => setActiveVibeCategory('film_archive')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      activeVibeCategory === 'film_archive'
                        ? 'bg-[#E29D72] text-[#121214] font-semibold'
                        : 'text-[#A0A0AA] hover:text-white bg-[#202026]'
                    }`}
                  >
                    <Camera className="w-3 h-3 text-[#E29D72]" />
                    <span>35mm Film</span>
                  </button>
                  <button
                    onClick={() => setActiveVibeCategory('scrapbook')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      activeVibeCategory === 'scrapbook'
                        ? 'bg-[#E29D72] text-[#121214] font-semibold'
                        : 'text-[#A0A0AA] hover:text-white bg-[#202026]'
                    }`}
                  >
                    <Heart className="w-3 h-3 text-[#E29D72]" />
                    <span>Scrapbook</span>
                  </button>
                </div>

                {/* AI Art Director Button */}
                <button
                  onClick={() => setIsArtDirectorOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#E29D72]/20 to-[#E76F51]/20 hover:from-[#E29D72]/30 hover:to-[#E76F51]/30 text-[#E29D72] border border-[#E29D72]/40 text-xs font-semibold shrink-0 transition-all shadow-xs"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>AI Art Director</span>
                </button>
              </div>

              {/* Layout Presets Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                {filteredRibbonLayouts.slice(0, 10).map((item) => {
                  const isCurrent = currentLayout.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectLayout(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-[#E29D72] text-[#121214] border-[#E29D72] shadow-sm font-semibold'
                          : 'bg-[#202026] text-[#A0A0AB] border-[#2C2C35] hover:text-white hover:border-[#3D3D48]'
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-[10px] font-mono opacity-70">
                        ({item.slots.length}p)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Studio Workspace: Canvas & Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Canvas Interactive Studio (Left 7-8 cols) */}
              <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-center justify-center bg-[#151518] rounded-3xl border border-[#27272F] p-4 sm:p-6 shadow-inner min-h-[550px]">
                <LayoutCanvasView
                  layout={currentLayout}
                  photos={photos}
                  slotAssignments={slotAssignments}
                  slotTransforms={slotTransforms}
                  styleVariation={styleVariation}
                  backgroundColor={backgroundColor}
                  backgroundTexture={backgroundTexture}
                  frameColor={frameColor}
                  frameWidth={frameWidth}
                  dropShadow={dropShadow}
                  tapeStyle={tapeStyle}
                  stickerText={stickerText}
                  dateStampText={dateStampText}
                  handwrittenNoteText={handwrittenNoteText}
                  onAssignPhoto={(slotId, photoId) => {
                    setSlotAssignments((prev) => ({ ...prev, [slotId]: photoId }));
                  }}
                  onUpdateTransform={(slotId, transform) => {
                    setSlotTransforms((prev) => ({
                      ...prev,
                      [slotId]: {
                        ...(prev[slotId] || { zoom: 1, panX: 0, panY: 0 }),
                        ...transform,
                      },
                    }));
                  }}
                />
              </div>

              {/* Controls & Customization Panel (Right 5 cols) */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-4">
                <StyleControls
                  layout={currentLayout}
                  format={format}
                  styleVariation={styleVariation}
                  backgroundColor={backgroundColor}
                  backgroundTexture={backgroundTexture}
                  frameColor={frameColor}
                  frameWidth={frameWidth}
                  dropShadow={dropShadow}
                  tapeStyle={tapeStyle}
                  stickerText={stickerText}
                  dateStampText={dateStampText}
                  handwrittenNoteText={handwrittenNoteText}
                  onUpdateFormat={handleUpdateFormat}
                  onUpdateStyleVariation={handleUpdateStyleVariation}
                  onUpdateBackground={setBackgroundColor}
                  onUpdateTexture={setBackgroundTexture}
                  onUpdateFrameColor={setFrameColor}
                  onUpdateFrameWidth={setFrameWidth}
                  onUpdateDropShadow={setDropShadow}
                  onUpdateTapeStyle={setTapeStyle}
                  onUpdateStickerText={setStickerText}
                  onUpdateDateStampText={setDateStampText}
                  onUpdateHandwrittenNoteText={setHandwrittenNoteText}
                  onShufflePhotos={handleShuffleCurrent}
                  onSaveCurrentLayout={handleSaveCurrentLayout}
                  saveSuccess={saveSuccess}
                />

                {/* Quick Export Trigger Banner */}
                <div className="bg-gradient-to-r from-[#202026] to-[#1C1C22] rounded-2xl border border-[#2F2F3B] p-4 flex items-center justify-between gap-3 shadow-md">
                  <div>
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#E29D72]" />
                      <span>Ready to post on Instagram?</span>
                    </h4>
                    <p className="text-[11px] text-[#8E8E98] mt-0.5">
                      Renders at crisp 1080x1920 with high-res PNG export
                    </p>
                  </div>
                  <button
                    onClick={() => setIsExportOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E29D72] to-[#E76F51] hover:opacity-95 text-[#121214] font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#E29D72]/20 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-LAYOUT SHOWCASE VIEW */}
        {activeTab === 'showcase' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                  <span>Multi-Layout Grid Combinations</span>
                  <span className="text-xs font-mono font-normal text-[#E29D72] bg-[#E29D72]/15 px-2 py-0.5 rounded border border-[#E29D72]/30">
                    Live with your {photos.length} photos
                  </span>
                </h2>
                <p className="text-xs text-[#9E9EA7]">
                  Browse multiple layout compositions rendered with your outing photos simultaneously. Click any to customize or quick export!
                </p>
              </div>
            </div>

            <MultiLayoutShowcase
              layouts={allLayouts}
              photos={photos}
              activeLayoutId={currentLayout.id}
              onSelectLayout={(layout, assignments) => {
                handleSelectLayout(layout, assignments);
                setActiveTab('editor');
              }}
              onQuickExport={handleQuickExport}
              onOpenArtDirector={() => setIsArtDirectorOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#202026] bg-[#141417] py-6 px-4 text-center text-xs text-[#7A7A85] space-y-1">
        <p className="font-mono text-[11px]">
          Aesthetic IG Layouts • Gen-Z Party & Vacation Outing Dump to Editorial Story • 2026
        </p>
        <p className="text-[10px] text-[#555]">
          AI Art Direction & Pinterest reverse-engineering powered by Gemini 3.8 Flash • Designed, not mathematically tiled
        </p>
      </footer>

      {/* AI Art Director Modal */}
      <AiArtDirectorModal
        isOpen={isArtDirectorOpen}
        onClose={() => setIsArtDirectorOpen(false)}
        photos={photos}
        onApplyLayout={handleApplyCustomLayout}
      />

      {/* Pinterest Extractor Modal */}
      <PinterestExtractorModal
        isOpen={isExtractorOpen}
        onClose={() => setIsExtractorOpen(false)}
        photos={photos}
        onApplyLayout={handleApplyCustomLayout}
      />

      {/* Saved Layouts Modal */}
      <SavedLayoutsModal
        isOpen={isSavedLayoutsOpen}
        onClose={() => setIsSavedLayoutsOpen(false)}
        photos={photos}
        onSelectLayout={(layout, assignments) => {
          handleSelectLayout(layout, assignments);
          setActiveTab('editor');
        }}
        onRefreshSaved={() => {
          const saved = getSavedLayouts();
          setAllLayouts([...saved, ...PRESET_LAYOUTS]);
        }}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        layout={currentLayout}
        photos={photos}
        slotAssignments={slotAssignments}
        slotTransforms={slotTransforms}
        styleVariation={styleVariation}
        backgroundColor={backgroundColor}
        backgroundTexture={backgroundTexture}
        frameColor={frameColor}
        frameWidth={frameWidth}
        dropShadow={dropShadow}
        tapeStyle={tapeStyle}
        stickerText={stickerText}
        dateStampText={dateStampText}
        handwrittenNoteText={handwrittenNoteText}
      />
    </div>
  );
}
