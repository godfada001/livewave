/*import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

const API_URL = '/api'

function Player({ stream, onClose }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function cleanupPlayer() {
    const video = videoRef.current
    const hls = hlsRef.current

    // Stop HLS immediately
    if (hls) {
      hls.stopLoad()
      hls.destroy()
      hlsRef.current = null
    }

    // Stop the video immediately
    if (video) {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }

  function handleClose() {
    cleanupPlayer()
    onClose()
  }

  useEffect(() => {
    if (!stream?.url || !videoRef.current) {
      return
    }

    const video = videoRef.current

    setLoading(true)
    setError(null)

    const url =
      `${API_URL}/streams/proxy?url=${encodeURIComponent(
        stream.url
      )}`

    let hls

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      })

      hlsRef.current = hls

      hls.loadSource(url)
      hls.attachMedia(video)

      hls.on(
        Hls.Events.MANIFEST_PARSED,
        () => {
          setLoading(false)

          video.play().catch(error => {
            console.warn(
              'Autoplay prevented:',
              error
            )
          })
        }
      )

      hls.on(
        Hls.Events.ERROR,
        (_, data) => {
          console.error(
            'HLS playback error:',
            data
          )

          if (data.fatal) {
            setLoading(false)

            setError(
              'Unable to play this stream.'
            )
          }
        }
      )
    } else if (
      video.canPlayType(
        'application/vnd.apple.mpegurl'
      )
    ) {
      video.src = url

      const handleLoadedMetadata = () => {
        setLoading(false)

        video.play().catch(error => {
          console.warn(
            'Autoplay prevented:',
            error
          )
        })
      }

      video.addEventListener(
        'loadedmetadata',
        handleLoadedMetadata,
        { once: true }
      )

      return () => {
        video.removeEventListener(
          'loadedmetadata',
          handleLoadedMetadata
        )

        cleanupPlayer()
      }
    } else {
      video.src = url
      setLoading(false)
    }

    return () => {
      cleanupPlayer()
    }
  }, [stream])

  if (!stream) {
    return null
  }

  return (
    <div className="player-overlay">
      <div className="player-container">

        <div className="player-header">
          <div className="player-live">
            <span className="live-dot" />
            LIVE
          </div>

          <button
            type="button"
            className="close-button"
            onClick={handleClose}
            aria-label="Close player"
          >
            ✕
          </button>
        </div>

        <div className="player-video-wrapper">

          <video
            ref={videoRef}
            className="video-player"
            controls
            playsInline
          />

          {loading && (
            <div className="player-loading">
              <div className="player-spinner" />

              <span>
                Loading stream...
              </span>
            </div>
          )}

          {error && (
            <div className="player-error">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setLoading(true)

                  if (videoRef.current) {
                    videoRef.current.load()
                  }
                }}
              >
                Retry
              </button>
            </div>
          )}

        </div>

        <div className="player-info">
          <div>
            <h2>
              {stream.title || 'Live Channel'}
            </h2>

            {stream.channel && (
              <p>
                {stream.channel}
              </p>
            )}
          </div>

          {stream.quality && (
            <span className="player-quality">
              {stream.quality}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}

export default Player*/

/*import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

// Same-origin API path. On Vercel, vercel.json routes /api/* to the backend;
// locally, the Vite dev proxy forwards /api to http://localhost:2000.
const API_URL = '/api'

// How many times to try recovering from a fatal hls.js error before giving up.
const MAX_RECOVERY_ATTEMPTS = 3

function buildProxyUrl(streamUrl) {
  return `${API_URL}/streams/proxy?url=${encodeURIComponent(streamUrl)}`
}

function Player({ stream, onClose }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  function cleanupPlayer() {
    const video = videoRef.current
    const hls = hlsRef.current

    // Stop HLS immediately
    if (hls) {
      hls.stopLoad()
      hls.destroy()
      hlsRef.current = null
    }

    // Stop the video immediately
    if (video) {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }

  function handleClose() {
    cleanupPlayer()
    onClose()
  }

  useEffect(() => {
    if (!stream?.url || !videoRef.current) {
      return
    }

    const video = videoRef.current
    const src = buildProxyUrl(stream.url)

    let cancelled = false
    let recoveryAttempts = 0

    setLoading(true)
    setError(null)

    const startPlayback = () => {
      if (cancelled) {
        return
      }

      setLoading(false)

      video.play().catch(playError => {
        // AbortError means play() was interrupted by pause()/load(),
        // for example when switching channels. That is harmless.
        if (playError?.name !== 'AbortError') {
          console.warn('Autoplay prevented:', playError)
        }
      })
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,

        // Stay further behind the live edge (default is 3 segments), so
        // there is more video queued up when a segment arrives late.
        liveSyncDurationCount: 5,

        // Buffer up to 60s ahead when the playlist allows it, and drop
        // video that is more than 30s behind the playhead.
        maxBufferLength: 60,
        maxMaxBufferLength: 90,
        backBufferLength: 30
      })

      hlsRef.current = hls

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, startPlayback)

      // A segment buffered successfully, so playback is healthy again.
      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        recoveryAttempts = 0
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('HLS playback error:', data)

        if (!data.fatal || cancelled) {
          return
        }

        // Try to recover before showing an error. A single failed playlist
        // refresh or segment request should not end the stream.
        if (recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            recoveryAttempts += 1
            hls.startLoad()
            return
          }

          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            recoveryAttempts += 1
            hls.recoverMediaError()
            return
          }
        }

        setLoading(false)
        setError('Unable to play this stream.')
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari plays HLS natively.
      video.src = src

      video.addEventListener('loadedmetadata', startPlayback, {
        once: true
      })
    } else {
      video.src = src
      setLoading(false)
    }

    return () => {
      cancelled = true
      video.removeEventListener('loadedmetadata', startPlayback)
      cleanupPlayer()
    }
    // Depend on the URL, not the whole object, so a parent re-render that
    // creates a new `stream` object does not restart playback.
  }, [stream?.url, retryKey])

  if (!stream) {
    return null
  }

  return (
    <div className="player-overlay">
      <div className="player-container">

        <div className="player-header">
          <div className="player-live">
            <span className="live-dot" />
            LIVE
          </div>

          <button
            type="button"
            className="close-button"
            onClick={handleClose}
            aria-label="Close player"
          >
            ✕
          </button>
        </div>

        <div className="player-video-wrapper">

          <video
            ref={videoRef}
            className="video-player"
            controls
            playsInline
          />

          {loading && (
            <div className="player-loading">
              <div className="player-spinner" />

              <span>
                Loading stream...
              </span>
            </div>
          )}

          {error && (
            <div className="player-error">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setRetryKey(key => key + 1)}
              >
                Retry
              </button>
            </div>
          )}

        </div>

        <div className="player-info">
          <div>
            <h2>
              {stream.title || 'Live Channel'}
            </h2>

            {stream.channel && (
              <p>
                {stream.channel}
              </p>
            )}
          </div>

          {stream.quality && (
            <span className="player-quality">
              {stream.quality}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}

export default Player */
import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

