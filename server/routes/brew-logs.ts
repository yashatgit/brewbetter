import { Router } from 'express'
import { db } from '../db'
import { brewLogs, beans, equipment, brewMethods, tastingEvaluations } from '../db/schema'
import { eq, desc, and, gte, lte } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'
import { refreshBeanStats, refreshPreferenceScores } from '../lib/analytics'

export const brewLogsRouter = Router()

brewLogsRouter.get('/', (req, res) => {
  const { beanId, from, to, limit } = req.query as Record<string, string>
  let query = db.select().from(brewLogs).orderBy(desc(brewLogs.brewedAt))

  const conditions = []
  if (beanId) conditions.push(eq(brewLogs.beanId, beanId))
  if (from) conditions.push(gte(brewLogs.brewedAt, from))
  if (to) conditions.push(lte(brewLogs.brewedAt, to))

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any
  }
  if (limit) {
    query = query.limit(parseInt(limit)) as any
  }

  const logs = query.all()

  // Enrich with relations
  const enriched = logs.map((log) => {
    const bean = db.select().from(beans).where(eq(beans.id, log.beanId)).get()
    const grinder = db.select().from(equipment).where(eq(equipment.id, log.grinderId)).get()
    const brewDevice = db.select().from(equipment).where(eq(equipment.id, log.brewDeviceId)).get()
    const filter = log.filterId ? db.select().from(equipment).where(eq(equipment.id, log.filterId)).get() : null
    const waterType = db.select().from(equipment).where(eq(equipment.id, log.waterTypeId)).get()
    const brewMethod = db.select().from(brewMethods).where(eq(brewMethods.id, log.brewMethodId)).get()
    const tasting = db.select().from(tastingEvaluations).where(eq(tastingEvaluations.brewLogId, log.id)).get()

    return { ...log, bean, grinder, brewDevice, filter, waterType, brewMethod, tasting }
  })

  res.json(enriched)
})

brewLogsRouter.get('/:id', (req, res) => {
  const log = db.select().from(brewLogs).where(eq(brewLogs.id, req.params.id)).get()
  if (!log) return res.status(404).json({ message: 'Brew log not found' })

  const bean = db.select().from(beans).where(eq(beans.id, log.beanId)).get()
  const grinder = db.select().from(equipment).where(eq(equipment.id, log.grinderId)).get()
  const brewDevice = db.select().from(equipment).where(eq(equipment.id, log.brewDeviceId)).get()
  const filter = log.filterId ? db.select().from(equipment).where(eq(equipment.id, log.filterId)).get() : null
  const waterType = db.select().from(equipment).where(eq(equipment.id, log.waterTypeId)).get()
  const brewMethod = db.select().from(brewMethods).where(eq(brewMethods.id, log.brewMethodId)).get()
  const tasting = db.select().from(tastingEvaluations).where(eq(tastingEvaluations.brewLogId, log.id)).get()

  res.json({ ...log, bean, grinder, brewDevice, filter, waterType, brewMethod, tasting })
})

brewLogsRouter.post('/', (req, res) => {
  const id = uuid()
  db.insert(brewLogs).values({ id, ...req.body }).run()
  const created = db.select().from(brewLogs).where(eq(brewLogs.id, id)).get()
  // Refresh analytics
  if (created?.beanId) {
    try { refreshBeanStats(created.beanId); refreshPreferenceScores() } catch {}
  }
  res.status(201).json(created)
})

brewLogsRouter.put('/:id', (req, res) => {
  const existing = db.select().from(brewLogs).where(eq(brewLogs.id, req.params.id)).get()
  if (!existing) return res.status(404).json({ message: 'Brew log not found' })

  db.update(brewLogs)
    .set({ ...req.body, updatedAt: new Date().toISOString() })
    .where(eq(brewLogs.id, req.params.id))
    .run()

  // Return enriched result
  const log = db.select().from(brewLogs).where(eq(brewLogs.id, req.params.id)).get()!
  const bean = db.select().from(beans).where(eq(beans.id, log.beanId)).get()
  const grinder = db.select().from(equipment).where(eq(equipment.id, log.grinderId)).get()
  const brewDevice = db.select().from(equipment).where(eq(equipment.id, log.brewDeviceId)).get()
  const filter = log.filterId ? db.select().from(equipment).where(eq(equipment.id, log.filterId)).get() : null
  const waterType = db.select().from(equipment).where(eq(equipment.id, log.waterTypeId)).get()
  const brewMethod = db.select().from(brewMethods).where(eq(brewMethods.id, log.brewMethodId)).get()
  const tasting = db.select().from(tastingEvaluations).where(eq(tastingEvaluations.brewLogId, log.id)).get()

  // Refresh analytics
  if (log.beanId) {
    try { refreshBeanStats(log.beanId); refreshPreferenceScores() } catch {}
  }
  res.json({ ...log, bean, grinder, brewDevice, filter, waterType, brewMethod, tasting })
})

brewLogsRouter.delete('/:id', (req, res) => {
  const log = db.select().from(brewLogs).where(eq(brewLogs.id, req.params.id)).get()
  // Delete tasting first (FK constraint)
  db.delete(tastingEvaluations).where(eq(tastingEvaluations.brewLogId, req.params.id)).run()
  db.delete(brewLogs).where(eq(brewLogs.id, req.params.id)).run()
  // Refresh analytics
  if (log?.beanId) {
    try { refreshBeanStats(log.beanId); refreshPreferenceScores() } catch {}
  }
  res.json({ success: true })
})
