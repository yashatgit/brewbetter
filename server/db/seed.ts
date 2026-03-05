import { sqliteDb as db } from './sqlite'
import { equipment, brewMethods } from './schema'
import { v4 as uuid } from 'uuid'

const equipmentData = [
  // Grinders
  { id: uuid(), type: 'grinder' as const, name: 'Niche Zero', brand: 'Niche', model: 'Zero', grindUnitLabel: 'Niche dial', isDefault: true },
  { id: uuid(), type: 'grinder' as const, name: '1Zpresso J-Max', brand: '1Zpresso', model: 'J-Max', grindUnitLabel: '1Zpresso clicks', isDefault: false },
  // Brew devices
  { id: uuid(), type: 'brew_device' as const, name: 'Hario V60 02', brand: 'Hario', model: 'V60 02', isDefault: true },
  { id: uuid(), type: 'brew_device' as const, name: 'Hario Switch', brand: 'Hario', model: 'Switch', isDefault: false },
  { id: uuid(), type: 'brew_device' as const, name: 'AeroPress', brand: 'AeroPress', model: 'Original', isDefault: false },
  // Filters
  { id: uuid(), type: 'filter' as const, name: 'V60 Paper (Bleached)', brand: 'Hario', isDefault: true },
  { id: uuid(), type: 'filter' as const, name: 'V60 Paper (Unbleached)', brand: 'Hario', isDefault: false },
  { id: uuid(), type: 'filter' as const, name: 'Cafec Abaca', brand: 'Cafec', isDefault: false },
  { id: uuid(), type: 'filter' as const, name: 'AeroPress Paper', brand: 'AeroPress', isDefault: false },
  // Water types
  { id: uuid(), type: 'water_type' as const, name: 'Home Filter', isDefault: true },
  { id: uuid(), type: 'water_type' as const, name: 'Bottled', isDefault: false },
  { id: uuid(), type: 'water_type' as const, name: 'Tap', isDefault: false },
  { id: uuid(), type: 'water_type' as const, name: 'Custom Mineral Recipe', isDefault: false },
]

const v60Method = {
  id: uuid(),
  name: 'V60 Pour Over',
  brewDeviceType: 'Hario V60 02',
  parameterSchema: {
    fields: [
      { name: 'coffeeDose', label: 'Coffee Dose', type: 'number', unit: 'g', required: true },
      { name: 'totalWater', label: 'Total Water', type: 'number', unit: 'g', required: true },
      { name: 'waterTemp', label: 'Water Temperature', type: 'number', unit: '°C', required: true },
      { name: 'grinderSetting', label: 'Grind Setting', type: 'text', required: true },
      { name: 'bloomWater', label: 'Bloom Water', type: 'number', unit: 'g', required: false },
      { name: 'bloomTime', label: 'Bloom Time', type: 'number', unit: 's', required: false },
      { name: 'numPours', label: 'Number of Pours', type: 'number', required: false },
      { name: 'totalBrewTime', label: 'Total Brew Time', type: 'time', unit: 's', required: true },
      { name: 'techniqueNotes', label: 'Technique Notes', type: 'textarea', required: false },
    ],
  },
}

async function seed() {
  console.log('Seeding database...')

  // Check if already seeded
  const existing = db.select().from(equipment).all()
  if (existing.length > 0) {
    console.log('Database already seeded, skipping.')
    return
  }

  for (const item of equipmentData) {
    db.insert(equipment).values(item).run()
  }
  console.log(`Inserted ${equipmentData.length} equipment items`)

  db.insert(brewMethods).values(v60Method).run()
  console.log('Inserted V60 Pour Over method')

  console.log('Seed complete!')
}

seed()
