/**
 * InfinitySoul Design System
 *
 * An emotional accessibility architecture built on 21 years of musical evolution:
 *
 * KANYE (Late Registration): Orchestral layering, composition over inheritance
 * - Design tokens: layering, depths, shadows
 * - Motion: orchestral builds, staggered entries, cinematic sweeps
 *
 * JAY-Z (December 4th): Narrative precision, momentum builds
 * - Design tokens: rhythm spacing, typography voice, flow (border-radius)
 * - Motion: verses, momentum shifts, earned crescendos
 *
 * ELLIOTT SMITH (Pretty Mary Kay): Intimate minimalism, less is more
 * - Design tokens: color palette (soul, warmth, meaning), reduced motion
 * - Motion: whispers, fades, intimate hovers
 *
 * FOUNDATION: WCAG AAA Compliance
 * - Like drums and bass: invisible but everything rests on it
 * - Touch targets, focus states, timing, contrast, announcements
 *
 * @example
 * import { tokens, motion, emotion, a11y } from '@/design';
 *
 * // Use Kanye's layering philosophy
 * style={{ zIndex: tokens.layering.depths.overlay }}
 *
 * // Use Jay-Z's narrative rhythm
 * style={{ marginBottom: tokens.narrative.rhythm.verse }}
 *
 * // Use Elliott Smith's intimate palette
 * style={{ color: tokens.intimacy.palette.soul[500] }}
 *
 * // Use motion presets
 * <motion.div {...motion.presets.card} />
 *
 * // Use emotional states
 * const colors = emotion.colors.partnership;
 *
 * // Use accessibility utilities
 * a11y.announce('Welcome to InfinitySoul');
 */

// Core design tokens
export { tokens, layering, narrative, intimacy, accessibility } from './tokens';
export type {
  LayeringTokens,
  NarrativeTokens,
  IntimacyTokens,
  AccessibilityTokens,
  DesignTokens,
} from './tokens';

// Motion system
export {
  motion,
  curves,
  orchestral,
  narrative as narrativeMotion,
  intimate as intimateMotion,
  reduced,
  presets,
  getMotionVariants,
  getSafeTransition,
} from './motion';

// Emotion system
export {
  emotion,
  emotionColors,
  emotionAnnouncements,
  emotionHaptics,
  narrativeStates,
  getAnnouncement,
  triggerHaptic,
  getEmotionAriaProps,
} from './emotion';
export type {
  EmotionType,
  EmotionIntensity,
  EmotionState,
  EmotionContextValue,
} from './emotion';

// Accessibility utilities
export {
  a11y,
  visuallyHidden,
  announce,
  focusRingStyles,
  focusClasses,
  moveFocusTo,
  createFocusTrap,
  touchTargetStyles,
  touchClasses,
  safeTimeout,
  meetsContrastRatio,
  prefersReducedMotion,
  onReducedMotionChange,
  keys,
  isActivationKey,
  createListKeyboardHandler,
  getExpandableAriaProps,
  getFieldAriaProps,
} from './a11y';
