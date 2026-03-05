import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@server/db'
import { tastingEvaluations, brewLogs } from '@server/db/schema'
import { v4 as uuid } from 'uuid'
import { refreshBeanStats, refreshPreferenceScores } from '@server/lib/analytics'

export async function POST(request: Request) {
  const body = await request.json()
  const id = uuid()
  db.insert(tastingEvaluations).values({ id, ...body }).run()
  const created = db.select().from(tastingEvaluations).where(eq(tastingEvaluations.id, id)).get()
  const log = db.select().from(brewLogs).where(eq(brewLogs.id, body.brewLogId)).get()
  if (log?.beanId) {
    try { refreshBeanStats(log.beanId); refreshPreferenceScores() } catch {}
  }
  return NextResponse.json(created, { status: 201 })
}
