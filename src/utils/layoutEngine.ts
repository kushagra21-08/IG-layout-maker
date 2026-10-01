import { LayoutTemplate, Photo, Slot, StyleVariation } from '../types/layout';

const SAVED_LAYOUTS_KEY = 'aesthetic_ig_saved_layouts_v1';

// Auto-assign photos to slots with aspect-ratio matching
export function autoAssignPhotos(
  slots: Slot[],
  photos: Photo[],
  offset = 0
): Record<string, string> {
  const assignments: Record<string, string> = {};
  if (photos.length === 0 || slots.length === 0) return assignments;

  // Clone photo pool
  const pool = [...photos];
  // Rotate pool by offset for variation cycling
  if (offset > 0) {
    const shift = offset % pool.length;
    pool.push(...pool.splice(0, shift));
  }

  // Separate portrait and landscape candidates
  const portraits = pool.filter((p) => p.aspectRatio === 'portrait');
  const landscapes = pool.filter((p) => p.aspectRatio === 'landscape');
  const squares = pool.filter((p) => p.aspectRatio === 'square');

  const used = new Set<string>();

  slots.forEach((slot, index) => {
    let matchedPhoto: Photo | undefined;

    if (slot.aspectRatio === 'landscape' && landscapes.length > 0) {
      matchedPhoto = landscapes.find((p) => !used.has(p.id));
    } else if (slot.aspectRatio === 'portrait' && portraits.length > 0) {
      matchedPhoto = portraits.find((p) => !used.has(p.id));
    } else if (slot.aspectRatio === 'square' && squares.length > 0) {
      matchedPhoto = squares.find((p) => !used.has(p.id));
    }

    // Fallback: pick next unused photo from general pool
    if (!matchedPhoto) {
      matchedPhoto = pool.find((p) => !used.has(p.id));
    }

    // If still none (more slots than photos), loop over pool
    if (!matchedPhoto) {
      matchedPhoto = pool[index % pool.length];
    }

    if (matchedPhoto) {
      assignments[slot.id] = matchedPhoto.id;
      used.add(matchedPhoto.id);
    }
  });

  return assignments;
}

// Generate random aesthetic combination
export function shuffleAssignments(
  slots: Slot[],
  photos: Photo[]
): Record<string, string> {
  if (photos.length === 0 || slots.length === 0) return {};
  const shuffled = [...photos].sort(() => Math.random() - 0.5);
  return autoAssignPhotos(slots, shuffled);
}

// Transform layout between Bordered and Borderless variation
export function convertStyleVariation(
  layout: LayoutTemplate,
  targetStyle: StyleVariation
): LayoutTemplate {
  if (targetStyle === 'bordered') {
    return {
      ...layout,
      styleType: 'bordered',
      frameColor: layout.frameColor === 'transparent' ? '#FFFFFF' : layout.frameColor,
      frameWidth: layout.frameWidth > 0 ? layout.frameWidth : 8,
      dropShadow: true,
      tapeStyle: layout.tapeStyle === 'none' ? 'washi_top' : layout.tapeStyle,
      backgroundColor: layout.backgroundColor === '#121214' ? '#FAF6F0' : layout.backgroundColor,
      backgroundTexture: layout.backgroundTexture === 'clean' ? 'paper' : layout.backgroundTexture,
    };
  } else {
    return {
      ...layout,
      styleType: 'borderless',
      frameColor: 'transparent',
      frameWidth: 0,
      dropShadow: false,
      tapeStyle: 'none',
      backgroundColor: layout.backgroundColor === '#FAF6F0' ? '#121214' : layout.backgroundColor,
      backgroundTexture: 'clean',
    };
  }
}

// Storage helpers
export function getSavedLayouts(): LayoutTemplate[] {
  try {
    const raw = localStorage.getItem(SAVED_LAYOUTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved layouts', e);
    return [];
  }
}

export function saveLayoutToStorage(layout: LayoutTemplate): boolean {
  try {
    const current = getSavedLayouts();
    const existingIndex = current.findIndex((l) => l.id === layout.id);
    const updated = {
      ...layout,
      isCustomOrExtracted: true,
    };

    let nextList: LayoutTemplate[];
    if (existingIndex >= 0) {
      nextList = [...current];
      nextList[existingIndex] = updated;
    } else {
      nextList = [updated, ...current];
    }

    localStorage.setItem(SAVED_LAYOUTS_KEY, JSON.stringify(nextList));
    return true;
  } catch (e) {
    console.error('Failed to save layout', e);
    return false;
  }
}

export function deleteSavedLayoutFromStorage(layoutId: string): boolean {
  try {
    const current = getSavedLayouts();
    const nextList = current.filter((l) => l.id !== layoutId);
    localStorage.setItem(SAVED_LAYOUTS_KEY, JSON.stringify(nextList));
    return true;
  } catch (e) {
    console.error('Failed to delete saved layout', e);
    return false;
  }
}
