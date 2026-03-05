// ── Asset Paths ─────────────────────────────────────────────────────
export const ASSETS = {
  LOGO_CABINA: '/cabinaDigitalSonidos.png',
  FAVICON: '/favicon-dj.jpeg',
  BG_PATTERN: '/bg-pattern.png',
  BG_SONIDERO: '/bg-sonidero.png',
  BG_SONIDERO_ABOUT: '/sonidero-about-bg.png',
  AVATARS: [
    '/avatars/boy1.svg', '/avatars/girl1.svg',
    '/avatars/boy2.svg', '/avatars/girl2.svg',
    '/avatars/skull.svg', '/avatars/mask.svg',
  ],
} as const;

// ── Brand ───────────────────────────────────────────────────────────
export const BRAND = {
  APP_NAME: 'Cabina Digital',
  WEBSITE: 'www.cabina-digital.mx',
  DESCRIPTION: 'Para Djs y Sonideros',
  COPYRIGHT_YEAR: 2026,
} as const;

// ── API Endpoints ───────────────────────────────────────────────────
export const ENDPOINTS = {
  USERS: '/users',
  MESSAGES: '/messages',
  SONGS: '/songs',
  CONFIG: '/config',
  DIRECT_MESSAGES: '/directMessages',
  USER_VOTES: '/userVotes',
  FEEDBACKS: '/feedbacks',
} as const;

// ── Input Limits ────────────────────────────────────────────────────
export const LIMITS = {
  CHAT_MESSAGE: 150,
  DM_DJ_MESSAGE: 120,
  FEEDBACK_COMMENT: 150,
} as const;

// ── HTTP Config ─────────────────────────────────────────────────────
export const HTTP = {
  TIMEOUT: 10000,
  API_PORT: 3001,
} as const;
