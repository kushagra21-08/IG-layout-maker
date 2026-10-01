import React from 'react';
import { Sparkles, Image as ImageIcon, LayoutGrid, Download, BookOpen, Wand2 } from 'lucide-react';

interface HeaderProps {
  photoCount: number;
  onOpenArtDirector: () => void;
  onOpenExtractor: () => void;
  onOpenSavedLayouts: () => void;
  onExport: () => void;
  activeTab: 'editor' | 'showcase';
  setActiveTab: (tab: 'editor' | 'showcase') => void;
}

export const Header: React.FC<HeaderProps> = ({
  photoCount,
  onOpenArtDirector,
  onOpenExtractor,
  onOpenSavedLayouts,
  onExport,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-[#26262B] bg-[#161619]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E29D72] via-[#E76F51] to-[#F4A261] flex items-center justify-center text-white shadow-lg shadow-[#E29D72]/15">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-base sm:text-lg text-white tracking-tight">
                Aesthetic IG Layouts
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#E29D72]/15 text-[#E29D72] border border-[#E29D72]/30">
                Outing Dump → Story
              </span>
            </div>
            <p className="text-xs text-[#9E9EA7] hidden sm:block">
              Art-directed Gen-Z layouts • Vacation diaries • Pinterest extractor • 1080p export
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
          {/* Editor vs Multi-Layout Showcase Tabs */}
          <div className="flex bg-[#202025] p-0.5 rounded-lg border border-[#2D2D33] text-xs">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'editor'
                  ? 'bg-[#E29D72] text-[#121214] shadow-sm font-semibold'
                  : 'text-[#A0A0AB] hover:text-white'
              }`}
            >
              Studio Editor
            </button>
            <button
              onClick={() => setActiveTab('showcase')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'showcase'
                  ? 'bg-[#E29D72] text-[#121214] shadow-sm font-semibold'
                  : 'text-[#A0A0AB] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Layout Grid</span>
            </button>
          </div>

          {/* AI Art Director Button */}
          <button
            onClick={onOpenArtDirector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E29D72]/15 hover:bg-[#E29D72]/25 text-[#E29D72] border border-[#E29D72]/30 text-xs font-semibold transition-all shadow-xs"
            title="Generate custom Gen-Z party, vacation, or editorial layouts with AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E29D72]" />
            <span>AI Art Director</span>
          </button>

          {/* Pinterest Extractor Button */}
          <button
            onClick={onOpenExtractor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E60023]/15 hover:bg-[#E60023]/25 text-[#FF5A5F] border border-[#E60023]/30 text-xs font-medium transition-all"
            title="Upload a Pinterest screenshot and automatically extract its layout"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#FF5A5F]" />
            <span className="hidden md:inline">Extract from</span> Pinterest
          </button>

          {/* Saved Layouts */}
          <button
            onClick={onOpenSavedLayouts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202025] hover:bg-[#2A2A31] text-[#D4D4D8] border border-[#2D2D33] text-xs font-medium transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#A0A0AB]" />
            <span>Saved</span>
          </button>

          {/* Export High-Res */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#E29D72] to-[#E76F51] hover:opacity-95 text-[#121214] font-semibold text-xs transition-all shadow-md shadow-[#E29D72]/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export for IG</span>
          </button>
        </div>
      </div>
    </header>
  );
};
