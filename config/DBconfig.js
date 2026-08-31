import { MongoClient } from 'mongodb'

import { env } from './env.js'

let client
let database

export async function connectDatabase() {
  if (database) {
    return database
  }

  if (!env.mongodb.uri) {
    throw new Error(
      'MONGODB_URI is not defined in the environment'
    )
  }

  client = new MongoClient(env.mongodb.uri)

  await client.connect()

  database = client.db(env.mongodb.database)

  console.log(
    `MongoDB connected: ${env.mongodb.database}`
  )

  return database
}

export function getDatabase() {
  if (!database) {
    throw new Error(
      'Database has not been initialized'
    )
  }

  return database
}

export async function closeDatabase() {
  if (client) {
    await client.close()

    client = null
    database = null

    console.log('MongoDB connection closed')
  }
}
