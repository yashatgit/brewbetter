import { Router } from 'express'
import { db } from '../db'
import { savedSetups } from '../db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'

export const savedSetupsRouter = Router()

savedSetupsRouter.get('/', (_req, res) => {
  const all = db.select().from(savedSetups).all()
  res.json(all)
})

savedSetupsRouter.post('/', (req, res) => {
  const id = uuid()
  db.insert(savedSetups).values({ id, ...req.body }).run()
  const created = db.select().from(savedSetups).where(eq(savedSetups.id, id)).get()
  res.status(201).json(created)
})

savedSetupsRouter.put('/:id', (req, res) => {
  db.update(savedSetups).set(req.body).where(eq(savedSetups.id, req.params.id)).run()
  const updated = db.select().from(savedSetups).where(eq(savedSetups.id, req.params.id)).get()
  res.json(updated)
})

savedSetupsRouter.delete('/:id', (req, res) => {
  db.delete(savedSetups).where(eq(savedSetups.id, req.params.id)).run()
  res.json({ success: true })
})
