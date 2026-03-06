import { eq } from 'drizzle-orm'
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
    const _method = db.select().from(brewMethods).where(eq(brewMethods.id, brew.brewMethodId)).get()
    const tasting = db.select().from(tastingEvaluations).where(eq(tastingEvaluations.brewLogId, brewId)).get()

    const userMessage = buildBrewCommentaryMessage({
      beanName: bean?.name ?? 'Unknown',
      roaster: bean?.roaster ?? 'Unknown',
      origin: [bean?.originCountry, bean?.originRegion].filter(Boolean).join(', '),
      processingMethod: bean?.processingMethod ?? 'unknown',
      roastLevel: bean?.roastLevel ?? 'unknown',
      daysOffRoast: brew.daysOffRoast,
      brewDevice: brewDevice?.name ?? 'Unknown',
      grinder: grinder?.name ?? 'Unknown',
      grinderSetting: brew.grinderSetting,
      filter: filter?.name ?? undefined,
      waterType: waterType?.name ?? 'Unknown',
      coffeeDose: brew.coffeeDose,
      totalWater: brew.totalWater,
      ratio: brew.ratio,
      waterTemp: brew.waterTemp,
      bloomWater: brew.bloomWater ?? undefined,
      bloomTime: brew.bloomTime ?? undefined,
      numPours: brew.numPours ?? undefined,
      totalBrewTime: brew.totalBrewTime,
      techniqueNotes: brew.techniqueNotes ?? undefined,
      acidityFeel: tasting?.sourness,
      sweetBitter: tasting?.bitterness,
      body: tasting?.body,
      aftertastePresence: tasting?.aftertastePresence,
      aftertastePleasant: tasting?.aftertastePleasant ?? undefined,
      flavorNotes: tasting?.flavorNotes ?? undefined,
      overallEnjoyment: tasting?.overallEnjoyment,
      personalNotes: tasting?.personalNotes ?? undefined,
      mindfulness: tasting?.mindfulness ?? undefined,
    })

    const encoder = new TextEncoder()
    let accumulated = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamChat(
            { system: BREW_COMMENTARY_SYSTEM, userMessage, maxTokens: 1024 },
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
