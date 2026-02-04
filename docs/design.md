# Mission Control — Design System

## Overview

A warm, editorial dashboard for AI agent orchestration. The aesthetic draws from traditional newspaper layouts—hierarchy through typography, generous whitespace, and a refined neutral palette—while maintaining the real-time responsiveness of a modern control center.

> *"Like reading The New York Times, but for monitoring your AI team."*

---

## Design Principles

1. **Editorial Clarity** — Information hierarchy through typography, not decoration
2. **Warm Neutrality** — Creams and warm grays feel human, not clinical
3. **Semantic Color** — Status colors carry meaning without screaming
4. **Generous Breathing Room** — Content needs space to be readable
5. **Consistent Rhythm** — Predictable spacing creates visual calm

---

## Color Palette

### Background Colors (Paper Tones)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#FDFCF8` | Main background (warm off-white) |
| `bg-secondary` | `#F7F5F0` | Card backgrounds, sidebars |
| `bg-tertiary` | `#F0EDE6` | Elevated surfaces, hover states |
| `bg-muted` | `#E8E4DB` | Disabled states, borders |

### Ink Colors (Text)

| Token | Hex | Usage |
|-------|-----|-------|
| `ink-primary` | `#1A1A1A` | Headlines, primary text |
| `ink-secondary` | `#4A4A45` | Body text, labels |
| `ink-tertiary` | `#6B6B65` | Captions, metadata |
| `ink-muted` | `#8A8A82` | Placeholders, timestamps |
| `ink-inverse` | `#FDFCF8` | Text on dark backgrounds |

### Accent Colors (Editorial)

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-warm` | `#B8860B` | Links, highlights (dark goldenrod) |
| `accent-coral` | `#C75B39` | CTAs, primary actions |
| `accent-slate` | `#5A6573` | Secondary actions, icons |

### Status Colors (Semantic)

| Status | Background | Border | Text |
|--------|-----------|--------|------|
| **Inbox** | `#F7F5F0` | `#E8E4DB` | `#6B6B65` |
| **Assigned** | `#EEF4FF` | `#C7D2FE` | `#4F46E5` |
| **In Progress** | `#FEF3C7` | `#FCD34D` | `#D97706` |
| **Review** | `#E0E7FF` | `#A5B4FC` | `#4338CA` |
| **Done** | `#ECFDF5` | `#A7F3D0` | `#059669` |
| **Blocked** | `#FEF2F2` | `#FECACA` | `#DC2626` |
| **Idle** (Agent) | `#F3F4F6` | `#D1D5DB` | `#6B7280` |
| **Active** (Agent) | `#ECFDF5` | `#A7F3D0` | `#059669` |

### Color Usage Guidelines

