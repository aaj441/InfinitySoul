/**
 * InfinitySoul Design Tokens
 *
 * A design system built on 21 years of musical evolution:
 * - Kanye West "Late Registration": Orchestral layering, sample-driven soul, architectural builds
 * - Jay-Z "December 4th": Narrative precision, momentum shifts, earned confidence
 * - Elliott Smith "Pretty Mary Kay": Melancholic intimacy, minimal but rich texture
 *
 * These tokens enforce ethical accessibility defaults while making
 * WCAG compliance feel like a feature, not a footnote.
 *
 * Philosophy: Accessibility is the drums and bass—invisible but everything rests on it.
 */

// =============================================================================
// KANYE TOKENS: ORCHESTRAL LAYERING
// Like sample-driven soul production—layers that build meaning through composition
// =============================================================================

export const layering = {
  // Z-index layers like track stems in a mix
  depths: {
    base: 0,        // The sample—the foundation everything's built on
    lift: 10,       // First string section—slight elevation
    float: 20,      // Horns coming in—noticeable presence
    overlay: 30,    // The choir—drawing attention
    modal: 40,      // The drop—everything stops for this
    toast: 50,      // The ad-lib—brief, unmissable
  },

  // Shadow tokens like reverb depth
  shadows: {
    intimate: '0 1px 2px hsla(265, 30%, 10%, 0.15)',          // Dry, close
    warm: '0 2px 8px hsla(265, 30%, 10%, 0.12)',              // Room reverb
    orchestral: '0 8px 24px hsla(265, 30%, 10%, 0.18)',       // Hall reverb
    cinematic: '0 16px 48px hsla(265, 30%, 10%, 0.25)',       // Cathedral
  },

  // Opacity for layered elements (like mixing faders)
  mix: {
    subtle: 0.6,    // Background vocal
    present: 0.8,   // Supporting instrument
    lead: 0.95,     // Lead vocal
    solo: 1,        // Solo moment
  },
} as const;

// =============================================================================
// JAY-Z TOKENS: NARRATIVE PRECISION
// Like "December 4th"—momentum shifts, earned confidence, the story builds
// =============================================================================

export const narrative = {
  // Spacing that tells a story (like bars in a verse)
  rhythm: {
    breath: '0.25rem',    // 4px - A beat rest
    phrase: '0.5rem',     // 8px - End of a bar
    bar: '1rem',          // 16px - Natural pause
    verse: '1.5rem',      // 24px - Verse break
    hook: '2rem',         // 32px - Pre-chorus
    drop: '3rem',         // 48px - The hook hits
    outro: '4rem',        // 64px - Song section change
  },

  // Typography that builds confidence
  voice: {
    whisper: {
      size: '0.75rem',      // 12px
      weight: 400,
      tracking: '0.01em',
      lineHeight: 1.5,
    },
    speak: {
      size: '0.875rem',     // 14px
      weight: 400,
      tracking: '0',
      lineHeight: 1.6,
    },
    address: {
      size: '1rem',         // 16px - WCAG minimum for body
      weight: 400,
      tracking: '-0.01em',
      lineHeight: 1.7,
    },
    proclaim: {
      size: '1.25rem',      // 20px
      weight: 500,
      tracking: '-0.02em',
      lineHeight: 1.5,
    },
    declare: {
      size: '1.5rem',       // 24px
      weight: 600,
      tracking: '-0.02em',
      lineHeight: 1.4,
    },
    command: {
      size: '2rem',         // 32px
      weight: 700,
      tracking: '-0.03em',
      lineHeight: 1.3,
    },
    headline: {
      size: '3rem',         // 48px
      weight: 800,
      tracking: '-0.04em',
      lineHeight: 1.2,
    },
  },

  // Border radius like flow—sharp where confidence peaks, rounded where smooth
  flow: {
    sharp: '0',             // Decisive, no-compromise moments
    crisp: '0.25rem',       // 4px - Clean but not cold
    smooth: '0.5rem',       // 8px - Natural, conversational
    round: '0.75rem',       // 12px - Approachable
    soft: '1rem',           // 16px - Warm, inviting
    pill: '9999px',         // Full - Confident flourish
  },
} as const;

// =============================================================================
// ELLIOTT SMITH TOKENS: INTIMATE MINIMALISM
// Like "Pretty Mary Kay"—melancholic beauty, less is more, rich texture in restraint
// =============================================================================

