// ─── Enums (mirror schema) ────────────────────────────────────────────────────
export type ProfileState = "aspirational" | "blended" | "data_derived";
export type RemixMode = "dub" | "reaction";
export type RenderStatus = "queued" | "rendering" | "ready" | "failed";
export type CampaignStatus = "draft" | "live" | "paused" | "closed";
export type ApplicationStatus = "applied" | "accepted" | "rejected" | "withdrawn";
export type BrandTier = "self_serve" | "mid_tier" | "enterprise";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Creator = {
  id: string;
  name: string;
  avatar: string;
  languages: string[];
  profileState: ProfileState;
  bio: string;
  followers: number;
  totalDubs: number;
  earnings: number; // cents
};

export type Clip = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  owner: Creator;
  language: string;
  category: string;
  salienceScore: number;
  remixCount: number;
  createdAt: string;
};

export type Remix = {
  id: string;
  clipId: string;
  mode: RemixMode;
  renderStatus: RenderStatus;
  creator: Creator;
  language: string;
  thumbnailUrl: string;
  createdAt: string;
  labels: string[];
};

export type FeedRow = {
  clip: Clip;
  remixes: Remix[];
};

export type Brand = {
  id: string;
  name: string;
  logo: string;
  industry: string;
  tier: BrandTier;
  region: string;
};

export type Campaign = {
  id: string;
  brand: Brand;
  name: string;
  brief: string;
  targetLanguages: string[];
  budgetCents: number;
  status: CampaignStatus;
  startAt: string;
  endAt: string | null;
  applicantCount: number;
  matchScore: number; // 0-1, this creator's embedding similarity
};

export type MyApplication = {
  campaignId: string;
  status: ApplicationStatus;
  appliedAt: string;
  decidedAt: string | null;
};

// ─── Creators ────────────────────────────────────────────────────────────────
export const CREATORS: Creator[] = [
  {
    id: "u-yuki",
    name: "Yuki Nakamura",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yuki&backgroundColor=b6e3f4",
    languages: ["ja", "en"],
    profileState: "data_derived",
    bio: "Tokyo-based voice actor. Specialising in anime and travel content.",
    followers: 42300,
    totalDubs: 187,
    earnings: 4820_00,
  },
  {
    id: "u-marie",
    name: "Marie Dupont",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marie&backgroundColor=ffdfbf",
    languages: ["fr", "en", "es"],
    profileState: "data_derived",
    bio: "Parisian creator. Food, culture, and comedy dubs.",
    followers: 28900,
    totalDubs: 94,
    earnings: 2310_00,
  },
  {
    id: "u-emeka",
    name: "Emeka Obi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emeka&backgroundColor=c0aede",
    languages: ["yo", "ig", "en"],
    profileState: "blended",
    bio: "Lagos. Music, Afrobeats, Nollywood reactions.",
    followers: 19100,
    totalDubs: 56,
    earnings: 870_00,
  },
  {
    id: "u-priya",
    name: "Priya Sharma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=d1d4f9",
    languages: ["hi", "bn", "en"],
    profileState: "data_derived",
    bio: "Mumbai. Dance tutorials, Bollywood commentary.",
    followers: 61500,
    totalDubs: 243,
    earnings: 7150_00,
  },
  {
    id: "u-lucas",
    name: "Lucas Ferreira",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lucas&backgroundColor=ffd5dc",
    languages: ["pt", "es"],
    profileState: "blended",
    bio: "São Paulo street art and music scene.",
    followers: 11200,
    totalDubs: 38,
    earnings: 430_00,
  },
  {
    id: "u-mina",
    name: "Mina Choi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mina&backgroundColor=b6e3f4",
    languages: ["ko", "en"],
    profileState: "data_derived",
    bio: "Seoul. K-drama breakdowns and beauty commentary.",
    followers: 88200,
    totalDubs: 312,
    earnings: 12300_00,
  },
  {
    id: "u-alex",
    name: "Alex Rivera",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=d1d4f9",
    languages: ["es", "en"],
    profileState: "blended",
    bio: "Mexico City. Street food and travel reactions.",
    followers: 7800,
    totalDubs: 22,
    earnings: 200_00,
  },
  {
    id: "u-fatima",
    name: "Fatima Al-Rashid",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fatima&backgroundColor=c0aede",
    languages: ["ar", "fr"],
    profileState: "data_derived",
    bio: "Beirut. Fashion, lifestyle, and culture dubs.",
    followers: 34600,
    totalDubs: 129,
    earnings: 3480_00,
  },
];

