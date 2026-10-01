export type LayoutFormat = 'story' | 'square' | 'portrait_feed' | 'landscape';

export type StyleVariation = 'bordered' | 'borderless';

export type VibeCategory =
  | 'genz_party'
  | 'vacation_diary'
  | 'vogue_editorial'
  | 'film_archive'
  | 'scrapbook';

export interface Photo {
  id: string;
  url: string;
  name: string;
  aspectRatio: 'portrait' | 'landscape' | 'square';
  width?: number;
  height?: number;
}

export interface Slot {
  id: string;
  x: number;          // 0 to 100 (% of canvas width)
  y: number;          // 0 to 100 (% of canvas height)
  width: number;      // 0 to 100 (% of canvas width)
  height: number;     // 0 to 100 (% of canvas height)
  rotation?: number;  // degrees (-15 to 15)
  zIndex?: number;
  borderRadius?: number; // px
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  captionHint?: string;
  isHero?: boolean;
  shadowIntensity?: 'none' | 'soft' | 'deep';
  borderOverride?: number;
}

export interface LayoutSticker {
  id: string;
  type: 'star' | 'barcode' | 'tape' | 'stamp' | 'heart' | 'film_label' | 'smile';
  x: number;          // % 0-100
  y: number;          // % 0-100
  rotation?: number;  // degrees
  text?: string;
  color?: string;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  format: LayoutFormat;
  styleType: StyleVariation;
  vibeCategory: VibeCategory;
  photoCount: number;
  backgroundColor: string;
  backgroundTexture?: 'clean' | 'paper' | 'grain' | 'linen' | 'dark_matte';
  frameColor: string;
  frameWidth: number;
  gap: number;
  dropShadow: boolean;
  tapeStyle?: 'none' | 'washi_top' | 'corners' | 'polaroid_bottom' | 'pin';
  stickerText?: string;
  captionVibe?: string;
  dateStamp?: string;
  handwrittenNote?: string;
  handwrittenPosition?: { x: number; y: number; rotation?: number };
  stickers?: LayoutSticker[];
  filmSprockets?: boolean;
  slots: Slot[];
  isCustomOrExtracted?: boolean;
}

export interface SlotTransform {
  zoom: number; // 1 to 2.5
  panX: number; // -50 to 50
  panY: number; // -50 to 50
  rotationOffset?: number;
}

export interface ActiveProject {
  photos: Photo[];
  currentLayoutId: string;
  format: LayoutFormat;
  styleVariation: StyleVariation;
  slotAssignments: Record<string, string>; // slotId -> photoId
  slotTransforms: Record<string, SlotTransform>;
  backgroundColor: string;
  backgroundTexture: 'clean' | 'paper' | 'grain' | 'linen' | 'dark_matte';
  frameColor: string;
  frameWidth: number;
  dropShadow: boolean;
  tapeStyle: 'none' | 'washi_top' | 'corners' | 'polaroid_bottom' | 'pin';
  customStickerText: string;
  dateStampText: string;
  handwrittenNoteText: string;
}
