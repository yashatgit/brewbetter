import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@server/db'
import { brewLogs, beans, equipment, brewMethods, tastingEvaluations } from '@server/db/schema'
import { refreshBeanStats, refreshPreferenceScores } from '@server/lib/analytics'

function enrichLog(log: any) {
  const bean = db.select().from(beans).where(eq(beans.id, log.beanId)).get()
  const grinder = db.select().from(equipment).where(eq(equipment.id, log.grinderId)).get()
  const brewDevice = db.select().from(equipment).where(eq(equipment.id, log.brewDeviceId)).get()
  const filter = log.filterId ? db.select().from(equipment).where(eq(equipment.id, log.filterId)).get() : null
  const waterType = db.select().from(equipment).where(eq(equipment.id, log.waterTypeId)).get()
  const brewMethod = db.select().from(brewMethods).where(eq(brewMethods.id, log.brewMethodId)).get()
  const tasting = db.select().from(tastingEvaluations).where(eq(tastingEvaluations.brewLogId, log.id)).get()
  return { ...log, bean, grinder, brewDevice, filter, waterType, brewMethod, tasting }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const log = db.select().from(brewLogs).where(eq(brewLogs.id, id)).get()
  if (!log) return NextResponse.json({ message: 'Brew log not found' }, { status: 404 })
  return NextResponse.json(enrichLog(log))
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const existing = db.select().from(brewLogs).where(eq(brewLogs.id, id)).get()
  if (!existing) return NextResponse.json({ message: 'Brew log not found' }, { status: 404 })

  const body = await request.json()
  db.update(brewLogs)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(brewLogs.id, id))
    .run()

  const log = db.select().from(brewLogs).where(eq(brewLogs.id, id)).get()!
  if (log.beanId) {
    try { refreshBeanStats(log.beanId); refreshPreferenceScores() } catch {}
  }
  return NextResponse.json(enrichLog(log))
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const log = db.select().from(brewLogs).where(eq(brewLogs.id, id)).get()
  db.delete(tastingEvaluations).where(eq(tastingEvaluations.brewLogId, id)).run()
  db.delete(brewLogs).where(eq(brewLogs.id, id)).run()
  if (log?.beanId) {
    try { refreshBeanStats(log.beanId); refreshPreferenceScores() } catch {}
  }
  return NextResponse.json({ success: true })
}
