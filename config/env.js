import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT) || 2000,

  nodeEnv: process.env.NODE_ENV || 'development',

  apiPrefix: process.env.API_PREFIX || '/api',

  mongodb: {
    uri: process.env.MONGODB_URI,
    database: process.env.MONGODB_DATABASE || 'iptv_app'
  }
}