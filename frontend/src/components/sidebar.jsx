/*const countries = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'IN', name: 'India', flag: '🇮🇳' }
]

function Sidebar({
  selectedCountry,
  onCountryChange,
  favorites,
  channels,
  onFavoriteClick,
  onRemoveFavorite
}) {
  /*
   * Favorites stored in MongoDB are channel IDs.
   *
   * Match those IDs against the channels we
   * already have loaded from the IPTV API.
   
  const favoriteChannels = channels.filter(channel =>
    favorites.includes(channel.id)
  )

  return (
    <aside className="sidebar">

      {/* =========================
          MAIN NAVIGATION
      ========================= }

      <div className="sidebar-section">
        <div className="sidebar-label">
          MENU
        </div>

        <button
          className="sidebar-nav active"
          onClick={() => onCountryChange('')}
        >
          <span className="sidebar-nav-icon">⌂</span>
          <span>Home</span>
        </button>

        <button
          className="sidebar-nav"
          onClick={() => onCountryChange('')}
        >
          <span className="sidebar-nav-icon">▣</span>
          <span>All Channels</span>
        </button>
      </div>


      {/* =========================
          MY LIBRARY
      ========================= }

      <div className="sidebar-section">

        <div className="sidebar-label">
          MY LIBRARY
        </div>

        <div className="sidebar-nav favorites-nav">
          <span className="sidebar-nav-icon">★</span>
          <span>Favorites</span>

          <span className="favorites-count">
            {favoriteChannels.length}
          </span>
        </div>

        {favoriteChannels.length === 0 ? (
          <div className="sidebar-empty">
            <div className="sidebar-empty-icon">
              ☆
            </div>

            <p>No favorites yet</p>

            <small>
              Star a channel to save it here.
            </small>
          </div>
        ) : (
          <div className="favorites-list">

            {favoriteChannels.map(channel => (
              <div
                key={channel.id}
                className="favorite-item"
              >

                <button
                  className="favorite-channel"
                  onClick={() =>
                    onFavoriteClick(channel)
                  }
                >

                  <div className="favorite-logo">
                    {channel.name?.charAt(0) || '?'}
                  </div>

                  <span className="favorite-name">
                    {channel.name}
                  </span>

                </button>

                <button
                  className="favorite-remove"
                  onClick={() =>
                    onRemoveFavorite(channel)
                  }
                  title="Remove from favorites"
                >
                  ★
                </button>

              </div>
            ))}

          </div>
        )}

      </div>


      {/* =========================
          EXPLORE
      ========================= }

      <div className="sidebar-section countries-section">

        <div className="sidebar-label">
          EXPLORE
        </div>

        <button
          className={
            selectedCountry === ''
              ? 'country active'
              : 'country'
          }
          onClick={() =>
            onCountryChange('')
          }
        >
          <span className="country-icon">🌎</span>
          <span>All Countries</span>
        </button>

        {countries.map(country => (
          <button
            key={country.code}
            className={
              selectedCountry === country.code
                ? 'country active'
                : 'country'
            }
            onClick={() =>
              onCountryChange(country.code)
            }
          >
            <span className="country-icon">
              {country.flag}
            </span>

            <span>
              {country.name}
            </span>
          </button>
        ))}

      </div>

    </aside>
  )
}

export default Sidebar*/
const countries = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'IN', name: 'India', flag: '🇮🇳' }
]

function Sidebar({
  selectedCountry,
  onCountryChange,
  favorites,
  channels,
  onFavoriteClick,
  onRemoveFavorite
}) {
  /*
   * Favorites stored in MongoDB are channel IDs.
   *
   * Match those IDs against the channels we
   * already have loaded from the IPTV API.
   */
  const favoriteChannels = channels.filter(channel =>
    favorites.includes(channel.id)
  )

  return (
    <aside className="sidebar">

      {/* =========================
          MAIN NAVIGATION
      ========================= */}

      <div className="sidebar-section menu-section">
        <div className="sidebar-label">
          MENU
        </div>

        <button
          className="sidebar-nav active"
          onClick={() => onCountryChange('')}
        >
          <span className="sidebar-nav-icon">⌂</span>
          <span>Home</span>
        </button>

        <button
          className="sidebar-nav"
          onClick={() => onCountryChange('')}
        >
          <span className="sidebar-nav-icon">▣</span>
          <span>All Channels</span>
        </button>
      </div>


      {/* =========================
          MY LIBRARY
      ========================= */}

      <div className="sidebar-section library-section">

        <div className="sidebar-label">
          MY LIBRARY
        </div>

        <div className="sidebar-nav favorites-nav">
          <span className="sidebar-nav-icon">★</span>
          <span>Favorites</span>

          <span className="favorites-count">
            {favoriteChannels.length}
          </span>
        </div>

        {favoriteChannels.length === 0 ? (
          <div className="sidebar-empty">
            <div className="sidebar-empty-icon">
              ☆
            </div>

            <p>No favorites yet</p>

            <small>
              Star a channel to save it here.
            </small>
          </div>
        ) : (
          <div className="favorites-list">

            {favoriteChannels.map(channel => (
              <div
                key={channel.id}
                className="favorite-item"
              >

                <button
                  className="favorite-channel"
                  onClick={() =>
                    onFavoriteClick(channel)
                  }
                >

                  <div className="favorite-logo">
                    {channel.name?.charAt(0) || '?'}
                  </div>

                  <span className="favorite-name">
                    {channel.name}
                  </span>

                </button>

                <button
                  className="favorite-remove"
                  onClick={() =>
                    onRemoveFavorite(channel)
                  }
                  title="Remove from favorites"
                >
                  ★
                </button>

              </div>
            ))}

          </div>
        )}

      </div>


      {/* =========================
          EXPLORE
      ========================= */}

      <div className="sidebar-section countries-section">

        <div className="sidebar-label">
          EXPLORE
        </div>

        <button
          className={
            selectedCountry === ''
              ? 'country active'
              : 'country'
          }
          onClick={() =>
            onCountryChange('')
          }
        >
          <span className="country-icon">🌎</span>
          <span>All Countries</span>
        </button>

        {countries.map(country => (
          <button
            key={country.code}
            className={
              selectedCountry === country.code
                ? 'country active'
                : 'country'
            }
            onClick={() =>
              onCountryChange(country.code)
            }
          >
            <span className="country-icon">
              {country.flag}
            </span>

            <span>
              {country.name}
            </span>
          </button>
        ))}

      </div>

    </aside>
  )
}

export default Sidebar