- **Never use pure black** (`#000000`) — `ink-primary` (#1A1A1A) provides enough contrast without harshness
- **Never use pure white** — `bg-primary` (#FDFCF8) reduces eye strain
- **Status colors should never be the only indicator** — Always pair with text labels for accessibility
- **Warm accents sparingly** — Use `accent-warm` for links and subtle highlights, not backgrounds

---

## Typography System

### Font Stack

```css
--font-serif: "Source Serif 4", "Georgia", "Times New Roman", serif;
--font-sans: "Inter", "system-ui", -apple-system, sans-serif;
--font-mono: "JetBrains Mono", "SF Mono", "Consolas", monospace;
```

### Type Scale

| Style | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|------|--------|-------------|----------------|-------|
| **Display** | Serif | 32px / 2rem | 600 | 1.2 | -0.02em | Page titles |
| **H1** | Serif | 24px / 1.5rem | 600 | 1.3 | -0.01em | Section headers |
| **H2** | Serif | 20px / 1.25rem | 600 | 1.3 | 0 | Card titles |
| **H3** | Sans | 16px / 1rem | 600 | 1.4 | 0 | Subsection headers |
| **H4** | Sans | 14px / 0.875rem | 600 | 1.4 | 0.01em | Labels |
| **Body** | Sans | 15px / 0.9375rem | 400 | 1.6 | 0 | Paragraphs |
| **Body Small** | Sans | 13px / 0.8125rem | 400 | 1.5 | 0 | Secondary text |
| **Caption** | Sans | 12px / 0.75rem | 500 | 1.4 | 0.02em | Metadata, timestamps |
| **Code** | Mono | 13px / 0.8125rem | 400 | 1.5 | 0 | Inline code |
| **Badge** | Sans | 11px / 0.6875rem | 600 | 1 | 0.04em | Status badges |

### Typography Patterns

**Headlines** — Source Serif 4, tight line-height, slight negative tracking
**Body Text** — Inter, generous line-height (1.6) for readability
**Labels & UI** — Inter, medium weight, often uppercase with tracking
**Code** — JetBrains Mono, slightly smaller size

### Editorial Hierarchy Example

```
┌─────────────────────────────────────────┐
│  Mission Control              [Display] │
│  ━━━━━━━━━━━━━                          │
│                                         │
│  Today's Activity             [H1]      │
│                                         │
│  Task Updates                 [H2]      │
│  Loki completed the blog post draft     │
│  3 hours ago                  [Caption] │
│                                         │
│  Review the draft for the new landing   │
│  page content. The introduction needs   │
│  more punch and the CTA could be...     │
│  [Body text, truncated]                 │
└─────────────────────────────────────────┘
```

---

## Spacing System

### Base Unit

**4px** is the base unit. All spacing values are multiples of 4.

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps, icon padding |
| `space-2` | 8px | Inline spacing, small gaps |
| `space-3` | 12px | Component internal padding |
| `space-4` | 16px | Card padding, standard gaps |
| `space-5` | 20px | Section gaps |
| `space-6` | 24px | Large section gaps |
| `space-8` | 32px | Major section dividers |
| `space-10` | 40px | Page-level spacing |
| `space-12` | 48px | Large layout gaps |

### Layout Grid

- **Columns**: 12-column grid
- **Gutter**: 24px (`space-6`)
- **Margin**: 32px (`space-8`) on desktop, 16px (`space-4`) on mobile
- **Max Width**: 1440px (content area)

### Density Modes

| Mode | Card Padding | Gap | Use Case |
|------|-------------|-----|----------|
| **Comfortable** | 24px | 24px | Default, most screens |
| **Compact** | 16px | 16px | Data-dense views (Kanban) |
| **Minimal** | 12px | 12px | Mobile, small viewports |

---

## Components

### Buttons

**Primary Button**
```
Background: accent-coral (#C75B39)
Text: ink-inverse (#FDFCF8)
Padding: 10px 16px
Border-radius: 6px
Font: 14px / 600
Hover: darken 8%
Active: darken 12%
```

**Secondary Button**
```
Background: transparent
Border: 1px solid ink-muted (#8A8A82)
Text: ink-secondary (#4A4A45)
Padding: 10px 16px
Border-radius: 6px
Font: 14px / 500
Hover: bg-secondary
```

**Tertiary Button (Ghost)**
```
Background: transparent
Text: accent-warm (#B8860B)
Padding: 8px 12px
Border-radius: 4px
Font: 14px / 500
Hover: bg-secondary
```

**Icon Button**
```
Size: 36px × 36px
Background: transparent
Border-radius: 6px
Hover: bg-secondary
Active: bg-tertiary
```

### Cards

**Standard Card**
```
Background: bg-primary or bg-secondary
Border: 1px solid bg-muted (#E8E4DB)
Border-radius: 8px
Padding: 24px (comfortable) / 16px (compact)
Shadow: none (flat) or subtle on hover
```

**Elevated Card**
```
Background: bg-primary
Border: 1px solid bg-muted
Border-radius: 8px
Padding: 24px
Shadow: 0 2px 8px rgba(0,0,0,0.04)
```

**Newspaper Card** (Activity Feed)
```
Background: bg-primary
Border-bottom: 1px solid bg-muted
Padding: 20px 0
No side borders or radius
Full-width within container
```

### Inputs

**Text Input**
```
Background: bg-primary
Border: 1px solid bg-muted
Border-radius: 6px
Padding: 10px 12px
Font: 15px / 400
Placeholder: ink-muted
Focus: border-accent-warm, outline 2px outline-accent-warm/20%
```

**Textarea (Comment Box)**
```
Min-height: 80px
Max-height: 300px
Resize: vertical
```

**Select/Dropdown**
```
Same as text input
Arrow icon: ChevronDown, ink-tertiary
Dropdown: bg-primary, shadow-elevated
```

### Badges & Pills

**Status Badge**
```
Padding: 4px 10px
Border-radius: 9999px (pill)
Font: 11px / 600 / 0.04em tracking (uppercase)
Background: varies by status
Text: varies by status
```

**Agent Badge**
```
Padding: 4px 8px
Border-radius: 4px
Font: 12px / 500
Background: agent color (subtle)
Text: agent color (ink)
```

### Avatars

**Agent Avatar**
```
Size: 32px (default) / 40px (large) / 24px (small)
Border-radius: 6px (slightly rounded square)
Background: agent's assigned color
Text: ink-inverse, centered initials
Font: 13px / 600
```

### Dividers

**Horizontal Rule**
```
Height: 1px
Background: bg-muted
Margin: 16px 0
```

**Section Divider** (with text)
```
Flex row with lines on sides
Line: 1px bg-muted
Text: ink-tertiary, 12px, uppercase, tracking
```

### Lists

**Activity List**
```
No bullets
Items separated by 1px border-bottom
Padding: 16px 0 per item
Hover: bg-secondary on item
```

**Comment Thread**
```
Nested indentation: 0 (top level), 24px (replies)
Connector line: 2px bg-muted, left side
Avatar + content side by side
Gap: 12px
```

### Navigation

**Sidebar Nav Item**
```
Padding: 10px 16px
Border-radius: 6px
Font: 14px / 500
Color: ink-secondary
Hover: bg-secondary
Active: bg-tertiary, ink-primary, left border 3px accent-warm
```

**Top Nav**
```
Height: 56px
Background: bg-primary
Border-bottom: 1px solid bg-muted
Padding: 0 24px
```

### Tooltips

```
Background: ink-primary (#1A1A1A)
Text: ink-inverse
Padding: 6px 10px
Border-radius: 4px
Font: 12px / 400
Shadow: 0 2px 8px rgba(0,0,0,0.15)
Arrow: 4px
```

---

## Layout Patterns

### Page Structure

```
┌─────────────────────────────────────────────────────┐
│  TOP NAV (56px)                                     │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │           MAIN CONTENT                   │
│ (240px)  │           (flex: 1)                      │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| `mobile` | < 640px | Single column, sidebar becomes drawer |
| `tablet` | 640px - 1024px | Sidebar collapses to icons, 2-column layouts |
| `desktop` | 1024px - 1440px | Full sidebar, multi-column |
| `wide` | > 1440px | Max-width container centered |

### Container Widths

| Size | Max Width | Usage |
|------|-----------|-------|
| `narrow` | 640px | Reading content, documents |
| `default` | 960px | Standard pages |
| `wide` | 1200px | Dashboards, data views |
| `full` | 100% | Kanban boards, wide tables |

### Common Layouts

**Three-Column Dashboard**
```
┌──────────┬──────────────┬──────────┐
│ ACTIVITY │   KANBAN     │  AGENTS  │
│  (25%)   │    (50%)     │  (25%)   │
│  320px   │   flexible   │  320px   │
└──────────┴──────────────┴──────────┘
```

**Two-Column with Detail**
```
┌───────────────────┬─────────────────┐
│   TASK BOARD      │  TASK DETAIL    │
│    (60%)          │    (40%)        │
│                   │  (Slide-over    │
│                   │   on mobile)    │
└───────────────────┴─────────────────┘
```

---

## Screen Specifications

### 1. Activity Feed

**Layout**
- Full-height scrollable list
- Newspaper-style: no card borders, just dividers
- Chronological, newest first
- Real-time updates animate in from top

**Item Structure**
```
┌─────────────────────────────────────────┐
│ [ICON]  [Headline text]       [Time]   │
│         [Secondary description]          │
│         [Preview of content...]          │
└─────────────────────────────────────────┘
```

**Item Types**
- **Task Created**: Document icon, task title, creator name
- **Status Changed**: Arrow icon, "Moved to [status]", agent name
- **Comment Added**: Chat icon, agent name, comment preview
- **Document Added**: File icon, document title, agent name
- **Agent Status**: Agent avatar, "[Agent] is now [status]"

**Visual Style**
- No background on items (transparent)
- Border-bottom: 1px solid bg-muted
- Hover: bg-secondary
- Unread: left border 3px accent-warm

### 2. Task Board (Kanban)

**Layout**
- Horizontal scroll on mobile
- 5 columns: Inbox | Assigned | In Progress | Review | Done
- Columns fixed width: 280px minimum
- Column headers sticky on scroll

**Column Structure**
```
┌─────────────────────────┐
│ [STATUS]        [COUNT] │ ← Header (sticky)
│ ━━━━━━━━━━━━━━━━━━━━━━━ │
│ ┌─────────────────────┐ │
│ │ Task Card           │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Task Card           │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Task Card**
```
┌─────────────────────────────┐
│ [BADGE: Status]             │
│ Task Title Goes Here        │
│                             │
│ [Preview of description...] │
│                             │
│ 👤👤 [Avatar stack]   💬 3  │
└─────────────────────────────┘
```

**Card Specs**
- Background: bg-primary
- Border: 1px solid bg-muted
- Border-radius: 6px
- Padding: 16px
- Margin-bottom: 12px
- Dragging: shadow-elevated, rotate 2deg

### 3. Agent Cards

**Layout**
- Grid: 2 columns on desktop, 1 on mobile
- Card-based, each agent in own card

**Card Structure**
```
┌─────────────────────────────────────┐
│ [AVATAR]  Agent Name      [STATUS] │
│           Role                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ Currently working on:               │
│ Task title goes here...             │
│                                     │
│ [Progress bar or metadata]          │
│                                     │
│ Last active: 5 min ago              │
└─────────────────────────────────────┘
```

**Status Indicators**
- **Idle**: Gray dot, "Idle" label
- **Active**: Green pulse animation, "Active" label
- **Blocked**: Red dot, "Blocked" label with reason

**Visual Style**
- Background: bg-secondary
- Border: 1px solid bg-muted
- Border-radius: 8px
- Padding: 20px
- Status dot: 8px circle, positioned top-right of avatar

### 4. Task Detail

**Layout**
- Slide-over panel on desktop (40% width)
- Full-screen modal on mobile
- Three sections: Header | Content | Comments

**Header**
```
┌─────────────────────────────────────┐
│ [←]  [STATUS BADGE]        [•••]   │
│      Task Title                     │
│      Assigned to: 👤 👤 👤          │
└─────────────────────────────────────┘
```

**Content**
```
┌─────────────────────────────────────┐
│ Description                         │
│ [Full task description text...]     │
│                                     │
│ Attachments                         │
│ [📄 Document 1] [📄 Document 2]     │
│                                     │
│ Activity                            │
│ [Timeline of changes]               │
└─────────────────────────────────────┘
```

**Comments Section**
```
┌─────────────────────────────────────┐
│ Comments (5)                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                     │
│ [AVATAR]  Agent Name    2h ago     │
│           Comment text goes here    │
│           and can wrap multiple     │
│           lines...                  │
│           [Reply] [React]           │
│                                     │
│           [AVATAR] Agent Name      │
│           Reply text...             │
│           (indented reply)          │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ [Add a comment...         ] [Post] │
└─────────────────────────────────────┘
```

### 5. Document Panel

**Layout**
- Split view: Document list (left) | Document viewer (right)
- List: 280px fixed width
- Viewer: Flexible, scrollable

**Document List Item**
```
┌─────────────────────────┐
│ [ICON] Document Title   │
│        Type • Modified  │
│        [Preview line...]│
└─────────────────────────┘
```

**Document Viewer**
```
┌─────────────────────────────────────┐
│ [←] Document Title        [•••]    │
│     Type: Deliverable               │
├─────────────────────────────────────┤
│                                     │
│  # Heading                          │
│                                     │
│  Body text in readable serif...     │
│                                     │
│  ## Subheading                      │
│                                     │
│  More content here...               │
│                                     │
└─────────────────────────────────────┘
```

**Reading Mode**
- Background: slightly warmer (#FAF9F6)
- Content max-width: 720px, centered
- Typography: Serif for headings, Sans for body
- Line length: 65-75 characters optimal

---

## Animation & Interactions

### Transitions

| Element | Duration | Easing |
|---------|----------|--------|
| Hover states | 150ms | ease-out |
| Panel slide | 250ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Modal fade | 200ms | ease-in-out |
| Card drag | 0ms | none (immediate) |
| New activity | 300ms | cubic-bezier(0, 0, 0.2, 1) |

### Micro-interactions

**Button Hover**
- Scale: 1.02
- Background darkens 8%
- Duration: 150ms

**Card Hover**
- Border color: ink-muted
- Transform: translateY(-1px)
- Shadow: subtle elevation
- Duration: 150ms

**Status Change**
- Flash background with new status color
- Duration: 400ms

**New Activity (Real-time)**
- Slide in from top
- Background flash: accent-warm/10%
- Duration: 300ms

**Agent Status Pulse (Active)**
- Scale: 1 → 1.2 → 1
- Opacity: 1 → 0.5 → 1
- Duration: 2s
- Iteration: infinite

### Focus States

All interactive elements:
- Outline: 2px solid accent-warm
- Outline-offset: 2px
- Border-radius: inherit

---

## Accessibility

### Color Contrast

- All text meets WCAG AA (4.5:1 minimum)
- Large text (18px+) meets WCAG AA (3:1 minimum)
- Interactive elements have visible focus states

### Screen Readers

- Status badges include `sr-only` text description
- Icons have `aria-label` or are `aria-hidden`
- Live regions for real-time updates
- Skip links for keyboard navigation

### Keyboard Navigation

- Tab order follows visual layout
- Enter/Space activates buttons
- Escape closes modals/panels
- Arrow keys navigate lists

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Assets

### Icons

Use **Lucide React** icon library.

| Usage | Icon |
|-------|------|
| Activity | `Activity` |
| Task | `CheckSquare` |
| Agent | `User` / `Bot` |
| Document | `FileText` |
| Comment | `MessageSquare` |
| Status change | `ArrowRight` |
| Add | `Plus` |
| More options | `MoreHorizontal` |
| Close | `X` |
| Search | `Search` |
| Filter | `Filter` |
| Settings | `Settings` |
| Notification | `Bell` |
| Attachment | `Paperclip` |
| Calendar | `Calendar` |
| Clock | `Clock` |
| Blocked | `AlertCircle` |
| Done | `CheckCircle` |
| In Progress | `Loader` |

### Agent Colors

Each agent has a subtle color association:

| Agent | Color | Hex |
|-------|-------|-----|
| Jarvis | Navy | `#1E3A5F` |
| Shuri | Teal | `#0D7377` |
| Fury | Rust | `#8B4513` |
| Vision | Indigo | `#4F46E5` |
| Loki | Emerald | `#059669` |
| Quill | Amber | `#D97706` |
| Wanda | Rose | `#BE185D` |
| Pepper | Coral | `#C75B39` |
| Friday | Slate | `#475569` |
| Wong | Stone | `#78716C` |

---

## Implementation Notes

### CSS Variables

```css
:root {
  /* Backgrounds */
  --bg-primary: #FDFCF8;
  --bg-secondary: #F7F5F0;
  --bg-tertiary: #F0EDE6;
  --bg-muted: #E8E4DB;
  
  /* Inks */
  --ink-primary: #1A1A1A;
  --ink-secondary: #4A4A45;
  --ink-tertiary: #6B6B65;
  --ink-muted: #8A8A82;
  --ink-inverse: #FDFCF8;
  
  /* Accents */
  --accent-warm: #B8860B;
  --accent-coral: #C75B39;
  --accent-slate: #5A6573;
  
  /* Status */
  --status-inbox-bg: #F7F5F0;
  --status-inbox-border: #E8E4DB;
  --status-inbox-text: #6B6B65;
  
  --status-assigned-bg: #EEF4FF;
  --status-assigned-border: #C7D2FE;
  --status-assigned-text: #4F46E5;
  
  --status-progress-bg: #FEF3C7;
  --status-progress-border: #FCD34D;
  --status-progress-text: #D97706;
  
  --status-review-bg: #E0E7FF;
  --status-review-border: #A5B4FC;
  --status-review-text: #4338CA;
  
  --status-done-bg: #ECFDF5;
  --status-done-border: #A7F3D0;
  --status-done-text: #059669;
  
  --status-blocked-bg: #FEF2F2;
  --status-blocked-border: #FECACA;
  --status-blocked-text: #DC2626;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  
  /* Typography */
  --font-serif: "Source Serif 4", Georgia, serif;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

### Tailwind Config Extension

```javascript
// tailwind.config.js additions
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#FDFCF8',
          secondary: '#F7F5F0',
          tertiary: '#F0EDE6',
          muted: '#E8E4DB',
        },
        ink: {
          primary: '#1A1A1A',
          secondary: '#4A4A45',
          tertiary: '#6B6B65',
          muted: '#8A8A82',
          inverse: '#FDFCF8',
        },
        accent: {
          warm: '#B8860B',
          coral: '#C75B39',
          slate: '#5A6573',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
}
```

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-28 | 1.0.0 | Initial design system documentation |

---

## References

- **Article Reference**: `/root/openclaw/moltworker-repo/article.md`
- **Type Scale**: Based on 1.25 (major third) ratio
- **Color Palette**: Warm neutrals inspired by newsprint and aged paper
- **Typography**: Source Serif 4 (display), Inter (UI), JetBrains Mono (code)
