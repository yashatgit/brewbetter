import { db } from '../db'
import { brewLogs, beans, tastingEvaluations, beanStats, preferenceScores } from '../db/schema'
import { eq, sql } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'

export function refreshBeanStats(beanId: string) {
  const rows = db
    .select({
      brewCount: sql<number>`count(*)`,
      avgRatio: sql<number>`avg(${brewLogs.ratio})`,
      avgDose: sql<number>`avg(${brewLogs.coffeeDose})`,
      avgWaterTemp: sql<number>`avg(${brewLogs.waterTemp})`,
      lastBrewedAt: sql<string>`max(${brewLogs.brewedAt})`,
    })
    .from(brewLogs)
    .where(eq(brewLogs.beanId, beanId))
    .get()

  const tastingRows = db
    .select({
      avgEnjoyment: sql<number>`avg(${tastingEvaluations.overallEnjoyment})`,
      bestEnjoyment: sql<number>`max(${tastingEvaluations.overallEnjoyment})`,
    })
    .from(tastingEvaluations)
    .innerJoin(brewLogs, eq(tastingEvaluations.brewLogId, brewLogs.id))
    .where(eq(brewLogs.beanId, beanId))
    .get()

  if (!rows || rows.brewCount === 0) {
    db.delete(beanStats).where(eq(beanStats.beanId, beanId)).run()
    return
  }

  const now = new Date().toISOString()
  const existing = db.select().from(beanStats).where(eq(beanStats.beanId, beanId)).get()

  const data = {
    brewCount: rows.brewCount,
    avgEnjoyment: tastingRows?.avgEnjoyment ?? null,
    bestEnjoyment: tastingRows?.bestEnjoyment ?? null,
    avgRatio: rows.avgRatio,
    avgDose: rows.avgDose,
    avgWaterTemp: rows.avgWaterTemp,
    lastBrewedAt: rows.lastBrewedAt,
    updatedAt: now,
  }

  if (existing) {
    db.update(beanStats).set(data).where(eq(beanStats.beanId, beanId)).run()
  } else {
    db.insert(beanStats).values({ beanId, ...data }).run()
  }
}

export function refreshPreferenceScores() {
  const now = new Date().toISOString()

  // Delete all existing scores
  db.delete(preferenceScores).run()

  // Origin preferences
  const originRows = db
    .select({
      value: beans.originCountry,
      brewCount: sql<number>`count(*)`,
      avgEnjoyment: sql<number>`avg(${tastingEvaluations.overallEnjoyment})`,
      avgAcidity: sql<number>`avg(${tastingEvaluations.acidityFeel})`,
      avgSweetBitter: sql<number>`avg(${tastingEvaluations.sweetBitter})`,
    })
    .from(brewLogs)
    .innerJoin(beans, eq(brewLogs.beanId, beans.id))
    .innerJoin(tastingEvaluations, eq(tastingEvaluations.brewLogId, brewLogs.id))
    .groupBy(beans.originCountry)
    .all()

  for (const row of originRows) {
    db.insert(preferenceScores).values({
      id: uuid(),
      category: 'origin',
      value: row.value,
      brewCount: row.brewCount,
      avgEnjoyment: row.avgEnjoyment,
      avgAcidity: row.avgAcidity,
      avgSweetBitter: row.avgSweetBitter,
      updatedAt: now,
    }).run()
  }

  // Processing method preferences
  const processRows = db
    .select({
      value: beans.processingMethod,
      brewCount: sql<number>`count(*)`,
      avgEnjoyment: sql<number>`avg(${tastingEvaluations.overallEnjoyment})`,
      avgAcidity: sql<number>`avg(${tastingEvaluations.acidityFeel})`,
      avgSweetBitter: sql<number>`avg(${tastingEvaluations.sweetBitter})`,
    })
    .from(brewLogs)
    .innerJoin(beans, eq(brewLogs.beanId, beans.id))
    .innerJoin(tastingEvaluations, eq(tastingEvaluations.brewLogId, brewLogs.id))
    .groupBy(beans.processingMethod)
    .all()

  for (const row of processRows) {
    db.insert(preferenceScores).values({
      id: uuid(),
      category: 'processing_method',
      value: row.value,
      brewCount: row.brewCount,
      avgEnjoyment: row.avgEnjoyment,
      avgAcidity: row.avgAcidity,
      avgSweetBitter: row.avgSweetBitter,
      updatedAt: now,
    }).run()
  }

  // Roast level preferences
  const roastRows = db
    .select({
      value: beans.roastLevel,
      brewCount: sql<number>`count(*)`,
      avgEnjoyment: sql<number>`avg(${tastingEvaluations.overallEnjoyment})`,
      avgAcidity: sql<number>`avg(${tastingEvaluations.acidityFeel})`,
      avgSweetBitter: sql<number>`avg(${tastingEvaluations.sweetBitter})`,
    })
    .from(brewLogs)
    .innerJoin(beans, eq(brewLogs.beanId, beans.id))
    .innerJoin(tastingEvaluations, eq(tastingEvaluations.brewLogId, brewLogs.id))
    .groupBy(beans.roastLevel)
    .all()

  for (const row of roastRows) {
    db.insert(preferenceScores).values({
      id: uuid(),
      category: 'roast_level',
      value: row.value,
      brewCount: row.brewCount,
      avgEnjoyment: row.avgEnjoyment,
      avgAcidity: row.avgAcidity,
      avgSweetBitter: row.avgSweetBitter,
      updatedAt: now,
    }).run()
  }

  // Brew type preferences
  const brewTypeRows = db
    .select({
      value: brewLogs.brewTypeId,
      brewCount: sql<number>`count(*)`,
      avgEnjoyment: sql<number>`avg(${tastingEvaluations.overallEnjoyment})`,
      avgAcidity: sql<number>`avg(${tastingEvaluations.acidityFeel})`,
      avgSweetBitter: sql<number>`avg(${tastingEvaluations.sweetBitter})`,
    })
    .from(brewLogs)
    .innerJoin(tastingEvaluations, eq(tastingEvaluations.brewLogId, brewLogs.id))
    .where(sql`${brewLogs.brewTypeId} is not null`)
    .groupBy(brewLogs.brewTypeId)
    .all()

  for (const row of brewTypeRows) {
    if (!row.value) continue
    db.insert(preferenceScores).values({
      id: uuid(),
      category: 'brew_type',
      value: row.value,
      brewCount: row.brewCount,
      avgEnjoyment: row.avgEnjoyment,
      avgAcidity: row.avgAcidity,
      avgSweetBitter: row.avgSweetBitter,
      updatedAt: now,
    }).run()
  }
}
