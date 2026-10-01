import { LayoutTemplate, Photo, SlotTransform, StyleVariation } from '../types/layout';

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = () => reject(new Error('Failed to load image: ' + url));
      fallbackImg.src = url;
    };
    img.src = url;
  });
}

export interface RenderCanvasOptions {
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
  resolutionScale?: number;
}

export function getCanvasDimensions(format: LayoutTemplate['format']) {
  switch (format) {
    case 'story':
      return { width: 1080, height: 1920 };
    case 'square':
      return { width: 1080, height: 1080 };
    case 'portrait_feed':
      return { width: 1080, height: 1350 };
    case 'landscape':
      return { width: 1920, height: 1080 };
    default:
      return { width: 1080, height: 1920 };
  }
}

export async function renderLayoutToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderCanvasOptions
): Promise<void> {
  const {
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
    stickerText = layout.stickerText || '',
    dateStampText = layout.dateStamp || '',
    handwrittenNoteText = layout.handwrittenNote || '',
  } = options;

  const { width: baseWidth, height: baseHeight } = getCanvasDimensions(layout.format);
  const scale = options.resolutionScale || 1.0;
  const canvasWidth = Math.round(baseWidth * scale);
  const canvasHeight = Math.round(baseHeight * scale);

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  // Pre-load photos
  const photoMap = new Map<string, Photo>();
  photos.forEach((p) => photoMap.set(p.id, p));

  const imageMap = new Map<string, HTMLImageElement>();
  await Promise.all(
    layout.slots.map(async (slot) => {
      const assignedPhotoId = slotAssignments[slot.id];
      if (assignedPhotoId && photoMap.has(assignedPhotoId)) {
        const photo = photoMap.get(assignedPhotoId)!;
        try {
          const img = await loadImage(photo.url);
          imageMap.set(assignedPhotoId, img);
        } catch (err) {
          console.warn('Could not load image for slot', slot.id, err);
        }
      }
    })
  );

  // 1. Draw Canvas Background
  ctx.save();
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Background texture overlays
  if (backgroundTexture === 'grain' || backgroundTexture === 'paper') {
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 120;
    noiseCanvas.height = 120;
    const nCtx = noiseCanvas.getContext('2d');
    if (nCtx) {
      const imgData = nCtx.createImageData(120, 120);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        imgData.data[i] = val;
        imgData.data[i + 1] = val;
        imgData.data[i + 2] = val;
        imgData.data[i + 3] = backgroundTexture === 'grain' ? 14 : 7;
      }
      nCtx.putImageData(imgData, 0, 0);
      ctx.fillStyle = ctx.createPattern(noiseCanvas, 'repeat') || backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  } else if (backgroundTexture === 'linen') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.025)';
    for (let x = 0; x < canvasWidth; x += 6) ctx.fillRect(x, 0, 1, canvasHeight);
    for (let y = 0; y < canvasHeight; y += 6) ctx.fillRect(0, y, canvasWidth, 1);
  }
  ctx.restore();

  const isBordered = styleVariation === 'bordered';
  const isDarkBg =
    backgroundColor === '#121214' ||
    backgroundColor === '#161618' ||
    backgroundColor === '#0F0F11' ||
    backgroundColor === '#0A0A0C' ||
    backgroundColor === '#0E0E11' ||
    backgroundColor === '#141416';

  // 2. Film Sprockets (if enabled)
  if (layout.filmSprockets) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    const sprocketW = 14 * scale;
    const sprocketH = 22 * scale;
    const step = 42 * scale;
    for (let y = 20 * scale; y < canvasHeight - 20 * scale; y += step) {
      roundRect(ctx, 16 * scale, y, sprocketW, sprocketH, 3 * scale);
      ctx.fill();
      roundRect(ctx, canvasWidth - 16 * scale - sprocketW, y, sprocketW, sprocketH, 3 * scale);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. Editorial outer borders & crosshairs
  if (isBordered && !layout.filmSprockets) {
    ctx.save();
    const margin = 28 * scale;
    ctx.strokeStyle = isDarkBg ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(margin, margin, canvasWidth - margin * 2, canvasHeight - margin * 2);

    // Crosshairs
    const tickLen = 8 * scale;
    const corners = [
      { x: margin, y: margin },
      { x: canvasWidth - margin, y: margin },
      { x: margin, y: canvasHeight - margin },
      { x: canvasWidth - margin, y: canvasHeight - margin },
    ];
    ctx.strokeStyle = isDarkBg ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.18)';
    ctx.lineWidth = 1.5 * scale;
    corners.forEach((c) => {
      ctx.beginPath();
      ctx.moveTo(c.x - tickLen, c.y);
      ctx.lineTo(c.x + tickLen, c.y);
      ctx.moveTo(c.x, c.y - tickLen);
      ctx.lineTo(c.x, c.y + tickLen);
      ctx.stroke();
    });
    ctx.restore();
  }

  // 4. Sort slots by zIndex to preserve art-directed layer overlap
  const sortedSlots = [...layout.slots].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

  // 5. Draw each photo slot
  for (const slot of sortedSlots) {
    const slotX = (slot.x / 100) * canvasWidth;
    const slotY = (slot.y / 100) * canvasHeight;
    const slotW = (slot.width / 100) * canvasWidth;
    const slotH = (slot.height / 100) * canvasHeight;
    const rotation = (slot.rotation || 0) * (Math.PI / 180);
    const assignedPhotoId = slotAssignments[slot.id];
    const img = assignedPhotoId ? imageMap.get(assignedPhotoId) : null;
    const transform = slotTransforms[slot.id] || { zoom: 1, panX: 0, panY: 0 };

    ctx.save();
    const centerX = slotX + slotW / 2;
    const centerY = slotY + slotH / 2;
    ctx.translate(centerX, centerY);
    if (rotation !== 0) ctx.rotate(rotation);

    const halfW = slotW / 2;
    const halfH = slotH / 2;

    const effectiveBorder = isBordered ? Math.max(frameWidth * scale, 6 * scale) : 0;
    const isPolaroid = isBordered && (tapeStyle === 'polaroid_bottom' || Boolean(slot.captionHint));
    const polaroidChin = isPolaroid ? 46 * scale : 0;

    // Overlapping Depth Shadows
    if (dropShadow) {
      if (isBordered) {
        ctx.shadowColor = isDarkBg ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.18)';
        ctx.shadowBlur = (slot.isHero ? 28 : 20) * scale;
        ctx.shadowOffsetY = 10 * scale;
        ctx.shadowOffsetX = 3 * scale;
      } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
        ctx.shadowBlur = 14 * scale;
        ctx.shadowOffsetY = 6 * scale;
      }
    }

    // Outer Frame Card (e.g. Polaroid frame or Bordered card)
    if (isBordered) {
      ctx.fillStyle = frameColor || '#FFFFFF';
      const frameRectX = -halfW - effectiveBorder;
      const frameRectY = -halfH - effectiveBorder;
      const frameRectW = slotW + effectiveBorder * 2;
      const frameRectH = slotH + effectiveBorder * 2 + polaroidChin;
      const radius = (slot.borderRadius || 3) * scale;

      roundRect(ctx, frameRectX, frameRectY, frameRectW, frameRectH, radius);
      ctx.fill();

      // Reset shadow for inner photo
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowOffsetX = 0;
    }

    // Inner photo clip rect
    const photoRadius = isBordered ? 1 * scale : (slot.borderRadius || 0) * scale;
    ctx.save();
    roundRect(ctx, -halfW, -halfH, slotW, slotH, photoRadius);
    ctx.clip();

    if (img) {
      const imgAspect = img.width / img.height;
      const slotAspect = slotW / slotH;
      let drawW = slotW;
      let drawH = slotH;
      if (imgAspect > slotAspect) {
        drawH = slotH;
        drawW = slotH * imgAspect;
      } else {
        drawW = slotW;
        drawH = slotW / imgAspect;
      }

      const zoom = transform.zoom || 1.0;
      drawW *= zoom;
      drawH *= zoom;

      const panX = ((transform.panX || 0) / 100) * slotW;
      const panY = ((transform.panY || 0) / 100) * slotH;

      const drawX = -drawW / 2 + panX;
      const drawY = -drawH / 2 + panY;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = isBordered ? '#F0EDE8' : '#2A2A2E';
      ctx.fillRect(-halfW, -halfH, slotW, slotH);

      ctx.fillStyle = isBordered ? '#A0988E' : '#71717A';
      ctx.font = `${Math.round(14 * scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+ Place Photo', 0, 0);
    }
    ctx.restore(); // restore photo clip

    // Polaroid chin handwritten caption
    if (isPolaroid && isBordered && slot.captionHint) {
      ctx.fillStyle = '#3A3A3C';
      ctx.font = `600 ${Math.round(15 * scale)}px "Caveat", cursive, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const captionY = halfH + effectiveBorder + polaroidChin / 2 - 2 * scale;
      ctx.fillText(slot.captionHint, 0, captionY);
    }

    // Washi Tape Graphics with realistic jagged ends
    if (isBordered && (tapeStyle === 'washi_top' || tapeStyle === 'corners')) {
      if (tapeStyle === 'washi_top') {
        ctx.save();
        ctx.fillStyle = 'rgba(240, 232, 218, 0.92)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
        ctx.shadowBlur = 5 * scale;
        ctx.shadowOffsetY = 2 * scale;
        const tapeW = slotW * 0.48;
        const tapeH = 20 * scale;
        const tapeX = -tapeW / 2;
        const tapeY = -halfH - effectiveBorder - tapeH / 2 + 3 * scale;
        ctx.fillRect(tapeX, tapeY, tapeW, tapeH);
        ctx.strokeStyle = 'rgba(190, 170, 145, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tapeX + 2, tapeY + 2, tapeW - 4, tapeH - 4);
        ctx.restore();
      } else if (tapeStyle === 'corners') {
        ctx.save();
        ctx.fillStyle = 'rgba(230, 220, 205, 0.88)';
        const cSize = 20 * scale;
        ctx.beginPath();
        ctx.moveTo(-halfW - effectiveBorder - 2, -halfH + cSize);
        ctx.lineTo(-halfW + cSize, -halfH - effectiveBorder - 2);
        ctx.lineTo(-halfW + cSize + 10, -halfH - effectiveBorder - 2);
        ctx.lineTo(-halfW - effectiveBorder - 2, -halfH + cSize + 10);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(halfW + effectiveBorder + 2, halfH - cSize);
        ctx.lineTo(halfW - cSize, halfH + effectiveBorder + 2);
        ctx.lineTo(halfW - cSize - 10, halfH + effectiveBorder + 2);
        ctx.lineTo(halfW + effectiveBorder + 2, halfH - cSize - 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore(); // restore slot translation & rotation
  }

  // 6. Draw Decorative Stickers (Stars, Barcodes, Stamps, Hearts)
  if (layout.stickers && layout.stickers.length > 0) {
    for (const sticker of layout.stickers) {
      const stX = (sticker.x / 100) * canvasWidth;
      const stY = (sticker.y / 100) * canvasHeight;
      const stRot = (sticker.rotation || 0) * (Math.PI / 180);

      ctx.save();
      ctx.translate(stX, stY);
      if (stRot !== 0) ctx.rotate(stRot);

      if (sticker.type === 'star') {
        ctx.fillStyle = sticker.color || '#E29D72';
        drawStarDoodle(ctx, 0, 0, 16 * scale);
      } else if (sticker.type === 'barcode') {
        drawBarcodeSticker(ctx, 0, 0, 72 * scale, 32 * scale, scale);
      } else if (sticker.type === 'stamp') {
        drawPassportStamp(ctx, 0, 0, 36 * scale, sticker.text || 'ARCHIVE', scale);
      } else if (sticker.type === 'heart') {
        drawHeartDoodle(ctx, 0, 0, 14 * scale, sticker.color || '#E76F51');
      } else if (sticker.type === 'smile') {
        drawSmileyDoodle(ctx, 0, 0, 14 * scale, sticker.color || '#F4A261');
      }

      ctx.restore();
    }
  }

  // 7. Draw Handwritten Note Scribble
  if (handwrittenNoteText) {
    ctx.save();
    const pos = layout.handwrittenPosition || { x: 12, y: 92, rotation: -3 };
    const hX = (pos.x / 100) * canvasWidth;
    const hY = (pos.y / 100) * canvasHeight;
    const hRot = (pos.rotation || -3) * (Math.PI / 180);

    ctx.translate(hX, hY);
    ctx.rotate(hRot);

    ctx.font = `600 ${Math.round(26 * scale)}px "Caveat", cursive, sans-serif`;
    ctx.fillStyle = isDarkBg ? '#FAF5EE' : '#1C1C20';
    ctx.shadowColor = isDarkBg ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 4 * scale;
    ctx.fillText(handwrittenNoteText, 0, 0);

    ctx.restore();
  }

  // 8. Draw Aesthetic Typographic Header & Date Stamps
  const textColor = isDarkBg ? '#F0F0F0' : '#1F1F21';
  const subtextColor = isDarkBg ? '#9D9DA5' : '#686870';

  if (stickerText) {
    ctx.save();
    const stampX = 38 * scale;
    const stampY = 50 * scale;
    ctx.font = `700 ${Math.round(11 * scale)}px "Space Mono", monospace`;
    ctx.letterSpacing = '2px';
    ctx.fillStyle = textColor;
    ctx.fillText(stickerText.toUpperCase(), stampX, stampY);
    ctx.restore();
  }

  if (dateStampText || layout.captionVibe) {
    ctx.save();
    const stampY = canvasHeight - 44 * scale;
    ctx.textAlign = 'right';
    ctx.font = `500 ${Math.round(11 * scale)}px "Space Mono", monospace`;
    ctx.letterSpacing = '1px';
    ctx.fillStyle = subtextColor;
    const displayText = (dateStampText || '') + (layout.captionVibe ? ` • ${layout.captionVibe}` : '');
    ctx.fillText(displayText.toUpperCase(), canvasWidth - 38 * scale, stampY);
    ctx.restore();
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawStarDoodle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  // 4-point sparkle star
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.closePath();
  ctx.fill();
}

function drawHeartDoodle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + size / 4);
  ctx.quadraticCurveTo(x, y, x + size / 4, y);
  ctx.quadraticCurveTo(x + size / 2, y, x + size / 2, y + size / 4);
  ctx.quadraticCurveTo(x + size / 2, y, x + (size * 3) / 4, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + size / 4);
  ctx.quadraticCurveTo(x + size, y + size / 2, x + size / 2, y + (size * 3) / 4);
  ctx.lineTo(x + size / 2, y + size);
  ctx.lineTo(x + size / 2, y + (size * 3) / 4);
  ctx.quadraticCurveTo(x, y + size / 2, x, y + size / 4);
  ctx.fill();
  ctx.restore();
}

function drawSmileyDoodle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Eyes
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx - r / 3, cy - r / 4, 2, 0, Math.PI * 2);
  ctx.arc(cx + r / 3, cy - r / 4, 2, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(cx, cy, r / 2, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

function drawBarcodeSticker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 4 * scale;
  ctx.shadowOffsetY = 2 * scale;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 2 * scale);
  ctx.fill();

  // Barcode bars
  ctx.fillStyle = '#111';
  let curX = x - w / 2 + 5 * scale;
  const barW = 1.2 * scale;
  const barH = h - 10 * scale;
  while (curX < x + w / 2 - 5 * scale) {
    const isThick = Math.random() > 0.6;
    ctx.fillRect(curX, y - h / 2 + 4 * scale, isThick ? barW * 2 : barW, barH);
    curX += (isThick ? 3.5 : 2.2) * scale;
  }
  ctx.restore();
}

function drawPassportStamp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  text: string,
  scale: number
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(215, 85, 60, 0.75)';
  ctx.lineWidth = 1.8 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r - 4 * scale, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(215, 85, 60, 0.85)';
  ctx.font = `700 ${Math.round(8 * scale)}px "Space Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), cx, cy);
  ctx.restore();
}
