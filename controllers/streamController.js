/*import streamService from '../services/iptv/streamService.js'
import hlsproxyService from '../services/iptv/hlsproxyService.js' 

export async function getChannelStreams(
  req,
  res,
  next
) {
  try {
    const streams =
      await streamService.getByChannel(
        req.params.channelId
      )

    res.json({
      success: true,
      count: streams.length,
      data: streams
    })
  } catch (error) {
    next(error)
  }
}

export async function getBestStream(
  req,
  res,
  next
) {
  try {
    const stream =
      await streamService.getBestStream(
        req.params.channelId
      )

    if (!stream) {
      return res.status(404).json({
        success: false,
        message: 'No playable stream found'
      })
    }

    res.json({
      success: true,
      data: {
        channel: stream.channel,
        feed: stream.feed,
        title: stream.title,
        url: stream.url,
        referrer: stream.referrer,
        userAgent: stream.user_agent,
        quality: stream.quality,
        label: stream.label
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function proxyStream(
  req,
  res,
  next
) {
  try {
    const { url } = req.query

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Stream URL is required'
      })
    }

    const result =
      await hlsproxyService.fetch(url)

    // HLS playlist
    if (result.type === 'playlist') {
      res.setHeader(
        'Content-Type',
        'application/vnd.apple.mpegurl'
      )

      res.setHeader(
        'Cache-Control',
        'no-cache'
      )

      return res.send(result.content)
    }

    // Video/audio segment
    res.setHeader(
      'Content-Type',
      result.contentType
    )

    res.setHeader(
      'Cache-Control',
      'no-cache'
    )

    return res.send(result.buffer)
  } catch (error) {
    next(error)
  }
}*/
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import streamService from '../services/iptv/streamService.js'
import hlsproxyService from '../services/iptv/hlsproxyService.js'

export async function getChannelStreams(
  req,
  res,
  next
) {
  try {
    const streams =
      await streamService.getByChannel(
        req.params.channelId
      )

    res.json({
      success: true,
      count: streams.length,
      data: streams
    })
  } catch (error) {
    next(error)
  }
}

export async function getBestStream(
  req,
  res,
  next
) {
  try {
    const stream =
      await streamService.getBestStream(
        req.params.channelId
      )

    if (!stream) {
      return res.status(404).json({
        success: false,
        message: 'No playable stream found'
      })
    }

    res.json({
      success: true,
      data: {
        channel: stream.channel,
        feed: stream.feed,
        title: stream.title,
        url: stream.url,
        referrer: stream.referrer,
        userAgent: stream.user_agent,
        quality: stream.quality,
        label: stream.label
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function proxyStream(
  req,
  res,
  next
) {
  try {
    const { url } = req.query

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Stream URL is required'
      })
    }

    const result =
      await hlsproxyService.fetch(url)

    // HLS playlist
    if (result.type === 'playlist') {
      res.setHeader(
        'Content-Type',
        'application/vnd.apple.mpegurl'
      )

      res.setHeader(
        'Cache-Control',
        'no-cache'
      )

      return res.send(result.content)
    }

    // Video/audio segment: stream it through without buffering.
    res.status(200)

    res.setHeader(
      'Content-Type',
      result.contentType
    )

    if (result.contentLength) {
      res.setHeader(
        'Content-Length',
        result.contentLength
      )
    }

    res.setHeader(
      'Cache-Control',
      'no-cache'
    )

    if (!result.body) {
      result.done()
      return res.end()
    }

    // hls.js cancels requests often (quality switches, seeking, closing the
    // player). When the client goes away, stop downloading from upstream.
    res.on('close', () => {
      if (!res.writableFinished) {
        result.abort()
      }
    })

    try {
      await pipeline(
        Readable.fromWeb(result.body),
        res
      )

      result.done()
    } catch (error) {
      result.abort()

      // The client disconnected. Nothing to report.
      if (
        error?.code === 'ERR_STREAM_PREMATURE_CLOSE' ||
        res.destroyed
      ) {
        return
      }

      // Failed after bytes were already sent: the status line is gone, so
      // cut the connection and let hls.js retry the segment.
      if (res.headersSent) {
        console.error('Stream proxy failed mid-segment:', error.message)
        res.destroy()
        return
      }

      // Failed before anything was sent: answer with a normal error.
      res.removeHeader('Content-Length')
      return next(error)
    }
  } catch (error) {
    next(error)
  }
}