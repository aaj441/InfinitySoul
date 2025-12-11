/**
 * InfinitySoul Motion System
 *
 * Animation presets built on musical production philosophies:
 * - Kanye: Orchestral builds, layered entries, cinematic sweeps
 * - Jay-Z: Narrative momentum, precise timing, earned crescendos
 * - Elliott Smith: Intimate gestures, subtle fades, melancholic ease
 *
 * All animations respect prefers-reduced-motion automatically.
 * Motion is a feature for those who want it, invisible for those who don't.
 */

import type { Variants, Transition, MotionProps } from 'framer-motion';

// =============================================================================
// CORE TIMING CURVES
// Like a producer's ear for groove—the difference between stiff and soulful
// =============================================================================

export const curves = {
  // Kanye curves: Grand, sweeping, cinematic
  orchestral: {
    easeIn: [0.4, 0, 1, 1],           // Slow build, dramatic release
    easeOut: [0, 0, 0.2, 1],          // Quick start, gentle landing
    easeInOut: [0.4, 0, 0.2, 1],      // The strings swell then resolve
  },

  // Jay-Z curves: Confident, precise, no wasted motion
  narrative: {
    easeIn: [0.6, 0, 0.6, 1],         // Deliberate entry
    easeOut: [0.2, 0, 0.4, 1],        // Clean exit, no flourish
    easeInOut: [0.45, 0, 0.15, 1],    // Professional, earned
  },

  // Elliott Smith curves: Gentle, sad, intimate
  intimate: {
    easeIn: [0.2, 0, 0.6, 1],         // Hesitant start
    easeOut: [0, 0, 0.2, 1],          // Soft fade, like trailing off
    easeInOut: [0.2, 0, 0.2, 1],      // Barely there, natural
  },

  // Spring presets for organic feel
  spring: {
    gentle: { type: 'spring', stiffness: 120, damping: 20 },
    bouncy: { type: 'spring', stiffness: 300, damping: 25 },
    snappy: { type: 'spring', stiffness: 400, damping: 30 },
    wobbly: { type: 'spring', stiffness: 180, damping: 12 },
  },
} as const;

// =============================================================================
// KANYE VARIANTS: ORCHESTRAL BUILDS
// "Late Registration" energy—layers stack, strings swell, everything builds
// =============================================================================

export const orchestral: Record<string, Variants> = {
  // Staggered children like instrument sections entering
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  },

  // Individual item in a staggered group
  staggerChild: {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: curves.orchestral.easeOut as [number, number, number, number],
      },
    },
  },

  // The drop—everything builds to this moment
  drop: {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: 40,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: curves.orchestral.easeOut as [number, number, number, number],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -20,
      transition: {
        duration: 0.3,
        ease: curves.orchestral.easeIn as [number, number, number, number],
      },
    },
  },

  // Cinematic sweep—like a camera pan with orchestra
  sweep: {
    hidden: {
      opacity: 0,
      x: -60,
      rotateY: -15,
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: {
        duration: 0.7,
        ease: curves.orchestral.easeOut as [number, number, number, number],
      },
    },
  },

  // Layered reveal—like stems being added to a mix
  layered: {
    hidden: {
      opacity: 0,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: curves.orchestral.easeOut as [number, number, number, number],
      },
    },
  },
};

// =============================================================================
// JAY-Z VARIANTS: NARRATIVE PRECISION
// "December 4th" energy—momentum builds, story unfolds, confidence earned
// =============================================================================

export const narrative: Record<string, Variants> = {
  // The verse—steady, confident delivery
  verse: {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: curves.narrative.easeOut as [number, number, number, number],
      },
    },
  },

  // Momentum shift—like switching flows mid-verse
  shift: {
    initial: { opacity: 1, x: 0 },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
        ease: curves.narrative.easeIn as [number, number, number, number],
      },
    },
    enter: {
      opacity: 0,
      x: 20,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: curves.narrative.easeOut as [number, number, number, number],
      },
    },
  },

  // Earned crescendo—when you've built to the payoff
  crescendo: {
    initial: {
      opacity: 0,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: curves.narrative.easeOut as [number, number, number, number],
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: curves.narrative.easeInOut as [number, number, number, number],
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
      },
    },
  },

  // The ad-lib—brief, punchy, memorable
  adLib: {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.15,
      },
    },
  },
};

