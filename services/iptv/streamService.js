import iptvService from './iptvService.js'

class StreamService {
  async getByChannel(channelId) {
    const data = await iptvService.getData()

    return data.streams
      .filter(
        stream => stream.channel === channelId
      )
      .all()
  }

  async getBestStream(channelId) {
    const streams = await this.getByChannel(channelId)

    if (!streams.length) {
      return null
    }

    // Only consider streams that actually have a URL
    const playableStreams = streams.filter(
      stream => stream.url
    )

    if (!playableStreams.length) {
      return null
    }

    // Pick the first playable stream for now
    const stream = playableStreams[0]

    // Clean Markdown-style URLs such as:
    // [https://example.com/stream.m3u8](https://example.com/stream.m3u8)
    const cleanUrl = stream.url
      .replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1')
      .trim()

    return {
      ...stream,
      url: cleanUrl
    }
  }

  getQuality(quality) {
    if (!quality) {
      return 0
    }

    const match = quality.match(/(\d+)p/i)

    return match
      ? Number(match[1])
      : 0
  }
}

export default new StreamService()