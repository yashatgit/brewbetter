import BeansLibrary from './beans-library'
import EquipmentPage from './equipment'

export default function Inventory() {
  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <p className="kicker">Your Collection</p>
        <h1 className="text-4xl md:text-5xl font-display text-foreground tracking-tight leading-[0.95]">
          Inventory
        </h1>
      </div>

      {/* Beans section */}
      <section>
        <div className="flex items-center gap-4 mb-5">
          <h2 className="font-display text-2xl text-foreground tracking-tight shrink-0">
            Beans
          </h2>
          <div className="flex-1 border-t border-input" />
        </div>
        <BeansLibrary />
      </section>

      {/* Equipment section */}
      <section>
        <div className="flex items-center gap-4 mb-5">
          <h2 className="font-display text-2xl text-foreground tracking-tight shrink-0">
            Equipment
          </h2>
          <div className="flex-1 border-t border-input" />
        </div>
        <EquipmentPage />
      </section>
    </div>
  )
}
