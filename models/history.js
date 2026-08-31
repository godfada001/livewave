import { getDatabase } from '../config/DBconfig.js'

export function historyCollection() {
  return getDatabase().collection('watchHistory')
}