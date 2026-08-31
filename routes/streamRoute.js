import { Router } from 'express'

import {
  getChannelStreams,
  getBestStream,
  proxyStream
} from '../controllers/streamController.js'

const router = Router()

router.get(
  '/channel/:channelId',
  getChannelStreams
)

router.get(
  '/channel/:channelId/best',
  getBestStream
)

router.get(
  '/proxy',
  proxyStream
)

export default router