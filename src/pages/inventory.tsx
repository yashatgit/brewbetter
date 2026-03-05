import BeansLibrary from './beans-library'
import EquipmentPage from './equipment'

export default function Inventory() {
  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl md:text-5xl font-display italic text-espresso-900 tracking-tight leading-[0.95]">
          Inventory
        </h1>
        <p className="text-sm text-espresso-500">
          Your beans and brewing gear
        </p>
      </div>

      {/* Beans section */}
      <section>
        <div className="flex items-center gap-4 mb-5">
          <h2 className="font-display text-2xl text-espresso-800 tracking-tight shrink-0">
            Beans
          </h2>
          <div className="flex-1 border-t border-cream-300" />
        </div>
        <BeansLibrary />
      </section>

      {/* Equipment section */}
      <section>
        <div className="flex items-center gap-4 mb-5">
          <h2 className="font-display text-2xl text-espresso-800 tracking-tight shrink-0">
            Equipment
          </h2>
          <div className="flex-1 border-t border-cream-300" />
        </div>
        <EquipmentPage />
      </section>
    </div>
  )
}
