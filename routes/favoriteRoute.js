import { Router } from 'express'

import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
} from '../controllers/favoriteController.js'

import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

router.use(authMiddleware)

router.get(
  '/',
  getFavorites
)

router.post(
  '/:channelId',
  addFavorite
)

router.delete(
  '/:channelId',
  removeFavorite
)

router.get(
  '/:channelId',
  checkFavorite
)

export default router