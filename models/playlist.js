import { getDatabase } from '../config/DBconfig.js'

export function playlistsCollection() {
  return getDatabase().collection('playlists')
}