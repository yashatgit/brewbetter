import { Router } from 'express'
import { db } from '../db'
import { tastingEvaluations, brewLogs } from '../db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'
import { refreshBeanStats, refreshPreferenceScores } from '../lib/analytics'

export const tastingRouter = Router()

tastingRouter.get('/:brewLogId', (req, res) => {
  const tasting = db
    .select()
    .from(tastingEvaluations)
    .where(eq(tastingEvaluations.brewLogId, req.params.brewLogId))
    .get()
  if (!tasting) return res.status(404).json({ message: 'Tasting not found' })
  res.json(tasting)
})

tastingRouter.put('/:brewLogId', (req, res) => {
  const existing = db
    .select()
    .from(tastingEvaluations)
    .where(eq(tastingEvaluations.brewLogId, req.params.brewLogId))
    .get()
  if (!existing) return res.status(404).json({ message: 'Tasting not found' })

  db.update(tastingEvaluations)
    .set(req.body)
    .where(eq(tastingEvaluations.id, existing.id))
    .run()

  const updated = db.select().from(tastingEvaluations).where(eq(tastingEvaluations.id, existing.id)).get()
  // Refresh analytics
  const log = db.select().from(brewLogs).where(eq(brewLogs.id, req.params.brewLogId)).get()
  if (log?.beanId) {
    try { refreshBeanStats(log.beanId); refreshPreferenceScores() } catch {}
  }
  res.json(updated)
})

tastingRouter.post('/', (req, res) => {
  const id = uuid()
  db.insert(tastingEvaluations).values({ id, ...req.body }).run()
  const created = db.select().from(tastingEvaluations).where(eq(tastingEvaluations.id, id)).get()
  // Refresh analytics
  const log = db.select().from(brewLogs).where(eq(brewLogs.id, req.body.brewLogId)).get()
  if (log?.beanId) {
    try { refreshBeanStats(log.beanId); refreshPreferenceScores() } catch {}
  }
  res.status(201).json(created)
})
