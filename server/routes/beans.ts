import { Router } from 'express'
import { db } from '../db'
import { beans } from '../db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'

export const beansRouter = Router()

beansRouter.get('/', (_req, res) => {
  const all = db.select().from(beans).all()
  res.json(all)
})

beansRouter.get('/:id', (req, res) => {
  const bean = db.select().from(beans).where(eq(beans.id, req.params.id)).get()
  if (!bean) return res.status(404).json({ message: 'Bean not found' })
  res.json(bean)
})

beansRouter.post('/', (req, res) => {
  const id = uuid()
  const data = { id, ...req.body }
  db.insert(beans).values(data).run()
  const created = db.select().from(beans).where(eq(beans.id, id)).get()
  res.status(201).json(created)
})

beansRouter.put('/:id', (req, res) => {
  db.update(beans).set(req.body).where(eq(beans.id, req.params.id)).run()
  const updated = db.select().from(beans).where(eq(beans.id, req.params.id)).get()
  res.json(updated)
})

beansRouter.delete('/:id', (req, res) => {
  db.delete(beans).where(eq(beans.id, req.params.id)).run()
  res.json({ success: true })
})
