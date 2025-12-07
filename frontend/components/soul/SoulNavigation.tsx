/**
 * SoulNavigation
 *
 * A navigation system that tells the story of WELCOME.
 *
 * Musical philosophy (combining all three artists):
 * - Kanye's layering: Nav items stack with purpose, mobile menu overlays
 * - Jay-Z's momentum: Clear hierarchy, confident wayfinding
 * - Elliott Smith's intimacy: Subtle indicators, gentle transitions
 *
 * The navigation should feel like arriving somewhere—
 * not cold wayfinding, but a warm "you're here."
 *
 * WCAG AAA:
 * - Semantic nav element with aria-label
 * - Skip links for keyboard users
 * - Current page indication (aria-current)
 * - Mobile menu with focus management
 * - Touch-friendly targets (48px+)
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { orchestral, narrative, intimate, curves } from '../../design/motion';
import { focusClasses, touchClasses, createFocusTrap, announce } from '../../design/a11y';
import { triggerHaptic, emotionColors } from '../../design/emotion';

// =============================================================================
// TYPES
// =============================================================================

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
}

export interface SoulNavigationProps {
  /** Navigation items */
  items: NavItem[];
  /** Current active item ID */
  activeId?: string;
  /** Logo/brand element */
  brand?: React.ReactNode;
  /** Actions on the right side */
  actions?: React.ReactNode;
  /** Custom link component (for Next.js Link, etc.) */
  linkComponent?: React.ComponentType<{ href: string; children: React.ReactNode; className?: string }>;
  /** Callback when item is clicked */
  onNavigate?: (item: NavItem) => void;
  /** Make nav sticky */
  sticky?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// SKIP LINK
// The secret handshake for keyboard users
// =============================================================================

const SkipLink: React.FC<{ href: string }> = ({ href }) => {
  return (
    <a
      href={href}
      className={cn(
        // Visually hidden until focused
        'sr-only focus:not-sr-only',
        'focus:absolute focus:top-4 focus:left-4 focus:z-50',
        'focus:px-4 focus:py-2',
        'focus:bg-purple-600 focus:text-white',
        'focus:rounded-lg focus:shadow-lg',
        focusClasses.ring
      )}
    >
      Skip to main content
    </a>
  );
};

// =============================================================================
// NAV ITEM COMPONENT
// Each item is a moment in the navigation story
// =============================================================================

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
  linkComponent?: React.ComponentType<{ href: string; children: React.ReactNode; className?: string }>;
}

const NavItemComponent: React.FC<NavItemProps> = ({
  item,
  isActive,
  onClick,
  linkComponent: LinkComponent,
}) => {
  const Wrapper = LinkComponent || 'a';

  return (
    <motion.li
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: curves.intimate.easeOut }}
    >
      <Wrapper
        href={item.href}
        className={cn(
          // Base styles
          'relative flex items-center gap-2 px-4 py-2',
          'text-sm font-medium rounded-lg',
          'transition-colors duration-200',

          // Touch target
          touchClasses.minimum,

          // Focus
          focusClasses.ring,

          // States
          isActive
            ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
        )}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => {
          if (isActive) {
            announce(`You are on the ${item.label} page`);
          } else {
            triggerHaptic('welcome');
            announce(`Navigating to ${item.label}`);
          }
          onClick?.();
        }}
      >
        {/* Icon */}
        {item.icon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {item.icon}
          </span>
        )}

        {/* Label */}
        <span>{item.label}</span>

        {/* Badge */}
        {item.badge && (
          <span
            className={cn(
              'ml-auto px-2 py-0.5 text-xs font-semibold rounded-full',
              'bg-purple-100 text-purple-700',
              'dark:bg-purple-900/50 dark:text-purple-300'
            )}
          >
            {item.badge}
          </span>
        )}

        {/* Active indicator - the arrival moment */}
        {isActive && (
          <motion.div
            layoutId="nav-active-indicator"
            className="absolute inset-0 bg-purple-50 dark:bg-purple-900/20 rounded-lg -z-10"
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          />
        )}
      </Wrapper>
    </motion.li>
  );
};

// =============================================================================
// MOBILE MENU
// The sidebar entrance—a moment of welcome
// =============================================================================

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  activeId?: string;
  brand?: React.ReactNode;
  linkComponent?: React.ComponentType<{ href: string; children: React.ReactNode; className?: string }>;
  onNavigate?: (item: NavItem) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  items,
  activeId,
  brand,
  linkComponent,
  onNavigate,
}) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Focus trap when open
  React.useEffect(() => {
    if (isOpen && menuRef.current) {
      const cleanup = createFocusTrap(menuRef.current);
      return cleanup;
    }
  }, [isOpen]);

  // Close on escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <motion.div
            ref={menuRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'fixed inset-y-0 left-0 w-72 z-50 lg:hidden',
              'bg-white dark:bg-gray-900',
              'shadow-2xl',
              'flex flex-col'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              {brand}
              <button
                onClick={onClose}
                className={cn(
                  'p-2 rounded-lg',
                  'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  focusClasses.ring,
                  touchClasses.minimum
                )}
                aria-label="Close navigation menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 overflow-y-auto p-4" aria-label="Main navigation">
              <motion.ul
                className="space-y-1"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 },
                  },
                }}
              >
                {items.map((item) => (
                  <NavItemComponent
                    key={item.id}
                    item={item}
                    isActive={item.id === activeId}
                    linkComponent={linkComponent}
                    onClick={() => {
                      onNavigate?.(item);
                      onClose();
                    }}
                  />
                ))}
              </motion.ul>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// =============================================================================
// MAIN NAVIGATION COMPONENT
// =============================================================================

const SoulNavigation: React.FC<SoulNavigationProps> = ({
  items,
  activeId,
  brand,
  actions,
  linkComponent,
  onNavigate,
  sticky = true,
  className,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <>
      {/* Skip link for keyboard users */}
      <SkipLink href="#main-content" />

      {/* Main navigation bar */}
      <header
        className={cn(
          'w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg',
          'border-b border-gray-200 dark:border-gray-800',
          sticky && 'sticky top-0 z-30',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex-shrink-0">{brand}</div>

            {/* Desktop navigation */}
            <nav
              className="hidden lg:block"
              aria-label="Main navigation"
            >
              <ul className="flex items-center gap-1">
                {items.map((item) => (
                  <NavItemComponent
                    key={item.id}
                    item={item}
                    isActive={item.id === activeId}
                    linkComponent={linkComponent}
                    onClick={() => onNavigate?.(item)}
                  />
                ))}
              </ul>
            </nav>

            {/* Right side: actions + mobile menu button */}
            <div className="flex items-center gap-3">
              {/* Actions (visible on all sizes) */}
              {actions}

              {/* Mobile menu button */}
              <button
                className={cn(
                  'lg:hidden p-2 rounded-lg',
                  'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  focusClasses.ring,
                  touchClasses.minimum
                )}
                onClick={() => setIsMobileMenuOpen(true)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Open navigation menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        items={items}
        activeId={activeId}
        brand={brand}
        linkComponent={linkComponent}
        onNavigate={onNavigate}
      />
    </>
  );
};

export { SoulNavigation, SkipLink };
export default SoulNavigation;
