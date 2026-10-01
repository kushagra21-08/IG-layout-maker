import { Photo } from '../types/layout';

export const SAMPLE_PHOTO_DUMPS: Record<
  string,
  { label: string; tag: string; description: string; photos: Photo[] }
> = {
  genz_party: {
    label: 'Gen-Z Night Out & Rave',
    tag: 'Party Vibes',
    description: 'Flash photography, disco balls, 3am laughter, drinks & afters',
    photos: [
      {
        id: 'party-1',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
        name: 'Flash Party Crowd',
        aspectRatio: 'landscape',
      },
      {
        id: 'party-2',
        url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
        name: 'Neon Flash Lights',
        aspectRatio: 'portrait',
      },
      {
        id: 'party-3',
        url: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=1000&q=80',
        name: 'Disco Ball Sparkle',
        aspectRatio: 'portrait',
      },
      {
        id: 'party-4',
        url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
        name: 'Friends Laughing with Flash',
        aspectRatio: 'landscape',
      },
      {
        id: 'party-5',
        url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1000&q=80',
        name: 'Cocktails on the Bar',
        aspectRatio: 'portrait',
      },
      {
        id: 'party-6',
        url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
        name: 'Subway Ride at 4AM',
        aspectRatio: 'landscape',
      },
    ],
  },
  euro_summer: {
    label: 'Euro Summer Vacation',
    tag: 'Vacation Diary',
    description: 'Amalfi coast, turquoise water, limoncello spritz & boat rides',
    photos: [
      {
        id: 'euro-1',
        url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
        name: 'Santorini Coast Horizon',
        aspectRatio: 'landscape',
      },
      {
        id: 'euro-2',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
        name: 'Linen Dress Sunlit',
        aspectRatio: 'portrait',
      },
      {
        id: 'euro-3',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        name: 'Turquoise Sea Waves',
        aspectRatio: 'landscape',
      },
      {
        id: 'euro-4',
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
        name: 'Iced Coffee in Courtyard',
        aspectRatio: 'portrait',
      },
      {
        id: 'euro-5',
        url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
        name: 'Sunset Coastline Roadtrip',
        aspectRatio: 'landscape',
      },
    ],
  },
  tokyo_outing: {
    label: 'Tokyo 35mm Street Outing',
    tag: 'Film Archive',
    description: 'Matcha lattes, neon backstreets, 35mm disposable walk',
    photos: [
      {
        id: 'sample-1',
        url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
        name: 'Tokyo Neon Street',
        aspectRatio: 'portrait',
      },
      {
        id: 'sample-2',
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
        name: 'Film Camera Walk',
        aspectRatio: 'landscape',
      },
      {
        id: 'sample-3',
        url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1000&q=80',
        name: 'Shibuya Crossing Glimpse',
        aspectRatio: 'portrait',
      },
      {
        id: 'sample-4',
        url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
        name: 'Lantern Backstreet',
        aspectRatio: 'landscape',
      },
    ],
  },
};

export const SAMPLE_PINTEREST_SCREENSHOTS = [
  {
    id: 'pin-party',
    title: '3AM Flash Scatter Scrapbook',
    description: 'Overlapping polaroids with neon stars, washi tape & handwritten party scribbles',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    fallbackLayout: {
      title: 'Party Flash Scatter (Extracted)',
      vibeDescription: 'Tilted flash polaroids with party energy and tape stickers',
      vibeCategory: 'genz_party' as const,
      format: 'story' as const,
      styleType: 'bordered' as const,
      backgroundColor: '#0E0E12',
      frameColor: '#FFFFFF',
      frameWidth: 9,
      dropShadow: true,
      tapeStyle: 'washi_top' as const,
      stickerText: 'RAVE ARCHIVE // 03:42 AM',
      handwrittenNote: "don't let the music stop ✨",
      slots: [
        { id: 'p1', x: 8, y: 14, width: 60, height: 42, rotation: -5, zIndex: 1, borderRadius: 2, aspectRatio: 'portrait' as const, isHero: true, captionHint: 'vip booth' },
        { id: 'p2', x: 42, y: 36, width: 50, height: 36, rotation: 6, zIndex: 2, borderRadius: 2, aspectRatio: 'landscape' as const, captionHint: 'polaroid kiss' },
        { id: 'p3', x: 14, y: 60, width: 56, height: 32, rotation: -2, zIndex: 3, borderRadius: 2, aspectRatio: 'landscape' as const, captionHint: '4am diner' },
      ],
    },
  },
  {
    id: 'pin-vacation',
    title: 'Mediterranean Vacation Diary',
    description: 'Dominant hero seascape with 2 tilted mini polaroids and travel visa stamps',
    thumbnail: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    fallbackLayout: {
      title: 'Amalfi Hero Diary (Extracted)',
      vibeDescription: 'Hero landscape with staggered polaroids and paper texture',
      vibeCategory: 'vacation_diary' as const,
      format: 'story' as const,
      styleType: 'bordered' as const,
      backgroundColor: '#FAF5EE',
      frameColor: '#FFFFFF',
      frameWidth: 9,
      dropShadow: true,
      tapeStyle: 'washi_top' as const,
      stickerText: 'SUMMER DIARY // AMALFI',
      handwrittenNote: 'sunkissed & salty 🌊',
      slots: [
        { id: 'p1', x: 6, y: 10, width: 88, height: 48, rotation: 0, zIndex: 1, borderRadius: 2, aspectRatio: 'landscape' as const, isHero: true, captionHint: 'CALDERA HORIZON' },
        { id: 'p2', x: 8, y: 60, width: 44, height: 30, rotation: -4, zIndex: 2, borderRadius: 2, aspectRatio: 'portrait' as const, captionHint: 'spriz' },
        { id: 'p3', x: 48, y: 58, width: 46, height: 32, rotation: 4, zIndex: 3, borderRadius: 2, aspectRatio: 'portrait' as const, captionHint: 'sunset cruise' },
      ],
    },
  },
  {
    id: 'pin-editorial',
    title: 'Vogue Minimal Centerfold',
    description: 'Massive fashion crop bleed with dramatic negative space and micro inset',
    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    fallbackLayout: {
      title: 'Vogue Centerfold (Extracted)',
      vibeDescription: 'Sleek borderless editorial split with rich negative space',
      vibeCategory: 'vogue_editorial' as const,
      format: 'story' as const,
      styleType: 'borderless' as const,
      backgroundColor: '#0F0F12',
      frameColor: 'transparent',
      frameWidth: 0,
      dropShadow: false,
      tapeStyle: 'none' as const,
      stickerText: 'VOGUE EDIT // ISSUE 14',
      handwrittenNote: 'poetic architecture.',
      slots: [
        { id: 'v1', x: 6, y: 8, width: 88, height: 58, rotation: 0, zIndex: 1, borderRadius: 0, aspectRatio: 'portrait' as const, isHero: true },
        { id: 'v2', x: 42, y: 70, width: 52, height: 22, rotation: 0, zIndex: 2, borderRadius: 0, aspectRatio: 'landscape' as const },
      ],
    },
  },
];
