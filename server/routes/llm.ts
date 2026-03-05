import { Router, type Request, type Response, type NextFunction } from 'express'
import { db } from '../db'
import { brewLogs, beans, equipment, brewMethods, tastingEvaluations } from '../db/schema'
import { eq } from 'drizzle-orm'
import { BREW_COMMENTARY_SYSTEM, buildBrewCommentaryMessage } from '../prompts/brew-commentary'
import { streamChat, visionRequest } from '../lib/llm-provider'

export const llmRouter = Router()

console.log('[LLM] llmRouter module loaded')

llmRouter.post('/brew-commentary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { brewId } = req.body
    console.log('[LLM] POST /brew-commentary — brewId:', brewId)

    if (!brewId) {
      console.warn('[LLM] Missing brewId in request body')
      res.status(400).json({ message: 'brewId is required' })
      return
    }

    const brew = db.select().from(brewLogs).where(eq(brewLogs.id, brewId)).get()
    if (!brew) {
      console.warn('[LLM] Brew not found:', brewId)
      res.status(404).json({ message: 'Brew not found' })
      return
    }

    const bean = db.select().from(beans).where(eq(beans.id, brew.beanId)).get()
    const grinder = db.select().from(equipment).where(eq(equipment.id, brew.grinderId)).get()
    const brewDevice = db.select().from(equipment).where(eq(equipment.id, brew.brewDeviceId)).get()
    const filter = brew.filterId ? db.select().from(equipment).where(eq(equipment.id, brew.filterId)).get() : null
    const waterType = db.select().from(equipment).where(eq(equipment.id, brew.waterTypeId)).get()
    const method = db.select().from(brewMethods).where(eq(brewMethods.id, brew.brewMethodId)).get()
    const tasting = db.select().from(tastingEvaluations).where(eq(tastingEvaluations.brewLogId, brewId)).get()

    console.log('[LLM] Fetched brew data — bean:', bean?.name, '| device:', brewDevice?.name, '| hasTasting:', !!tasting)

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
      acidityFeel: tasting?.acidityFeel,
      sweetBitter: tasting?.sweetBitter,
      body: tasting?.body,
      aftertastePresence: tasting?.aftertastePresence,
      aftertastePleasant: tasting?.aftertastePleasant ?? undefined,
      flavorNotes: tasting?.flavorNotes ?? undefined,
      overallEnjoyment: tasting?.overallEnjoyment,
      personalNotes: tasting?.personalNotes ?? undefined,
      mindfulness: tasting?.mindfulness ?? undefined,
    })

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.setHeader('Cache-Control', 'no-cache')

    let accumulated = ''
    await streamChat(
      { system: BREW_COMMENTARY_SYSTEM, userMessage, maxTokens: 1024 },
      (text) => {
        accumulated += text
        res.write(text)
      },
    )

    // Save commentary to DB
    if (accumulated) {
      db.update(brewLogs)
        .set({ aiCommentary: accumulated })
        .where(eq(brewLogs.id, brewId))
        .run()
    }

    console.log('[LLM] Brew commentary streamed successfully for brewId:', brewId)
    res.end()
  } catch (err: any) {
    console.error('[LLM] Error in /brew-commentary:', err.message, err.stack)
    if (!res.headersSent) {
      res.status(500).json({ message: err.message || 'LLM request failed' })
    } else {
      res.end()
    }
  }
})

llmRouter.post('/bean-scan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image } = req.body
    console.log('[LLM] POST /bean-scan — image length:', image?.length ?? 0)

    if (!image) {
      console.warn('[LLM] Missing image in request body')
      res.status(400).json({ message: 'image (base64) is required' })
      return
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

    const prompt = `Extract coffee bean information from this bag photo. Return ONLY a JSON object with these fields (use null for anything not visible or unclear):

{
  "name": "coffee name",
  "roaster": "roaster/brand name",
  "originCountry": "country of origin",
  "originRegion": "region if visible",
  "variety": "coffee variety if listed",
  "processingMethod": "washed|natural|honey|anaerobic|infused|wet_hulled|other",
  "roastLevel": "light|medium_light|medium|medium_dark|dark",
  "altitudeMasl": null or number,
  "bagWeightG": null or number,
  "roastDate": "YYYY-MM-DD or null",
  "notes": "any tasting notes or descriptions on the bag"
}

Return ONLY valid JSON, no other text.`

    const text = await visionRequest({
      base64Image: base64Data,
      mediaType: 'image/jpeg',
      prompt,
      maxTokens: 1024,
    })

    console.log('[LLM] Bean scan raw response:', text.substring(0, 200))

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('[LLM] Could not extract JSON from bean scan response')
      res.status(422).json({ message: 'Could not extract bean data from image' })
      return
    }

    const parsed = JSON.parse(jsonMatch[0])
    console.log('[LLM] Bean scan parsed successfully — name:', parsed.name, '| roaster:', parsed.roaster)
    res.json(parsed)
  } catch (err: any) {
    console.error('[LLM] Error in /bean-scan:', err.message, err.stack)
    res.status(500).json({ message: err.message || 'Bean scan failed' })
  }
})
