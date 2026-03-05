import { Router } from 'express'
import { db } from '../db'
import { beanStats, preferenceScores } from '../db/schema'
import { refreshBeanStats, refreshPreferenceScores } from '../lib/analytics'

export const analyticsRouter = Router()

analyticsRouter.get('/bean-stats', (_req, res) => {
  const stats = db.select().from(beanStats).all()
  res.json(stats)
})

analyticsRouter.get('/preferences', (_req, res) => {
  const scores = db.select().from(preferenceScores).all()
  res.json(scores)
})

analyticsRouter.post('/refresh', (_req, res) => {
  try {
    // Refresh all bean stats
    const allBeanIds = db
      .selectDistinct({ beanId: beanStats.beanId })
      .from(beanStats)
      .all()
      .map((r) => r.beanId)

    for (const beanId of allBeanIds) {
      refreshBeanStats(beanId)
    }

    refreshPreferenceScores()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to refresh analytics' })
  }
})
