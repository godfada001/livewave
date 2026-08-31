import { Router } from 'express'

import {
  getChannels,
  getChannel,
  searchChannels
} from '../controllers/channelController.js'

const router = Router()

router.get(
  '/',
  getChannels
)

router.get(
  '/search',
  searchChannels
)

router.get(
  '/:id',
  getChannel
)

export default router