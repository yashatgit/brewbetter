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
    'group flex items-center gap-3.5 px-3.5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-250 border-l-[2px]',
    isActive
      ? 'border-l-editorial text-editorial pl-[12px]'
      : 'border-l-transparent text-inverted-muted hover:text-inverted-foreground pl-[12px]',
  ].join(' ')
}

/* ------------------------------------------------------------------ */
/*  AppShell                                                           */
/* ------------------------------------------------------------------ */

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* -- Desktop sidebar (dark inverted — matches editorial topbar) -- */}
      <aside className="hidden w-64 shrink-0 flex-col bg-inverted border-r border-inverted md:flex overflow-hidden">
        {/* Logo area */}
        <div className="px-6 pt-7 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Bean size={20} strokeWidth={2} className="text-editorial" />
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-inverted-foreground block leading-tight">
                Brew Better
              </span>
              <span className="text-[10px] text-inverted-muted tracking-[0.2em] uppercase font-mono">
                Coffee Journal
              </span>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex flex-1 flex-col pt-4">
          <div className="flex flex-col gap-0.5">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={sidebarLinkClass}
              >
                <item.icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Separator */}
          <div className="mx-6 my-4 border-t border-white/10" />

          {/* Secondary nav */}
          <div className="flex flex-col gap-0.5">
            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={sidebarLinkClass}
              >
                <item.icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom tagline */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="font-mono text-[10px] text-inverted-muted uppercase tracking-widest">
            craft your perfect cup
          </p>
        </div>
      </aside>

      {/* -- Main content column -- */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile header (dark inverted) */}
        <header className="flex h-14 items-center border-b border-border bg-inverted px-5 md:hidden">
          <div className="flex items-center gap-2.5">
            <Bean size={16} strokeWidth={2} className="text-editorial" />
            <span className="font-display text-base font-bold tracking-tight text-inverted-foreground">
              Brew Better
            </span>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-background p-5 pb-28 md:p-10 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  )
}
