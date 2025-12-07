/**
 * InfinitySoul Accessibility Utilities
 *
 * WCAG AAA compliance as "poetic government"—
 * rules that serve people, not just check boxes.
 *
 * Philosophy: Accessibility is the drums and bass of UI.
 * You don't notice when it's right, but everything feels wrong without it.
 *
 * These utilities enforce ethical defaults:
 * - Touch targets that respect human fingers
 * - Focus states that guide, not distract
 * - Announcements that inform, not interrupt
 * - Timing that respects cognitive load
 */

import { accessibility as tokens } from './tokens';

// =============================================================================
// SCREEN READER UTILITIES
// =============================================================================

/**
 * Styles for visually hidden but screen-reader accessible content
 * This is the sr-only pattern, but with better naming
 */
export const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * Announce to screen readers without visual change
 * Uses ARIA live regions properly
 */
export function announce(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof document === 'undefined') return;

  // Find or create the announcer element
  let announcer = document.getElementById(`soul-announcer-${politeness}`);

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = `soul-announcer-${politeness}`;
    announcer.setAttribute('aria-live', politeness);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
    Object.assign(announcer.style, visuallyHidden);
    document.body.appendChild(announcer);
  }

  // Clear and set new message (triggers announcement)
  announcer.textContent = '';
  // Small delay ensures the clear is registered
  setTimeout(() => {
    if (announcer) announcer.textContent = message;
  }, 50);
}

// =============================================================================
// FOCUS MANAGEMENT
// =============================================================================

/**
 * Get CSS for a focus ring that meets WCAG 2.4.7
 * Uses our soul purple for consistent branding
 */
export const focusRingStyles: React.CSSProperties = {
  outline: tokens.focus.ring,
  outlineOffset: tokens.focus.outlineOffset,
};

/**
 * Tailwind classes for focus states
 */
export const focusClasses = {
  // Standard focus ring
  ring: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',

  // High contrast focus ring
  ringHighContrast: 'focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-600 focus-visible:ring-offset-3',

  // Focus within for container elements
  within: 'focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2',

  // No visible ring but still accessible
  subtle: 'focus:outline-none focus-visible:bg-purple-50 dark:focus-visible:bg-purple-900/20',
};

/**
 * Move focus to an element programmatically
 * Useful for focus management in SPAs
 */
export function moveFocusTo(
  elementOrSelector: HTMLElement | string,
  options: { preventScroll?: boolean; announce?: string } = {}
): void {
  if (typeof document === 'undefined') return;

  const element = typeof elementOrSelector === 'string'
    ? document.querySelector<HTMLElement>(elementOrSelector)
    : elementOrSelector;

  if (!element) return;

  // Make sure it can receive focus
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
  }

  element.focus({ preventScroll: options.preventScroll });

  if (options.announce) {
    announce(options.announce);
  }
}

/**
 * Trap focus within a container (for modals/dialogs)
 */
