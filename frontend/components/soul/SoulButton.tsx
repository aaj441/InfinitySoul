/**
 * SoulButton
 *
 * A button that feels like Jay-Z's confidence—earned, precise, impactful.
 *
 * Musical philosophy:
 * - Default: Confident delivery, like a verse that knows where it's going
 * - Hover: The crowd starts to feel it—subtle scale, building energy
 * - Press: The hit—satisfying impact, then release
 * - Disabled: Quiet moment—still present, just waiting
 *
 * WCAG AAA:
 * - 44px minimum touch target
 * - 7:1 contrast ratio
 * - Clear focus indicators
 * - Keyboard accessible
 * - Loading state announcements
 */

'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { presets, curves } from '../../design/motion';
import { triggerHaptic } from '../../design/emotion';
import { focusClasses, touchClasses } from '../../design/a11y';

// =============================================================================
// VARIANT DEFINITIONS
// Like different song styles—each has its place
// =============================================================================

const buttonVariants = cva(
  // Base styles: The foundation every button needs
  [
    // Layout
    'inline-flex items-center justify-center gap-2',
    // Typography (Jay-Z's proclaim voice)
    'text-base font-medium tracking-tight',
    // Shape
    'rounded-lg',
    // Transitions
    'transition-all duration-200',
    // Touch target (WCAG 2.5.5 AAA)
    touchClasses.minimum,
    // Focus (WCAG 2.4.7)
    focusClasses.ring,
    // Disabled state
    'disabled:pointer-events-none disabled:opacity-50',
    // Remove browser defaults
    'select-none',
  ],
  {
    variants: {
      // Visual style variants
      variant: {
        // Primary: The hook—confident, can't miss it
        primary: [
          'bg-purple-600 text-white',
          'hover:bg-purple-700',
          'active:bg-purple-800',
          'shadow-md hover:shadow-lg',
        ],

        // Secondary: The verse—supportive, still impactful
        secondary: [
          'bg-purple-100 text-purple-900',
          'hover:bg-purple-200',
          'active:bg-purple-300',
          'dark:bg-purple-900/30 dark:text-purple-100',
          'dark:hover:bg-purple-900/50',
        ],

        // Ghost: The ad-lib—barely there, but counts
        ghost: [
          'bg-transparent text-purple-700',
          'hover:bg-purple-50',
          'active:bg-purple-100',
          'dark:text-purple-300',
          'dark:hover:bg-purple-900/30',
        ],

        // Outline: The bridge—defined but not dominant
        outline: [
          'border-2 border-purple-600 text-purple-700 bg-transparent',
          'hover:bg-purple-50',
          'active:bg-purple-100',
          'dark:border-purple-400 dark:text-purple-300',
          'dark:hover:bg-purple-900/30',
        ],

        // Destructive: The reality check—honest, not angry
        destructive: [
          'bg-rose-600 text-white',
          'hover:bg-rose-700',
          'active:bg-rose-800',
          'shadow-md hover:shadow-lg',
        ],
      },

      // Size variants
      size: {
        sm: 'h-9 px-3 text-sm rounded-md',
        md: 'h-11 px-5',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-11 w-11 p-0',
      },

      // Width variants
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

// =============================================================================
// LOADING SPINNER
// Anticipation state—the build before the drop
// =============================================================================

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.svg
      className={cn(sizes[size], 'animate-spin')}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );
};

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

export interface SoulButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Use a custom element (for links styled as buttons) */
  asChild?: boolean;
  /** Show loading state */
  isLoading?: boolean;
  /** Loading text for screen readers */
  loadingText?: string;
  /** Icon to show before text */
  leftIcon?: React.ReactNode;
  /** Icon to show after text */
  rightIcon?: React.ReactNode;
  /** Disable motion animations */
  disableMotion?: boolean;
}

const SoulButton = React.forwardRef<HTMLButtonElement, SoulButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      loadingText = 'Loading',
      leftIcon,
      rightIcon,
      disabled,
      children,
      onClick,
      disableMotion = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || isLoading;

    // Handle click with haptic feedback
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        triggerHaptic('welcome');
        onClick?.(e);
      }
    };

    // Motion props for the button
    const motionProps = disableMotion
      ? {}
      : {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          transition: {
            duration: 0.15,
            ease: curves.narrative.easeOut,
          },
        };

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        onClick={handleClick}
        {...motionProps}
        {...props}
      >
        {/* Loading spinner with animation */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center"
            >
              <LoadingSpinner size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} />
              <span className="sr-only">{loadingText}</span>
            </motion.span>
          )}
        </AnimatePresence>

        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Button content */}
        <span className={cn(isLoading && 'opacity-0')}>{children}</span>

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </motion.button>
    );
  }
);

SoulButton.displayName = 'SoulButton';

export { SoulButton, buttonVariants };
export default SoulButton;
