// UI related constants

// Polling intervals (in milliseconds)
export const POLLING_INTERVALS = {
  PLAYBACK_STATE: 2000,      // 2 seconds
  PLAYBACK_INIT_DELAY: 500,  // 0.5 seconds
  GLOBAL_CHAT: 5000,         // 5 seconds
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FADE: 300,
  SLIDE: 200,
  TRANSITION: 150,
} as const;

// Limits
export const UI_LIMITS = {
  MAX_CHAT_MESSAGES: 100,
  MAX_PLAY_HISTORY: 50,
  MESSAGE_MAX_LENGTH: 500,
  USERNAME_MAX_LENGTH: 50,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1280,
} as const;

// Toast configurations
export const TOAST_CONFIG = {
  DURATION: 3000,
  POSITION: 'bottom-right',
} as const;

