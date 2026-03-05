import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { MobileNav } from './MobileNav'
import {
  LayoutGrid,
  Bean,
  Package,
  PlusCircle,
  BookOpen,
  Bookmark,
  BarChart3,
  Download,
  Settings,
} from 'lucide-react'

interface AppShellProps {
  children: ReactNode
}

/* ------------------------------------------------------------------ */
/*  Nav data                                                          */
/* ------------------------------------------------------------------ */

const mainNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/brew/new', label: 'New Brew', icon: PlusCircle },
  { to: '/brew/history', label: 'Journal', icon: BookOpen },
  { to: '/setups', label: 'Saved Setups', icon: Bookmark },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
] as const

const secondaryNavItems = [
  { to: '/export', label: 'Export', icon: Download },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

/* ------------------------------------------------------------------ */
/*  Sidebar link                                                       */
/* ------------------------------------------------------------------ */

function sidebarLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    'group flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-250',
    isActive
      ? 'border-l-[4px] border-sienna-400 bg-espresso-800/70 text-cream-100 pl-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
      : 'border-l-[4px] border-transparent text-espresso-400 hover:bg-espresso-800/30 hover:text-sienna-300 pl-[10px]',
  ].join(' ')
}

/* ------------------------------------------------------------------ */
/*  AppShell                                                           */
/* ------------------------------------------------------------------ */

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-cream-100">
      {/* ── Desktop sidebar ── */}
      <aside className="paper-texture sidebar-stripe hidden w-72 shrink-0 flex-col bg-espresso-900 md:flex overflow-hidden">
        {/* Decorative top accent — thick warm bar */}
        <div className="h-1 w-full bg-gradient-to-r from-sienna-500 via-sienna-400 to-sienna-600 shrink-0" />

        {/* Logo area */}
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sienna-500/20 border border-sienna-500/30">
              <Bean size={22} strokeWidth={2} className="text-sienna-400" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-cream-50 block leading-tight">
                Brew Better
              </span>
              <span className="text-[11px] text-espresso-500 tracking-widest uppercase font-light">
                Coffee Journal
              </span>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex flex-1 flex-col px-4 pt-1">
          <div className="flex flex-col gap-0.5">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={sidebarLinkClass}
              >
                <item.icon size={20} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Separator — decorative line with dot */}
          <div className="relative mx-4 my-5">
            <div className="border-t border-espresso-700/50" />
            <div className="absolute left-1/2 -top-[3px] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-espresso-600" />
          </div>

          {/* Secondary nav */}
          <div className="flex flex-col gap-0.5">
            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={sidebarLinkClass}
              >
                <item.icon size={20} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom tagline with decorative element */}
        <div className="px-6 py-6">
          <div className="border-t border-espresso-700/40 pt-4">
            <p className="font-display text-[13px] italic text-espresso-500 leading-relaxed">
              craft your
              <span className="text-sienna-400"> perfect</span> cup
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main content column ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Accent top border — warm sienna gradient, thicker */}
        <div
          className="hidden h-[3px] shrink-0 md:block"
          style={{
            background:
              'linear-gradient(90deg, var(--color-sienna-500) 0%, var(--color-sienna-400) 30%, var(--color-cream-300) 100%)',
          }}
        />

        {/* Mobile header */}
        <header className="flex h-16 items-center border-b border-cream-200 bg-cream-50 px-5 md:hidden shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sienna-500/10">
              <Bean size={18} strokeWidth={2} className="text-sienna-500" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-espresso-900">
              Brew Better
            </span>
          </div>
        </header>

        {/* Content area */}
        <main className="paper-texture flex-1 overflow-y-auto bg-cream-100 p-5 pb-28 md:p-10 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  )
}
