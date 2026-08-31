import sdk from '@iptv-org/sdk'

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

export default new IPTVService()