import express from 'express'
import cors from 'cors'
import { beansRouter } from './routes/beans'
import { equipmentRouter } from './routes/equipment'
import { brewMethodsRouter } from './routes/brew-methods'
import { brewLogsRouter } from './routes/brew-logs'
import { tastingRouter } from './routes/tasting'
import { savedSetupsRouter } from './routes/saved-setups'
import { exportRouter } from './routes/export'
import { llmRouter } from './routes/llm'
import { analyticsRouter } from './routes/analytics'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Request logging
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    console.log(`[${req.method}] ${req.originalUrl} → ${res.statusCode} (${ms}ms)`)
  })
  next()
})

app.use('/api/beans', beansRouter)
app.use('/api/equipment', equipmentRouter)
app.use('/api/brew-methods', brewMethodsRouter)
app.use('/api/brew-logs', brewLogsRouter)
app.use('/api/tasting', tastingRouter)
app.use('/api/saved-setups', savedSetupsRouter)
app.use('/api/export', exportRouter)
app.use('/api/llm', llmRouter)
app.use('/api/analytics', analyticsRouter)

// Catch-all for unmatched routes — helps debug "Cannot POST/GET" issues
app.use((req, res) => {
  console.warn(`[404] No route matched: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log('Registered route prefixes: /api/beans, /api/equipment, /api/brew-methods, /api/brew-logs, /api/tasting, /api/saved-setups, /api/export, /api/llm, /api/analytics')
})
