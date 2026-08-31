import { getDatabase } from '../config/DBconfig.js'

export function usersCollection() {
  return getDatabase().collection('users')
}