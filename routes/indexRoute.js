import { Router } from 'express'

import channelRoutes from './channelRoute.js'
import streamRoutes from './streamRoute.js'
import favoriteRoutes from './favoriteRoute.js'

const router = Router()

router.use(
  '/channels',
  channelRoutes
)

router.use(
  '/streams',
  streamRoutes
)

router.use(
  '/favorites',
  favoriteRoutes
)
export default router