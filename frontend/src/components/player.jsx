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

export default Player