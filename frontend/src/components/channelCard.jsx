/*function ChannelCard({
  channel,
  onPlay,
  isFavorite,
  onFavorite
}) {
  function handleFavorite(event) {
    event.stopPropagation()

    onFavorite(channel)
  }

  return (
    <div className="channel-card">

      <button
        className="channel-play"
        onClick={() => onPlay(channel)}
      >

        <div className="channel-preview">

          <div className="channel-live">
            <span className="live-dot"></span>
            LIVE
          </div>

          <div className="channel-logo">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <span>
                {channel.name?.charAt(0) || '?'}
              </span>
            )}
          </div>

          <div className="channel-play-icon">
            ▶
          </div>

        </div>

        <div className="channel-info">

          <div className="channel-details">

            <h3>
              {channel.name}
            </h3>

            <p>
              {channel.country || 'Unknown'}
            </p>

          </div>

        </div>

      </button>

      <button
        className={`favorite-button ${
          isFavorite ? 'favorite-active' : ''
        }`}
        onClick={handleFavorite}
        aria-label={
          isFavorite
            ? 'Remove from favorites'
            : 'Add to favorites'
        }
      >
        {isFavorite ? '★' : '☆'}
      </button>

    </div>
  )
}

export default ChannelCard */

function ChannelCard({
  channel,
  onPlay,
  isFavorite,
  onFavorite
}) {
  function handleFavorite(event) {
    event.stopPropagation()

    onFavorite(channel)
  }

  return (
    <div className="channel-card">

      <button
        className="channel-play"
        onClick={() => onPlay(channel)}
      >

        <div className="channel-preview">

          <div className="channel-live">
            <span className="live-dot"></span>
            LIVE
          </div>

          <div className="channel-logo">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <span>
                {channel.name?.charAt(0) || '?'}
              </span>
            )}
          </div>

          <div className="channel-play-icon">
            ▶
          </div>

        </div>

        <div className="channel-info">

          <div className="channel-details">

            <h3>
              {channel.name}
            </h3>

            <p>
              {channel.country || 'Unknown'}
            </p>

          </div>

        </div>

      </button>

      <button
        className={`favorite-button ${
          isFavorite ? 'favorite-active' : ''
        }`}
        onClick={handleFavorite}
        aria-label={
          isFavorite
            ? 'Remove from favorites'
            : 'Add to favorites'
        }
      >
        {isFavorite ? '★' : '☆'}
      </button>

    </div>
  )
}

export default ChannelCard