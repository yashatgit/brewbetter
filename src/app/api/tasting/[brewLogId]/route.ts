import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@server/db'
import { tastingEvaluations, brewLogs } from '@server/db/schema'
import { refreshBeanStats, refreshPreferenceScores } from '@server/lib/analytics'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ brewLogId: string }> }
) {
  const { brewLogId } = await params
  const tasting = db
    .select()
    .from(tastingEvaluations)
    .where(eq(tastingEvaluations.brewLogId, brewLogId))
    .get()
  if (!tasting) return NextResponse.json({ message: 'Tasting not found' }, { status: 404 })
  return NextResponse.json(tasting)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ brewLogId: string }> }
) {
  const { brewLogId } = await params
  const existing = db
    .select()
    .from(tastingEvaluations)
    .where(eq(tastingEvaluations.brewLogId, brewLogId))
    .get()
  if (!existing) return NextResponse.json({ message: 'Tasting not found' }, { status: 404 })

  const body = await request.json()
  db.update(tastingEvaluations)
    .set(body)
    .where(eq(tastingEvaluations.id, existing.id))
    .run()

  const updated = db.select().from(tastingEvaluations).where(eq(tastingEvaluations.id, existing.id)).get()
  const log = db.select().from(brewLogs).where(eq(brewLogs.id, brewLogId)).get()
  if (log?.beanId) {
    try { refreshBeanStats(log.beanId); refreshPreferenceScores() } catch {}
  }
  return NextResponse.json(updated)
}