const API_URL = '/api'

function Player({ stream, onClose }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function cleanupPlayer() {
    const video = videoRef.current
    const hls = hlsRef.current

    // Stop HLS immediately
    if (hls) {
      hls.stopLoad()
      hls.destroy()
      hlsRef.current = null
    }

    // Stop the video immediately
    if (video) {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }

  function handleClose() {
    cleanupPlayer()
    onClose()
  }

  // Stop the page behind the player from scrolling on touch
  // devices while the full-screen player is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    if (!stream?.url || !videoRef.current) {
      return
    }

    const video = videoRef.current

    setLoading(true)
    setError(null)

    const url =
      `${API_URL}/streams/proxy?url=${encodeURIComponent(
        stream.url
      )}`

    let hls

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,

        // Don't pull a 1080p rendition into a phone-sized
        // player: saves mobile data and battery.
        capLevelToPlayerSize: true
      })

      hlsRef.current = hls

      hls.loadSource(url)
      hls.attachMedia(video)

      hls.on(
        Hls.Events.MANIFEST_PARSED,
        () => {
          setLoading(false)

          video.play().catch(error => {
            console.warn(
              'Autoplay prevented:',
              error
            )
          })
        }
      )

      hls.on(
        Hls.Events.ERROR,
        (_, data) => {
          console.error(
            'HLS playback error:',
            data
          )

          if (data.fatal) {
            setLoading(false)

            setError(
              'Unable to play this stream.'
            )
          }
        }
      )
    } else if (
      video.canPlayType(
        'application/vnd.apple.mpegurl'
      )
    ) {
      video.src = url

      const handleLoadedMetadata = () => {
        setLoading(false)

        video.play().catch(error => {
          console.warn(
            'Autoplay prevented:',
            error
          )
        })
      }

      video.addEventListener(
        'loadedmetadata',
        handleLoadedMetadata,
        { once: true }
      )

      return () => {
        video.removeEventListener(
          'loadedmetadata',
          handleLoadedMetadata
        )

        cleanupPlayer()
      }
    } else {
      video.src = url
      setLoading(false)
    }

    return () => {
      cleanupPlayer()
    }
  }, [stream])

  if (!stream) {
    return null
  }

  return (
    <div className="player-overlay">
      <div className="player-container">

        <div className="player-header">
          <div className="player-live">
            <span className="live-dot" />
            LIVE
          </div>

          <button
            type="button"
            className="close-button"
            onClick={handleClose}
            aria-label="Close player"
          >
            ✕
          </button>
        </div>

        <div className="player-video-wrapper">

          <video
            ref={videoRef}
            className="video-player"
            controls
            playsInline
          />

          {loading && (
            <div className="player-loading">
              <div className="player-spinner" />

              <span>
                Loading stream...
              </span>
            </div>
          )}

          {error && (
            <div className="player-error">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setLoading(true)

                  if (videoRef.current) {
                    videoRef.current.load()
                  }
                }}
              >
                Retry
              </button>
            </div>
          )}

        </div>

        <div className="player-info">
          <div>
            <h2>
              {stream.title || 'Live Channel'}
            </h2>

            {stream.channel && (
              <p>
                {stream.channel}
              </p>
            )}
          </div>

          {stream.quality && (
            <span className="player-quality">
              {stream.quality}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}

export default Player