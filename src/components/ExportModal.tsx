import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Share2,
  FileImage,
} from 'lucide-react';
import { LayoutTemplate, Photo, SlotTransform, StyleVariation } from '../types/layout';
import { getCanvasDimensions, renderLayoutToCanvas } from '../utils/canvasRenderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
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
  handwrittenNoteText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const { width: targetWidth, height: targetHeight } = getCanvasDimensions(layout.format);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsRendering(true);

    const runRender = async () => {
      try {
        const offscreenCanvas = document.createElement('canvas');
        await renderLayoutToCanvas(offscreenCanvas, {
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
          handwrittenNoteText: handwrittenNoteText ?? layout.handwrittenNote,
          resolutionScale: 1.0,
        });

        if (isMounted) {
          const dataUrl = offscreenCanvas.toDataURL('image/png');
          setPreviewDataUrl(dataUrl);

          // Draw onto visible canvas
          if (canvasRef.current) {
            canvasRef.current.width = offscreenCanvas.width;
            canvasRef.current.height = offscreenCanvas.height;
            const ctx = canvasRef.current.getContext('2d');
            ctx?.drawImage(offscreenCanvas, 0, 0);
          }
          setIsRendering(false);
        }
      } catch (err) {
        console.error('Export canvas render failed', err);
        if (isMounted) setIsRendering(false);
      }
    };

    runRender();

    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
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
    handwrittenNoteText,
  ]);

  if (!isOpen) return null;

  const handleDownload = (format: 'png' | 'jpeg') => {
    if (!canvasRef.current) return;
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvasRef.current.toDataURL(mime, 0.95);
    const link = document.createElement('a');
    link.download = `aesthetic-${layout.format}-${Date.now()}.${format}`;
    link.href = dataUrl;
    link.click();
  };

  const handleCopyClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }, 'image/png');
    } catch (e) {
      console.warn('Clipboard copy not supported in this browser context', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#18181D] border border-[#2B2B33] rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-[#272730] flex items-center justify-between bg-[#141417]">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Ready for Instagram</span>
              <span className="text-[10px] font-mono text-[#E29D72] bg-[#E29D72]/15 px-2 py-0.5 rounded border border-[#E29D72]/30 uppercase">
                {targetWidth} × {targetHeight}px
              </span>
            </h2>
            <p className="text-xs text-[#9E9EA7]">
              Pristine high-resolution render ready to post on Stories or Feed
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9E9EA7] hover:text-white hover:bg-[#25252D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex flex-col md:flex-row items-center justify-center gap-6">
          {/* Render Preview Frame */}
          <div className="flex flex-col items-center">
            <div
              className={`relative rounded-2xl overflow-hidden border border-[#30303A] shadow-2xl bg-[#0F0F12] flex items-center justify-center ${
                layout.format === 'story'
                  ? 'w-[250px] aspect-[9/16]'
                  : layout.format === 'square'
                  ? 'w-[280px] aspect-square'
                  : 'w-[260px] aspect-[4/5]'
              }`}
            >
              {isRendering ? (
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <div className="w-8 h-8 rounded-full border-2 border-[#E29D72] border-t-transparent animate-spin" />
                  <span className="text-xs text-[#9E9EA7] font-medium">
                    Rendering at {targetWidth}x{targetHeight}...
                  </span>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <span className="text-[11px] font-mono text-[#7A7A85] mt-2">
              Instagram {layout.format === 'story' ? 'Story (9:16)' : 'Post (1:1 / 4:5)'}
            </span>
          </div>

          {/* Download & Options Panel */}
          <div className="flex-1 w-full max-w-sm space-y-4">
            <div className="bg-[#1F1F26] border border-[#2D2D36] rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Export Options
              </h3>

              {/* Download PNG (Best Quality) */}
              <button
                onClick={() => handleDownload('png')}
                disabled={isRendering}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E29D72] to-[#E76F51] hover:opacity-95 text-[#121214] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#E29D72]/20 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG (1080p)</span>
              </button>

              {/* Download JPEG */}
              <button
                onClick={() => handleDownload('jpeg')}
                disabled={isRendering}
                className="w-full py-2.5 px-4 rounded-xl bg-[#292933] hover:bg-[#343440] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors border border-[#353542] disabled:opacity-50"
              >
                <FileImage className="w-4 h-4 text-[#A0A0AB]" />
                <span>Download Compact JPEG</span>
              </button>

              {/* Copy to Clipboard */}
              <button
                onClick={handleCopyClipboard}
                disabled={isRendering}
                className="w-full py-2.5 px-4 rounded-xl bg-[#292933] hover:bg-[#343440] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors border border-[#353542] disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#A0A0AB]" />
                    <span>Copy Image to Clipboard</span>
                  </>
                )}
              </button>
            </div>

            {/* Posting Guide / Tips */}
            <div className="bg-[#141418] border border-[#26262E] rounded-2xl p-4 space-y-2 text-xs text-[#9E9EA7]">
              <div className="flex items-center gap-1.5 text-white font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#E29D72]" />
                <span>Tips for Best Aesthetic:</span>
              </div>
              <ul className="space-y-1 list-disc pl-4 text-[11px] text-[#8C8C96]">
                <li>Paste directly into Instagram Stories or save to Camera Roll</li>
                <li>Add IG native ambient music or low-fi audio for best vibes</li>
                <li>Bordered layouts look gorgeous with IG's film grain sticker filter</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
