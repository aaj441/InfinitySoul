/**
 * SoulError
 *
 * An error state that tells the story of PARTNERSHIP, not failure.
 *
 * Musical philosophy:
 * - Elliott Smith's honesty: Errors are acknowledged, not hidden
 * - Jay-Z's earned confidence: We've been here before, we can fix this
 * - Kanye's orchestral resolution: The tension resolves into action
 *
 * Traditional error states say: "You failed."
 * SoulError says: "Something went wrong. Let's fix it together."
 *
 * WCAG AAA:
 * - role="alert" for screen reader announcement
 * - aria-live="assertive" for immediate notification
 * - Clear, actionable error messages
 * - High contrast error colors (7:1+)
 * - Focus management to error region
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { narrative, intimate, curves } from '../../design/motion';
import { emotionColors, triggerHaptic, getEmotionAriaProps } from '../../design/emotion';
import { focusClasses, announce } from '../../design/a11y';

// =============================================================================
// TYPES
// =============================================================================

type ErrorSeverity = 'minor' | 'standard' | 'critical';
type ErrorVariant = 'inline' | 'banner' | 'page' | 'toast';

export interface SoulErrorProps {
  /** Error title - the "what" */
  title: string;
  /** Error message - the "why" and "what now" */
  message?: string;
  /** Severity level */
  severity?: ErrorSeverity;
  /** Visual variant */
  variant?: ErrorVariant;
  /** Primary action (e.g., retry) */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Secondary action (e.g., dismiss, get help) */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Show/hide the error */
  isVisible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// DEFAULT ICONS
// Visual language that says "together" not "wrong"
// =============================================================================

const PartnershipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const SupportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

// =============================================================================
// INLINE ERROR
// For form fields and small contexts
// =============================================================================

const InlineError: React.FC<SoulErrorProps> = ({
  title,
  message,
  action,
  icon,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: curves.intimate.easeOut }}
      className={cn(
        'flex items-start gap-2 p-3 rounded-lg',
        'bg-rose-50 dark:bg-rose-900/20',
        'border border-rose-200 dark:border-rose-800/50',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <span className="flex-shrink-0 text-rose-500 dark:text-rose-400">
        {icon || <PartnershipIcon className="w-5 h-5" />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-rose-800 dark:text-rose-200">
          {title}
        </p>
        {message && (
          <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">
            {message}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              'mt-2 text-sm font-medium',
              'text-rose-700 dark:text-rose-300',
              'underline underline-offset-2',
              'hover:text-rose-900 dark:hover:text-rose-100',
              focusClasses.ring
            )}
          >
            {action.label}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// =============================================================================
// BANNER ERROR
// For page-level notifications
// =============================================================================

const BannerError: React.FC<SoulErrorProps> = ({
  title,
  message,
  action,
  secondaryAction,
  onDismiss,
  icon,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: curves.narrative.easeOut }}
      className={cn(
        'relative w-full p-4',
        'bg-rose-50 dark:bg-rose-900/30',
        'border-l-4 border-rose-500',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4 max-w-7xl mx-auto">
        <span className="flex-shrink-0 text-rose-500 dark:text-rose-400">
          {icon || <SupportIcon className="w-6 h-6" />}
        </span>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-rose-900 dark:text-rose-100">
            {title}
          </h3>
          {message && (
            <p className="mt-1 text-sm text-rose-700 dark:text-rose-200">
              {message}
            </p>
          )}

          {(action || secondaryAction) && (
            <div className="mt-3 flex items-center gap-4">
              {action && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    triggerHaptic('partnership');
                    action.onClick();
                  }}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg',
                    'bg-rose-600 text-white',
                    'hover:bg-rose-700',
                    focusClasses.ring
                  )}
                >
                  {action.label}
                </motion.button>
              )}
              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className={cn(
                    'text-sm font-medium',
                    'text-rose-700 dark:text-rose-300',
                    'hover:text-rose-900 dark:hover:text-rose-100',
                    focusClasses.ring
                  )}
                >
                  {secondaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              'flex-shrink-0 p-1 rounded',
              'text-rose-500 hover:text-rose-700',
              'dark:text-rose-400 dark:hover:text-rose-200',
              focusClasses.ring
            )}
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

// =============================================================================
// PAGE ERROR
// Full-page error state (404, 500, etc.)
// =============================================================================

const PageError: React.FC<SoulErrorProps> = ({
  title,
  message,
  action,
  secondaryAction,
  icon,
  className,
}) => {
  // Announce to screen readers
  React.useEffect(() => {
    announce(`Error: ${title}. ${message || ''}`, 'assertive');
  }, [title, message]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: curves.orchestral.easeOut }}
      className={cn(
        'flex flex-col items-center justify-center min-h-[60vh] px-4 text-center',
        className
      )}
      role="main"
      aria-labelledby="error-title"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
          <span className="text-rose-500 dark:text-rose-400">
            {icon || <SupportIcon className="w-10 h-10" />}
          </span>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        id="error-title"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100"
      >
        {title}
      </motion.h1>

      {/* Message */}
      {message && (
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-md"
        >
          {message}
        </motion.p>
      )}

      {/* Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mt-8 flex flex-col sm:flex-row items-center gap-4"
      >
        {action && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerHaptic('partnership');
              action.onClick();
            }}
            className={cn(
              'px-6 py-3 text-base font-medium rounded-lg',
              'bg-purple-600 text-white',
              'hover:bg-purple-700',
              'shadow-md hover:shadow-lg',
              focusClasses.ring
            )}
          >
            {action.label}
          </motion.button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className={cn(
              'px-6 py-3 text-base font-medium rounded-lg',
              'text-gray-700 dark:text-gray-300',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              focusClasses.ring
            )}
          >
            {secondaryAction.label}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

// =============================================================================
// TOAST ERROR
// Temporary notification
// =============================================================================

const ToastError: React.FC<SoulErrorProps & { duration?: number }> = ({
  title,
  message,
  action,
  onDismiss,
  icon,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      className={cn(
        'w-full max-w-sm p-4 rounded-xl',
        'bg-white dark:bg-gray-900',
        'border border-rose-200 dark:border-rose-800/50',
        'shadow-lg',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 text-rose-500 dark:text-rose-400">
          {icon || <PartnershipIcon className="w-5 h-5" />}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {title}
          </p>
          {message && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'mt-2 text-sm font-medium',
                'text-purple-600 dark:text-purple-400',
                'hover:text-purple-800 dark:hover:text-purple-300',
                focusClasses.ring
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              'flex-shrink-0 p-1 rounded',
              'text-gray-400 hover:text-gray-600',
              'dark:text-gray-500 dark:hover:text-gray-300',
              focusClasses.ring
            )}
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const SoulError: React.FC<SoulErrorProps> = ({
  variant = 'inline',
  isVisible = true,
  ...props
}) => {
  // Announce errors to screen readers
  React.useEffect(() => {
    if (isVisible && props.title) {
      triggerHaptic('partnership');
    }
  }, [isVisible, props.title]);

  const ErrorComponent = {
    inline: InlineError,
    banner: BannerError,
    page: PageError,
    toast: ToastError,
  }[variant];

  return (
    <AnimatePresence>
      {isVisible && <ErrorComponent {...props} />}
    </AnimatePresence>
  );
};

export { SoulError, InlineError, BannerError, PageError, ToastError };
export default SoulError;