export function createFocusTrap(container: HTMLElement) {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const getFocusableElements = () =>
    container.querySelectorAll<HTMLElement>(focusableSelectors);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element
  const focusable = getFocusableElements();
  focusable[0]?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

// =============================================================================
// TOUCH TARGET UTILITIES
// =============================================================================

/**
 * Minimum touch target size styles (WCAG 2.5.5 AAA)
 */
export const touchTargetStyles: React.CSSProperties = {
  minWidth: tokens.touch.minimum,
  minHeight: tokens.touch.minimum,
};

/**
 * Tailwind classes for touch targets
 */
export const touchClasses = {
  minimum: 'min-w-[44px] min-h-[44px]',
  comfortable: 'min-w-[48px] min-h-[48px]',
  generous: 'min-w-[56px] min-h-[56px]',
};

// =============================================================================
// TIMING UTILITIES
// =============================================================================

/**
 * Safe timeout that respects WCAG 2.2.1 (enough time)
 * Returns cleanup function
 */
export function safeTimeout(
  callback: () => void,
  duration: number,
  options: { canExtend?: boolean; extendOnHover?: HTMLElement } = {}
): () => void {
  let timeoutId = setTimeout(callback, duration);
  let isPaused = false;
  let remaining = duration;
  let startTime = Date.now();

  const pause = () => {
    if (isPaused) return;
    isPaused = true;
    clearTimeout(timeoutId);
    remaining -= Date.now() - startTime;
  };

  const resume = () => {
    if (!isPaused) return;
    isPaused = false;
    startTime = Date.now();
    timeoutId = setTimeout(callback, remaining);
  };

  // Extend on hover if element provided
  if (options.extendOnHover) {
    options.extendOnHover.addEventListener('mouseenter', pause);
    options.extendOnHover.addEventListener('mouseleave', resume);
    options.extendOnHover.addEventListener('focusin', pause);
    options.extendOnHover.addEventListener('focusout', resume);
  }

  // Return cleanup
  return () => {
    clearTimeout(timeoutId);
    if (options.extendOnHover) {
      options.extendOnHover.removeEventListener('mouseenter', pause);
      options.extendOnHover.removeEventListener('mouseleave', resume);
      options.extendOnHover.removeEventListener('focusin', pause);
      options.extendOnHover.removeEventListener('focusout', resume);
    }
  };
}

// =============================================================================
// COLOR CONTRAST UTILITIES
// =============================================================================

/**
 * Check if a color combination meets WCAG contrast requirements
 */
export function meetsContrastRatio(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AAA'
): boolean {
  const getLuminance = (hex: string) => {
    // Convert to RGB and calculate relative luminance
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const toLinear = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
}

// =============================================================================
// REDUCED MOTION UTILITIES
// =============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Subscribe to reduced motion preference changes
 */
export function onReducedMotionChange(callback: (prefers: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

// =============================================================================
// KEYBOARD NAVIGATION UTILITIES
// =============================================================================

/**
 * Common key codes for keyboard navigation
 */
export const keys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * Check if a keyboard event is an activation key (Enter or Space)
 */
export function isActivationKey(event: KeyboardEvent): boolean {
  return event.key === keys.ENTER || event.key === keys.SPACE;
}

/**
 * Create keyboard handler for list navigation
 */
export function createListKeyboardHandler(options: {
  items: HTMLElement[];
  orientation?: 'vertical' | 'horizontal';
  loop?: boolean;
  onSelect?: (index: number) => void;
}) {
  const { items, orientation = 'vertical', loop = true, onSelect } = options;

  return (event: KeyboardEvent) => {
    const currentIndex = items.findIndex(item => item === document.activeElement);
    if (currentIndex === -1) return;

    const prevKey = orientation === 'vertical' ? keys.ARROW_UP : keys.ARROW_LEFT;
    const nextKey = orientation === 'vertical' ? keys.ARROW_DOWN : keys.ARROW_RIGHT;

    let newIndex = currentIndex;

    switch (event.key) {
      case prevKey:
        event.preventDefault();
        newIndex = currentIndex > 0
          ? currentIndex - 1
          : loop ? items.length - 1 : 0;
        break;
      case nextKey:
        event.preventDefault();
        newIndex = currentIndex < items.length - 1
          ? currentIndex + 1
          : loop ? 0 : items.length - 1;
        break;
      case keys.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case keys.END:
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      case keys.ENTER:
      case keys.SPACE:
        event.preventDefault();
        onSelect?.(currentIndex);
        return;
    }

    items[newIndex]?.focus();
  };
}

// =============================================================================
// ARIA ATTRIBUTE HELPERS
// =============================================================================

/**
 * Generate ARIA attributes for expandable content
 */
export function getExpandableAriaProps(
  controlId: string,
  contentId: string,
  isExpanded: boolean
) {
  return {
    control: {
      'aria-expanded': isExpanded,
      'aria-controls': contentId,
      id: controlId,
    },
    content: {
      id: contentId,
      'aria-labelledby': controlId,
      hidden: !isExpanded,
    },
  };
}

/**
 * Generate ARIA attributes for form fields
 */
export function getFieldAriaProps(options: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  const describedBy = [
    options.hint ? `${options.id}-hint` : null,
    options.error ? `${options.id}-error` : null,
  ].filter(Boolean).join(' ') || undefined;

  return {
    field: {
      id: options.id,
      'aria-label': options.label,
      'aria-required': options.required || undefined,
      'aria-invalid': options.error ? true : undefined,
      'aria-describedby': describedBy,
    },
    hint: options.hint ? {
      id: `${options.id}-hint`,
    } : null,
    error: options.error ? {
      id: `${options.id}-error`,
      role: 'alert',
      'aria-live': 'assertive' as const,
    } : null,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const a11y = {
  // Screen reader
  visuallyHidden,
  announce,

  // Focus
  focusRingStyles,
  focusClasses,
  moveFocusTo,
  createFocusTrap,

  // Touch
  touchTargetStyles,
  touchClasses,

  // Timing
  safeTimeout,

  // Color
  meetsContrastRatio,

  // Motion
  prefersReducedMotion,
  onReducedMotionChange,

  // Keyboard
  keys,
  isActivationKey,
  createListKeyboardHandler,

  // ARIA
  getExpandableAriaProps,
  getFieldAriaProps,
} as const;

export default a11y;