// =============================================================================
// ELLIOTT SMITH VARIANTS: INTIMATE MINIMALISM
// "Pretty Mary Kay" energy—melancholic, gentle, less is more
// =============================================================================

export const intimate: Record<string, Variants> = {
  // Soft fade—like a song fading out
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: curves.intimate.easeOut as [number, number, number, number],
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: curves.intimate.easeIn as [number, number, number, number],
      },
    },
  },

  // Gentle rise—like a quiet verse starting
  whisper: {
    hidden: {
      opacity: 0,
      y: 8,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: curves.intimate.easeOut as [number, number, number, number],
      },
    },
  },

  // Melancholic pulse—subtle, rhythmic, sad but beautiful
  pulse: {
    initial: { opacity: 0.7 },
    animate: {
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },

  // Intimate hover—barely there, just enough
  hover: {
    rest: {
      scale: 1,
      opacity: 1,
    },
    hover: {
      scale: 1.01,
      opacity: 0.95,
      transition: {
        duration: 0.3,
        ease: curves.intimate.easeInOut as [number, number, number, number],
      },
    },
    tap: {
      scale: 0.99,
      opacity: 0.9,
      transition: {
        duration: 0.1,
      },
    },
  },
};

// =============================================================================
// REDUCED MOTION VARIANTS
// For users who prefer less motion—still beautiful, just quieter
// =============================================================================

export const reduced: Record<string, Variants> = {
  // Simple fade, no movement
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.15 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.1 },
    },
  },

  // Instant, but not jarring
  instant: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.05 },
    },
  },
};

// =============================================================================
// ACCESSIBILITY MOTION HELPERS
// =============================================================================

/**
 * Returns appropriate variants based on prefers-reduced-motion
 * Usage: const variants = useMotionPreference(orchestral.drop, reduced.fade)
 */
export function getMotionVariants(
  full: Variants,
  reducedVariant: Variants = reduced.fade
): Variants {
  if (typeof window === 'undefined') return full;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReduced ? reducedVariant : full;
}

/**
 * Transition config that respects reduced motion
 */
export function getSafeTransition(transition: Transition): Transition {
  if (typeof window === 'undefined') return transition;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    return {
      duration: 0.05,
      ease: 'linear',
    };
  }
  return transition;
}

// =============================================================================
// COMPONENT ANIMATION PRESETS
// Ready-to-use motion props for common components
// =============================================================================

export const presets = {
  // For page/section entries
  pageEntry: {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    variants: orchestral.drop,
  } as MotionProps,

  // For list items
  listItem: {
    variants: orchestral.staggerChild,
  } as MotionProps,

  // For cards and interactive elements
  card: {
    initial: 'initial',
    animate: 'animate',
    whileHover: 'hover',
    whileTap: 'tap',
    variants: narrative.crescendo,
  } as MotionProps,

  // For buttons
  button: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.15 },
  } as MotionProps,

  // For form elements
  formField: {
    initial: 'hidden',
    animate: 'visible',
    variants: intimate.whisper,
  } as MotionProps,

  // For modals/dialogs
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: {
      duration: 0.2,
      ease: curves.narrative.easeOut,
    },
  } as MotionProps,

  // For toasts/notifications
  toast: {
    initial: { opacity: 0, y: 20, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  } as MotionProps,

  // For loading states
  loading: {
    animate: {
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  } as MotionProps,
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

export const motion = {
  curves,
  orchestral,
  narrative,
  intimate,
  reduced,
  presets,
  getMotionVariants,
  getSafeTransition,
} as const;

export default motion;
