import { Card } from '../components/ui/Card'

const APP_VERSION = '0.0.0'

export default function Settings() {
  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto animate-fade-in">
      <div className="space-y-1">
        <p className="kicker">Configuration</p>
        <h1 className="text-4xl md:text-5xl font-display text-foreground tracking-tight leading-[0.95]">
          Settings
        </h1>
      </div>

      {/* Theme Toggle Placeholder */}
      <Card className="space-y-2">
        <div className="flex items-center gap-4 mb-1">
          <h2 className="font-display text-foreground text-2xl tracking-tight shrink-0">Appearance</h2>
          <div className="flex-1 border-t border-secondary" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Theme customization coming soon. The app currently uses the
          light editorial theme.
        </p>
      </Card>

      {/* Database Info */}
      <Card className="space-y-3">
        <div className="flex items-center gap-4 mb-1">
          <h2 className="font-display text-foreground text-2xl tracking-tight shrink-0">Database</h2>
          <div className="flex-1 border-t border-secondary" />
        </div>
        <div className="flex items-center justify-between py-2 border-b border-secondary">
          <span className="data-label">Provider</span>
          <span className="text-sm data-value">
            SQLite (local)
          </span>
        </div>
      </Card>

      {/* App Version */}
      <Card className="space-y-3">
        <div className="flex items-center gap-4 mb-1">
          <h2 className="font-display text-foreground text-2xl tracking-tight shrink-0">About</h2>
          <div className="flex-1 border-t border-secondary" />
        </div>
        <div className="flex items-center justify-between py-2 border-b border-secondary">
          <span className="data-label">Version</span>
          <span className="text-sm data-value">
            v{APP_VERSION}
          </span>
        </div>
        <p className="text-xs font-mono text-muted-foreground pt-2 uppercase tracking-widest">
          Brew Better &mdash; craft your perfect cup
        </p>
      </Card>
    </div>
  )
}
