import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialize Gemini AI client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Pinterest / Screenshot layout extraction endpoint
app.post('/api/extract-layout', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', targetFormat } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    // Strip data prefix if provided
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check environment settings.',
      });
    }

    const promptText = `
You are a visionary Gen-Z aesthetic layout architect, Pinterest art-director, and high-fashion editorial designer.
Analyze this Pinterest screenshot, moodboard, or photo layout screenshot with supreme precision.

CRITICAL INSTRUCTION - REJECT RIGID MATH GRIDS:
The layout must feel INTENTIONALLY ART-DIRECTED, not mechanically tiled. Look for:
- Asymmetrical compositions
- Different photo sizes within the same layout (e.g. 1 huge hero image + 2 tiny supporting snapshots)
- Overlapping photographs (photo A layer over photo B with subtle rotation angles like -4 to +6 degrees)
- Photos partially extending outside frames or bleeding off edges
- Interesting negative space and off-center focal points
- Film-strip / contact sheet styling or Scrapbook tape & polaroid arrangements
- Tape / sticker elements, barcode stamps, star doodles, or handwritten text scribbles
- Gen-Z party / afters / vacation / fashion-editorial mood

Deconstruct the composition into:
1. "format": 'story' (9:16), 'square' (1:1), 'portrait_feed' (4:5), or 'landscape'.
2. "vibeCategory": 'genz_party' | 'vacation_diary' | 'vogue_editorial' | 'film_archive' | 'scrapbook'
3. "styleType": 'bordered' or 'borderless'
4. "backgroundColor": exact aesthetic hex (e.g. '#0F0F12', '#FAF5EE', '#EAE5DB', '#F4EFE6')
5. "frameColor": hex for photo borders (e.g. '#FFFFFF', '#252528', 'transparent')
6. "frameWidth": frame width in px (0 for borderless, 6-16 for polaroids)
7. "dropShadow": boolean
8. "tapeStyle": 'none' | 'washi_top' | 'corners' | 'polaroid_bottom' | 'pin'
9. "stickerText": aesthetic label (e.g. "AFTER HOURS // 03:42AM", "AMALFI VIBES", "ARCHIVE // 35MM")
10. "dateStamp": aesthetic date (e.g. "'98 10 24", "OCT 2026", "23.08.26")
11. "handwrittenNote": aesthetic handwritten scribble (e.g. "take me back 🫧", "best night with the crew ✨", "don't look at camera", "pure serotonin", "summer diary")
12. "slots": Array of photo slots:
   - "id": string
   - "x": percentage left (0-100)
   - "y": percentage top (0-100)
   - "width": percentage width (10-95)
   - "height": percentage height (10-95)
   - "rotation": degrees (-12 to 12)
   - "zIndex": integer layer depth (1 to 5)
   - "borderRadius": px (0-16)
   - "aspectRatio": 'portrait' | 'landscape' | 'square'
   - "isHero": boolean (true if dominant centerpiece image)
   - "captionHint": short sub-caption if polaroid

Return strictly valid JSON matching this schema:
{
  "title": string,
  "vibeDescription": string,
  "vibeCategory": "genz_party" | "vacation_diary" | "vogue_editorial" | "film_archive" | "scrapbook",
  "format": "story" | "square" | "portrait_feed" | "landscape",
  "styleType": "bordered" | "borderless",
  "backgroundColor": string,
  "frameColor": string,
  "frameWidth": number,
  "dropShadow": boolean,
  "tapeStyle": "none" | "washi_top" | "corners" | "polaroid_bottom" | "pin",
  "stickerText": string,
  "dateStamp": string,
  "handwrittenNote": string,
  "slots": [
    {
      "id": string,
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "rotation": number,
      "zIndex": number,
      "borderRadius": number,
      "aspectRatio": "portrait" | "landscape" | "square",
      "isHero": boolean,
      "captionHint": string
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        {
          text: promptText,
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No layout detected from model response');
    }

    const layoutData = JSON.parse(text);
    return res.json({ success: true, layout: layoutData });
  } catch (error: any) {
    console.error('Error extracting layout:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to extract layout from screenshot',
    });
  }
});

// AI Art Director: Generate bespoke Gen-Z / Vacation / Editorial layouts
app.post('/api/generate-ai-layout', async (req: Request, res: Response) => {
  try {
    const {
      vibePrompt = 'chaotic 3am party dump with flash photography and polaroid overlaps',
      photoCount = 4,
      format = 'story',
      styleType = 'bordered',
      vibeCategory = 'genz_party',
    } = req.body;

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const artDirectorPrompt = `
You are an iconic Gen-Z Instagram creative director and high-fashion editorial art director.
A user has an outing/camera dump of ${photoCount} photos.
They want a custom layout with this aesthetic vibe: "${vibePrompt}".
Format: ${format} (e.g. story 9:16 or square 1:1 or feed 4:5).
Style: ${styleType} (bordered or borderless).
Vibe category: ${vibeCategory} (genz_party, vacation_diary, vogue_editorial, film_archive, or scrapbook).

