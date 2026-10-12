
import express from 'express'
import cors from 'cors'

import { env } from './config/env.js'
import {
  connectDatabase
} from './config/DBconfig.js'

import routes from './routes/indexRoute.js'
import authRoute from './routes/authRoute.js'

import iptvService from './services/iptv/iptvService.js'

import {
  notFoundMiddleware
} from './middleware/not-foundMiddleware.js'

import {
  errorMiddleware
} from './middleware/errorMiddleware.js'

const app = express()

app.use(cors())
app.use(express.json())

let initializationPromise

function initializeBackend() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      console.log('Initializing IPTV backend...')

      await connectDatabase()
      await iptvService.initialize()

      console.log('IPTV backend initialized')
    })().catch((error) => {
      initializationPromise = undefined
      throw error
    })
  }

  return initializationPromise
}

app.use(async (req, res, next) => {
  try {
    await initializeBackend()
    next()
  } catch (error) {
    next(error)
  }
})

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok'
  })
})

app.use('/api/auth', authRoute)
app.use('/api', routes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

// Export the Express app for Vercel.
export default app

// Start a normal HTTP server only when running locally.
if (!process.env.VERCEL) {
  initializeBackend()
    .then(() => {
      app.listen(env.port, () => {
        console.log(
          `Server running on http://localhost:${env.port}`
        )
      })
    })
    .catch((error) => {
      console.error('Failed to start server:', error)
      process.exitCode = 1
    })
}
