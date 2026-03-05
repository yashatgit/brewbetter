import { Router } from 'express'
import { db } from '../db'
import { brewLogs, beans, equipment, brewMethods, tastingEvaluations } from '../db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'

export const exportRouter = Router()

exportRouter.get('/', (req, res) => {
  const { format, from, to } = req.query as Record<string, string>

  const conditions = []
  if (from) conditions.push(gte(brewLogs.brewedAt, from))
  if (to) conditions.push(lte(brewLogs.brewedAt, to))

  let query = db.select().from(brewLogs)
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any
  }
  const logs = query.all()

  const enriched = logs.map((log) => {
    const bean = db.select().from(beans).where(eq(beans.id, log.beanId)).get()
    const grinder = db.select().from(equipment).where(eq(equipment.id, log.grinderId)).get()
    const brewDevice = db.select().from(equipment).where(eq(equipment.id, log.brewDeviceId)).get()
    const filter = log.filterId ? db.select().from(equipment).where(eq(equipment.id, log.filterId)).get() : null
    const waterType = db.select().from(equipment).where(eq(equipment.id, log.waterTypeId)).get()
    const brewMethod = db.select().from(brewMethods).where(eq(brewMethods.id, log.brewMethodId)).get()
    const tasting = db.select().from(tastingEvaluations).where(eq(tastingEvaluations.brewLogId, log.id)).get()

    return {
      ...log,
      bean_name: bean?.name,
      bean_roaster: bean?.roaster,
      bean_origin: bean?.originCountry,
      bean_processing: bean?.processingMethod,
      bean_roast_level: bean?.roastLevel,
      grinder_name: grinder?.name,
      brew_device_name: brewDevice?.name,
      filter_name: filter?.name,
      water_type_name: waterType?.name,
      brew_method_name: brewMethod?.name,
      rating_acidity: tasting?.acidityFeel,
      rating_sweet_bitter: tasting?.sweetBitter,
      rating_body: tasting?.body,
      rating_aftertaste: tasting?.aftertastePresence,
      rating_aftertaste_pleasant: tasting?.aftertastePleasant,
      rating_flavor_notes: tasting?.flavorNotes,
      rating_overall: tasting?.overallEnjoyment,
      rating_notes: tasting?.personalNotes,
    }
  })

  if (format === 'csv') {
    if (enriched.length === 0) {
      res.setHeader('Content-Type', 'text/csv')
      return res.send('')
    }
    const headers = Object.keys(enriched[0])
    const csvRows = [
      headers.join(','),
      ...enriched.map((row) =>
        headers.map((h) => {
          const val = (row as any)[h]
          if (val === null || val === undefined) return ''
          const str = String(val)
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str
        }).join(',')
      ),
    ]
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=brew_better_export.csv')
    return res.send(csvRows.join('\n'))
  }

  res.json(enriched)
})
