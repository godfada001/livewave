import { getDatabase } from '../config/DBconfig.js'

export function favoritesCollection() {
  return getDatabase().collection('favorites')
}