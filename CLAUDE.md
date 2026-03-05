# Brew Better — Design System & Coding Guidelines

## Theme: Bold Editorial (Light)

Magazine-grade typography on warm cream backgrounds with dramatic dark borders and
burnt red (#C44B2B) accent. Inspired by high-end print editorial design.

## The Three-Layer Rule

```
Primitives (cream-50, espresso-400, rose-400)
    ↓ defined once in @theme
Semantic Tokens (card, foreground, muted-foreground, editorial)
    ↓ used in component code
Component Styles (bg-card, text-foreground, text-editorial)
```

**Never reference a primitive in component code.** Always use semantic tokens.

## Color Palette Summary

| Role | Color | Hex |
|------|-------|-----|
| Background | Warm cream | #FAF7F2 |
| Card surface | White | #FFFFFF |
| Text (primary) | Near-black | #1A1A1A |
| Text (secondary) | Dark gray | #555555 |
| Text (muted) | Mid gray | #999999 |
| Accent (editorial) | Burnt red | #C44B2B |
| Borders | Near-black | #1A1A1A |
| Inverted surface | Near-black | #1A1A1A |
| Subtle fills | Light cream | #F0EDE6 |

**No amber. No gradients. Red is the ONLY accent color.**

## Semantic Token Vocabulary

### Surfaces (backgrounds)

| Token | Tailwind Class | Use |
|-------|---------------|-----|
| background | `bg-background` | Page canvas (#FAF7F2 cream) |
| card | `bg-card` | Panels, cards, elevated surfaces (#FFFFFF white) |
| muted | `bg-muted` | Subtle fills, hover states, tags (#F0EDE6) |
| accent | `bg-accent` | Selected/active item background (#FFF5F2 light red tint) |
| primary | `bg-primary` | Primary buttons (#C44B2B red) |
| destructive | `bg-destructive` | Danger buttons, error backgrounds |
| success | `bg-success` | Success states (#4A7744 green) |
| secondary | `bg-secondary` | Subtle borders as bg, tracks (#E0DDD6) |
| inverted | `bg-inverted` | Dark blocks: sidebar, navbars, score panels (#1A1A1A) |

### Text (3-tier hierarchy)

| Tier | Class | Purpose |
|------|-------|---------|
| **Primary** | `text-foreground` | Headings, titles (#1A1A1A) |
| **Secondary** | `text-secondary-foreground` | Body text, descriptions (#555555) |
| **Muted** | `text-muted-foreground` | Timestamps, placeholders (#999999) |

Default body text is `text-secondary-foreground`. Only use `text-muted-foreground` for genuinely
supplementary content.

### Foreground Pairings

Every surface has a foreground partner:

| Background | Text on it |
|-----------|-----------|
| `bg-primary` | `text-primary-foreground` (#FFFFFF) |
| `bg-destructive` | `text-destructive-foreground` (#FFFFFF) |
| `bg-card` | `text-card-foreground` (#1A1A1A) |
| `bg-accent` | `text-accent-foreground` (#C44B2B) |
| `bg-success` | `text-success-foreground` (#FFFFFF) |
| `bg-inverted` | `text-inverted-foreground` (#FAF7F2) |

### App-Specific Tokens

| Class | Color | Purpose |
|-------|-------|---------|
| `text-editorial` | #C44B2B (burnt red) | Kickers, accent text, scores, active nav |
| `text-data` | #C44B2B (burnt red) | Data emphasis, scores |
| `border-editorial` | #C44B2B | Left accent stripes on cards |
| `text-inverted-muted` | #888888 | Muted text on dark surfaces (sidebar, nav) |

### Edges

| Class | Purpose |
|-------|---------|
| `border-border` | Heavy dark borders (#1A1A1A) — always 2px for structural |
| `border-input` | Input field borders (#1A1A1A) |
| `ring-ring` | Focus rings (#C44B2B red) |
| `border-secondary` | Subtle/light borders (#E0DDD6) |

## Typography Rules

| Font | Class | Use For |
|------|-------|---------|
| Playfair Display | `font-display` | Page titles, section headings, large display numbers |
| DM Sans | `font-body` (default) | Body text, descriptions, form labels |
| Space Mono | `font-mono` | Data values, kickers, labels, timestamps, scores |

## Semantic CSS Utility Classes

Use these instead of duplicating Tailwind strings:

| Class | What it renders | Key visual |
|-------|----------------|-----------|
| `.kicker` | Red mono label above titles | Red uppercase tracking-wide |
| `.data-label` | Dim mono key label | Gray uppercase tracking-wide |
| `.data-value` | Red mono value | Red bold mono |
| `.data-grid` | Grid with 1px dark separators | Dark gaps, cream cells |
| `.select-card` | Selectable panel | 2px light border, white bg |
| `.select-card--active` | Selected state | Red border, light red bg |
| `.chip` / `.chip--active` | Dark inverted tag | Dark bg, light text |
| `.divider-thick` | 3px editorial rule | Dark 3px bar |
| `.divider-thin` | 1px separator | Light 1px line |

## Visual Rules

### DO
- Sharp corners on all structural elements
- 5px red left accent stripes on cards (border-l-[5px])
- 2px borders on structural elements (border-2)
- Red (#C44B2B) for ALL accents: kickers, buttons, stripes, scores, active nav, selected states
- Near-black (#1A1A1A) for heavy borders — signature editorial look
- Dark inverted blocks for sidebar, nav bars, score displays, chips
- Font-mono on all numerical data displays
- Uppercase tracking-widest on labels
- Thick 3px dividers between major sections
- White (#FFFFFF) inputs with dark borders

### DON'T
- No amber/gold (#D4A744) — that's Dark Lab, not Editorial
- No `rounded-*` on structural elements
- No gradients (`bg-gradient-*`)
- No decorative shadows (`shadow-*`)
- No italic on headings
- No primitive colors in component code (`cream-*`, `espresso-*`, `rose-*`)
- No `text-white` or hardcoded hex — use inverted-foreground or primary-foreground
- No opacity to fake text hierarchy (`text-foreground/50`) — use the 3-tier system

## Self-Check Before Writing Styles

1. Does any class contain a primitive name? → Replace with semantic token
2. Does every `bg-*` have a matching `text-*-foreground`? → Pair them
3. Is the text color the right tier? Heading → foreground, Body → secondary-foreground, Helper → muted-foreground
4. Am I duplicating a pattern that has a CSS utility? → Use `.kicker`, `.data-label`, `.data-value`, etc.
5. Am I using amber anywhere? → Replace with red/editorial
6. Are structural borders 2px? → Use `border-2`
7. Does this element need a dark inverted surface? → Use `bg-inverted text-inverted-foreground`

## Tech Stack

- Next.js 15 (App Router) with Turbopack
- React 19, TanStack Query v5
- Tailwind CSS v4 with `@tailwindcss/postcss` and `@theme` block in `src/index.css`
- All pages are Client Components using TanStack Query for data fetching
- API routes in `app/api/` (Next.js Route Handlers replacing Express)
- Server code (DB, schema, analytics, LLM) in `server/`
- SQLite via better-sqlite3 + Drizzle ORM
- UI components in `src/components/ui/` (Button, Card, Badge, Input, Select, Slider, StarRating, Dialog)
- Design tokens defined in `src/index.css` @theme block