export const ME: Creator = CREATORS[0]; // signed-in creator for the demo

// ─── Clips ────────────────────────────────────────────────────────────────────
export const CLIPS: Clip[] = [
  {
    id: "clip-001",
    title: "Street food tour — Osaka",
    description: "6-minute takoyaki-to-ramen run through Dotonbori. Original Japanese narration.",
    thumbnailUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    owner: CREATORS[5],
    language: "ja",
    category: "Food & Travel",
    salienceScore: 0.91,
    remixCount: 24,
    createdAt: "2026-05-28",
  },
  {
    id: "clip-002",
    title: "Bollywood dance breakdown",
    description: "Step-by-step tutorial on the hook from Naatu Naatu. Hindi instruction.",
    thumbnailUrl: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80",
    owner: CREATORS[3],
    language: "hi",
    category: "Dance",
    salienceScore: 0.95,
    remixCount: 41,
    createdAt: "2026-06-01",
  },
  {
    id: "clip-003",
    title: "Lagos Afrobeats studio session",
    description: "Emeka walks through a live session beat build from scratch. Yoruba commentary.",
    thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    owner: CREATORS[2],
    language: "yo",
    category: "Music",
    salienceScore: 0.88,
    remixCount: 29,
    createdAt: "2026-06-02",
  },
  {
    id: "clip-004",
    title: "Barcelona rooftop at golden hour",
    description: "60-second city timelapse. No narration — open for any language.",
    thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    owner: CREATORS[1],
    language: "fr",
    category: "Travel",
    salienceScore: 0.83,
    remixCount: 18,
    createdAt: "2026-06-03",
  },
  {
    id: "clip-005",
    title: "K-drama red-flag compilation",
    description: "Every toxic trope from 2025's biggest dramas. Korean commentary.",
    thumbnailUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
    owner: CREATORS[5],
    language: "ko",
    category: "Entertainment",
    salienceScore: 0.97,
    remixCount: 67,
    createdAt: "2026-06-04",
  },
  {
    id: "clip-006",
    title: "São Paulo street art documentary",
    description: "Graffiti legend Mundano on 20 years of walls. Portuguese with English subs.",
    thumbnailUrl: "https://images.unsplash.com/photo-1531913223931-b0d3198229ee?w=800&q=80",
    owner: CREATORS[4],
    language: "pt",
    category: "Art & Culture",
    salienceScore: 0.82,
    remixCount: 12,
    createdAt: "2026-06-05",
  },
  {
    id: "clip-007",
    title: "Beirut fashion week backstage",
    description: "30-min uncut backstage access at FFWD. Arabic narration.",
    thumbnailUrl: "https://images.unsplash.com/photo-1558618047-f4e60c38d9f7?w=800&q=80",
    owner: CREATORS[7],
    language: "ar",
    category: "Fashion",
    salienceScore: 0.86,
    remixCount: 33,
    createdAt: "2026-06-06",
  },
];

