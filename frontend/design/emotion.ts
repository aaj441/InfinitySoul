/**
 * InfinitySoul Emotion System
 *
 * Emotional state management that treats accessibility as storytelling.
 * Every state tells a story—not just what happened, but how to feel about it.
 *
 * Narrative approach to feedback:
 * - Welcome, not just "loaded"
 * - Safety, not just "valid"
 * - Partnership, not just "error"
 * - Anticipation, not just "loading"
 *
 * Each emotional state maps to:
 * 1. Visual treatment (color, icon, animation)
 * 2. Haptic feedback (for supported devices)
 * 3. Screen reader announcement (ARIA live region content)
 * 4. Sound cue (optional, for users who want it)
 */

import { intimacy, accessibility as a11y } from './tokens';

// =============================================================================
// EMOTIONAL STATE TYPES
// =============================================================================

export type EmotionType =
  | 'welcome'      // Successful load, arrival, completion
  | 'safety'       // Valid input, secure state, trusted
  | 'partnership'  // Error that we'll solve together
  | 'anticipation' // Loading, processing, building
  | 'attention'    // Warning, needs user awareness
  | 'celebration'  // Major success, achievement
  | 'calm'         // Neutral, resting state
  | 'focus';       // User is actively engaged

export type EmotionIntensity = 'subtle' | 'present' | 'emphasized';

export interface EmotionState {
  type: EmotionType;
  intensity: EmotionIntensity;
  message?: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// =============================================================================
// EMOTIONAL COLOR MAPPING
// Colors that communicate feeling, not just status
// =============================================================================

export const emotionColors = {
  welcome: {
    bg: intimacy.palette.meaning.hopeLight,
    border: intimacy.palette.meaning.hope,
    text: intimacy.palette.meaning.hopeDark,
    accent: intimacy.palette.meaning.hope,
  },
  safety: {
    bg: 'hsl(150, 45%, 96%)',
    border: 'hsl(150, 40%, 50%)',
    text: 'hsl(150, 50%, 20%)',
    accent: 'hsl(150, 45%, 40%)',
  },
  partnership: {
    bg: intimacy.palette.meaning.honestLight,
    border: intimacy.palette.meaning.honest,
    text: intimacy.palette.meaning.honestDark,
    accent: intimacy.palette.meaning.honest,
  },
  anticipation: {
    bg: intimacy.palette.soul[100],
    border: intimacy.palette.soul[400],
    text: intimacy.palette.soul[800],
    accent: intimacy.palette.soul[500],
  },
  attention: {
    bg: intimacy.palette.meaning.pauseLight,
    border: intimacy.palette.meaning.pause,
    text: intimacy.palette.meaning.pauseDark,
    accent: intimacy.palette.meaning.pause,
  },
  celebration: {
    bg: 'hsl(45, 90%, 95%)',
    border: 'hsl(45, 85%, 50%)',
    text: 'hsl(45, 90%, 25%)',
    accent: 'hsl(45, 85%, 45%)',
  },
  calm: {
    bg: intimacy.palette.warmth[100],
    border: intimacy.palette.warmth[300],
    text: intimacy.palette.warmth[800],
    accent: intimacy.palette.warmth[500],
  },
  focus: {
    bg: intimacy.palette.soul[50],
    border: intimacy.palette.soul[500],
    text: intimacy.palette.soul[900],
    accent: intimacy.palette.soul[500],
  },
} as const;

// =============================================================================
// ARIA ANNOUNCEMENT MAPPING
// How we speak emotional states to screen readers
// The words matter—they're the voice of the UI
// =============================================================================

export const emotionAnnouncements: Record<EmotionType, {
  politeness: 'polite' | 'assertive';
  prefix: string;
  suffix?: string;
}> = {
  welcome: {
    politeness: 'polite',
    prefix: 'Success: ',
    suffix: ' You\'re all set.',
  },
  safety: {
    politeness: 'polite',
    prefix: '',
    suffix: ' Looking good.',
  },
  partnership: {
    politeness: 'assertive',
    prefix: 'Let\'s fix this together: ',
    suffix: ' We can help.',
  },
  anticipation: {
    politeness: 'polite',
    prefix: 'Working on it: ',
    suffix: ' Almost there.',
  },
  attention: {
    politeness: 'polite',
    prefix: 'Heads up: ',
  },
  celebration: {
    politeness: 'polite',
    prefix: 'Congratulations! ',
  },
  calm: {
    politeness: 'polite',
    prefix: '',
  },
  focus: {
    politeness: 'polite',
    prefix: '',
  },
};

// =============================================================================
// HAPTIC PATTERNS
// For devices that support vibration—tactile emotional feedback
// =============================================================================

export const emotionHaptics: Record<EmotionType, number[]> = {
  welcome: [50],                    // Single gentle tap
  safety: [30],                     // Soft confirmation
  partnership: [100, 50, 100],      // Pattern that says "we're here"
  anticipation: [20, 100, 20],      // Rhythmic waiting pulse
  attention: [50, 30, 50, 30, 50],  // Gentle attention-getter
  celebration: [50, 50, 50, 50, 100], // Celebratory pattern
  calm: [],                         // No haptic for calm
  focus: [20],                      // Barely there focus tap
};

// =============================================================================
// EMOTIONAL NARRATIVE HELPERS
// Functions that help components speak emotionally
// =============================================================================

/**
 * Get the full announcement text for a screen reader
 */
export function getAnnouncement(emotion: EmotionType, message: string): string {
  const config = emotionAnnouncements[emotion];
  let text = config.prefix + message;
  if (config.suffix) {
    text += config.suffix;
  }
  return text;
}

/**
 * Trigger haptic feedback if available
 */
export function triggerHaptic(emotion: EmotionType): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  const pattern = emotionHaptics[emotion];
  if (pattern.length > 0) {
    navigator.vibrate(pattern);
  }
}