STRICT ART DIRECTION RULES:
1. REJECT BORING EQUAL-SIZED GRIDS. The layout must feel human-designed, intentional, emotional, and visually dynamic.
2. DIFFERENT PHOTO SIZES: Design varying weights. E.g., 1 massive hero photo (60-80% height or width) + 2 or 3 smaller satellite photos, or staggered asymmetry.
3. OVERLAPPING & DEPTH: Photos must have natural layering (z-index 1, 2, 3...) and subtle tilt angles (-8 to +8 degrees) like prints scattered on a table or stuck in a scrapbook.
4. NEGATIVE SPACE: Deliberately place photos off-center or create dramatic editorial negative margins.
5. VIBE-SPECIFIC DETAILS:
   - For 'genz_party': flash photography vibe, dark or cream canvas, tilted polaroids, barcode/star stickers, timestamp '03:42 AM', handwritten scribbles like "favorite chaos ✨", "don't let the music stop".
   - For 'vacation_diary': sunny cream/sand canvas, washi tape corners, coordinates stamp (e.g. '37.8651° N, 15.2863° E'), handwritten note "sun-kissed & salty 🌊".
   - For 'vogue_editorial': sleek high-fashion cuts, massive off-center crop, micro inset, stark minimal negative space, bold chic typography.
   - For 'film_archive': 35mm contact sheet reel numbers, orange date stamp '98 10 24', frame borders.
   - For 'scrapbook': layered overlapping photos with washi tape, polaroid chins, paper texture feel.

Generate exactly ${photoCount} slots with precise percentage coordinates (0-100) ensuring everything looks beautifully balanced and within view.

Return strictly valid JSON:
{
  "title": string,
  "vibeDescription": string,
  "vibeCategory": "genz_party" | "vacation_diary" | "vogue_editorial" | "film_archive" | "scrapbook",
  "format": "${format}",
  "styleType": "${styleType}",
  "backgroundColor": string,
  "frameColor": string,
  "frameWidth": number,
  "dropShadow": boolean,
  "tapeStyle": "none" | "washi_top" | "corners" | "polaroid_bottom" | "pin",
  "stickerText": string,
  "dateStamp": string,
  "handwrittenNote": string,
  "slots": [
    {
      "id": string,
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "rotation": number,
      "zIndex": number,
      "borderRadius": number,
      "aspectRatio": "portrait" | "landscape" | "square",
      "isHero": boolean,
      "captionHint": string
    }
  ]
}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: artDirectorPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (text) {
        const layoutData = JSON.parse(text);
        return res.json({ success: true, layout: layoutData });
      }
    } catch (modelErr) {
      console.warn('Gemini 3.8 Flash temporarily busy, using smart art-director fallback:', modelErr);
    }

    // Dynamic Art-Directed Fallback (never fails, highly designed with asymmetry and overlapping!)
    const fallbackLayout = generateArtDirectedFallback(
      vibePrompt,
      photoCount,
      format,
      styleType,
      vibeCategory
    );
    return res.json({ success: true, layout: fallbackLayout, fallback: true });
  } catch (error: any) {
    console.error('Error generating AI layout:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate AI layout',
    });
  }
});