// ─── Remixes (2–4 per clip) ───────────────────────────────────────────────────
export const REMIXES: Remix[] = [
  // clip-001 remixes
  { id: "rx-001-en", clipId: "clip-001", mode: "dub", renderStatus: "ready", creator: CREATORS[6], language: "en", thumbnailUrl: CLIPS[0].thumbnailUrl, createdAt: "2026-05-30", labels: ["food", "travel", "english"] },
  { id: "rx-001-fr", clipId: "clip-001", mode: "dub", renderStatus: "ready", creator: CREATORS[1], language: "fr", thumbnailUrl: CLIPS[0].thumbnailUrl, createdAt: "2026-05-31", labels: ["food", "french"] },
  { id: "rx-001-ko", clipId: "clip-001", mode: "reaction", renderStatus: "ready", creator: CREATORS[5], language: "ko", thumbnailUrl: CLIPS[0].thumbnailUrl, createdAt: "2026-06-01", labels: ["food", "reaction"] },

  // clip-002 remixes
  { id: "rx-002-en", clipId: "clip-002", mode: "dub", renderStatus: "ready", creator: CREATORS[6], language: "en", thumbnailUrl: CLIPS[1].thumbnailUrl, createdAt: "2026-06-02", labels: ["dance", "english"] },
  { id: "rx-002-ko", clipId: "clip-002", mode: "dub", renderStatus: "ready", creator: CREATORS[5], language: "ko", thumbnailUrl: CLIPS[1].thumbnailUrl, createdAt: "2026-06-03", labels: ["dance", "korean"] },
  { id: "rx-002-ar", clipId: "clip-002", mode: "reaction", renderStatus: "ready", creator: CREATORS[7], language: "ar", thumbnailUrl: CLIPS[1].thumbnailUrl, createdAt: "2026-06-04", labels: ["dance", "arabic", "reaction"] },
  { id: "rx-002-fr", clipId: "clip-002", mode: "dub", renderStatus: "ready", creator: CREATORS[1], language: "fr", thumbnailUrl: CLIPS[1].thumbnailUrl, createdAt: "2026-06-04", labels: ["dance", "french"] },

  // clip-003 remixes
  { id: "rx-003-en", clipId: "clip-003", mode: "dub", renderStatus: "ready", creator: CREATORS[0], language: "en", thumbnailUrl: CLIPS[2].thumbnailUrl, createdAt: "2026-06-03", labels: ["music", "english"] },
  { id: "rx-003-pt", clipId: "clip-003", mode: "reaction", renderStatus: "ready", creator: CREATORS[4], language: "pt", thumbnailUrl: CLIPS[2].thumbnailUrl, createdAt: "2026-06-04", labels: ["music", "portuguese"] },

  // clip-004 remixes
  { id: "rx-004-ar", clipId: "clip-004", mode: "dub", renderStatus: "ready", creator: CREATORS[7], language: "ar", thumbnailUrl: CLIPS[3].thumbnailUrl, createdAt: "2026-06-04", labels: ["travel", "arabic"] },
  { id: "rx-004-hi", clipId: "clip-004", mode: "dub", renderStatus: "ready", creator: CREATORS[3], language: "hi", thumbnailUrl: CLIPS[3].thumbnailUrl, createdAt: "2026-06-05", labels: ["travel", "hindi"] },
  { id: "rx-004-es", clipId: "clip-004", mode: "dub", renderStatus: "ready", creator: CREATORS[6], language: "es", thumbnailUrl: CLIPS[3].thumbnailUrl, createdAt: "2026-06-05", labels: ["travel", "spanish"] },

  // clip-005 remixes
  { id: "rx-005-en", clipId: "clip-005", mode: "dub", renderStatus: "ready", creator: CREATORS[6], language: "en", thumbnailUrl: CLIPS[4].thumbnailUrl, createdAt: "2026-06-05", labels: ["entertainment", "english"] },
  { id: "rx-005-ja", clipId: "clip-005", mode: "reaction", renderStatus: "ready", creator: CREATORS[0], language: "ja", thumbnailUrl: CLIPS[4].thumbnailUrl, createdAt: "2026-06-06", labels: ["kdrama", "japanese"] },
  { id: "rx-005-fr", clipId: "clip-005", mode: "reaction", renderStatus: "ready", creator: CREATORS[1], language: "fr", thumbnailUrl: CLIPS[4].thumbnailUrl, createdAt: "2026-06-06", labels: ["kdrama", "french"] },

  // clip-006 remixes
  { id: "rx-006-en", clipId: "clip-006", mode: "dub", renderStatus: "ready", creator: CREATORS[0], language: "en", thumbnailUrl: CLIPS[5].thumbnailUrl, createdAt: "2026-06-06", labels: ["art", "english"] },
  { id: "rx-006-fr", clipId: "clip-006", mode: "dub", renderStatus: "ready", creator: CREATORS[1], language: "fr", thumbnailUrl: CLIPS[5].thumbnailUrl, createdAt: "2026-06-07", labels: ["art", "french"] },

  // clip-007 remixes
  { id: "rx-007-en", clipId: "clip-007", mode: "dub", renderStatus: "ready", creator: CREATORS[6], language: "en", thumbnailUrl: CLIPS[6].thumbnailUrl, createdAt: "2026-06-07", labels: ["fashion", "english"] },
  { id: "rx-007-fr", clipId: "clip-007", mode: "dub", renderStatus: "ready", creator: CREATORS[1], language: "fr", thumbnailUrl: CLIPS[6].thumbnailUrl, createdAt: "2026-06-07", labels: ["fashion", "french"] },
  { id: "rx-007-ko", clipId: "clip-007", mode: "reaction", renderStatus: "ready", creator: CREATORS[5], language: "ko", thumbnailUrl: CLIPS[6].thumbnailUrl, createdAt: "2026-06-08", labels: ["fashion", "korean"] },
];

