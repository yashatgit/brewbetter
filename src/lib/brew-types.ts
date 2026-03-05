export interface BrewTypeField {
  name: string
  label: string
  type: 'number' | 'text' | 'boolean' | 'time'
  unit?: string
  placeholder?: string
  required?: boolean
  defaultValue?: string | number | boolean
  min?: number
  max?: number
  step?: number
}

export interface BrewTypeStandardFields {
  coffeeDose: boolean
  totalWater: boolean
  waterTemp: boolean
  grindSetting: boolean
  bloomWater: boolean
  bloomTime: boolean
  numPours: boolean
  totalBrewTime: boolean
  techniqueNotes: boolean
}

export type BrewTypeCategory = 'pour_over' | 'immersion' | 'hybrid' | 'pressure'

export interface BrewType {
  id: string
  name: string
  icon: string
  category: BrewTypeCategory
  standardFields: BrewTypeStandardFields
  extraFields: BrewTypeField[]
  defaults?: Partial<{
    coffeeDose: number
    totalWater: number
    waterTemp: number
    ratio: number
  }>
}

const ALL_STANDARD_ON: BrewTypeStandardFields = {
  coffeeDose: true,
  totalWater: true,
  waterTemp: true,
  grindSetting: true,
  bloomWater: true,
  bloomTime: true,
  numPours: true,
  totalBrewTime: true,
  techniqueNotes: true,
}

export const BREW_TYPES: BrewType[] = [
  {
    id: 'v60',
    name: 'V60',
    icon: '☕',
    category: 'pour_over',
    standardFields: ALL_STANDARD_ON,
    extraFields: [],
    defaults: { coffeeDose: 15, totalWater: 250, waterTemp: 96 },
  },
  {
    id: 'kalita_wave',
    name: 'Kalita Wave',
    icon: '🌊',
    category: 'pour_over',
    standardFields: ALL_STANDARD_ON,
    extraFields: [],
    defaults: { coffeeDose: 15, totalWater: 250, waterTemp: 94 },
  },
  {
    id: 'chemex',
    name: 'Chemex',
    icon: '🧪',
    category: 'pour_over',
    standardFields: ALL_STANDARD_ON,
    extraFields: [],
    defaults: { coffeeDose: 30, totalWater: 500, waterTemp: 96 },
  },
  {
    id: 'aeropress',
    name: 'AeroPress',
    icon: '💨',
    category: 'pressure',
    standardFields: {
      ...ALL_STANDARD_ON,
      numPours: false,
      bloomWater: false,
      bloomTime: false,
    },
    extraFields: [
      {
        name: 'inverted',
        label: 'Inverted Method',
        type: 'boolean',
        defaultValue: false,
      },
      {
        name: 'plungeTime',
        label: 'Plunge Time',
        type: 'number',
        unit: 's',
        placeholder: 'e.g. 30',
        min: 0,
        max: 300,
        step: 1,
      },
    ],
    defaults: { coffeeDose: 15, totalWater: 200, waterTemp: 85 },
  },
  {
    id: 'aeropress_inverted',
    name: 'AeroPress (Inverted)',
    icon: '🔄',
    category: 'pressure',
    standardFields: {
      ...ALL_STANDARD_ON,
      numPours: false,
      bloomWater: false,
      bloomTime: false,
    },
    extraFields: [
      {
        name: 'steepTime',
        label: 'Steep Time',
        type: 'number',
        unit: 's',
        placeholder: 'e.g. 60',
        min: 0,
        max: 600,
        step: 1,
      },
      {
        name: 'plungeTime',
        label: 'Plunge Time',
        type: 'number',
        unit: 's',
        placeholder: 'e.g. 30',
        min: 0,
        max: 300,
        step: 1,
      },
    ],
    defaults: { coffeeDose: 15, totalWater: 200, waterTemp: 85 },
  },
  {
    id: 'hario_switch',
    name: 'Hario Switch',
    icon: '🔀',
    category: 'hybrid',
    standardFields: {
      ...ALL_STANDARD_ON,
      numPours: false,
    },
    extraFields: [
      {
        name: 'immersionTime',
        label: 'Immersion Time',
        type: 'number',
        unit: 's',
        placeholder: 'e.g. 120',
        min: 0,
        max: 600,
        step: 1,
      },
      {
        name: 'drainTime',
        label: 'Drain Time',
        type: 'number',
        unit: 's',
        placeholder: 'e.g. 60',
        min: 0,
        max: 300,
        step: 1,
      },
    ],
    defaults: { coffeeDose: 15, totalWater: 250, waterTemp: 96 },
  },
  {
    id: 'french_press',
    name: 'French Press',
    icon: '🫖',
    category: 'immersion',
    standardFields: {
      ...ALL_STANDARD_ON,
      bloomWater: false,
      bloomTime: false,
      numPours: false,
    },
    extraFields: [
      {
        name: 'steepTime',
        label: 'Steep Time',
        type: 'number',
        unit: 's',
        placeholder: 'e.g. 240',
        min: 0,
        max: 600,
        step: 1,
      },
      {
        name: 'pressTime',
        label: 'Press Time',
        type: 'number',
        unit: 's',
        placeholder: 'e.g. 30',
        min: 0,
        max: 120,
        step: 1,
      },
    ],
    defaults: { coffeeDose: 18, totalWater: 300, waterTemp: 96 },
  },
  {
    id: 'clever_dripper',
    name: 'Clever Dripper',
    icon: '🎯',
    category: 'hybrid',
    standardFields: {
      ...ALL_STANDARD_ON,
      numPours: false,
    },
    extraFields: [
      {
        name: 'immersionTime',
        label: 'Immersion Time',
        type: 'number',
        unit: 's',
        placeholder: 'e.g. 180',
        min: 0,
        max: 600,
        step: 1,
      },
      {
        name: 'drainTime',
        label: 'Drain Time',
        type: 'number',
        unit: 's',
        placeholder: 'e.g. 90',
        min: 0,
        max: 300,
        step: 1,
      },
    ],
    defaults: { coffeeDose: 15, totalWater: 250, waterTemp: 94 },
  },
]

export const BREW_TYPE_MAP = Object.fromEntries(
  BREW_TYPES.map((bt) => [bt.id, bt])
) as Record<string, BrewType>

export const BREW_TYPE_CATEGORIES: { key: BrewTypeCategory; label: string }[] = [
  { key: 'pour_over', label: 'Pour Over' },
  { key: 'immersion', label: 'Immersion' },
  { key: 'hybrid', label: 'Hybrid' },
  { key: 'pressure', label: 'Pressure' },
]

export function getBrewType(id: string | null | undefined): BrewType | null {
  if (!id) return null
  return BREW_TYPE_MAP[id] ?? null
}