function generateArtDirectedFallback(
  vibePrompt: string,
  photoCount: number,
  format: string,
  styleType: string,
  vibeCategory: string
) {
  const isParty = vibeCategory === 'genz_party' || vibePrompt.toLowerCase().includes('party');
  const isVacation = vibeCategory === 'vacation_diary' || vibePrompt.toLowerCase().includes('vacation') || vibePrompt.toLowerCase().includes('amalfi');
  const isEditorial = vibeCategory === 'vogue_editorial' || styleType === 'borderless';

  const isDark = isParty || isEditorial;
  const bgColor = isParty ? '#0E0E12' : isVacation ? '#FAF5EE' : isEditorial ? '#101012' : '#F6F2EC';

  // Art-directed asymmetric slot arrangements
  let slots = [];
  if (photoCount <= 2) {
    slots = [
      { id: 's1', x: 8, y: 12, width: 62, height: 48, rotation: -4, zIndex: 1, borderRadius: 2, aspectRatio: 'portrait', isHero: true, captionHint: 'main memory' },
      { id: 's2', x: 38, y: 44, width: 56, height: 44, rotation: 5, zIndex: 2, borderRadius: 2, aspectRatio: 'portrait', isHero: false, captionHint: 'afters' },
    ];
  } else if (photoCount === 3) {
    slots = [
      { id: 's1', x: 6, y: 10, width: 88, height: 46, rotation: 0, zIndex: 1, borderRadius: 3, aspectRatio: 'landscape', isHero: true, captionHint: 'POSTCARD' },
      { id: 's2', x: 8, y: 60, width: 44, height: 32, rotation: -4.5, zIndex: 2, borderRadius: 2, aspectRatio: 'portrait', isHero: false, captionHint: 'spriz stop' },
      { id: 's3', x: 48, y: 58, width: 46, height: 34, rotation: 4.5, zIndex: 3, borderRadius: 2, aspectRatio: 'portrait', isHero: false, captionHint: 'sunset cruise' },
    ];
  } else if (photoCount === 4) {
    slots = [
      { id: 's1', x: 6, y: 8, width: 54, height: 38, rotation: -3.5, zIndex: 1, borderRadius: 2, aspectRatio: 'portrait', isHero: true, captionHint: 'the entrance' },
      { id: 's2', x: 50, y: 14, width: 44, height: 32, rotation: 4, zIndex: 2, borderRadius: 2, aspectRatio: 'landscape', isHero: false, captionHint: 'flash crowd' },
      { id: 's3', x: 8, y: 48, width: 42, height: 34, rotation: 2.5, zIndex: 2, borderRadius: 2, aspectRatio: 'square', isHero: false, captionHint: 'table dump' },
      { id: 's4', x: 42, y: 50, width: 52, height: 40, rotation: -4, zIndex: 3, borderRadius: 2, aspectRatio: 'portrait', isHero: false, captionHint: '3am ride' },
    ];
  } else {
    slots = [
      { id: 's1', x: 14, y: 12, width: 72, height: 48, rotation: -1, zIndex: 2, borderRadius: 2, aspectRatio: 'portrait', isHero: true, captionHint: 'CENTERPIECE' },
      { id: 's2', x: 6, y: 8, width: 32, height: 26, rotation: -6, zIndex: 3, borderRadius: 2, aspectRatio: 'square', isHero: false, captionHint: '01' },
      { id: 's3', x: 64, y: 7, width: 30, height: 26, rotation: 5, zIndex: 3, borderRadius: 2, aspectRatio: 'square', isHero: false, captionHint: '02' },
      { id: 's4', x: 7, y: 64, width: 38, height: 28, rotation: 4, zIndex: 4, borderRadius: 2, aspectRatio: 'landscape', isHero: false, captionHint: '03' },
      { id: 's5', x: 55, y: 63, width: 38, height: 28, rotation: -5, zIndex: 4, borderRadius: 2, aspectRatio: 'landscape', isHero: false, captionHint: '04' },
    ];
  }

  return {
    title: isParty ? '3AM Flash Scatter' : isVacation ? 'Amalfi Sun Diary' : 'Vogue Editorial Asymmetric',
    vibeDescription: isParty ? 'Chaotic flash photography with polaroid tilt' : 'Mediterranean travel postcards with washi tape',
    vibeCategory: isParty ? 'genz_party' : isVacation ? 'vacation_diary' : 'vogue_editorial',
    format: format || 'story',
    styleType: styleType || 'bordered',
    backgroundColor: bgColor,
    frameColor: isEditorial ? 'transparent' : '#FFFFFF',
    frameWidth: isEditorial ? 0 : 9,
    dropShadow: true,
    tapeStyle: isEditorial ? 'none' : 'washi_top',
    stickerText: isParty ? 'AFTERS // 03:42 AM' : isVacation ? 'MEDITERRANEAN // ARCHIVE' : 'THE EDIT // ISSUE 08',
    dateStamp: isParty ? "'26 10 01" : isVacation ? '37.8651° N, 15.2863° E' : 'AUTUMN 2026',
    handwrittenNote: isParty ? "don't let the music stop ✨" : isVacation ? 'sun-kissed & salty hair 🌊' : 'poetic forms.',
    slots,
  };
}

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