// ─── 2D Feed grid ─────────────────────────────────────────────────────────────
// Each row: clip at col 0, remixes at col 1..n
export const FEED_ROWS: FeedRow[] = CLIPS.map((clip) => ({
  clip,
  remixes: REMIXES.filter((r) => r.clipId === clip.id),
}));

// ─── Brands ───────────────────────────────────────────────────────────────────
export const BRANDS: Brand[] = [
  { id: "b-001", name: "Spotify", logo: "https://api.dicebear.com/7.x/initials/svg?seed=SP&backgroundColor=1db954", industry: "Music Streaming", tier: "enterprise", region: "Global" },
  { id: "b-002", name: "Duolingo", logo: "https://api.dicebear.com/7.x/initials/svg?seed=DL&backgroundColor=58cc02", industry: "EdTech", tier: "enterprise", region: "Global" },
  { id: "b-003", name: "Zara", logo: "https://api.dicebear.com/7.x/initials/svg?seed=ZA&backgroundColor=000000", industry: "Fashion", tier: "mid_tier", region: "EMEA" },
  { id: "b-004", name: "Rappi", logo: "https://api.dicebear.com/7.x/initials/svg?seed=RA&backgroundColor=ff441f", industry: "Food Delivery", tier: "mid_tier", region: "LATAM" },
  { id: "b-005", name: "Telecom Africa", logo: "https://api.dicebear.com/7.x/initials/svg?seed=TA&backgroundColor=0066cc", industry: "Telecom", tier: "enterprise", region: "Africa" },
];

