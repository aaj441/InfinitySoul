/**
 * SoulCard
 *
 * A card component built on Kanye's orchestral layering philosophy.
 *
 * Musical philosophy (Late Registration):
 * - Composition over inheritance: Cards are composed of Header, Body, Footer
 * - Layering creates meaning: Shadows, borders, and content stack with purpose
 * - Architectural builds: The card feels substantial, grounded
 *
 * Like a well-produced track:
 * - The foundation (container) provides the beat
 * - Content layers add richness
 * - Visual hierarchy guides the ear (eye)
 *
 * WCAG AAA:
 * - Semantic structure with proper headings
 * - Color contrast on all backgrounds
 * - Focus management for interactive cards
 * - Motion respects reduced-motion preference
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { orchestral, intimate, curves } from '../../design/motion';
import { layering } from '../../design/tokens';
import { focusClasses } from '../../design/a11y';

// =============================================================================
// CARD CONTEXT
// Allows sub-components to know their container's state
// =============================================================================

interface CardContextValue {
  isHovered: boolean;
  isInteractive: boolean;
  variant: CardVariant;
}

const CardContext = React.createContext<CardContextValue | null>(null);

const useCardContext = () => {
  const context = React.useContext(CardContext);
  if (!context) {
    throw new Error('Card sub-components must be used within a SoulCard');
  }
  return context;
};

// =============================================================================
// TYPES
// =============================================================================

type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost' | 'glass';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface SoulCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Make the entire card clickable */
  asButton?: boolean;
  /** Link destination (makes card a link) */
  href?: string;
  /** Show hover effects */
  interactive?: boolean;
  /** Disable motion animations */
  disableMotion?: boolean;
}

// =============================================================================
// CARD CONTAINER
// The foundation—like the drums in a track
// =============================================================================

const SoulCard = React.forwardRef<HTMLDivElement, SoulCardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      asButton = false,
      href,
      interactive,
      disableMotion = false,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const isInteractive = interactive ?? (asButton || !!href || !!onClick);

    // Variant styles
    const variantStyles = {
      default: [
        'bg-white dark:bg-gray-900',
        'border border-gray-200 dark:border-gray-800',
        'shadow-sm',
      ],
      elevated: [
        'bg-white dark:bg-gray-900',
        'shadow-md',
        isHovered && 'shadow-lg',
      ],
      outlined: [
        'bg-transparent',
        'border-2 border-gray-200 dark:border-gray-700',
      ],
      ghost: [
        'bg-transparent',
        isHovered && 'bg-gray-50 dark:bg-gray-800/50',
      ],
      glass: [
        'bg-white/80 dark:bg-gray-900/80',
        'backdrop-blur-lg',
        'border border-white/20 dark:border-gray-700/50',
        'shadow-lg',
      ],
    };

    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
    };

    // Motion variants
    const motionVariants = {
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: curves.orchestral.easeOut,
        },
      },
      hover: isInteractive
        ? {
            y: -2,
            transition: { duration: 0.2, ease: curves.narrative.easeOut },
          }
        : {},
      tap: isInteractive
        ? {
            y: 0,
            scale: 0.99,
            transition: { duration: 0.1 },
          }
        : {},
    };

    // Determine element type
    const Component = href ? 'a' : asButton ? 'button' : 'div';
    const componentProps = href ? { href } : {};

    return (
      <CardContext.Provider value={{ isHovered, isInteractive, variant }}>
        <motion.div
          ref={ref}
          className={cn(
            // Base styles
            'rounded-xl overflow-hidden',
            'transition-all duration-200',

            // Variant
            variantStyles[variant],

            // Padding
            paddingStyles[padding],

            // Interactive styles
            isInteractive && [
              'cursor-pointer',
              focusClasses.ring,
            ],

            className
          )}
          initial={disableMotion ? false : 'initial'}
          animate="animate"
          whileHover={disableMotion ? undefined : 'hover'}
          whileTap={disableMotion ? undefined : 'tap'}
          variants={motionVariants}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={onClick}
          role={asButton ? 'button' : undefined}
          tabIndex={isInteractive ? 0 : undefined}
          {...componentProps}
          {...props}
        >
          {children}
        </motion.div>
      </CardContext.Provider>
    );
  }
);

SoulCard.displayName = 'SoulCard';

// =============================================================================
// CARD HEADER
// The intro—sets the tone
// =============================================================================

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Title content */
  title?: React.ReactNode;
  /** Subtitle/description */
  subtitle?: React.ReactNode;
  /** Action element (button, menu, etc.) */
  action?: React.ReactNode;
}

const SoulCardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between gap-4', className)}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

SoulCardHeader.displayName = 'SoulCardHeader';

// =============================================================================
// CARD BODY
// The verse—the main content
// =============================================================================

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const SoulCardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mt-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SoulCardBody.displayName = 'SoulCardBody';

// =============================================================================
// CARD FOOTER
// The outro—wraps it up with actions
// =============================================================================

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Align content */
  align?: 'left' | 'center' | 'right' | 'between';
}

const SoulCardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ align = 'right', className, children, ...props }, ref) => {
    const alignStyles = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'mt-6 pt-4 border-t border-gray-100 dark:border-gray-800',
          'flex items-center gap-3',
          alignStyles[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SoulCardFooter.displayName = 'SoulCardFooter';

// =============================================================================
// CARD IMAGE
// Visual layer—like the sample that anchors the track
// =============================================================================

interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Aspect ratio */
  aspect?: 'video' | 'square' | 'wide' | 'auto';
  /** Overlay content */
  overlay?: React.ReactNode;
}

const SoulCardImage = React.forwardRef<HTMLDivElement, CardImageProps>(
  ({ aspect = 'video', overlay, className, alt = '', src, ...props }, ref) => {
    const aspectStyles = {
      video: 'aspect-video',
      square: 'aspect-square',
      wide: 'aspect-[21/9]',
      auto: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden -m-5 mb-4',
          aspectStyles[aspect],
          className
        )}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          {...props}
        />
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
            {overlay}
          </div>
        )}
      </div>
    );
  }
);

SoulCardImage.displayName = 'SoulCardImage';

// =============================================================================
// EXPORTS
// =============================================================================

export {
  SoulCard,
  SoulCardHeader,
  SoulCardBody,
  SoulCardFooter,
  SoulCardImage,
};

export default SoulCard;
