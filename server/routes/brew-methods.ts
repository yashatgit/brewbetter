import { Router } from 'express'
import { db } from '../db'
import { brewMethods } from '../db/schema'
import { eq } from 'drizzle-orm'

export const brewMethodsRouter = Router()

brewMethodsRouter.get('/', (_req, res) => {
  const all = db.select().from(brewMethods).all()
  res.json(all)
})

brewMethodsRouter.get('/:id', (req, res) => {
  const method = db.select().from(brewMethods).where(eq(brewMethods.id, req.params.id)).get()
  if (!method) return res.status(404).json({ message: 'Method not found' })
  res.json(method)
})
