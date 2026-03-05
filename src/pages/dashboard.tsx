import { Link, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const { data: recentBrews, isLoading: brewsLoading } = useBrewLogs({ limit: '5' })
  const { data: allBrews } = useBrewLogs()
  const { data: setups } = useSavedSetups()
  const { data: beans } = useBeans()

  const brews = (recentBrews ?? []) as BrewLogWithRelations[]
  const allBrewsList = (allBrews ?? []) as BrewLogWithRelations[]
  const savedSetups = setups ?? []
  const hasBrews = allBrewsList.length > 0

  const totalBrews = allBrewsList.length
  const avgRating = getAverageRating(allBrewsList)
  const mostUsedBean = getMostUsedBean(allBrewsList)
  const brewsThisWeek = getBrewsThisWeek(allBrewsList)

  if (brewsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="animate-float">
            <Bean size={48} strokeWidth={1.2} className="text-espresso-300 mx-auto" />
          </div>
          <p className="font-display italic text-espresso-400 text-lg">Brewing your journal...</p>
        </div>
      </div>
    )
  }

  // Empty state for first-time users
  if (!hasBrews && (!beans || beans.length === 0)) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="flex flex-col items-center text-center py-20 space-y-10">
          {/* Large coffee cup illustration */}
          <div className="text-espresso-200 animate-float">
            <svg
              width="160"
              height="160"
              viewBox="0 0 120 120"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Steam wisps — animated feel */}
              <path d="M42 38 Q44 26 42 14" className="opacity-30" />
              <path d="M55 32 Q57 16 55 4" className="opacity-20" />
              <path d="M68 36 Q70 24 68 12" className="opacity-30" />
              <path d="M78 38 Q76 28 78 18" className="opacity-20" />
              {/* Cup body — larger */}
              <path d="M22 44 h76 v6 Q96 98 60 98 Q24 98 22 50 Z" strokeWidth="1.5" />
              {/* Handle */}
              <path d="M98 52 Q116 52 116 68 Q116 84 98 84" />
              {/* Saucer */}
              <ellipse cx="60" cy="104" rx="44" ry="9" />
            </svg>
          </div>

          <div className="space-y-4">
            <h1 className="font-display italic text-5xl text-espresso-800 tracking-tight leading-tight">
              Your journal<br />awaits
            </h1>
            <p className="font-body text-espresso-400 max-w-sm mx-auto leading-relaxed text-lg font-light">
              Every great cup starts with a single pour. Begin logging your brews to uncover
              what makes your coffee truly yours.
            </p>
          </div>

          <Link
            to="/brew/new"
            className="group relative inline-flex items-center px-10 py-4 rounded-2xl bg-gradient-to-br from-sienna-500 to-sienna-700 text-cream-50 font-display text-lg font-semibold warm-glow transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100"
          >
            Start Your First Brew
            <ArrowRight size={20} strokeWidth={2.5} className="inline ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 max-w-4xl animate-fade-in">
      {/* ── Hero Welcome ── */}
      <section className="space-y-6">
        <div className="space-y-1">
          <p className="text-espresso-400 font-body text-sm tracking-widest uppercase font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-display text-6xl md:text-7xl text-espresso-900 tracking-tight leading-[0.95]">
            {getGreeting()}
          </h1>
        </div>

        {/* Hero CTA — dramatic, full-width */}
        <button
          type="button"
          onClick={() => navigate('/brew/new')}
          className="group relative w-full text-left overflow-hidden rounded-3xl bg-gradient-to-br from-espresso-800 via-espresso-900 to-espresso-950 p-8 md:p-10 text-cream-50 cursor-pointer warm-glow transition-all duration-300 hover:scale-[1.01] active:scale-[0.995] focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }} />
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-sienna-500/10 blur-3xl" />
          <div className="absolute -left-8 -bottom-8 w-48 h-48 rounded-full bg-sienna-400/5 blur-2xl" />

          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <p className="font-body text-espresso-400 text-sm tracking-widest uppercase font-light">
                Ready when you are
              </p>
              <p className="font-display text-3xl md:text-4xl text-cream-50 tracking-tight font-bold">
                Start a Brew
              </p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-sienna-500/20 border border-sienna-500/30 backdrop-blur-sm group-hover:bg-sienna-500/30 transition-all duration-300">
              <ArrowRight size={28} strokeWidth={2} className="text-sienna-300 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </div>
        </button>

        {/* Quick setups */}
        {savedSetups.length > 0 && (
          <div className="flex flex-wrap gap-2.5 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <span className="text-[11px] text-espresso-400 uppercase tracking-widest font-medium self-center mr-1">Quick:</span>
            {savedSetups.map((setup: { id: string; name: string }) => (
              <Link key={setup.id} to={`/brew/new?setup=${setup.id}`}>
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-cream-300 bg-cream-50 px-5 py-2 text-sm font-medium text-espresso-600 transition-all duration-200 hover:border-sienna-400 hover:bg-sienna-500/5 hover:text-sienna-600 hover:shadow-md cursor-pointer">
                  <Zap size={12} strokeWidth={2.5} className="text-sienna-400" />
                  {setup.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Stats Strip — dramatic numbers ── */}
      <section>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 stagger-children">
          {[
            { value: totalBrews, label: 'Brews', accent: 'border-l-sienna-500' },
            { value: avgRating > 0 ? avgRating.toString() : '-', label: 'Avg Rating', accent: 'border-l-amber-400' },
            { value: mostUsedBean, label: 'Top Bean', accent: 'border-l-sage-500', isText: true },
            { value: brewsThisWeek, label: 'This Week', accent: 'border-l-espresso-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border border-cream-200 bg-cream-50 p-5 md:p-6 border-l-[5px] ${stat.accent} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
            >
              <p className={`font-display tracking-tight text-espresso-900 leading-none ${
                stat.isText ? 'text-xl md:text-2xl truncate pt-2 pb-1' : 'text-5xl md:text-6xl'
              }`}>
                {stat.value}
              </p>
              <p className="font-body text-[11px] text-espresso-400 mt-2.5 uppercase tracking-[0.15em] font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent Brews ── */}
      {brews.length > 0 && (
        <section className="space-y-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-3xl md:text-4xl text-espresso-900 tracking-tight shrink-0">
              Recent Brews
            </h2>
            <div className="hidden sm:block flex-1 border-t border-cream-300" />
            <Link
              to="/brew/history"
              className="font-body text-sm font-medium text-sienna-500 hover:text-sienna-700 transition-colors group"
            >
              View journal
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 ml-0.5">&rarr;</span>
            </Link>
          </div>

          <div className="space-y-3">
            {brews.map((brew, i) => (
              <Card
                key={brew.id}
                onClick={() => navigate(`/brew/${brew.id}`)}
                className="group !border-l-[5px] !border-l-transparent hover:!border-l-sienna-400 transition-all duration-250 !py-5 !px-6 hover:!shadow-lg"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="min-w-0 space-y-1.5">
                    <h3 className="font-display text-xl text-espresso-900 truncate tracking-tight group-hover:text-sienna-700 transition-colors">
                      {brew.bean?.name ?? 'Unknown Bean'}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="font-body text-xs text-espresso-400 font-medium">
                        {formatDate(brew.brewedAt)} &middot; {formatTime(brew.brewedAt)}
                      </span>
                      {(brew.coffeeDose > 0 || brew.totalWater > 0) && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-cream-300" />
                          <span className="font-body text-xs text-espresso-300 font-light">
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
                      <span className="font-display text-xs text-espresso-300 italic">
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