/**
 * Get ARIA attributes for an emotional state
 */
export function getEmotionAriaProps(emotion: EmotionType, message: string) {
  const config = emotionAnnouncements[emotion];

  return {
    role: emotion === 'partnership' ? 'alert' : 'status',
    'aria-live': config.politeness,
    'aria-atomic': true,
    'aria-label': getAnnouncement(emotion, message),
  };
}

// =============================================================================
// NARRATIVE STATE PRESETS
// Pre-configured emotional states for common UI scenarios
// =============================================================================

export const narrativeStates = {
  // Navigation: The story of WELCOME
  navigation: {
    arriving: {
      type: 'anticipation' as EmotionType,
      intensity: 'subtle' as EmotionIntensity,
      message: 'Finding your destination',
    },
    arrived: {
      type: 'welcome' as EmotionType,
      intensity: 'present' as EmotionIntensity,
      message: 'You\'re here',
    },
    exploring: {
      type: 'calm' as EmotionType,
      intensity: 'subtle' as EmotionIntensity,
      message: 'Take your time',
    },
  },

  // Forms: The story of SAFETY
  form: {
    pristine: {
      type: 'calm' as EmotionType,
      intensity: 'subtle' as EmotionIntensity,
      message: 'Ready when you are',
    },
    focused: {
      type: 'focus' as EmotionType,
      intensity: 'present' as EmotionIntensity,
      message: 'We\'re listening',
    },
    validating: {
      type: 'anticipation' as EmotionType,
      intensity: 'subtle' as EmotionIntensity,
      message: 'Checking',
    },
    valid: {
      type: 'safety' as EmotionType,
      intensity: 'subtle' as EmotionIntensity,
      message: 'This looks right',
    },
    submitting: {
      type: 'anticipation' as EmotionType,
      intensity: 'present' as EmotionIntensity,
      message: 'Sending your information securely',
    },
    submitted: {
      type: 'welcome' as EmotionType,
      intensity: 'emphasized' as EmotionIntensity,
      message: 'All done',
    },
  },

  // Errors: The story of PARTNERSHIP
  error: {
    validation: {
      type: 'partnership' as EmotionType,
      intensity: 'subtle' as EmotionIntensity,
      message: 'Let\'s adjust this',
    },
    submission: {
      type: 'partnership' as EmotionType,
      intensity: 'present' as EmotionIntensity,
      message: 'Something went wrong, but we can try again',
    },
    connection: {
      type: 'partnership' as EmotionType,
      intensity: 'emphasized' as EmotionIntensity,
      message: 'Having trouble connecting—let\'s wait a moment',
    },
    notFound: {
      type: 'partnership' as EmotionType,
      intensity: 'present' as EmotionIntensity,
      message: 'We couldn\'t find that, but we can help you search',
    },
  },

  // Loading: The story of ANTICIPATION
  loading: {
    starting: {
      type: 'anticipation' as EmotionType,
      intensity: 'subtle' as EmotionIntensity,
      message: 'Getting things ready',
    },
    progress: {
      type: 'anticipation' as EmotionType,
      intensity: 'present' as EmotionIntensity,
      message: 'Building something for you',
    },
    almostDone: {
      type: 'anticipation' as EmotionType,
      intensity: 'emphasized' as EmotionIntensity,
      message: 'Just a moment more',
    },
  },

  // Success: The story of CELEBRATION
  success: {
    minor: {
      type: 'welcome' as EmotionType,
      intensity: 'subtle' as EmotionIntensity,
      message: 'Done',
    },
    standard: {
      type: 'welcome' as EmotionType,
      intensity: 'present' as EmotionIntensity,
      message: 'Success',
    },
    major: {
      type: 'celebration' as EmotionType,
      intensity: 'emphasized' as EmotionIntensity,
      message: 'Amazing work',
    },
  },
} as const;

// =============================================================================
// EMOTION CONTEXT TYPE
// For React context to share emotional state across components
// =============================================================================

export interface EmotionContextValue {
  currentEmotion: EmotionState | null;
  setEmotion: (emotion: EmotionState | null) => void;
  clearEmotion: () => void;
  announce: (emotion: EmotionType, message: string) => void;
}

// =============================================================================
// EXPORTS
// =============================================================================

export const emotion = {
  colors: emotionColors,
  announcements: emotionAnnouncements,
  haptics: emotionHaptics,
  narratives: narrativeStates,
  getAnnouncement,
  triggerHaptic,
  getEmotionAriaProps,
} as const;

export default emotion;