// ─── Campaigns ────────────────────────────────────────────────────────────────
export const CAMPAIGNS: Campaign[] = [
  {
    id: "cmp-001",
    brand: BRANDS[0],
    name: "Wrapped 2026 Creator Push",
    brief: "Dub or react to our 60-second Wrapped announcement clip. Capture the excitement of your listeners' year-in-review in your native language. High energy, personal, authentic.",
    targetLanguages: ["ja", "ko", "fr", "pt", "hi", "ar"],
    budgetCents: 15000_00,
    status: "live",
    startAt: "2026-06-01",
    endAt: "2026-06-30",
    applicantCount: 142,
    matchScore: 0.89,
  },
  {
    id: "cmp-002",
    brand: BRANDS[1],
    name: "Language of the Month — Japanese",
    brief: "Show how you'd teach a simple Japanese phrase to your followers. Can be comedic, dramatic, or educational. Must demonstrate genuine language affinity.",
    targetLanguages: ["ja", "en"],
    budgetCents: 3500_00,
    status: "live",
    startAt: "2026-06-05",
    endAt: "2026-06-20",
    applicantCount: 38,
    matchScore: 0.96,
  },
  {
    id: "cmp-003",
    brand: BRANDS[2],
    name: "Summer Collection Reveal",
    brief: "Dub the 45-second summer collection reveal in your language. Glamorous, aspirational tone. Target audience is 18–30 fashion-conscious viewers.",
    targetLanguages: ["fr", "ar", "ko", "ja"],
    budgetCents: 8000_00,
    status: "live",
    startAt: "2026-06-08",
    endAt: "2026-07-01",
    applicantCount: 74,
    matchScore: 0.81,
  },
  {
    id: "cmp-004",
    brand: BRANDS[3],
    name: "Street Food Delivery Series",
    brief: "React to our 30-second street food clips in your native language. Authentic, hungry energy. We want creators who actually love street food.",
    targetLanguages: ["pt", "es", "hi", "yo"],
    budgetCents: 5500_00,
    status: "live",
    startAt: "2026-06-03",
    endAt: "2026-06-25",
    applicantCount: 91,
    matchScore: 0.74,
  },
  {
    id: "cmp-005",
    brand: BRANDS[4],
    name: "5G Launch — West Africa",
    brief: "Dub our 90-second network launch spot in Yoruba, Igbo, or Nigerian Pidgin. Celebratory, community-focused tone. Must be a native speaker.",
    targetLanguages: ["yo", "ig", "pcm"],
    budgetCents: 12000_00,
    status: "live",
    startAt: "2026-06-01",
    endAt: null,
    applicantCount: 23,
    matchScore: 0.62,
  },
];

// ─── My applications (ME = Yuki) ─────────────────────────────────────────────
export const MY_APPLICATIONS: MyApplication[] = [
  { campaignId: "cmp-001", status: "applied", appliedAt: "2026-06-03", decidedAt: null },
  { campaignId: "cmp-002", status: "accepted", appliedAt: "2026-06-06", decidedAt: "2026-06-07" },
];

// ─── My remixes (as ME) ───────────────────────────────────────────────────────
export const MY_REMIXES = REMIXES.filter((r) => r.creator.id === ME.id);

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const LANGUAGE_LABELS: Record<string, string> = {
  ja: "Japanese", ko: "Korean", fr: "French", en: "English", hi: "Hindi",
  ar: "Arabic", pt: "Portuguese", es: "Spanish", yo: "Yoruba", ig: "Igbo",
  bn: "Bengali", de: "German", zh: "Mandarin", pcm: "Nigerian Pidgin",
};

export const LANGUAGE_FLAGS: Record<string, string> = {
  ja: "🇯🇵", ko: "🇰🇷", fr: "🇫🇷", en: "🇬🇧", hi: "🇮🇳",
  ar: "🇱🇧", pt: "🇧🇷", es: "🇲🇽", yo: "🇳🇬", ig: "🇳🇬",
  bn: "🇧🇩", de: "🇩🇪", zh: "🇨🇳", pcm: "🇳🇬",
};

export const PROFILE_STATE_LABEL: Record<ProfileState, string> = {
  aspirational: "New Creator",
  blended: "Rising Creator",
  data_derived: "Verified Creator",
};

export const PROFILE_STATE_COLOR: Record<ProfileState, string> = {
  aspirational: "#6b7280",
  blended: "#f59e0b",
  data_derived: "#10b981",
};

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}
