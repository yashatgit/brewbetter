export type ProcessingMethod = 'washed' | 'natural' | 'honey' | 'anaerobic' | 'infused' | 'wet_hulled' | 'other'
export type RoastLevel = 'light' | 'medium_light' | 'medium' | 'medium_dark' | 'dark'
export type EquipmentType = 'grinder' | 'brew_device' | 'filter' | 'water_type'
export type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'evening'
export type BodyType = 'thin' | 'medium' | 'thick'
export type AftertastePleasant = 'pleasant' | 'neutral' | 'unpleasant'
export type Mindfulness = 'focused' | 'casual' | 'distracted'

export interface Bean {
  id: string
  name: string
  roaster: string
  originCountry: string
  originRegion?: string | null
  variety?: string | null
  processingMethod: ProcessingMethod
  roastLevel: RoastLevel
  roastDate: string
  altitudeMasl?: number | null
  bagWeightG?: number | null
  bagPhotoUrl?: string | null
  notes?: string | null
  isActive: boolean
  createdAt: string
}

export interface Equipment {
  id: string
  type: EquipmentType
  name: string
  brand?: string | null
  model?: string | null
  grindUnitLabel?: string | null
  isDefault: boolean
  lastUsedAt?: string | null
  createdAt: string
}

export interface BrewMethod {
  id: string
  name: string
  brewDeviceType: string
  parameterSchema: any
  createdAt: string
}

export interface BrewLog {
  id: string
  brewedAt: string
  timeOfDay: TimeOfDay
  beanId: string
  daysOffRoast: number
  grinderId: string
  grinderSetting: string
  brewDeviceId: string
  filterId?: string | null
  waterTypeId: string
  brewMethodId: string
  waterTemp: number
  coffeeDose: number
  totalWater: number
  ratio: number
  bloomWater?: number | null
  bloomTime?: number | null
  numPours?: number | null
  totalBrewTime: number
  techniqueNotes?: string | null
  brewTypeId?: string | null
  extraParams?: Record<string, any> | null
  updatedAt?: string | null
  aiCommentary?: string | null
  createdAt: string
}

export interface BeanStats {
  beanId: string
  brewCount: number
  avgEnjoyment?: number | null
  bestEnjoyment?: number | null
  avgRatio?: number | null
  avgDose?: number | null
  avgWaterTemp?: number | null
  lastBrewedAt?: string | null
  updatedAt: string
}

export interface PreferenceScore {
  id: string
  category: 'origin' | 'processing_method' | 'roast_level' | 'brew_type'
  value: string
  brewCount: number
  avgEnjoyment?: number | null
  avgAcidity?: number | null
  avgSweetBitter?: number | null
  updatedAt: string
}

export interface TastingEvaluation {
  id: string
  brewLogId: string
  acidityFeel: number
  sweetBitter: number
  body: BodyType
  aftertastePresence: boolean
  aftertastePleasant?: AftertastePleasant | null
  flavorNotes?: string | null
  overallEnjoyment: number
  personalNotes?: string | null
  mindfulness?: Mindfulness | null
  createdAt: string
}

export interface SavedSetup {
  id: string
  name: string
  grinderId: string
  defaultGrindSetting?: string | null
  brewDeviceId: string
  filterId?: string | null
  waterTypeId?: string | null
  brewMethodId: string
  defaultCoffeeDose?: number | null
  defaultTotalWater?: number | null
  defaultWaterTemp?: number | null
  isDefault: boolean
  lastUsedAt?: string | null
  createdAt: string
}

export interface BrewLogWithRelations extends BrewLog {
  bean?: Bean
  grinder?: Equipment
  brewDevice?: Equipment
  filter?: Equipment | null
  waterType?: Equipment
  brewMethod?: BrewMethod
  tasting?: TastingEvaluation | null
}
