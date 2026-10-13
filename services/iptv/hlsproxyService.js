/*const ALLOWED_HOSTS = new Set([
  'jmp2.uk',
  'stitcher-ipv4.pluto.tv',
  'mcdn-01.plutotv.net'
])

function cleanStreamUrl(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  const match = url.match(
    /https?:\/\/[^\s\])]+/
  )

  return match
    ? match[0].trim()
    : url.trim()
}

function validateUrl(url) {
  const parsed = new URL(url)

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Invalid stream protocol')
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(
      `Stream host not allowed: ${parsed.hostname}`
    )
  }

  return parsed
}

function proxyUrl(url) {
  return `/api/streams/proxy?url=${encodeURIComponent(url)}`
}

function rewritePlaylist(content, baseUrl) {
  // Rewrite URI="..." attributes used by things such as:
  // #EXT-X-KEY
  // #EXT-X-MAP
  // #EXT-X-MEDIA
  content = content.replace(
    /URI="([^"]+)"/g,
    (_, uri) => {
      const absoluteUrl = new URL(
        uri,
        baseUrl
      ).href

      return `URI="${proxyUrl(absoluteUrl)}"`
    }
  )

  // Rewrite normal playlist URLs.
  const lines = content.split(/\r?\n/)

  return lines
    .map(line => {
      const trimmed = line.trim()

      // Preserve empty lines and HLS directives
      if (!trimmed || trimmed.startsWith('#')) {
        return line
      }

      try {
        const absoluteUrl = new URL(
          trimmed,
          baseUrl
        ).href

        return proxyUrl(absoluteUrl)
      } catch {
        return line
      }
    })
    .join('\n')
}

class HlsProxyService {
  async fetch(url) {
    const cleanUrl = cleanStreamUrl(url)

    if (!cleanUrl) {
      throw new Error('Stream URL is required')
    }

    const parsedUrl = validateUrl(cleanUrl)

    const response = await fetch(
      parsedUrl.href,
      {
        redirect: 'follow'
      }
    )

    if (!response.ok) {
      throw new Error(
        `Upstream stream returned ${response.status}`
      )
    }

    const contentType =
      response.headers.get('content-type') || ''

    const finalUrl = response.url

    const isPlaylist =
      contentType.includes('mpegurl') ||
      contentType.includes('m3u8') ||
      finalUrl.includes('.m3u8')

    if (isPlaylist) {
      const content = await response.text()

      return {
        type: 'playlist',
        content: rewritePlaylist(
          content,
          finalUrl
        )
      }
    }

    const buffer =
      Buffer.from(
        await response.arrayBuffer()
      )

    return {
      type: 'binary',
      buffer,
      contentType:
        contentType ||
        'application/octet-stream'
    }
  }
}

export default new HlsProxyService()*/

// services/iptv/hlsproxyService.js

// A host is allowed if it equals an entry or is a subdomain of it, so
// 'pluto.tv' covers stitcher-ipv4.pluto.tv, siloh.pluto.tv and so on.
// Video segments are often served from a different host than the playlist,
// which is why exact-match entries were rejecting segments.
const DEFAULT_ALLOWED_HOSTS = [
  'jmp2.uk',
  'pluto.tv',
  'plutotv.net'
]

const MAX_REDIRECTS = 5
const UPSTREAM_TIMEOUT_MS = 15_000

// Errors with an HTTP status, so the error middleware can answer with
// 400 / 403 / 404 / 502 / 504 instead of a blanket 500.
class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.expose = true
  }
}

// Extra hosts can be added without a code change by setting
// HLS_PROXY_EXTRA_HOSTS=host1.example,host2.example in Vercel.
function getAllowedHosts() {
  const extra = (process.env.HLS_PROXY_EXTRA_HOSTS || '')
    .split(',')
    .map(host => host.trim().toLowerCase())
    .filter(Boolean)

  return [...DEFAULT_ALLOWED_HOSTS, ...extra]
}

function isAllowedHost(hostname) {
  const host = hostname.toLowerCase()

  return getAllowedHosts().some(
    allowed => host === allowed || host.endsWith(`.${allowed}`)
  )
}

function cleanStreamUrl(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  const match = url.match(/https?:\/\/[^\s\])]+/)

  return match ? match[0].trim() : url.trim()
}

function validateUrl(url) {
  let parsed

  try {
    parsed = new URL(url)
  } catch {
    throw new HttpError(400, 'Invalid stream URL')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new HttpError(400, 'Invalid stream protocol')
  }

  if (!isAllowedHost(parsed.hostname)) {
    throw new HttpError(
      403,
      `Stream host not allowed: ${parsed.hostname}`
    )
  }

  return parsed
}

function proxyUrl(url) {
  return `/api/streams/proxy?url=${encodeURIComponent(url)}`
}

function rewritePlaylist(content, baseUrl) {
  // Rewrite URI="..." attributes used by tags such as
  // #EXT-X-KEY, #EXT-X-MAP and #EXT-X-MEDIA.
  content = content.replace(/URI="([^"]+)"/g, (match, uri) => {
    // Leave inline data: URIs alone, they are not fetched over the network.
    if (/^data:/i.test(uri)) {
      return match
    }

    try {
      const absoluteUrl = new URL(uri, baseUrl).href
      return `URI="${proxyUrl(absoluteUrl)}"`
    } catch {
      return match
    }
  })

  // Rewrite normal media/playlist lines.
  return content
    .split(/\r?\n/)
    .map(line => {
      const trimmed = line.trim()

      // Preserve empty lines and HLS directives.
      if (!trimmed || trimmed.startsWith('#')) {
        return line
      }

      try {
        return proxyUrl(new URL(trimmed, baseUrl).href)
      } catch {
        return line
      }
    })
    .join('\n')
}

// Follows redirects by hand so every hop is checked against the allowlist.
async function fetchUpstream(startUrl) {
  let current = validateUrl(startUrl)

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let response

    try {
      response = await fetch(current.href, {
        redirect: 'manual',
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
      })
    } catch (error) {
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        throw new HttpError(504, 'Upstream stream timed out')
      }

      throw new HttpError(
        502,
        `Could not reach upstream stream host: ${current.hostname}`
      )
    }

    const location = response.headers.get('location')

    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel?.().catch(() => {})

      let next

      try {
        next = new URL(location, current).href
      } catch {
        throw new HttpError(502, 'Upstream sent an invalid redirect')
      }

      current = validateUrl(next)
      continue
    }

    return { response, finalUrl: current.href }
  }

  throw new HttpError(502, 'Too many redirects from upstream')
}

class HlsProxyService {
  async fetch(url) {
    const cleanUrl = cleanStreamUrl(url)

    if (!cleanUrl) {
      throw new HttpError(400, 'Stream URL is required')
    }

    const { response, finalUrl } = await fetchUpstream(cleanUrl)

    if (!response.ok) {
      throw new HttpError(
        response.status === 404 ? 404 : 502,
        `Upstream stream returned ${response.status}`
      )
    }

    const contentType = response.headers.get('content-type') || ''

    const isPlaylist =
      contentType.includes('mpegurl') ||
      contentType.includes('m3u8') ||
      finalUrl.includes('.m3u8')

    if (isPlaylist) {
      const content = await response.text()

      return {
        type: 'playlist',
        content: rewritePlaylist(content, finalUrl)
      }
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    return {
      type: 'binary',
      buffer,
      contentType: contentType || 'application/octet-stream'
    }
  }
}

export { HttpError }
export default new HlsProxyService()