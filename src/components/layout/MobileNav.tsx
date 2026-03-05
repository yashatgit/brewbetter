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
          'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-250',
          isActive
            ? 'text-editorial'
            : 'text-inverted-muted hover:text-inverted-foreground',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} strokeWidth={1.8} />
          <span>{label}</span>
          {isActive && (
            <span className="h-[2px] w-4 bg-editorial mt-0.5" />
          )}
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
      <div className="relative bg-inverted border-t border-white/10">
        <div className="flex items-end justify-around px-1">
          <TabItem to="/" label="Home" icon={Home} end />
          <TabItem to="/inventory" label="Inventory" icon={Package} />

          {/* -- Center hero button -- */}
          <div className="flex flex-1 items-end justify-center">
            <NavLink
              to="/brew/new"
              className="-mt-4 mb-2 flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground transition-all duration-250 ease-out hover:bg-editorial active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-inverted"
              aria-label="New Brew"
            >
              <Plus size={24} strokeWidth={2.5} />
            </NavLink>
          </div>

          <TabItem to="/brew/history" label="Journal" icon={BookOpen} />

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
              <div role="menu" className="absolute bottom-full right-0 mb-3 w-56 animate-fade-in-scale border-2 border-border bg-card py-2">
                {moreLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    role="menuitem"
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3.5 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200',
                        isActive
                          ? 'bg-accent text-editorial'
                          : 'text-secondary-foreground hover:bg-muted hover:text-foreground',
                      ].join(' ')
                    }
                  >
                    <link.icon size={16} strokeWidth={1.8} />
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
