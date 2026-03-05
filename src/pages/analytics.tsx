import { useState, useEffect } from 'react'
import { useBeanStats } from '../hooks/use-analytics'
import { usePreferenceScores } from '../hooks/use-analytics'
import { useBeans } from '../hooks/use-beans'
import { StarRating } from '../components/ui/StarRating'
import { formatDate } from '../lib/utils'
import { Bean, Globe, Flame, Droplets, Trophy, Medal } from 'lucide-react'
import type { PreferenceScore } from '../types/database'
import { Card } from '../components/ui/Card'
import { Link } from 'react-router-dom'

const CATEGORY_LABELS: Record<PreferenceScore['category'], string> = {
  origin: 'Origin',
  processing_method: 'Processing Method',
  roast_level: 'Roast Level',
  brew_type: 'Brew Type',
}

const CATEGORY_ORDER: PreferenceScore['category'][] = [
  'origin',
  'processing_method',
  'roast_level',
  'brew_type',
]

const LOADING_MESSAGES = [
  'Steeping insights...',
  'Measuring flavor profiles...',
  'Extracting your preferences...',
  'Dialing in the data...',
  'Cupping your numbers...',
]

function useRotatingMessage(messages: string[], interval = 2200) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, interval)
    return () => clearInterval(timer)
  }, [messages.length, interval])
  return messages[index]
}

