const ALLOWED_HOSTS = new Set([
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

export default new HlsProxyService()