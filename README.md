# Brew Better

A local-first specialty coffee journal for tracking, refining, and understanding your brewing craft. Log every pour with granular parameters, build a personal inventory of beans and gear, rate your cups on a structured tasting framework, and let the app surface patterns in what you enjoy most — all running privately on your machine with zero cloud dependencies.

## Goals

- **Own your data** — Everything lives in a local SQLite database. No accounts, no cloud sync, no telemetry. Export anytime as JSON or CSV.
- **Brew with intention** — Capture the full picture of each brew: dose, water, ratio, temperature, bloom, pour count, brew time, and technique notes. Repeatable results start with repeatable records.
- **Develop your palate** — A structured tasting evaluation (acidity, sweet-bitter balance, body, aftertaste, overall enjoyment) turns subjective impressions into trackable data over time.
- **Surface your preferences** — Analytics automatically aggregate your tastings to reveal which origins, roast levels, processing methods, and brew types you consistently enjoy.
- **Reduce friction** — Saved setups let you capture your favorite equipment combinations (grinder + brewer + filter + water) and launch a brew log in one tap.

## What You Can Do

### Log Brews
Record every cup with a guided form: pick your beans, select equipment, dial in parameters (dose, water, temperature, bloom, pours, brew time), and add technique notes. Supports V60, Chemex, AeroPress, French Press, Espresso, and more.

### Taste & Rate
After brewing, run through a quick tasting evaluation — rate acidity feel, sweet-bitter balance, body, aftertaste, and overall enjoyment on simple scales. Add flavor notes and track your mindfulness level (focused, casual, or distracted).

### Manage Your Inventory
Keep a living catalog of your beans (origin, variety, processing, roast level, roast date) and equipment (grinders with grind-unit labels, brew devices, filters, water types). Scan a coffee bag with your camera to auto-fill bean details via AI vision.

### Build Saved Setups
Save named equipment combinations — your morning V60 rig, your weekend Chemex setup — and launch new brews from them instantly. Mark one as default.

### Review Your Journal
Browse your full brew history with date-range filtering and time-period presets (this week, this month, last 30 days). Tap into any entry for the complete detail view with recipe, tasting scores, and AI-generated brew commentary.

### Understand Your Taste
The analytics dashboard computes your taste profile automatically:
- **Bean performance** — Which beans score highest, how many times you've brewed each, average enjoyment rating
- **Preference breakdown** — Horizontal bar charts for origin, roast level, processing method, and brew type preferences ranked by average enjoyment
- **Quick insights** — Your favorite origin, roast, processing method, and total rated brews at a glance

### Export Your Data
Download your entire brew history as structured JSON (for backups) or CSV (for spreadsheets) with optional date-range filtering.

### Get AI Commentary
Optionally generate a short AI-written commentary on any brew, analyzing your parameters and tasting notes. Supports OpenAI and Anthropic as providers.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) with Turbopack |
| Frontend | React 19, TanStack Query v5 |
| Styling | Tailwind CSS v4 |
| Database | SQLite via Drizzle ORM + better-sqlite3 |
| AI (optional) | OpenAI (gpt-4o-mini) or Anthropic (Claude Sonnet) |

## Getting Started

```bash
# Install dependencies
npm install

# Push the database schema
npm run db:push

# (Optional) Seed with sample data
npm run db:seed

# Start dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Environment Variables (optional)

| Variable | Purpose | Default |
|---|---|---|
| `LLM_PROVIDER` | AI provider (`openai` or `anthropic`) | `openai` |
| `OPENAI_API_KEY` | OpenAI API key for brew commentary & bag scanning | — |
| `ANTHROPIC_API_KEY` | Anthropic API key (if using `anthropic` provider) | — |

AI features are entirely optional. The app works fully without any API keys.

## Project Structure

```
src/
  app/           Next.js App Router (pages + API route handlers)
  views/         Page-level React components
  components/    UI primitives and domain components
  hooks/         TanStack Query hooks per domain
  lib/           API client, brew type configs, utilities
  types/         TypeScript interfaces mirroring DB schema

server/
  db/            Schema, migrations, SQLite connection
  lib/           Analytics refresh, LLM provider abstraction
  prompts/       AI prompt templates
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |

---

*Brew Better — craft your perfect cup, one pour at a time.*
