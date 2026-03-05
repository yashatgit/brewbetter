export const BREW_COMMENTARY_SYSTEM = `You are a specialty coffee expert analyzing brew data from a coffee enthusiast's journal. You provide insightful, encouraging commentary on their brew — what likely worked well, what the tasting notes suggest about extraction, and specific, actionable suggestions for their next brew.

Keep your tone warm and knowledgeable, like a helpful barista friend. Avoid being overly technical — make it accessible.

Format: 2-3 short paragraphs of commentary, then 1-2 specific suggestions for next time. Use plain text only, no markdown headers.`

interface BrewData {
  beanName: string
  roaster: string
  origin: string
  processingMethod: string
  roastLevel: string
  daysOffRoast: number
  brewDevice: string
  grinder: string
  grinderSetting: string
  filter?: string
  waterType: string
  coffeeDose: number
  totalWater: number
  ratio: number
  waterTemp: number
  bloomWater?: number
  bloomTime?: number
  numPours?: number
  totalBrewTime: number
  techniqueNotes?: string
  acidityFeel?: number
  sweetBitter?: number
  body?: string
  aftertastePresence?: boolean
  aftertastePleasant?: string
  flavorNotes?: string
  overallEnjoyment?: number
  personalNotes?: string
  mindfulness?: string
}

export function buildBrewCommentaryMessage(data: BrewData): string {
  const lines: string[] = [
    `Bean: ${data.beanName} by ${data.roaster}`,
    `Origin: ${data.origin}`,
    `Processing: ${data.processingMethod}, Roast: ${data.roastLevel}`,
    `Days off roast: ${data.daysOffRoast}`,
    '',
    `Brew device: ${data.brewDevice}`,
    `Grinder: ${data.grinder} @ ${data.grinderSetting}`,
  ]

  if (data.filter) lines.push(`Filter: ${data.filter}`)
  lines.push(`Water: ${data.waterType}`)
  lines.push('')
  lines.push(`Dose: ${data.coffeeDose}g, Water: ${data.totalWater}g, Ratio: 1:${data.ratio}`)
  lines.push(`Water temp: ${data.waterTemp}°C`)

  if (data.bloomWater != null) lines.push(`Bloom: ${data.bloomWater}g for ${data.bloomTime ?? '?'}s`)
  if (data.numPours != null) lines.push(`Pours: ${data.numPours}`)

  const mins = Math.floor(data.totalBrewTime / 60)
  const secs = data.totalBrewTime % 60
  lines.push(`Total brew time: ${mins}:${secs.toString().padStart(2, '0')}`)

  if (data.techniqueNotes) lines.push(`Technique notes: ${data.techniqueNotes}`)

  if (data.acidityFeel != null) {
    lines.push('')
    lines.push('--- Tasting ---')
    lines.push(`Acidity (1=smooth, 5=bright): ${data.acidityFeel}`)
    lines.push(`Sweet/Bitter (1=sweet, 5=bitter): ${data.sweetBitter}`)
    lines.push(`Body: ${data.body}`)
    lines.push(`Aftertaste: ${data.aftertastePresence ? (data.aftertastePleasant ?? 'yes') : 'none'}`)
    if (data.flavorNotes) lines.push(`Flavor notes: ${data.flavorNotes}`)
    lines.push(`Overall enjoyment: ${data.overallEnjoyment}/5`)
    if (data.personalNotes) lines.push(`Personal notes: ${data.personalNotes}`)
    if (data.mindfulness) lines.push(`Mindfulness: ${data.mindfulness}`)
  }

  return lines.join('\n')
}
