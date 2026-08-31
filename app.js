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

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(cors())

app.use(express.json())

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok'
  })
})

// --------------------------------------------------
// API routes
// --------------------------------------------------

app.use(
  '/api/auth',
  authRoute
)
app.use(
    '/api',
    routes
)
// --------------------------------------------------
// Error handling
// --------------------------------------------------

app.use(notFoundMiddleware)

app.use(errorMiddleware)

// --------------------------------------------------
// Start server
// --------------------------------------------------

async function startServer() {
  try {
    console.log('Starting IPTV backend...')

    // Connect MongoDB
    await connectDatabase()

    // Load IPTV data
    await iptvService.initialize()

    // Start HTTP server
    app.listen(
      env.port,
      () => {
        console.log(
          `Server running on http://localhost:${env.port}`
        )
      }
    )
  } catch (error) {
    console.error(
      'Failed to start server:',
      error
    )

    process.exit(1)
  }
}

startServer()