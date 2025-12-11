/**
 * SoulInput
 *
 * A form input that tells the story of SAFETY.
 *
 * Musical philosophy (Elliott Smith's intimate minimalism):
 * - Pristine: Quiet, waiting, unobtrusive
 * - Focused: Gentle presence, like a soft chord
 * - Valid: Warm acknowledgment, not loud celebration
 * - Error: Partnership, not punishment—"let's fix this together"
 *
 * WCAG AAA:
 * - Visible labels (not just placeholders)
 * - Error messages linked via aria-describedby
 * - 7:1 contrast on all text
 * - Clear focus indicators
 * - Touch-friendly sizing
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { intimate } from '../../design/motion';
import { emotionColors, triggerHaptic } from '../../design/emotion';
import { focusClasses, getFieldAriaProps } from '../../design/a11y';

// =============================================================================
// TYPES
// =============================================================================

type InputState = 'pristine' | 'focused' | 'valid' | 'error' | 'disabled';

export interface SoulInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label (required for accessibility) */
  label: string;
  /** Hint text shown below the input */
  hint?: string;
  /** Error message (triggers error state) */
  error?: string;
  /** Success message (triggers valid state) */
  success?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional icon to show in the input */
  icon?: React.ReactNode;
  /** Position of the icon */
  iconPosition?: 'left' | 'right';
  /** Show character count */
  showCount?: boolean;
  /** Hide label visually (still accessible to screen readers) */
  hideLabel?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

const SoulInput = React.forwardRef<HTMLInputElement, SoulInputProps>(
  (
    {
      label,
      hint,
      error,
      success,
      size = 'md',
      icon,
      iconPosition = 'left',
      showCount = false,
      hideLabel = false,
      className,
      disabled,
      required,
      maxLength,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      id: providedId,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const id = React.useMemo(
      () => providedId || `soul-input-${Math.random().toString(36).substr(2, 9)}`,
      [providedId]
    );

    // Track focus state
    const [isFocused, setIsFocused] = React.useState(false);

    // Track character count for controlled/uncontrolled inputs
    const [charCount, setCharCount] = React.useState(
      () => String(value ?? defaultValue ?? '').length
    );

    // Determine current state
    const getState = (): InputState => {
      if (disabled) return 'disabled';
      if (error) return 'error';
      if (success) return 'valid';
      if (isFocused) return 'focused';
      return 'pristine';
    };

    const state = getState();

    // Get ARIA props
    const ariaProps = getFieldAriaProps({
      id,
      label,
      error,
      hint: hint || success,
      required,
    });

    // Handle focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Handle change (for character count)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length);

      // Haptic feedback on error clear or new error
      if (error && e.target.validity.valid) {
        triggerHaptic('safety');
      }

      onChange?.(e);
    };

    // Size classes
    const sizeClasses = {
      sm: 'h-9 text-sm px-3',
      md: 'h-11 text-base px-4',
      lg: 'h-14 text-lg px-5',
    };

    // State-based border colors
    const borderColors = {
      pristine: 'border-gray-300 dark:border-gray-600',
      focused: 'border-purple-500 ring-2 ring-purple-500/20',
      valid: 'border-green-500',
      error: 'border-rose-500 ring-2 ring-rose-500/20',
      disabled: 'border-gray-200 dark:border-gray-700',
    };

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium mb-1.5',
            'text-gray-700 dark:text-gray-200',
            hideLabel && 'sr-only'
          )}
        >
          {label}
          {required && (
            <span className="text-rose-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {/* Input wrapper */}
        <div className="relative">
          {/* Icon (left) */}
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}

          {/* The input */}
          <motion.input
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              // Base styles
              'w-full rounded-lg border bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'transition-all duration-200',

              // Size
              sizeClasses[size],

              // State
              borderColors[state],

              // Icon padding
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',

              // Focus (WCAG)
              focusClasses.ring,

              // Disabled
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800'
            )}
            aria-invalid={state === 'error'}
            aria-describedby={ariaProps.field['aria-describedby']}
            aria-required={required}
            {...props}
          />

          {/* Icon (right) */}
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}

          {/* State indicator */}
          <AnimatePresence>
            {(state === 'valid' || state === 'error') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2',
                  icon && iconPosition === 'right' && 'right-10'
                )}
              >
                {state === 'valid' && (
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {state === 'error' && (
                  <svg
                    className="w-5 h-5 text-rose-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Helper text area */}
        <div className="mt-1.5 flex justify-between items-start">
          <div className="flex-1">
            {/* Hint text */}
            {hint && !error && !success && (
              <p
                id={`${id}-hint`}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {hint}
              </p>
            )}

            {/* Success message - The story of SAFETY */}
            <AnimatePresence mode="wait">
              {success && !error && (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  id={`${id}-hint`}
                  className="text-sm text-green-600 dark:text-green-400"
                  role="status"
                >
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Error message - The story of PARTNERSHIP */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  id={`${id}-error`}
                  className="text-sm text-rose-600 dark:text-rose-400"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Character count */}
          {showCount && maxLength && (
            <p
              className={cn(
                'text-xs tabular-nums',
                charCount > maxLength * 0.9
                  ? 'text-rose-500'
                  : 'text-gray-400 dark:text-gray-500'
              )}
              aria-live="polite"
              aria-atomic="true"
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

SoulInput.displayName = 'SoulInput';

export { SoulInput };
export default SoulInput;
