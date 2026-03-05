import { Router } from 'express'
import { db } from '../db'
import { equipment } from '../db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'

export const equipmentRouter = Router()

equipmentRouter.get('/', (req, res) => {
  const type = req.query.type as string | undefined
  if (type) {
    const items = db.select().from(equipment).where(eq(equipment.type, type as any)).all()
    res.json(items)
  } else {
    const items = db.select().from(equipment).all()
    res.json(items)
  }
})

equipmentRouter.post('/', (req, res) => {
  const id = uuid()
  db.insert(equipment).values({ id, ...req.body }).run()
  const created = db.select().from(equipment).where(eq(equipment.id, id)).get()
  res.status(201).json(created)
})

equipmentRouter.put('/:id', (req, res) => {
  db.update(equipment).set(req.body).where(eq(equipment.id, req.params.id)).run()
  const updated = db.select().from(equipment).where(eq(equipment.id, req.params.id)).get()
  res.json(updated)
})

equipmentRouter.delete('/:id', (req, res) => {
  db.delete(equipment).where(eq(equipment.id, req.params.id)).run()
  res.json({ success: true })
})
