import { NavLink, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  Home,
  Package,
  Plus,
  BookOpen,
  MoreHorizontal,
  Bookmark,
  BarChart3,
  Download,
  Settings,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const moreLinks = [
  { to: '/setups', label: 'Saved Setups', icon: Bookmark },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/export', label: 'Export', icon: Download },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

/* ------------------------------------------------------------------ */
/*  Tab item                                                           */
/* ------------------------------------------------------------------ */

interface TabItemProps {
  to: string
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  end?: boolean
}

function TabItem({ to, label, icon: Icon, end }: TabItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-semibold tracking-wide transition-all duration-250',
          isActive
            ? 'text-sienna-600'
            : 'text-espresso-400 hover:text-espresso-600',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={22} strokeWidth={1.8} />
          <span>{label}</span>
          {/* Active dot indicator */}
          <span
            className={[
              'h-1.5 w-1.5 rounded-full transition-all duration-250',
              isActive ? 'bg-sienna-500 shadow-sm shadow-sienna-500/50' : 'bg-transparent',
            ].join(' ')}
          />
        </>
      )}
    </NavLink>
  )
}

/* ------------------------------------------------------------------ */
/*  MobileNav                                                          */
/* ------------------------------------------------------------------ */

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    setMoreOpen(false)
  }, [location.pathname])

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
    (link) => location.pathname === link.to || location.pathname.startsWith(link.to + '/')
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="relative bg-cream-50/95 backdrop-blur-lg border-t-2 border-cream-200 shadow-[0_-4px_20px_rgba(26,18,16,0.08)]">
        <div className="flex items-end justify-around px-1">
          <TabItem to="/" label="Home" icon={Home} end />
          <TabItem to="/inventory" label="Inventory" icon={Package} />

          {/* ── Center hero button ── */}
          <div className="flex flex-1 items-end justify-center">
            <NavLink
              to="/brew/new"
              className="-mt-5 mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sienna-500 to-sienna-700 text-white shadow-xl shadow-sienna-500/40 transition-all duration-250 ease-out hover:shadow-2xl hover:shadow-sienna-500/50 hover:scale-105 active:scale-95 ring-4 ring-cream-50 focus:outline-none focus-visible:ring-sienna-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
              aria-label="New Brew"
            >
              <Plus size={28} strokeWidth={2.5} />
            </NavLink>
          </div>

          <TabItem to="/brew/history" label="Journal" icon={BookOpen} />

          {/* More */}
          <div ref={menuRef} className="relative flex flex-1 flex-col items-center">
            <button
              type="button"
              onClick={() => setMoreOpen((prev) => !prev)}
              className={[
                'flex w-full flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-semibold tracking-wide transition-all duration-250',
                moreOpen || moreIsActive
                  ? 'text-sienna-600'
                  : 'text-espresso-400 hover:text-espresso-600',
              ].join(' ')}
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              <MoreHorizontal size={22} strokeWidth={1.8} />
              <span>More</span>
              <span
                className={[
                  'h-1.5 w-1.5 rounded-full transition-all duration-250',
                  moreOpen || moreIsActive ? 'bg-sienna-500 shadow-sm shadow-sienna-500/50' : 'bg-transparent',
                ].join(' ')}
              />
            </button>

            {/* Upward popover */}
            {moreOpen && (
              <div role="menu" className="absolute bottom-full right-0 mb-3 w-56 animate-fade-in-scale rounded-2xl border-2 border-cream-200 bg-cream-50/95 backdrop-blur-lg py-2 shadow-2xl shadow-espresso-900/12">
                {moreLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    role="menuitem"
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3.5 px-5 py-3 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-sienna-500/8 text-sienna-600'
                          : 'text-espresso-600 hover:bg-cream-200/60 hover:text-espresso-900',
                      ].join(' ')
                    }
                  >
                    <link.icon size={18} strokeWidth={1.8} />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
