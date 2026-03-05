'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
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
  Home,
  Plus,
  MoreHorizontal,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Nav data                                                          */
/* ------------------------------------------------------------------ */

const mainNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid, exact: true },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/brew/new', label: 'New Brew', icon: PlusCircle },
  { href: '/brew/history', label: 'Journal', icon: BookOpen },
  { href: '/setups', label: 'Saved Setups', icon: Bookmark },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
] as const

const secondaryNavItems = [
  { href: '/export', label: 'Export', icon: Download },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

const moreLinks = [
  { href: '/setups', label: 'Saved Setups', icon: Bookmark },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/export', label: 'Export', icon: Download },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isLinkActive(pathname: string | null, href: string, exact?: boolean): boolean {
  if (!pathname) return false
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + '/')
}

function sidebarLinkClass(isActive: boolean): string {
  return [
    'group flex items-center gap-3.5 px-3.5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-250 border-l-[2px]',
    isActive
      ? 'border-l-editorial text-editorial pl-[12px]'
      : 'border-l-transparent text-inverted-muted hover:text-inverted-foreground pl-[12px]',
  ].join(' ')
}

/* ------------------------------------------------------------------ */
/*  MobileNav                                                          */
/* ------------------------------------------------------------------ */

function MobileTabItem({
  href,
  label,
  icon: Icon,
  exact,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  exact?: boolean
}) {
  const pathname = usePathname()
  const isActive = isLinkActive(pathname, href, exact)

  return (
    <Link
      href={href}
      className={[
        'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-250',
        isActive
          ? 'text-editorial'
          : 'text-inverted-muted hover:text-inverted-foreground',
      ].join(' ')}
    >
      <Icon size={20} strokeWidth={1.8} />
      <span>{label}</span>
      {isActive && <span className="h-[2px] w-4 bg-editorial mt-0.5" />}
    </Link>
  )
}

function MobileNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const prevPathnameRef = useRef(pathname)
  if (prevPathnameRef.current !== pathname) {
    prevPathnameRef.current = pathname
    if (moreOpen) setMoreOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMoreOpen(false)
      }
    }

    if (moreOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [moreOpen])

  const moreIsActive = moreLinks.some(
    (link) => pathname === link.href || pathname?.startsWith(link.href + '/')
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="relative bg-inverted border-t border-white/10">
        <div className="flex items-end justify-around px-1">
          <MobileTabItem href="/" label="Home" icon={Home} exact />
          <MobileTabItem href="/inventory" label="Inventory" icon={Package} />

          {/* -- Center hero button -- */}
          <div className="flex flex-1 items-end justify-center">
            <Link
              href="/brew/new"
              className="-mt-4 mb-2 flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground transition-all duration-250 ease-out hover:bg-editorial active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-inverted"
              aria-label="New Brew"
            >
              <Plus size={24} strokeWidth={2.5} />
            </Link>
          </div>

          <MobileTabItem href="/brew/history" label="Journal" icon={BookOpen} />

          {/* More */}
          <div ref={menuRef} className="relative flex flex-1 flex-col items-center">
            <button
              type="button"
              onClick={() => setMoreOpen((prev) => !prev)}
              className={[
                'flex w-full flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-250',
                moreOpen || moreIsActive
                  ? 'text-editorial'
                  : 'text-inverted-muted hover:text-inverted-foreground',
              ].join(' ')}
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              <MoreHorizontal size={20} strokeWidth={1.8} />
              <span>More</span>
              {(moreOpen || moreIsActive) && (
                <span className="h-[2px] w-4 bg-editorial mt-0.5" />
              )}
            </button>

            {/* Upward popover */}
            {moreOpen && (
              <div
                role="menu"
                className="absolute bottom-full right-0 mb-3 w-56 animate-fade-in-scale border-2 border-border bg-card py-2"
              >
                {moreLinks.map((link) => {
                  const active = isLinkActive(pathname, link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      onClick={() => setMoreOpen(false)}
                      className={[
                        'flex items-center gap-3.5 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200',
                        active
                          ? 'bg-accent text-editorial'
                          : 'text-secondary-foreground hover:bg-muted hover:text-foreground',
                      ].join(' ')}
                    >
                      <link.icon size={16} strokeWidth={1.8} />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  Shell                                                              */
/* ------------------------------------------------------------------ */

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background">
      {/* -- Desktop sidebar (dark inverted) -- */}
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
            {mainNavItems.map((item) => {
              const active = isLinkActive(pathname, item.href, 'exact' in item ? item.exact : undefined)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={sidebarLinkClass(active)}
                >
                  <item.icon size={18} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Separator */}
          <div className="mx-6 my-4 border-t border-white/10" />

          {/* Secondary nav */}
          <div className="flex flex-col gap-0.5">
            {secondaryNavItems.map((item) => {
              const active = isLinkActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={sidebarLinkClass(active)}
                >
                  <item.icon size={18} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
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
