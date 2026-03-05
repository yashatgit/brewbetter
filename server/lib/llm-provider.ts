/**
 * Unified LLM provider abstraction.
 *
 * Set LLM_PROVIDER=openai (default) or LLM_PROVIDER=anthropic in .env
 * along with the matching API key (OPENAI_API_KEY / ANTHROPIC_API_KEY).
 */

type Provider = 'openai' | 'anthropic'

function getProvider(): Provider {
  const p = (process.env.LLM_PROVIDER ?? 'openai').toLowerCase()
  if (p !== 'openai' && p !== 'anthropic') {
    throw new Error(`Unknown LLM_PROVIDER "${p}". Use "openai" or "anthropic".`)
  }
  return p as Provider
}

// ── Chat completion (streaming) ─────────────────────────────────────────────

export interface StreamChatOpts {
  system: string
  userMessage: string
  maxTokens?: number
}

export async function streamChat(
  opts: StreamChatOpts,
  onChunk: (text: string) => void,
): Promise<void> {
  const provider = getProvider()
  console.log(`[LLM] streamChat via ${provider}`)

  if (provider === 'openai') {
    await streamChatOpenAI(opts, onChunk)
  } else {
    await streamChatAnthropic(opts, onChunk)
  }
}

async function streamChatOpenAI(opts: StreamChatOpts, onChunk: (text: string) => void) {
  const { default: OpenAI } = await import('openai')
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set. Add it to your .env file.')

  const client = new OpenAI({ apiKey })
  const stream = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    max_tokens: opts.maxTokens ?? 1024,
    stream: true,
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content: opts.userMessage },
    ],
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content
    if (text) onChunk(text)
  }
}

async function streamChatAnthropic(opts: StreamChatOpts, onChunk: (text: string) => void) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set. Add it to your .env file.')

  const client = new Anthropic({ apiKey })
  const stream = await client.messages.stream({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514',
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: [{ role: 'user', content: opts.userMessage }],
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      onChunk(event.delta.text)
    }
  }
}

// ── Vision (single response) ────────────────────────────────────────────────

export interface VisionOpts {
  base64Image: string        // raw base64 (no data-url prefix)
  mediaType?: string         // e.g. "image/jpeg"
  prompt: string
  maxTokens?: number
}

export async function visionRequest(opts: VisionOpts): Promise<string> {
  const provider = getProvider()
  console.log(`[LLM] visionRequest via ${provider}`)

  if (provider === 'openai') {
    return visionOpenAI(opts)
  } else {
    return visionAnthropic(opts)
  }
}

async function visionOpenAI(opts: VisionOpts): Promise<string> {
  const { default: OpenAI } = await import('openai')
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set. Add it to your .env file.')

  const client = new OpenAI({ apiKey })
  const mediaType = opts.mediaType ?? 'image/jpeg'
  const dataUrl = `data:${mediaType};base64,${opts.base64Image}`

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    max_tokens: opts.maxTokens ?? 1024,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: dataUrl } },
        { type: 'text', text: opts.prompt },
      ],
    }],
  })

  return response.choices[0]?.message?.content ?? ''
}

async function visionAnthropic(opts: VisionOpts): Promise<string> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set. Add it to your .env file.')

  const client = new Anthropic({ apiKey })
  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514',
    max_tokens: opts.maxTokens ?? 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: (opts.mediaType ?? 'image/jpeg') as 'image/jpeg',
            data: opts.base64Image,
          },
        },
        { type: 'text', text: opts.prompt },
      ],
    }],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}