export default function Analytics() {
  const { data: beanStats, isLoading: statsLoading } = useBeanStats()
  const { data: preferences, isLoading: prefsLoading } = usePreferenceScores()
  const { data: beans } = useBeans()

  const isLoading = statsLoading || prefsLoading
  const loadingMessage = useRotatingMessage(LOADING_MESSAGES)

  const beanNameMap = new Map(
    (beans ?? []).map((b: { id: string; name: string }) => [b.id, b.name])
  )

  // Quick insights from preferences
  const findFavorite = (category: PreferenceScore['category']) => {
    const items = (preferences ?? []).filter(
      (p) => p.category === category && (p.avgEnjoyment ?? 0) > 0 && p.brewCount >= 2
    )
    if (items.length === 0) return '-'
    items.sort((a, b) => (b.avgEnjoyment ?? 0) - (a.avgEnjoyment ?? 0))
    return items[0].value
  }

  const totalRated = (beanStats ?? []).reduce((sum, s) => sum + s.brewCount, 0)

  const sortedBeanStats = [...(beanStats ?? [])].sort(
    (a, b) => (b.avgEnjoyment ?? 0) - (a.avgEnjoyment ?? 0)
  )

  const topBean = sortedBeanStats.length > 0 && (sortedBeanStats[0].avgEnjoyment ?? 0) > 0
    ? sortedBeanStats[0]
    : null
  const restBeanStats = topBean ? sortedBeanStats.slice(1) : sortedBeanStats

  // Group preferences by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: (preferences ?? [])
      .filter((p) => p.category === cat && (p.avgEnjoyment ?? 0) > 0)
      .sort((a, b) => (b.avgEnjoyment ?? 0) - (a.avgEnjoyment ?? 0)),
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative mx-auto w-fit">
            <div className="animate-float">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <path d="M22 24 Q24 16 22 8" className="animate-steam opacity-40" />
                <path d="M32 22 Q34 12 32 4" className="animate-steam-delay-1 opacity-30" />
                <path d="M42 24 Q40 16 42 8" className="animate-steam-delay-2 opacity-40" />
                <path d="M12 28 h40 v4 Q50 56 32 56 Q14 56 12 32 Z" strokeWidth="1.5" />
                <path d="M52 32 Q60 32 60 40 Q60 48 52 48" />
                <ellipse cx="32" cy="58" rx="22" ry="4" />
              </svg>
            </div>
          </div>
          <p className="font-display text-muted-foreground text-lg transition-opacity duration-300">
            {loadingMessage}
          </p>
        </div>
      </div>
    )
  }

  const hasData = (beanStats ?? []).length > 0 || (preferences ?? []).length > 0

  if (!hasData) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="flex flex-col items-center text-center py-20 space-y-10">
          <div className="text-muted-foreground animate-float">
            <svg width="160" height="140" viewBox="0 0 160 140" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="20" y="90" width="16" height="30" className="fill-secondary/50" />
              <rect x="46" y="70" width="16" height="50" className="fill-secondary/50" />
              <rect x="72" y="50" width="16" height="70" className="fill-secondary/60" />
              <rect x="98" y="30" width="16" height="90" className="fill-primary/20" />
              <line x1="12" y1="122" x2="122" y2="122" className="opacity-30" />
              <ellipse cx="106" cy="24" rx="8" ry="10" className="opacity-40" />
              <path d="M106 14 Q103 24 106 34" className="opacity-30" />
              <path d="M130 18 L132 12 L134 18 L140 20 L134 22 L132 28 L130 22 L124 20 Z" className="opacity-20 fill-primary/30" strokeWidth="0.5" />
            </svg>
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-5xl text-foreground tracking-tight leading-tight">
              Your palate,<br />revealed
            </h1>
            <p className="font-body text-muted-foreground max-w-sm mx-auto leading-relaxed text-lg font-light">
              Brew and rate a few coffees to uncover your flavor fingerprint.
              We'll map your preferences as you explore.
            </p>
          </div>
          <Link
            to="/brew/new"
            className="group relative inline-flex items-center px-10 py-4 bg-primary text-primary-foreground font-display text-lg font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Start Brewing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-14 max-w-4xl animate-fade-in">
      {/* ── Hero Header ── */}
      <Card accent="editorial" className="p-8">
        <div>
          <p className="font-body text-muted-foreground text-xs tracking-[0.2em] uppercase font-medium mb-3">
            Your brewing patterns &amp; preferences
          </p>
          <h1 className="font-display text-6xl md:text-8xl text-foreground tracking-tight leading-[0.95]">
            Analytics
          </h1>
        </div>
      </Card>

      {/* ── Quick Insights — asymmetric grid ── */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 stagger-children">
          {/* Three text stats */}
          {[
            { value: findFavorite('origin'), label: 'Fav Origin', accent: 'border-l-data', icon: Globe },
            { value: findFavorite('roast_level'), label: 'Fav Roast', accent: 'border-l-data', icon: Flame },
            { value: findFavorite('processing_method'), label: 'Fav Process', accent: 'border-l-data', icon: Droplets },
          ].map((stat) => (
            <Card
              key={stat.label}
              accent="data"
              compact
              className="md:!p-6 hover:-translate-y-0.5"
            >
              <stat.icon size={14} strokeWidth={1.8} className="text-muted-foreground mb-3" />
              <p className="font-display text-xl md:text-2xl tracking-tight text-foreground leading-none truncate pt-1 pb-1">
                {stat.value}
              </p>
              <p className="font-body text-[11px] text-muted-foreground mt-2.5 uppercase tracking-[0.15em] font-medium">
                {stat.label}
              </p>
            </Card>
          ))}
          {/* Rated brews — hero stat, spans 2 cols */}
          <Card accent="muted" className="col-span-2 md:p-8 hover:-translate-y-0.5 flex flex-col justify-center">
            <p className="font-mono text-7xl md:text-8xl tracking-tighter text-foreground leading-none">
              {totalRated}
            </p>
            <p className="font-body text-[11px] text-muted-foreground mt-3 uppercase tracking-[0.15em] font-medium">
              Rated Brews
            </p>
          </Card>
        </div>
      </section>

      {/* ── Top Bean Hero ── */}
      {topBean && (
        <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Card className="md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-accent border-2 border-border">
                  <Trophy size={24} strokeWidth={1.8} className="text-data" />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-data uppercase tracking-[0.2em] font-semibold">
                    Top Performer
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl text-foreground tracking-tight leading-tight">
                    {beanNameMap.get(topBean.beanId) ?? 'Unknown Bean'}
                  </h3>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:ml-auto">
                <div>
                  <StarRating value={Math.round(topBean.avgEnjoyment ?? 0)} size="sm" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl text-foreground leading-none">{topBean.brewCount}</p>
                  <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mt-1">brews</p>
                </div>
                {topBean.avgRatio && (
                  <div className="text-center">
                    <p className="font-mono text-2xl text-foreground leading-none">1:{topBean.avgRatio.toFixed(1)}</p>
                    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mt-1">avg ratio</p>
                  </div>
                )}
                {topBean.avgDose && (
                  <div className="text-center">
                    <p className="font-mono text-2xl text-foreground leading-none">{topBean.avgDose.toFixed(1)}g</p>
                    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mt-1">avg dose</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* ── Bean Performance — remaining beans ── */}
      {restBeanStats.length > 0 && (
        <section className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-4">
            <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">
              Bean Performance
            </h2>
            <div className="flex-1 border-t border-input" />
          </div>
          <div className="border-2 border-border bg-background overflow-hidden">
            {/* Header row - desktop */}
            <div className="hidden sm:grid grid-cols-[1fr_80px_120px_80px_80px_100px] gap-4 px-6 py-3 border-b-2 border-border bg-muted">
              {['Bean', 'Brews', 'Enjoyment', 'Ratio', 'Dose', 'Last Brewed'].map((h) => (
                <span key={h} className="font-body text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-medium">
                  {h}
                </span>
              ))}
            </div>
            <div className="divide-y divide-border">
              {restBeanStats.map((stat, i) => {
                const isRunnerUp = i === 0 && (stat.avgEnjoyment ?? 0) > 0
                const isThird = i === 1 && (stat.avgEnjoyment ?? 0) > 0
                return (
                  <div
                    key={stat.beanId}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_80px_120px_80px_80px_100px] gap-2 sm:gap-4 px-6 py-4 sm:items-center hover:bg-muted transition-colors"
                  >
                    <span className="font-display text-lg sm:text-base text-foreground truncate tracking-tight flex items-center gap-2">
                      {isRunnerUp && <Medal size={16} strokeWidth={2} className="text-muted-foreground shrink-0" />}
                      {isThird && <Medal size={16} strokeWidth={2} className="text-data/50 shrink-0" />}
                      {beanNameMap.get(stat.beanId) ?? 'Unknown Bean'}
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      <span className="sm:hidden text-muted-foreground text-xs mr-1 font-body">Brews:</span>
                      {stat.brewCount}
                    </span>
                    <div>
                      {stat.avgEnjoyment ? (
                        <StarRating value={Math.round(stat.avgEnjoyment)} size="sm" />
                      ) : (
                        <span className="font-display text-xs text-muted-foreground">Unrated</span>
                      )}
                    </div>
                    <span className="font-mono text-sm text-foreground">
                      <span className="sm:hidden text-muted-foreground text-xs mr-1 font-body">Ratio:</span>
                      {stat.avgRatio ? `1:${stat.avgRatio.toFixed(1)}` : '-'}
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      <span className="sm:hidden text-muted-foreground text-xs mr-1 font-body">Dose:</span>
                      {stat.avgDose ? `${stat.avgDose.toFixed(1)}g` : '-'}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {stat.lastBrewedAt ? formatDate(stat.lastBrewedAt) : '-'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Taste Preferences ── */}
      {grouped.some((g) => g.items.length > 0) && (
        <section className="space-y-6 animate-slide-up" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center gap-4">
            <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">
              Taste Preferences
            </h2>
            <div className="flex-1 border-t border-input" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
            {grouped.map((group) =>
              group.items.length > 0 ? (
                <Card
                  key={group.category}
                  className="md:p-7 space-y-5 hover:-translate-y-0.5"
                >
                  <h3 className="font-display text-sm text-foreground tracking-wide">
                    {group.label}
                  </h3>
                  <div className="space-y-4">
                    {group.items.map((item, i) => {
                      const score = item.avgEnjoyment ?? 0
                      const pct = (score / 5) * 100
                      const isLeader = i === 0
                      return (
                        <div key={item.id} className="space-y-2 group/bar">
                          <div className="flex items-center justify-between">
                            <span className={`font-display tracking-tight ${
                              isLeader ? 'text-base text-foreground font-bold' : 'text-sm text-foreground'
                            }`}>
                              {item.value}
                              {isLeader && (
                                <span className="ml-2 inline-flex items-center bg-accent text-editorial border-2 border-border font-mono uppercase px-2 py-0.5 text-[10px] tracking-widest">
                                  top
                                </span>
                              )}
                            </span>
                            <span className="inline-flex items-center bg-muted px-2.5 py-0.5 text-[11px] font-mono text-foreground">
                              {item.brewCount} brew{item.brewCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="relative h-3.5 w-full bg-secondary overflow-hidden">
                            <div
                              className="h-full bg-primary animate-bar-fill"
                              style={{
                                width: `${pct}%`,
                                animationDelay: `${i * 100 + 300}ms`,
                              }}
                            />
                            {/* Hover tooltip — score */}
                            <div className="absolute inset-0 flex items-center justify-end pr-2.5 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 pointer-events-none">
                              <span className="text-[11px] font-mono font-bold text-foreground">
                                {score.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              ) : null
            )}
          </div>
        </section>
      )}
    </div>
  )
}
