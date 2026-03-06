import { eq, desc, sql } from 'drizzle-orm'
import { db } from '@server/db'
import { brewLogs, beans, equipment, brewMethods, tastingEvaluations } from '@server/db/schema'
import { BREW_COMMENTARY_SYSTEM, buildBrewCommentaryMessage } from '@server/prompts/brew-commentary'
import { streamChat } from '@server/lib/llm-provider'

export async function POST(request: Request) {
  try {
    const { brewId } = await request.json()

    if (!brewId) {
      return Response.json({ message: 'brewId is required' }, { status: 400 })
    }

    const brew = db.select().from(brewLogs).where(eq(brewLogs.id, brewId)).get()
    if (!brew) {
      return Response.json({ message: 'Brew not found' }, { status: 404 })
    }

    const bean = db.select().from(beans).where(eq(beans.id, brew.beanId)).get()
    const grinder = db.select().from(equipment).where(eq(equipment.id, brew.grinderId)).get()
    const brewDevice = db.select().from(equipment).where(eq(equipment.id, brew.brewDeviceId)).get()
    const filter = brew.filterId ? db.select().from(equipment).where(eq(equipment.id, brew.filterId)).get() : null
    const waterType = db.select().from(equipment).where(eq(equipment.id, brew.waterTypeId)).get()
    const method = db.select().from(brewMethods).where(eq(brewMethods.id, brew.brewMethodId)).get()
    const tasting = db.select().from(tastingEvaluations).where(eq(tastingEvaluations.brewLogId, brewId)).get()

    // Fetch last 20 brews (excluding current) with bean and tasting data
    const historyRows = db.select({
      brewedAt: brewLogs.brewedAt,
      timeOfDay: brewLogs.timeOfDay,
      daysOffRoast: brewLogs.daysOffRoast,
      coffeeDose: brewLogs.coffeeDose,
      totalWater: brewLogs.totalWater,
      ratio: brewLogs.ratio,
      waterTemp: brewLogs.waterTemp,
      totalBrewTime: brewLogs.totalBrewTime,
      grinderSetting: brewLogs.grinderSetting,
      beanName: beans.name,
      roaster: beans.roaster,
      originCountry: beans.originCountry,
      processingMethod: beans.processingMethod,
      roastLevel: beans.roastLevel,
      sweetness: tastingEvaluations.sweetness,
      sourness: tastingEvaluations.sourness,
      bitterness: tastingEvaluations.bitterness,
      body: tastingEvaluations.body,
      overallEnjoyment: tastingEvaluations.overallEnjoyment,
      flavorTags: tastingEvaluations.flavorTags,
      sweetnessDirection: tastingEvaluations.sweetnessDirection,
      sournessDirection: tastingEvaluations.sournessDirection,
      bitternessDirection: tastingEvaluations.bitternessDirection,
      bodyDirection: tastingEvaluations.bodyDirection,
    })
    .from(brewLogs)
    .innerJoin(beans, eq(brewLogs.beanId, beans.id))
    .leftJoin(tastingEvaluations, eq(tastingEvaluations.brewLogId, brewLogs.id))
    .where(sql`${brewLogs.id} != ${brewId}`)
    .orderBy(desc(brewLogs.brewedAt))
    .limit(20)
    .all()

    // Parse flavor tags helper
    const parseFlavorTags = (raw: string | null): string[] => {
      if (!raw) return []
      try { return JSON.parse(raw) } catch { return [] }
    }

    const currentBrew = {
      id: brew.id,
      brewed_at: brew.brewedAt,
      time_of_day: brew.timeOfDay,
      bean: {
        name: bean?.name ?? 'Unknown',
        roaster: bean?.roaster ?? 'Unknown',
        origin_country: bean?.originCountry ?? 'Unknown',
        origin_region: bean?.originRegion ?? null,
        variety: bean?.variety ?? null,
        processing_method: bean?.processingMethod ?? 'unknown',
        roast_level: bean?.roastLevel ?? 'unknown',
        roast_date: bean?.roastDate ?? 'unknown',
        altitude_masl: bean?.altitudeMasl ?? null,
      },
      days_off_roast: brew.daysOffRoast,
      equipment: {
        grinder: grinder?.name ?? 'Unknown',
        grinder_setting: brew.grinderSetting,
        brew_device: brewDevice?.name ?? 'Unknown',
        filter: filter?.name ?? null,
        water_type: waterType?.name ?? 'Unknown',
      },
      method: method?.name ?? null,
      parameters: {
        coffee_dose_g: brew.coffeeDose,
        total_water_g: brew.totalWater,
        ratio: brew.ratio,
        water_temp_c: brew.waterTemp,
        bloom_water_g: brew.bloomWater,
        bloom_time_s: brew.bloomTime,
        num_pours: brew.numPours,
        total_brew_time_s: brew.totalBrewTime,
        technique_notes: brew.techniqueNotes,
      },
      tasting: tasting ? {
        sweetness: tasting.sweetness,
        sweetness_direction: tasting.sweetnessDirection,
        sourness: tasting.sourness,
        sourness_direction: tasting.sournessDirection,
        bitterness: tasting.bitterness,
        bitterness_direction: tasting.bitternessDirection,
        body: tasting.body,
        body_direction: tasting.bodyDirection,
        aftertaste_presence: tasting.aftertastePresence,
        aftertaste_pleasant: tasting.aftertastePleasant,
        flavor_tags: parseFlavorTags(tasting.flavorTags),
        flavor_notes_freetext: tasting.flavorNotes,
        overall_enjoyment: tasting.overallEnjoyment,
        personal_notes: tasting.personalNotes,
      } : null,
    }

    const brewHistory = historyRows.map((row) => ({
      brewed_at: row.brewedAt,
      time_of_day: row.timeOfDay,
      days_off_roast: row.daysOffRoast,
      bean: {
        name: row.beanName,
        roaster: row.roaster,
        origin_country: row.originCountry,
        processing_method: row.processingMethod,
        roast_level: row.roastLevel,
      },
      parameters: {
        coffee_dose_g: row.coffeeDose,
        total_water_g: row.totalWater,
        ratio: row.ratio,
        water_temp_c: row.waterTemp,
        total_brew_time_s: row.totalBrewTime,
        grinder_setting: row.grinderSetting,
      },
      tasting: row.sweetness != null ? {
        sweetness: row.sweetness,
        sourness: row.sourness!,
        bitterness: row.bitterness!,
        sweetness_direction: row.sweetnessDirection,
        sourness_direction: row.sournessDirection,
        bitterness_direction: row.bitternessDirection,
        body: row.body!,
        body_direction: row.bodyDirection,
        flavor_tags: parseFlavorTags(row.flavorTags),
        overall_enjoyment: row.overallEnjoyment!,
      } : null,
    }))

    const userMessage = buildBrewCommentaryMessage(currentBrew, brewHistory)

    const encoder = new TextEncoder()
    let accumulated = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamChat(
            { system: BREW_COMMENTARY_SYSTEM, userMessage, maxTokens: 800 },
            (text) => {
              accumulated += text
              controller.enqueue(encoder.encode(text))
            },
          )

          // Save commentary to DB
          if (accumulated) {
            db.update(brewLogs)
              .set({ aiCommentary: accumulated })
              .where(eq(brewLogs.id, brewId))
              .run()
          }

          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err: any) {
    return Response.json({ message: err.message || 'LLM request failed' }, { status: 500 })
  }
}
