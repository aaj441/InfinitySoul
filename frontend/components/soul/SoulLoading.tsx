/**
 * SoulLoading
 *
 * A loading state that tells the story of ANTICIPATION, not waiting.
 *
 * Musical philosophy (Kanye's orchestral builds):
 * - Loading is the intro—building tension before the drop
 * - Each pulse is a phrase in the composition
 * - The user isn't "waiting"—they're experiencing the build-up
 *
 * Traditional loading says: "Please wait."
 * SoulLoading says: "Something good is coming."
 *
 * WCAG AAA:
 * - aria-busy on loading regions
 * - aria-live for status updates
 * - Respects prefers-reduced-motion
 * - Progress announcements for screen readers
 * - Focus management when loading completes
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { orchestral, intimate, curves } from '../../design/motion';
import { announce, prefersReducedMotion } from '../../design/a11y';

// =============================================================================
// TYPES
// =============================================================================

type LoadingVariant = 'spinner' | 'pulse' | 'dots' | 'bars' | 'skeleton';
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SoulLoadingProps {
  /** Visual variant */
  variant?: LoadingVariant;
  /** Size */
  size?: LoadingSize;
  /** Loading message for users */
  message?: string;
  /** Progress percentage (0-100) for determinate loading */
  progress?: number;
  /** Whether loading is active */
  isLoading?: boolean;
  /** Label for screen readers */
  label?: string;
  /** Custom color */
  color?: string;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// SOUL SPINNER
// The signature InfinitySoul loading animation
// =============================================================================

const SoulSpinner: React.FC<{ size: LoadingSize; color?: string }> = ({
  size,
  color = 'currentColor',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const reducedMotion = typeof window !== 'undefined' && prefersReducedMotion();

  return (
    <motion.div
      className={cn(sizes[size], 'relative')}
      animate={reducedMotion ? {} : { rotate: 360 }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {/* Outer ring */}
      <svg className="w-full h-full" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="80, 200"
          strokeDashoffset="0"
          opacity="0.2"
        />
        <motion.circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="80, 200"
          initial={{ strokeDashoffset: 0 }}
          animate={
            reducedMotion
              ? {}
              : {
                  strokeDashoffset: [-200, 0],
                }
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: curves.orchestral.easeInOut,
          }}
        />
      </svg>

      {/* Inner pulse - like a heartbeat */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={
          reducedMotion
            ? {}
            : {
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5],
              }
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          className="w-1/3 h-1/3 rounded-full"
          style={{ backgroundColor: color }}
        />
      </motion.div>
    </motion.div>
  );
};

// =============================================================================
// PULSE LOADER
// Elliott Smith's melancholic pulse—subtle, rhythmic
// =============================================================================

const PulseLoader: React.FC<{ size: LoadingSize; color?: string }> = ({
  size,
  color,
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const reducedMotion = typeof window !== 'undefined' && prefersReducedMotion();

  return (
    <div className={cn(sizes[size], 'relative')}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full bg-purple-500"
          style={{ backgroundColor: color }}
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={
            reducedMotion
              ? { opacity: [0.3, 0.8, 0.3] }
              : {
                  scale: [0.8, 1.5, 0.8],
                  opacity: [0.8, 0, 0.8],
                }
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
      <div
        className={cn(sizes[size], 'absolute inset-0 rounded-full bg-purple-500')}
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

// =============================================================================
// DOTS LOADER
// Jay-Z's rhythm—precise, bouncing flow
// =============================================================================

const DotsLoader: React.FC<{ size: LoadingSize; color?: string }> = ({
  size,
  color,
}) => {
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  };

  const gaps = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
    xl: 'gap-3',
  };

  const reducedMotion = typeof window !== 'undefined' && prefersReducedMotion();

  return (
    <div className={cn('flex items-center', gaps[size])}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(dotSizes[size], 'rounded-full bg-purple-500')}
          style={{ backgroundColor: color }}
          animate={
            reducedMotion
              ? { opacity: [0.3, 1, 0.3] }
              : {
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }
          }
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: curves.narrative.easeInOut,
          }}
        />
      ))}
    </div>
  );
};

// =============================================================================
// BARS LOADER
// Kanye's orchestral bars—building energy
// =============================================================================

