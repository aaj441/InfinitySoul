# WCAGAI Platform Design Guidelines

## Design Approach
**Visual Identity:** Perplexity Dark Theme - Premium, AI-first aesthetic with indigo primary, vibrant violet accents, and deep slate backgrounds optimized for accessibility and consultant workflows.

**Core Principles:**
- Premium dark-first design reduces eye strain for all-day use
- Indigo primary (#6366F1) for trusted, professional brand presence
- Vibrant violet accents (#7C3AED) for interactive AI features
- Deep, sophisticated backgrounds (#0F172A, #1E293B) with excellent contrast
- Clean, minimal design reduces cognitive load for complex compliance workflows

---

## Color Palette

### Primary Colors
- **Indigo Primary:** #6366F1 (hsl: 237 99% 66%) - Primary buttons, sidebars, highlights
- **Violet Accent:** #7C3AED (hsl: 259 90% 61%) - Interactive elements, secondary actions, AI features
- **Deep Navy Background:** #0F172A (hsl: 217 91% 8%) - Primary dark background
- **Slate Surface:** #1E293B (hsl: 215 28% 17%) - Card, surface backgrounds

### Supporting Colors
- **Text/Foreground:** #94A3B8 (hsl: 216 17% 92%) - Primary text on dark
- **Input/Field:** #334155 (hsl: 213 23% 25%) - Form inputs, focused states
- **Border/Divider:** #263249 (hsl: 218 23% 28%) - Subtle borders, dividers

### Status Colors
- **Success:** #14B8A6 (hsl: 169 87% 43%) - Compliance passed, emails sent
- **Warning:** #F59E0B (hsl: 38 92% 50%) - Audit in progress, pending actions
- **Error/Destructive:** #EF4444 (hsl: 0 93% 67%) - Critical violations, failed scans

---

## Typography System

**Font Stack:** IBM Plex Sans (via Google Fonts CDN)
- **Headings (H1):** 2.5rem/3rem, SemiBold (600), Letter-spacing: -1px
- **Headings (H2):** 2rem/2.5rem, SemiBold (600)
- **Headings (H3):** 1.5rem/2rem, Medium (500)
- **Body Large:** 1rem, Regular (400) - primary content
- **Body Standard:** 0.875rem, Regular (400) - dense data tables
- **Body Small:** 0.75rem, Regular (400) - metadata, captions
- **Code/Monospace:** IBM Plex Mono for violation codes, API endpoints

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20 (8px base grid)
- Component padding: p-4, p-6, p-8
- Section spacing: space-y-6, space-y-8
- Card gaps: gap-4, gap-6
- Page margins: px-6 (mobile), px-8 (desktop)

**Container Strategy:**
- Max-width: max-w-7xl for main dashboard
- Sidebar: fixed w-64 (collapsible to w-16 icon-only)
- Content area: Flexible with responsive grid

---

## Component Library

### Navigation & Structure
- **Top Bar:** Fixed header with logo, global search, notifications, user menu (h-16)
- **Sidebar:** Persistent left nav with icons + labels, collapsible, active state indicators (Brand Purple background)
- **Breadcrumbs:** Show hierarchy for deep navigation (Prospects > ABC Corp > Email Cadence)

### Data Display
- **Dashboard Cards:** Metric cards in grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
  - Large numeric value (text-3xl)
  - Label (text-sm)
  - Trend indicator with percentage change
  - Sparkline mini-chart
  
- **Data Tables:** 
  - Sticky header row
  - Sortable columns with arrow indicators
  - Row hover states (Electric Blue accent)
  - Action buttons (icon-only, right-aligned)
  - Pagination controls (bottom)
  - Filters/search (top)
  
- **Status Badges:** Pill-shaped, text-xs, px-2 py-1
  - High Risk, Medium Risk, Low Risk
  - Active Cadence, Paused, Completed
  - Lawsuit Alert, Funding Event, Redesign Detected

### Forms & Inputs
- **Text Inputs:** Outlined style with Electric Blue focus ring, h-10, px-3, label above, helper text below
- **Dropdowns/Select:** Consistent height (h-10), chevron icon right, Electric Blue accent on focus
- **Checkboxes/Radio:** Left-aligned with labels, group spacing (space-y-2), Electric Blue checked state
- **Buttons:** 
  - Primary: Brand Purple background with white text
  - Secondary: Electric Blue outline variant
  - Icon buttons: square, p-2
  - Loading states with spinner

### Visualization
- **Charts:** Using Chart.js via CDN
  - Primary color: Electric Blue (0066FF)
  - Secondary: Brand Purple (7C3AED)
  - Accent: Light Purple
  - Clean gridlines, axis labels, legend placement
  
- **Progress Indicators:**
  - Linear progress bars (Electric Blue fill on neutral background)
  - Circular indicators for ICP scores (0-100)
  - Step indicators for email cadence position (1 of 8)

### Cards & Panels
- **Prospect Cards:** 
  - Company logo/initial (top-left, Electric Blue circle)
  - Company name (text-lg, font-semibold)
  - Industry, size, revenue (text-sm metadata)
  - ICP Score (prominent, right side, Brand Purple)
  - Violation count badge (red/orange)
  - Quick actions footer
  
- **Email Preview Cards:**
  - Subject line (truncated with tooltip)
  - Preview text (2 lines max)
  - Send time + status
  - Open/click metrics
  
- **Alert Panels:** 
  - Lawsuit alerts: Urgent styling, expandable details
  - Trigger notifications: Inline, dismissible

### Overlays & Modals
- **Modal Dialogs:** Centered, max-w-2xl, backdrop overlay, close button (top-right)
- **Slide-out Panels:** Right-side drawer (w-96) for prospect details, email composer
- **Tooltips:** Small, contextual, on hover, max-w-xs

---

## Page Layouts

### Dashboard (Home)
- Grid of 4 metric cards (open rate, reply rate, demo bookings, active prospects)
- Recent lawsuit alerts section (urgent banner style)
- Engagement trends chart (full-width, Electric Blue primary color)
- Active cadences table (sortable)
- Recent activity feed (right sidebar or bottom section)

### Prospect List
- Filters bar (top): Industry, ICP Score range, Status, Risk level
- Search + bulk actions
- Data table with columns: Company, Industry, ICP Score, Violations, Status, Last Contact, Actions
- Pagination (bottom)

### Prospect Detail View
- Split layout: 
  - Left 2/3: Tabs (Overview, Email History, WCAG Scan, ROI Analysis)
  - Right 1/3: Quick stats, ICP score visual (Brand Purple), action buttons, timeline
- Overview tab: Company info, violation summary, risk indicators
- Email tab: Cadence progress, sent emails with metrics, compose new
- Scan tab: Violation list grouped by severity (expandable rows)

### Email Composer
- Full-width editor area
- AI generation panel (right side or toggle) - Electric Blue accent
- Subject line A/B testing section (side-by-side variants)
- Personalization token selector
- Preview mode toggle
- Schedule/send controls

### Analytics Dashboard
- Time range selector (top-right)
- KPI comparison cards vs. industry benchmarks
- Multi-line chart: Open rates, reply rates, demo bookings over time (Electric Blue primary)
- Funnel visualization: Prospects → Contacted → Replied → Demo → Closed
- Breakdown by industry, ICP score segment (bar/donut charts)
- Export data button

---

## Icons
**Library:** Lucide React (outline style for primary, solid for emphasis)
- Navigation: Home, Users, Mail, Chart, Alert, Settings
- Actions: Plus, Edit, Trash, Download, External Link
- Status: Check Circle, X Circle, Exclamation Triangle
- UI: Search, Filter, Sort, Menu, Close, Chevron Down

---

## Accessibility Implementation
- Semantic HTML5 structure (header, nav, main, aside, footer)
- ARIA labels for all interactive elements
- Keyboard navigation: Tab order, Enter/Space activation, Esc to close
- Focus indicators: Electric Blue 2px outline offset
- Skip links for main content
- Contrast ratios minimum 4.5:1 (text), 3:1 (UI components)
- Form labels explicitly associated via for/id
- Error messages programmatically linked to inputs
- Loading states announced via aria-live regions

---

## Animations
**Minimal & Purposeful:**
- Page transitions: None
- Modal/drawer: Slide-in (150ms ease-out) with Electric Blue accent
- Data loading: Skeleton screens (pulse effect)
- Notification toasts: Slide down from top (200ms)
- Hover states: No animation, instant visual feedback
- Chart rendering: Subtle fade-in (300ms) on initial load only

---

## Images
**Strategic Use:**
- Company logos in prospect cards (40x40px, rounded, Brand Purple circle background)
- Placeholder avatars for user profiles (initials on Electric Blue background)
- No hero images (this is a dashboard app, not marketing site)
- Screenshot placeholders for video audit previews (16:9 aspect ratio)
- Empty state illustrations for no-data scenarios (simple, minimal line art with Electric Blue accents)