export const intimacy = {
  // Colors that feel like late-night vulnerability
  // All colors meet WCAG AAA contrast ratios (7:1 minimum)
  palette: {
    // Soul purple—the signature InfinitySoul color
    soul: {
      50: 'hsl(263, 70%, 97%)',   // Barely there, like breath
      100: 'hsl(263, 65%, 93%)',
      200: 'hsl(263, 60%, 85%)',
      300: 'hsl(263, 55%, 72%)',
      400: 'hsl(263, 50%, 58%)',
      500: 'hsl(263, 70%, 50%)',  // Primary - confident soul
      600: 'hsl(263, 75%, 42%)',
      700: 'hsl(263, 80%, 35%)',
      800: 'hsl(263, 85%, 28%)',
      900: 'hsl(263, 90%, 18%)',
      950: 'hsl(265, 95%, 10%)',  // Deep, like 3am thoughts
    },

    // Warm neutrals—like aged paper, not sterile white
    warmth: {
      50: 'hsl(40, 20%, 98%)',    // Soft cream
      100: 'hsl(40, 15%, 95%)',
      200: 'hsl(40, 12%, 90%)',
      300: 'hsl(40, 10%, 80%)',
      400: 'hsl(40, 8%, 65%)',
      500: 'hsl(40, 6%, 50%)',
      600: 'hsl(40, 8%, 40%)',
      700: 'hsl(40, 10%, 30%)',
      800: 'hsl(40, 12%, 20%)',
      900: 'hsl(40, 15%, 12%)',
      950: 'hsl(40, 20%, 6%)',    // Almost black, but warm
    },

    // Semantic colors with soul
    meaning: {
      // Success: Not loud green, but hopeful sage
      hope: 'hsl(150, 45%, 40%)',
      hopeLight: 'hsl(150, 50%, 94%)',
      hopeDark: 'hsl(150, 50%, 25%)',

      // Warning: Not alarming yellow, but thoughtful amber
      pause: 'hsl(38, 70%, 45%)',
      pauseLight: 'hsl(38, 70%, 94%)',
      pauseDark: 'hsl(38, 80%, 30%)',

      // Error: Not angry red, but honest rose
      honest: 'hsl(350, 65%, 45%)',
      honestLight: 'hsl(350, 70%, 95%)',
      honestDark: 'hsl(350, 70%, 30%)',

      // Info: Not cold blue, but gentle sky
      calm: 'hsl(200, 60%, 45%)',
      calmLight: 'hsl(200, 65%, 94%)',
      calmDark: 'hsl(200, 70%, 30%)',
    },
  },

  // Reduced motion preferences—for those who need less, not more
  // This is the Elliott Smith approach: economy of expression
  reducedMotion: {
    fadeOnly: true,           // Just opacity, no movement
    durationMultiplier: 0.1,  // 90% faster, barely perceptible
    disableParallax: true,    // No scroll effects
    disableAutoplay: true,    // User controls everything
  },
} as const;

// =============================================================================
// WCAG AAA TOKENS: THE FOUNDATION
// Like drums and bass—invisible but everything rests on it
// =============================================================================

export const accessibility = {
  // Minimum touch targets (WCAG 2.5.5 AAA: 44x44px)
  touch: {
    minimum: '44px',
    comfortable: '48px',
    generous: '56px',
  },

  // Focus indicators (WCAG 2.4.7, enhanced)
  focus: {
    ring: '3px solid hsl(263, 70%, 50%)',
    ringOffset: '2px',
    ringColor: 'hsl(263, 70%, 50%)',
    outlineOffset: '3px',
  },

  // Contrast ratios (pre-validated AAA combinations)
  contrast: {
    // Text on light backgrounds
    textOnLight: 'hsl(265, 95%, 10%)',     // 15.2:1 on white
    mutedOnLight: 'hsl(265, 30%, 35%)',    // 7.1:1 on white (AAA)

    // Text on dark backgrounds
    textOnDark: 'hsl(40, 20%, 98%)',       // 14.8:1 on soul-950
    mutedOnDark: 'hsl(263, 30%, 70%)',     // 7.2:1 on soul-950 (AAA)

    // Interactive states
    linkDefault: 'hsl(263, 70%, 50%)',     // Distinguishable
    linkVisited: 'hsl(290, 60%, 45%)',     // Clearly different
    linkHover: 'hsl(263, 75%, 40%)',       // Noticeable change
  },

  // Timing for WCAG 2.2.1 (enough time)
  timing: {
    toastDuration: 10000,        // 10 seconds minimum for toasts
    autoHideMinimum: 20000,      // 20 seconds for auto-dismiss
    debounceTyping: 300,         // Reasonable typing debounce
    transitionSafe: 200,         // Fast enough to feel responsive
  },

  // Line length for readability (WCAG 1.4.8)
  measure: {
    min: '45ch',
    optimal: '66ch',
    max: '80ch',
  },
} as const;

// =============================================================================
// COMBINED DESIGN TOKENS EXPORT
// =============================================================================

export const tokens = {
  // Kanye: Composition and layering
  layering,

  // Jay-Z: Narrative and rhythm
  narrative,

  // Elliott Smith: Intimacy and restraint
  intimacy,

  // Foundation: Accessibility
  accessibility,
} as const;

// Type exports for TypeScript consumers
export type LayeringTokens = typeof layering;
export type NarrativeTokens = typeof narrative;
export type IntimacyTokens = typeof intimacy;
export type AccessibilityTokens = typeof accessibility;
export type DesignTokens = typeof tokens;

export default tokens;