const BarsLoader: React.FC<{ size: LoadingSize; color?: string }> = ({
  size,
  color,
}) => {
  const barWidths = {
    sm: 'w-1',
    md: 'w-1.5',
    lg: 'w-2',
    xl: 'w-2.5',
  };

  const barHeights = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-10',
  };

  const gaps = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
    xl: 'gap-2',
  };

  const reducedMotion = typeof window !== 'undefined' && prefersReducedMotion();

  return (
    <div className={cn('flex items-end', gaps[size], barHeights[size])}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={cn(barWidths[size], 'bg-purple-500 rounded-full')}
          style={{ backgroundColor: color }}
          animate={
            reducedMotion
              ? { opacity: [0.3, 1, 0.3] }
              : {
                  height: ['30%', '100%', '30%'],
                }
          }
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: curves.orchestral.easeInOut,
          }}
        />
      ))}
    </div>
  );
};

// =============================================================================
// SKELETON LOADER
// Placeholder for content—the anticipation of what's to come
// =============================================================================

interface SkeletonProps {
  /** Width of skeleton (Tailwind class or CSS value) */
  width?: string;
  /** Height of skeleton */
  height?: string;
  /** Make it circular */
  circle?: boolean;
  /** Custom class */
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = 'w-full',
  height = 'h-4',
  circle = false,
  className,
}) => {
  const reducedMotion = typeof window !== 'undefined' && prefersReducedMotion();

  return (
    <motion.div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        circle ? 'rounded-full' : 'rounded-md',
        width,
        height,
        className
      )}
      animate={
        reducedMotion
          ? {}
          : {
              opacity: [0.5, 1, 0.5],
            }
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

// =============================================================================
// PROGRESS BAR
// Determinate loading with percentage
// =============================================================================

interface ProgressBarProps {
  progress: number;
  size?: LoadingSize;
  color?: string;
  showLabel?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  color,
  showLabel = true,
  className,
}) => {
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  // Announce progress updates
  React.useEffect(() => {
    if (progress === 100) {
      announce('Loading complete');
    } else if (progress > 0 && progress % 25 === 0) {
      announce(`Loading ${progress}% complete`);
    }
  }, [progress]);

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          heights[size]
        )}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Loading: ${progress}% complete`}
      >
        <motion.div
          className={cn('h-full bg-purple-500 rounded-full')}
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 0.5,
            ease: curves.narrative.easeOut,
          }}
        />
      </div>
      {showLabel && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 tabular-nums">
          {progress}% complete
        </p>
      )}
    </div>
  );
};

// =============================================================================
// MAIN LOADING COMPONENT
// =============================================================================

const SoulLoading: React.FC<SoulLoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  message,
  progress,
  isLoading = true,
  label = 'Loading',
  color,
  className,
}) => {
  // Announce loading state changes
  React.useEffect(() => {
    if (isLoading) {
      announce(message || 'Loading, please wait');
    }
  }, [isLoading, message]);

  if (!isLoading) return null;

  // If we have progress, show the progress bar
  if (typeof progress === 'number') {
    return (
      <div
        className={cn('flex flex-col items-center gap-4', className)}
        aria-busy="true"
        aria-live="polite"
      >
        <ProgressBar progress={progress} size={size} color={color} />
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        )}
      </div>
    );
  }

  const LoaderComponent = {
    spinner: SoulSpinner,
    pulse: PulseLoader,
    dots: DotsLoader,
    bars: BarsLoader,
    skeleton: () => null, // Handled separately
  }[variant];

  return (
    <div
      className={cn('flex flex-col items-center gap-4', className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      <LoaderComponent size={size} color={color} />
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600 dark:text-gray-400"
        >
          {message}
        </motion.p>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
};

// =============================================================================
// LOADING OVERLAY
// Full-screen or container loading state
// =============================================================================

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  variant?: LoadingVariant;
  blur?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message,
  variant = 'spinner',
  blur = true,
  children,
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'bg-white/80 dark:bg-gray-900/80',
              blur && 'backdrop-blur-sm',
              'z-50'
            )}
            aria-busy="true"
          >
            <SoulLoading variant={variant} message={message} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export {
  SoulLoading,
  SoulSpinner,
  PulseLoader,
  DotsLoader,
  BarsLoader,
  Skeleton,
  ProgressBar,
  LoadingOverlay,
};

export default SoulLoading;
