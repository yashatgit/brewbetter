import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const beans = sqliteTable('beans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  roaster: text('roaster').notNull(),
  originCountry: text('origin_country').notNull(),
  originRegion: text('origin_region'),
  variety: text('variety'),
  processingMethod: text('processing_method', {
    enum: ['washed', 'natural', 'honey', 'anaerobic', 'infused', 'wet_hulled', 'other'],
  }).notNull(),
  roastLevel: text('roast_level', {
    enum: ['light', 'medium_light', 'medium', 'medium_dark', 'dark'],
  }).notNull(),
  roastDate: text('roast_date').notNull(),
  altitudeMasl: integer('altitude_masl'),
  bagWeightG: integer('bag_weight_g'),
  bagPhotoUrl: text('bag_photo_url'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const equipment = sqliteTable('equipment', {
  id: text('id').primaryKey(),
  type: text('type', {
    enum: ['grinder', 'brew_device', 'filter', 'water_type'],
  }).notNull(),
  name: text('name').notNull(),
  brand: text('brand'),
  model: text('model'),
  grindUnitLabel: text('grind_unit_label'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  lastUsedAt: text('last_used_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const brewMethods = sqliteTable('brew_methods', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  brewDeviceType: text('brew_device_type').notNull(),
  parameterSchema: text('parameter_schema', { mode: 'json' }).notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const brewLogs = sqliteTable('brew_logs', {
  id: text('id').primaryKey(),
  brewedAt: text('brewed_at').notNull(),
  timeOfDay: text('time_of_day', {
    enum: ['morning', 'midday', 'afternoon', 'evening'],
  }).notNull(),
  beanId: text('bean_id')
    .notNull()
    .references(() => beans.id),
  daysOffRoast: integer('days_off_roast').notNull(),
  grinderId: text('grinder_id')
    .notNull()
    .references(() => equipment.id),
  grinderSetting: text('grinder_setting').notNull(),
  brewDeviceId: text('brew_device_id')
    .notNull()
    .references(() => equipment.id),
  filterId: text('filter_id').references(() => equipment.id),
  waterTypeId: text('water_type_id')
    .notNull()
    .references(() => equipment.id),
  brewMethodId: text('brew_method_id')
    .notNull()
    .references(() => brewMethods.id),
  waterTemp: integer('water_temp').notNull(),
  coffeeDose: real('coffee_dose').notNull(),
  totalWater: real('total_water').notNull(),
  ratio: real('ratio').notNull(),
  bloomWater: real('bloom_water'),
  bloomTime: integer('bloom_time'),
  numPours: integer('num_pours'),
  totalBrewTime: integer('total_brew_time').notNull(),
  techniqueNotes: text('technique_notes'),
  brewTypeId: text('brew_type_id'),
  extraParams: text('extra_params', { mode: 'json' }),
  updatedAt: text('updated_at'),
  aiCommentary: text('ai_commentary'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const tastingEvaluations = sqliteTable('tasting_evaluations', {
  id: text('id').primaryKey(),
  brewLogId: text('brew_log_id')
    .notNull()
    .unique()
    .references(() => brewLogs.id),
  sweetness: integer('sweetness').notNull(),
  sourness: integer('sourness').notNull(),
  bitterness: integer('bitterness').notNull(),
  sweetnessDirection: text('sweetness_direction', {
    enum: ['wanted_less', 'just_right', 'wanted_more'],
  }),
  sournessDirection: text('sourness_direction', {
    enum: ['wanted_less', 'just_right', 'wanted_more'],
  }),
  bitternessDirection: text('bitterness_direction', {
    enum: ['wanted_less', 'just_right', 'wanted_more'],
  }),
  body: text('body', { enum: ['thin', 'medium', 'thick'] }).notNull(),
  bodyDirection: text('body_direction', {
    enum: ['wanted_lighter', 'just_right', 'wanted_heavier'],
  }),
  flavorTags: text('flavor_tags'),
  aftertastePresence: integer('aftertaste_presence', { mode: 'boolean' }).notNull(),
  aftertastePleasant: text('aftertaste_pleasant', {
    enum: ['pleasant', 'neutral', 'unpleasant'],
  }),
  flavorNotes: text('flavor_notes'),
  overallEnjoyment: integer('overall_enjoyment').notNull(),
  personalNotes: text('personal_notes'),
  mindfulness: text('mindfulness', {
    enum: ['focused', 'casual', 'distracted'],
  }),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const savedSetups = sqliteTable('saved_setups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  grinderId: text('grinder_id')
    .notNull()
    .references(() => equipment.id),
  defaultGrindSetting: text('default_grind_setting'),
  brewDeviceId: text('brew_device_id')
    .notNull()
    .references(() => equipment.id),
  filterId: text('filter_id').references(() => equipment.id),
  waterTypeId: text('water_type_id').references(() => equipment.id),
  brewMethodId: text('brew_method_id')
    .notNull()
    .references(() => brewMethods.id),
  defaultCoffeeDose: real('default_coffee_dose'),
  defaultTotalWater: real('default_total_water'),
  defaultWaterTemp: integer('default_water_temp'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  lastUsedAt: text('last_used_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const beanStats = sqliteTable('bean_stats', {
  beanId: text('bean_id').primaryKey().references(() => beans.id),
  brewCount: integer('brew_count').notNull().default(0),
  avgEnjoyment: real('avg_enjoyment'),
  bestEnjoyment: integer('best_enjoyment'),
  avgRatio: real('avg_ratio'),
  avgDose: real('avg_dose'),
  avgWaterTemp: real('avg_water_temp'),
  lastBrewedAt: text('last_brewed_at'),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const preferenceScores = sqliteTable('preference_scores', {
  id: text('id').primaryKey(),
  category: text('category', {
    enum: ['origin', 'processing_method', 'roast_level', 'brew_type'],
  }).notNull(),
  value: text('value').notNull(),
  brewCount: integer('brew_count').notNull().default(0),
  avgEnjoyment: real('avg_enjoyment'),
  avgSweetness: real('avg_sweetness'),
  avgSourness: real('avg_sourness'),
  avgBitterness: real('avg_bitterness'),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})
