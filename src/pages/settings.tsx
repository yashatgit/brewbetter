const APP_VERSION = '0.0.0'

export default function Settings() {
  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-4xl md:text-5xl font-display italic text-espresso-900 tracking-tight leading-[0.95]">
          Settings
        </h1>
        <p className="text-espresso-500 text-sm">App preferences</p>
      </div>

      {/* Theme Toggle Placeholder */}
      <div className="rounded-2xl border border-cream-200 bg-white p-6 space-y-2">
        <div className="flex items-center gap-4 mb-1">
          <h2 className="font-display text-espresso-800 text-2xl tracking-tight shrink-0">Appearance</h2>
          <div className="flex-1 border-t border-cream-300" />
        </div>
        <p className="text-sm text-espresso-400 leading-relaxed">
          Theme customization coming soon. The app currently uses the default
          warm craft journal theme.
        </p>
      </div>

      {/* Database Info */}
      <div className="rounded-2xl border border-cream-200 bg-white p-6 space-y-3">
        <div className="flex items-center gap-4 mb-1">
          <h2 className="font-display text-espresso-800 text-2xl tracking-tight shrink-0">Database</h2>
          <div className="flex-1 border-t border-cream-300" />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-espresso-400">Provider</span>
          <span className="text-sm font-medium text-espresso-700">
            SQLite (local)
          </span>
        </div>
      </div>

      {/* App Version */}
      <div className="rounded-2xl border border-cream-200 bg-white p-6 space-y-3">
        <div className="flex items-center gap-4 mb-1">
          <h2 className="font-display text-espresso-800 text-2xl tracking-tight shrink-0">About</h2>
          <div className="flex-1 border-t border-cream-300" />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-espresso-400">App Version</span>
          <span className="text-sm font-medium text-espresso-700">
            v{APP_VERSION}
          </span>
        </div>
        <p className="text-xs text-espresso-400 pt-2 border-t border-cream-200 italic font-display">
          Brew Better &mdash; craft your perfect cup, one pour at a time.
        </p>
      </div>
    </div>
  )
}
