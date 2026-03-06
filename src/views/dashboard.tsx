import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBrewLogs } from '../hooks/use-brew-logs'
import { useSavedSetups } from '../hooks/use-saved-setups'
import { useBeans } from '../hooks/use-beans'
import { Card } from '../components/ui/Card'
import { StarRating } from '../components/ui/StarRating'
import { formatDate, formatTime } from '../lib/utils'
import { Bean, ArrowRight, Zap } from 'lucide-react'
import type { BrewLogWithRelations } from '../types/database'

function getBrewsThisWeek(brews: BrewLogWithRelations[]): number {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  return brews.filter((b) => new Date(b.brewedAt) >= startOfWeek).length
}

function getMostUsedBean(brews: BrewLogWithRelations[]): string {
  if (brews.length === 0) return '-'
  const counts: Record<string, { name: string; count: number }> = {}
  for (const brew of brews) {
    const name = brew.bean?.name ?? 'Unknown'
    const id = brew.beanId
    if (!counts[id]) counts[id] = { name, count: 0 }
    counts[id].count++
  }
  const sorted = Object.values(counts).sort((a, b) => b.count - a.count)
  return sorted[0]?.name ?? '-'
}

function getAverageRating(brews: BrewLogWithRelations[]): number {
  const rated = brews.filter((b) => b.tasting?.overallEnjoyment)
  if (rated.length === 0) return 0
  const sum = rated.reduce((acc, b) => acc + (b.tasting?.overallEnjoyment ?? 0), 0)
  return Math.round((sum / rated.length) * 10) / 10
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const router = useRouter()
  const { data: recentBrews, isLoading: brewsLoading } = useBrewLogs({ limit: '5' })
  const { data: allBrews } = useBrewLogs()
  const { data: setups } = useSavedSetups()
  const { data: beans } = useBeans()

  const brews = (recentBrews ?? []) as BrewLogWithRelations[]
  const allBrewsList = (allBrews ?? []) as BrewLogWithRelations[]
  const savedSetups = setups ?? []
  const hasBrews = allBrewsList.length > 0

  const { totalBrews, avgRating, mostUsedBean, brewsThisWeek } = useMemo(() => ({
    totalBrews: allBrewsList.length,
    avgRating: getAverageRating(allBrewsList),
    mostUsedBean: getMostUsedBean(allBrewsList),
    brewsThisWeek: getBrewsThisWeek(allBrewsList),
  }), [allBrewsList])

  if (brewsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="animate-float">
            <Bean size={48} strokeWidth={1.2} className="text-muted-foreground mx-auto" />
          </div>
          <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    )
  }

  // Empty state for first-time users
  if (!hasBrews && (!beans || beans.length === 0)) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="flex flex-col items-center text-center py-20 space-y-10">
          <div className="text-muted-foreground animate-float">
            <svg
              aria-hidden="true"
              width="160"
              height="160"
              viewBox="0 0 120 120"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M42 38 Q44 26 42 14" className="opacity-30" />
              <path d="M55 32 Q57 16 55 4" className="opacity-20" />
              <path d="M68 36 Q70 24 68 12" className="opacity-30" />
              <path d="M78 38 Q76 28 78 18" className="opacity-20" />
              <path d="M22 44 h76 v6 Q96 98 60 98 Q24 98 22 50 Z" strokeWidth="1.5" />
              <path d="M98 52 Q116 52 116 68 Q116 84 98 84" />
              <ellipse cx="60" cy="104" rx="44" ry="9" />
            </svg>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-5xl text-foreground tracking-tight leading-tight">
              Your journal<br />awaits
            </h1>
            <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-sm">
              Every great cup starts with a single pour. Begin logging your brews to uncover
              what makes your coffee truly yours.
            </p>
          </div>

          <Link
            href="/brew/new"
            className="group inline-flex items-center px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm transition-all duration-300 hover:bg-accent-foreground active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Start Your First Brew
            <ArrowRight size={18} strokeWidth={2.5} className="inline ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 max-w-4xl animate-fade-in">
      {/* -- Hero Welcome -- */}
      <section className="space-y-6">
        <div className="space-y-1 text-center md:text-left">
          <p className="kicker">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight leading-[0.95]">
            {getGreeting()}
          </h1>
        </div>

        {/* Hero CTA */}
        <button
          type="button"
          onClick={() => router.push('/brew/new')}
          className="group relative w-full text-left overflow-hidden bg-card border-2 border-border border-l-4 border-l-editorial p-6 md:p-8 cursor-pointer transition-all duration-300 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="kicker">
                Ready when you are
              </p>
              <p className="font-display text-3xl md:text-4xl text-foreground tracking-tight font-bold">
                Start a Brew
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-inverted transition-all duration-300">
              <ArrowRight size={24} strokeWidth={2} className="text-inverted-foreground transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </div>
        </button>

        {/* Quick setups */}
        {savedSetups.length > 0 && (
          <div className="flex flex-wrap gap-2.5 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono self-center mr-1">Quick:</span>
            {savedSetups.map((setup: { id: string; name: string }) => (
              <Link key={setup.id} href={`/brew/new?setup=${setup.id}`}>
                <span className="chip transition-all duration-200 hover:bg-editorial hover:text-white cursor-pointer gap-2 px-4 py-2">
                  <Zap size={12} strokeWidth={2.5} />
                  {setup.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* -- Stats Strip -- */}
      <section>
        <div className="grid grid-cols-2 gap-px sm:grid-cols-4 bg-border border-2 border-border stagger-children">
          {[
            { value: totalBrews, label: 'Brews', accent: 'border-l-editorial', isText: false },
            { value: avgRating > 0 ? avgRating.toString() : '-', label: 'Avg Rating', accent: 'border-l-data', isText: false },
            { value: mostUsedBean, label: 'Top Bean', accent: 'border-l-editorial', isText: true },
            { value: brewsThisWeek, label: 'This Week', accent: 'border-l-editorial', isText: false },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-background px-5 py-6 md:p-6 border-l-[3px] ${stat.accent}`}
            >
              <p className={`font-display tracking-tight text-foreground leading-none truncate ${stat.isText ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'}`}>
                {stat.value}
              </p>
              <p className="data-label mt-2.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* -- Recent Brews -- */}
      {brews.length > 0 && (
        <section className="space-y-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-tight shrink-0">
              Recent Brews
            </h2>
            <div className="hidden sm:block flex-1 border-t-[3px] border-border" />
            <Link
              href="/brew/history"
              className="text-xs font-bold uppercase tracking-widest text-editorial hover:text-editorial/80 transition-colors group"
            >
              View journal
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 ml-0.5">&rarr;</span>
            </Link>
          </div>

          <div className="space-y-px bg-border">
            {brews.map((brew, i) => (
              <Card
                key={brew.id}
                onClick={() => router.push(`/brew/${brew.id}`)}
                accent="muted"
                compact
                className="group hover:!border-l-editorial"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="min-w-0 space-y-1.5">
                    <h3 className="font-display text-xl text-foreground truncate tracking-tight group-hover:text-editorial transition-colors">
                      {brew.bean?.name ?? 'Unknown Bean'}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatDate(brew.brewedAt)} &middot; {formatTime(brew.brewedAt)}
                      </span>
                      {(brew.coffeeDose > 0 || brew.totalWater > 0) && (
                        <>
                          <span className="w-[2px] h-3 bg-secondary" />
                          <span className="font-mono text-xs text-muted-foreground">
                            {brew.coffeeDose}g &middot; {brew.totalWater}g
                            {brew.ratio > 0 && (
                              <> &middot; 1:{brew.ratio}</>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {brew.tasting?.overallEnjoyment ? (
                      <StarRating value={brew.tasting.overallEnjoyment} size="sm" />
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                        Unrated
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
