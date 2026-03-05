import { type NextRequest, NextResponse } from 'next/server'
import { eq, desc, and, gte, lte } from 'drizzle-orm'
import { db } from '@server/db'
import { brewLogs, beans, equipment, brewMethods, tastingEvaluations } from '@server/db/schema'
import { v4 as uuid } from 'uuid'
import { refreshBeanStats, refreshPreferenceScores } from '@server/lib/analytics'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const beanId = searchParams.get('beanId')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const limit = searchParams.get('limit')

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

  return NextResponse.json(enriched)
}

export async function POST(request: Request) {
  const body = await request.json()
  const id = uuid()
  db.insert(brewLogs).values({ id, ...body }).run()
  const created = db.select().from(brewLogs).where(eq(brewLogs.id, id)).get()
  if (created?.beanId) {
    try { refreshBeanStats(created.beanId); refreshPreferenceScores() } catch {}
  }
  return NextResponse.json(created, { status: 201 })
}
