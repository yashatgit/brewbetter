import { visionRequest } from '@server/lib/llm-provider'

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return Response.json({ message: 'image (base64) is required' }, { status: 400 })
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

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ message: 'Could not extract bean data from image' }, { status: 422 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return Response.json(parsed)
  } catch (err: any) {
    return Response.json({ message: err.message || 'Bean scan failed' }, { status: 500 })
  }
}
