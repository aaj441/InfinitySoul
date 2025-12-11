/**
 * InfinitySoul Component Library
 *
 * Components that feel like good music—layered, rhythmic, intimate.
 *
 * Each component tells a story:
 * - SoulButton: Jay-Z's earned confidence
 * - SoulInput: Elliott Smith's intimate safety
 * - SoulCard: Kanye's orchestral layering
 * - SoulNavigation: The story of WELCOME
 * - SoulError: The story of PARTNERSHIP
 * - SoulLoading: The story of ANTICIPATION
 *
 * All components are:
 * - WCAG AAA compliant (7:1 contrast, 44px touch targets)
 * - Motion-respectful (prefers-reduced-motion)
 * - Screen reader friendly (proper ARIA)
 * - Neurodiverse-friendly (low cognitive load)
 */

// Button - The confident verse
export { SoulButton, buttonVariants } from './SoulButton';
export type { SoulButtonProps } from './SoulButton';

// Input - The safe harbor
export { SoulInput } from './SoulInput';
export type { SoulInputProps } from './SoulInput';

// Card - The layered composition
export {
  SoulCard,
  SoulCardHeader,
  SoulCardBody,
  SoulCardFooter,
  SoulCardImage,
} from './SoulCard';
export type { SoulCardProps } from './SoulCard';

// Navigation - The welcome mat
export { SoulNavigation, SkipLink } from './SoulNavigation';
export type { SoulNavigationProps, NavItem } from './SoulNavigation';

// Error - The partnership promise
export {
  SoulError,
  InlineError,
  BannerError,
  PageError,
  ToastError,
} from './SoulError';
export type { SoulErrorProps } from './SoulError';

// Loading - The anticipation build
export {
  SoulLoading,
  SoulSpinner,
  PulseLoader,
  DotsLoader,
  BarsLoader,
  Skeleton,
  ProgressBar,
  LoadingOverlay,
} from './SoulLoading';
export type { SoulLoadingProps } from './SoulLoading';

// VibeMeter - The proof of concept
export { VibeMeter, VIBE_LEVELS } from './VibeMeter';
export type { VibeMeterProps, VibeLevel, VibeState } from './VibeMeter';
