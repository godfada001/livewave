/* import sdk from '@iptv-org/sdk'

class IPTVService {
  constructor() {
    this.client = null
    this.data = null
    this.loaded = false
  }

  async initialize() {
    if (this.loaded) {
      return this.data
    }

    console.log('Loading IPTV data...')

    this.client = new sdk.Client()

    await this.client.load()

    this.data = this.client.getData()


const channels = this.data.channels.all()
const streams = this.data.streams.all()
const logos = this.data.logos.all()

const streamChannelIds = new Set(
  streams
    .map(stream => stream.channel)
    .filter(Boolean)
)

const availableChannels = channels.filter(
  channel => streamChannelIds.has(channel.id)
)
const logoMap = new Map()

for (const logo of logos) {
  if (logo.in_use === true && !logoMap.has(logo.channel)) {
    logoMap.set(logo.channel, logo.url)
  }
}

const channelsWithLogos = availableChannels.map(channel => ({
  ...channel,
  logo: logoMap.get(channel.id) || null
}))

this.data.channelsWithLogos = channelsWithLogos
this.data.channelSearchIndex =
  channelsWithLogos.map(channel => ({
    ...channel,
    searchName:
      channel.name?.toLowerCase() || '',
    searchAltNames:
      channel.alt_names?.map(name =>
        name.toLowerCase()
      ) || []
  }))

console.log(
  'CHANNELS WITH LOGOS:',
  channelsWithLogos.slice(0, 5)
)

const firstChannel = channelsWithLogos[0]
const firstStream = this.data.streams.all()[0]

    console.log('STREAM TYPE:', typeof firstStream)
    console.log('FIRST STREAM:', firstStream)

    console.log('CHANNEL TYPE:', typeof firstChannel)
    console.log('FIRST CHANNEL:', firstChannel)

    
   

    const radioStreams = this.data.streams
  .filter(stream => stream.channel === '002RadioTV.do')
  .all()

    console.log('002 RADIO STREAMS:', radioStreams)

    const linkedStreams = this.data.streams
  .filter(stream => stream.channel)
  .all()

    console.log(
  'STREAMS WITH CHANNEL:',
  linkedStreams.slice(0, 10)
)

    console.log('IPTV data loaded')

    console.log('Available data:', Object.keys(this.data))

    console.log(
      'Channels:',
      this.data.channels.all().length
    )

    console.log(
      'Streams:',
      this.data.streams.all().length
    )

    this.loaded = true

    return this.data
  }

  async getData() {
    if (!this.loaded) {
      await this.initialize()
    }

    return this.data
  }

  async refresh() {
    this.loaded = false
    this.client = null
    this.data = null

    return this.initialize()
  }
}

export default new IPTVService()*/

// services/iptv/iptvService.js
//
// Loads the iptv-org dataset straight from their public JSON API instead of
// using the @iptv-org/sdk loader. Nothing is read from or written to disk, so
// it works on Vercel's read-only serverless filesystem.
//
// The exposed data shape matches what channelService and streamService use:
//   data.channels / data.streams / data.logos   -> .all(), .filter(fn).all()
//   data.channelsWithLogos                      -> array
//   data.channelSearchIndex                     -> array

const API_BASE = 'https://iptv-org.github.io/api'
const FETCH_TIMEOUT_MS = 25_000
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // reload at most every 6 hours

// Minimal stand-in for the SDK's collections, so existing code such as
// data.streams.filter(fn).all() keeps working unchanged.
class Collection {
  constructor(items) {
    this.items = items
  }

  all() {
    return this.items
  }

  filter(fn) {
    return new Collection(this.items.filter(fn))
  }

  find(fn) {
    return this.items.find(fn)
  }

  count() {
    return this.items.length
  }
}

async function fetchJson(name) {
  const url = `${API_BASE}/${name}.json`

  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`)
  }

  const json = await response.json()

  if (!Array.isArray(json)) {
    throw new Error(`Unexpected response from ${url}: expected an array`)
  }

  return json
}

class IPTVService {
  constructor() {
    this.data = null
    this.loaded = false
    this.loadedAt = 0
    this.loading = null
  }

  async initialize() {
    if (this.loaded && !this.isExpired()) {
      return this.data
    }

    // Share one in-flight load between concurrent requests.
    if (!this.loading) {
      this.loading = this.load()
        .catch(error => {
          // If we already have (stale) data, keep serving it.
          if (this.data) {
            console.error('IPTV refresh failed, serving stale data:', error)
            this.loadedAt = Date.now()
            return this.data
          }

          throw error
        })
        .finally(() => {
          this.loading = null
        })
    }

    return this.loading
  }

  isExpired() {
    return Date.now() - this.loadedAt > CACHE_TTL_MS
  }

  async load() {
    console.log('Loading IPTV data...')

    const [channels, streams, logos] = await Promise.all([
      fetchJson('channels'),
      fetchJson('streams'),
      fetchJson('logos')
    ])

    // Only keep streams that belong to a channel. This also keeps memory down.
    const linkedStreams = streams.filter(stream => stream.channel)

    const streamChannelIds = new Set(
      linkedStreams.map(stream => stream.channel)
    )

    const availableChannels = channels.filter(channel =>
      streamChannelIds.has(channel.id)
    )

    // One logo per channel. Prefer one flagged in_use when the field exists,
    // otherwise fall back to the first logo found.
    const logoMap = new Map()
    const logoInUse = new Set()

    for (const logo of logos) {
      if (!logo.channel || !logo.url) continue

      const isInUse = logo.in_use === true

      if (!logoMap.has(logo.channel)) {
        logoMap.set(logo.channel, logo.url)
        if (isInUse) logoInUse.add(logo.channel)
      } else if (isInUse && !logoInUse.has(logo.channel)) {
        logoMap.set(logo.channel, logo.url)
        logoInUse.add(logo.channel)
      }
    }

    const channelsWithLogos = availableChannels.map(channel => ({
      ...channel,
      logo: logoMap.get(channel.id) || null
    }))

    const channelSearchIndex = channelsWithLogos.map(channel => ({
      ...channel,
      searchName: channel.name?.toLowerCase() || '',
      searchAltNames:
        channel.alt_names?.map(name => name.toLowerCase()) || []
    }))

    // Refuse to cache an empty result, so a bad load is retried instead of
    // being served as "success with 0 channels".
    if (channelsWithLogos.length === 0) {
      throw new Error(
        `IPTV load returned no channels (channels=${channels.length}, streams=${streams.length})`
      )
    }

    this.data = {
      channels: new Collection(channels),
      streams: new Collection(linkedStreams),
      logos: new Collection(logos),
      channelsWithLogos,
      channelSearchIndex
    }

    this.loaded = true
    this.loadedAt = Date.now()

    console.log(
      `IPTV data loaded: ${channels.length} channels, ` +
        `${linkedStreams.length} linked streams, ` +
        `${channelsWithLogos.length} channels with streams`
    )

    return this.data
  }

  async getData() {
    await this.initialize()
    return this.data
  }

  async refresh() {
    this.loaded = false
    this.loadedAt = 0
    return this.initialize()
  }
}

export default new IPTVService()