import React, { useRef } from 'react';
import { Upload, X, Plus, Sparkles, ImagePlus, Trash2 } from 'lucide-react';
import { Photo } from '../types/layout';
import { SAMPLE_PHOTO_DUMPS } from '../data/samplePhotos';

interface PhotoDumpUploaderProps {
  photos: Photo[];
  onAddPhotos: (newPhotos: Photo[]) => void;
  onRemovePhoto: (photoId: string) => void;
  onClearAll: () => void;
  onLoadSample: (key: string) => void;
}

export const PhotoDumpUploader: React.FC<PhotoDumpUploaderProps> = ({
  photos,
  onAddPhotos,
  onRemovePhoto,
  onClearAll,
  onLoadSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newPhotos: Photo[] = [];

    let loadedCount = 0;
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          let aspectRatio: 'portrait' | 'landscape' | 'square' = 'portrait';
          const ratio = img.width / img.height;
          if (ratio > 1.15) aspectRatio = 'landscape';
          else if (ratio < 0.88) aspectRatio = 'portrait';
          else aspectRatio = 'square';

          newPhotos.push({
            id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            url,
            name: file.name,
            aspectRatio,
            width: img.width,
            height: img.height,
          });

          loadedCount++;
          if (loadedCount === fileArray.length) {
            onAddPhotos(newPhotos);
          }
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-[#18181C] rounded-2xl border border-[#27272D] p-4.5 space-y-4">
      {/* Header & Photo count */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Outing Photo Dump
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#2A2A31] text-[#E29D72] border border-[#35353E]">
              {photos.length} photos
            </span>
          </div>
          <p className="text-xs text-[#9E9EA7] mt-0.5">
            Drop in raw photos from your day out — app will format into aesthetic layouts
          </p>
        </div>

        {photos.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-[11px] text-[#A1A1AA] hover:text-[#EF4444] px-2 py-1 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Dump</span>
          </button>
        )}
      </div>

      {/* Preset Outing Loaders (Convenience 1-click test) */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] text-[#808089] mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#E29D72]" />
          Or try sample dump:
        </span>
        {Object.entries(SAMPLE_PHOTO_DUMPS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => onLoadSample(key)}
            className="px-2.5 py-1 rounded-lg bg-[#222228] hover:bg-[#2C2C34] text-[#D1D1D8] border border-[#303038] text-[11px] font-medium transition-all"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Upload Zone / Gallery */}
      <div className="space-y-3">
        {/* Thumbnails Strip */}
        {photos.length > 0 ? (
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#33333C]">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative group shrink-0 w-20 h-24 rounded-xl overflow-hidden border border-[#33333C] bg-[#121214] shadow-sm"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
                {/* Index tag */}
                <span className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-[9px] font-mono text-white px-1 rounded">
                  #{index + 1}
                </span>
                {/* Aspect tag */}
                <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm text-[8px] font-mono uppercase text-[#E29D72] px-1 rounded">
                  {photo.aspectRatio[0]}
                </span>
                {/* Delete button */}
                <button
                  onClick={() => onRemovePhoto(photo.id)}
                  className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove photo"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}

            {/* Quick Add More Tile */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 w-20 h-24 rounded-xl border border-dashed border-[#3D3D48] hover:border-[#E29D72] bg-[#1C1C22]/60 hover:bg-[#25252D] flex flex-col items-center justify-center gap-1 text-[#9E9EA7] hover:text-[#E29D72] transition-all group"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">+ Add</span>
            </button>
          </div>
        ) : (
          /* Empty Dropzone */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#353540] hover:border-[#E29D72] bg-[#1A1A20] hover:bg-[#1E1E26] rounded-xl p-6 text-center cursor-pointer transition-all group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#272731] group-hover:bg-[#E29D72]/20 flex items-center justify-center text-[#A0A0AB] group-hover:text-[#E29D72] mb-3 transition-colors">
              <ImagePlus className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-white mb-1">
              Upload photos from your outing / dump
            </p>
            <p className="text-xs text-[#8A8A93]">
              Drag & drop any number of photos here, or click to browse
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
};
