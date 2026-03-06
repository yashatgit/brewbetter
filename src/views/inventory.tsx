import { useState } from 'react'
import BeansLibrary from './beans-library'
import EquipmentPage from './equipment'

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<'beans' | 'equipment'>('beans')

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="space-y-1 text-center md:text-left">
        <p className="kicker">Your Collection</p>
        <h1 className="text-4xl md:text-5xl font-display text-foreground tracking-tight leading-[0.95]">
          Inventory
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b-2 border-border">
        {(['beans', 'equipment'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${
              activeTab === tab
                ? 'text-editorial border-b-[3px] border-editorial -mb-[2px]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'beans' ? <BeansLibrary /> : <EquipmentPage />}
    </div>
  )
}
