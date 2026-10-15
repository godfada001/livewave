/*import { useEffect, useState } from 'react'

import Header from './components/header'
import Sidebar from './components/sidebar'
import ChannelCard from './components/channelCard'
import Player from './components/player'

import Login from './pages/login'
import Register from './pages/register'

import {
  getChannels,
  searchChannels,
  getBestStream,
  getCurrentUser,
  getFavorites,
  addFavorite,
  removeFavorite,
  logout
} from './services/Api'

function App() {
  /* =========================
     AUTH STATE
  ========================= 

  const [user, setUser] = useState(null)

  const [authLoading, setAuthLoading] =
    useState(true)

  const [authPage, setAuthPage] =
    useState('login')

  /* =========================
     CHANNEL STATE
  ========================= 

  const [channels, setChannels] =
    useState([])
    const [visibleCount, setVisibleCount] = useState(48)

  const [selectedCountry, setSelectedCountry] =
    useState('NG') // Default to Nigeria

    const[currentPage, setCurrentPage] = useState(1)
    
    const channelsPerPage =24

    const indexOfLastChannel =
  currentPage * channelsPerPage

const indexOfFirstChannel =
  indexOfLastChannel - channelsPerPage

const currentChannels =
  channels.slice(
    indexOfFirstChannel,
    indexOfLastChannel
  )

const totalPages =
  Math.ceil(
    channels.length / channelsPerPage
  )
    const [selectedLetter, setSelectedLetter] = useState('All')

  const [search, setSearch] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState(null)

    const alphabet = [
  'ALL',
  '0-9',
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
]
const filteredChannels = channels.filter(channel => {
  if (selectedLetter === 'ALL') {
    return true
  }

  const name = channel.name?.trim() || ''

  if (!name) {
    return false
  }

  if (selectedLetter === '0-9') {
    return /^[0-9]/.test(name)
  }

  return name.toUpperCase().startsWith(selectedLetter)
})
function changeLetter(letter) {
  setSelectedLetter(letter)
}

  /* =========================
     STREAM STATE
  ========================= 

  const [stream, setStream] =
    useState(null)

  const [playingChannel, setPlayingChannel] =
    useState(null)

  /* =========================
     FAVORITES
  ========================= 

  const [favorites, setFavorites] =
    useState([])

  /* =========================
     CHECK LOGIN
  ========================= 

  useEffect(() => {
    async function checkAuthentication() {
      const token =
        localStorage.getItem('token')

      if (!token) {
        setAuthLoading(false)
        return
      }

      try {
        const result =
          await getCurrentUser()

        setUser(result.data || result.user)
      } catch (error) {
        console.error(
          'Authentication check failed:',
          error
        )

        logout()
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuthentication()
  }, [])

  /* =========================
     LOAD FAVORITES
  ========================= 

  useEffect(() => {
    if (!user) {
      return
    }

    async function loadFavorites() {
      try {
        const result =
          await getFavorites()

        /*
         * Depending on your backend,
         * result.data may be an array
         * of favorite documents.
         

        const favoriteData =
          result.data || []

        setFavorites(favoriteData)
      } catch (error) {
        console.error(
          'Unable to load favorites:',
          error
        )
      }
    }

    loadFavorites()
  }, [user])

  /* =========================
     LOAD CHANNELS
  ========================= 

  async function loadChannels(country) {
    try {
      setLoading(true)
      setError(null)

      const result =
        await getChannels(country)

      setChannels(result.data || [])
      setVisibleCount(48)
    } catch (error) {
      console.error(error)

      if (error.status === 401) {
        handleLogout()
        return
      }

      setError(
        'Unable to load channels.'
      )
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     SEARCH
  ========================= 

  async function handleSearch() {
    setSelectedLetter('ALL')
    if (!search.trim()) {
      loadChannels(selectedCountry)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result =
        await searchChannels(search)

      setChannels(result.data || [])
      setVisibleCount(48)
    } catch (error) {
      console.error(error)

      setError(
        'Unable to search channels.'
      )
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     PLAY CHANNEL
  ========================= 

  async function handlePlay(channel) {
    if (!user) {
      setAuthPage('login')
      return
    }

    try {
      setError(null)

      setPlayingChannel(channel)

      const result =
        await getBestStream(channel.id)

      if (!result.data) {
        setError(
          'No playable stream found for this channel.'
        )

        setPlayingChannel(null)

        return
      }

      setStream(result.data)
    } catch (error) {
      console.error(error)

      if (error.status === 401) {
        handleLogout()
        return
      }

      setError(
        'Unable to load the channel stream.'
      )

      setPlayingChannel(null)
    }
  }

  /* =========================
     FAVORITE CHECK
  ========================= 

 function isFavorite(channelId) {
  return favorites.some(favorite => {
    const id =
      typeof favorite === 'string'
        ? favorite
        : favorite.channelId || favorite.channel

    return id === channelId
  })
}

  /* =========================
     ADD / REMOVE FAVORITE
  ========================= 

  async function handleFavorite(channel) {
    if (!user) {
      setAuthPage('login')
      return
    }

    const alreadyFavorite =
      isFavorite(channel.id)

    try {
      setError(null)

     if (alreadyFavorite) {
  await removeFavorite(channel.id)

  setFavorites(current =>
    current.filter(favorite => {
      const id =
        typeof favorite === 'string'
          ? favorite
          : favorite.channelId || favorite.channel

      return id !== channel.id
    })
  )
}  else {
  const result =
    await addFavorite(channel.id)

  /*
   * Backend returns the complete
   * favorites array.
   
  if (Array.isArray(result.data)) {
    setFavorites(result.data)
  } else {
    setFavorites(current => [
      ...current,
      channel.id
    ])
  }
}
    } catch (error) {
      console.error(error)

      if (error.status === 401) {
        handleLogout()
        return
      }

      setError(
        'Unable to update favorite.'
      )
    }
  }

  /* =========================
     CLOSE PLAYER
  ========================= 

  function closePlayer() {
    setStream(null)
    setPlayingChannel(null)
  }

  /* =========================
     CHANGE COUNTRY
  ========================= 

  function changeCountry(country) {
    setSelectedCountry(country)
    setSearch('')
    setSelectedLetter('ALL')
    setCurrentPage(1)
  

    loadChannels(country)
  }

  /* =========================
     LOGIN SUCCESS
  ========================= 

  function handleLogin(userData) {
    setUser(userData)

    setAuthLoading(false)
  }

  /* =========================
     REGISTER SUCCESS
  ========================= 

  function handleRegister(userData) {
    /*
     * If registration returned
     * a token, the user is already
     * authenticated.
     

    if (userData) {
      setUser(userData)
      setAuthLoading(false)
      return
    }

    /*
     * Otherwise send them to
     * the login screen.
     

    setAuthPage('login')
  }

  /* =========================
     LOGOUT
  ========================= 

  function handleLogout() {
    logout()

    setUser(null)
    setFavorites([])
    setStream(null)
    setPlayingChannel(null)
    setChannels([])

    setAuthPage('login')
  }

  /* =========================
     INITIAL CHANNEL LOAD
  ========================= 

  useEffect(() => {
    if (!user) {
      return
    }

    loadChannels('US')
  }, [user])

  /* =========================
     AUTH LOADING SCREEN
  ========================= 

  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="message">
          Checking authentication...
        </div>
      </div>
    )
  }

  /* =========================
     LOGIN / REGISTER
  ========================= 

  if (!user) {
    if (authPage === 'register') {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() =>
            setAuthPage('login')
          }
        />
      )
    }

    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() =>
          setAuthPage('register')
        }
      />
    )
  }

  /* =========================
     MAIN APPLICATION
  ========================= 

  return (
    <div className="app">
      <Header
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        onLogout={handleLogout}
      />
<section className="hero-section">
  <div className="hero-content">
    <span className="hero-eyebrow">
      ● LIVE TELEVISION
    </span>

    <h1>
      Watch television
      <br />
      <span>from anywhere.</span>
    </h1>

    <p>
      Explore live channels from around the world.
      Discover news, sports, entertainment and more.
    </p>

    <div className="hero-actions">
      <button
        className="hero-primary-button"
        onClick={() => {
          document
            .querySelector(".channels-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <span>▶</span>
        Browse Channels
      </button>

      <button
        className="hero-secondary-button"
        onClick={() => {
          document
            .querySelector(".favorites-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        ★ My Favorites
      </button>
    </div>
  </div>

  <div className="hero-visual">
    <div className="hero-glow"></div>

    <div className="hero-screen">
      <div className="hero-screen-top">
        <span className="hero-live-dot"></span>
        LIVE NOW
      </div>

      <div className="hero-screen-center">
        <span>▶</span>
      </div>

      <div className="hero-screen-bottom">
        <span>STREAMTV</span>
        <span>LIVE</span>
      </div>
    </div>
  </div>
</section>
      <div className="layout">
        <Sidebar
  selectedCountry={selectedCountry}
  onCountryChange={changeCountry}
  favorites={favorites}
  channels={channels}
  onFavoriteSelect={handlePlay}
/>

        <main className="content channels-section">
          <div className="content-header">
            <div>
              <p className="eyebrow">
                LIVE TELEVISION
              </p>

              <h2>
  {search
    ? `Search results for "${search}"`
    : selectedLetter !== 'ALL'
      ? `${selectedLetter} Channels`
      : selectedCountry === 'NG'
        ? 'Nigerian Channels'
        : 'Live Channels'}
</h2>
            </div>

            <div className="channel-count">
              {filteredChannels.length} channels
            </div>
          </div>

          {loading && (
            <div className="message">
              Loading channels...
            </div>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            channels.length === 0 && (
              <div className="message">
                No channels found.
              </div>
            )}

<div className="channel-count">
  {channels.length} channels
</div>
<div className="alphabet-filter">
  {alphabet.map(letter => {
    const hasChannels =
      letter === 'ALL'
        ? channels.length > 0
        : channels.some(channel => {
            const name =
              channel.name?.trim() || ''

            if (!name) {
              return false
            }

            if (letter === '0-9') {
              return /^[0-9]/.test(name)
            }

            return name
              .toUpperCase()
              .startsWith(letter)
          })

    return (
      <button
        key={letter}
        className={
          `alphabet-button ${
            selectedLetter === letter
              ? 'alphabet-active'
              : ''
          }`
        }
        disabled={!hasChannels}
        onClick={() => changeLetter(letter)}
      >
        {letter}
      </button>
    )
  })}
</div>
         <div className="channel-grid">
  {filteredChannels
    .slice(
  (currentPage - 1) * channelsPerPage,
  currentPage * channelsPerPage
)
    .map(channel => (
      <ChannelCard
        key={channel.id}
        channel={channel}
        onPlay={handlePlay}
        isFavorite={isFavorite(
          channel.id
        )}
        onFavorite={
          handleFavorite
        }
      />
    ))}
    
</div>
{totalPages > 1 && (
  <div className="pagination">

    <button
      className="pagination-button"
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage(currentPage - 1)
      }
    >
      ← Previous
    </button>

    <span className="pagination-info">
      Page {currentPage} of {totalPages}
    </span>

    <button
      className="pagination-button"
      disabled={currentPage === totalPages}
      onClick={() =>
        setCurrentPage(currentPage + 1)
      }
    >
      Next →
    </button>

  </div>
)}

{visibleCount < channels.length && (
  <button
    className="load-more-button"
    onClick={() =>
      setVisibleCount(current =>
        current + 48
      )
    }
  >
    Load More
  </button>
)}
        </main>
      </div>

      {stream && (
        <Player
          stream={stream}
          onClose={closePlayer}
        />
      )}
    </div>
  )
}

export default App*/

import { lazy, Suspense, useEffect, useState } from 'react'

import Header from './components/header'
import Sidebar from './components/sidebar'
import ChannelCard from './components/channelCard'

// The player pulls in hls.js (the bulk of the bundle). Load it
// only when someone actually plays a channel, so sign-in and
// browsing stay light on mobile data.
const Player = lazy(() => import('./components/player'))

import Login from './pages/login'
import Register from './pages/register'

import {
  getChannels,
  searchChannels,
  getBestStream,
  getCurrentUser,
  getFavorites,
  addFavorite,
  removeFavorite,
  logout
} from './services/Api'

function App() {
  /* =========================
     AUTH STATE
  ========================= */

  const [user, setUser] = useState(null)

  const [authLoading, setAuthLoading] =
    useState(true)

  const [authPage, setAuthPage] =
    useState('login')

  /* =========================
     CHANNEL STATE
  ========================= */

  const [channels, setChannels] =
    useState([])
    const [visibleCount, setVisibleCount] = useState(48)

  const [selectedCountry, setSelectedCountry] =
    useState('NG') // Default to Nigeria

    const[currentPage, setCurrentPage] = useState(1)
    
    const channelsPerPage =24

    const indexOfLastChannel =
  currentPage * channelsPerPage

const indexOfFirstChannel =
  indexOfLastChannel - channelsPerPage

const currentChannels =
  channels.slice(
    indexOfFirstChannel,
    indexOfLastChannel
  )

const totalPages =
  Math.ceil(
    channels.length / channelsPerPage
  )
    const [selectedLetter, setSelectedLetter] = useState('ALL')

  const [search, setSearch] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState(null)

    const alphabet = [
  'ALL',
  '0-9',
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
]
const filteredChannels = channels.filter(channel => {
  if (selectedLetter === 'ALL') {
    return true
  }

  const name = channel.name?.trim() || ''

  if (!name) {
    return false
  }

  if (selectedLetter === '0-9') {
    return /^[0-9]/.test(name)
  }

  return name.toUpperCase().startsWith(selectedLetter)
})
function changeLetter(letter) {
  setSelectedLetter(letter)
}

  /* =========================
     STREAM STATE
  ========================= */

  const [stream, setStream] =
    useState(null)

  const [playingChannel, setPlayingChannel] =
    useState(null)

  /* =========================
     FAVORITES
  ========================= */

  const [favorites, setFavorites] =
    useState([])

  /* =========================
     CHECK LOGIN
  ========================= */

  useEffect(() => {
    async function checkAuthentication() {
      const token =
        localStorage.getItem('token')

      if (!token) {
        setAuthLoading(false)
        return
      }

      try {
        const result =
          await getCurrentUser()

        setUser(result.data || result.user)
      } catch (error) {
        console.error(
          'Authentication check failed:',
          error
        )

        logout()
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuthentication()
  }, [])

  /* =========================
     LOAD FAVORITES
  ========================= */

  useEffect(() => {
    if (!user) {
      return
    }

    async function loadFavorites() {
      try {
        const result =
          await getFavorites()

        /*
         * Depending on your backend,
         * result.data may be an array
         * of favorite documents.
         */

        const favoriteData =
          result.data || []

        setFavorites(favoriteData)
      } catch (error) {
        console.error(
          'Unable to load favorites:',
          error
        )
      }
    }

    loadFavorites()
  }, [user])

  /* =========================
     LOAD CHANNELS
  ========================= */

  async function loadChannels(country) {
    try {
      setLoading(true)
      setError(null)

      const result =
        await getChannels(country)

      setChannels(result.data || [])
      setVisibleCount(48)
    } catch (error) {
      console.error(error)

      if (error.status === 401) {
        handleLogout()
        return
      }

      setError(
        'Unable to load channels.'
      )
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     SEARCH
  ========================= */

  async function handleSearch() {
    setSelectedLetter('ALL')
    if (!search.trim()) {
      loadChannels(selectedCountry)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result =
        await searchChannels(search)

      setChannels(result.data || [])
      setVisibleCount(48)
    } catch (error) {
      console.error(error)

      setError(
        'Unable to search channels.'
      )
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     PLAY CHANNEL
  ========================= */

  async function handlePlay(channel) {
    if (!user) {
      setAuthPage('login')
      return
    }

    try {
      setError(null)

      setPlayingChannel(channel)

      const result =
        await getBestStream(channel.id)

      if (!result.data) {
        setError(
          'No playable stream found for this channel.'
        )

        setPlayingChannel(null)

        return
      }

      setStream(result.data)
    } catch (error) {
      console.error(error)

      if (error.status === 401) {
        handleLogout()
        return
      }

      setError(
        'Unable to load the channel stream.'
      )

      setPlayingChannel(null)
    }
  }

  /* =========================
     FAVORITE CHECK
  ========================= */

 function isFavorite(channelId) {
  return favorites.some(favorite => {
    const id =
      typeof favorite === 'string'
        ? favorite
        : favorite.channelId || favorite.channel

    return id === channelId
  })
}

  /* =========================
     ADD / REMOVE FAVORITE
  ========================= */

  async function handleFavorite(channel) {
    if (!user) {
      setAuthPage('login')
      return
    }

    const alreadyFavorite =
      isFavorite(channel.id)

    try {
      setError(null)

     if (alreadyFavorite) {
  await removeFavorite(channel.id)

  setFavorites(current =>
    current.filter(favorite => {
      const id =
        typeof favorite === 'string'
          ? favorite
          : favorite.channelId || favorite.channel

      return id !== channel.id
    })
  )
}  else {
  const result =
    await addFavorite(channel.id)

  /*
   * Backend returns the complete
   * favorites array.
   */
  if (Array.isArray(result.data)) {
    setFavorites(result.data)
  } else {
    setFavorites(current => [
      ...current,
      channel.id
    ])
  }
}
    } catch (error) {
      console.error(error)

      if (error.status === 401) {
        handleLogout()
        return
      }

      setError(
        'Unable to update favorite.'
      )
    }
  }

  /* =========================
     CLOSE PLAYER
  ========================= */

  function closePlayer() {
    setStream(null)
    setPlayingChannel(null)
  }

  /* =========================
     CHANGE COUNTRY
  ========================= */

  function changeCountry(country) {
    setSelectedCountry(country)
    setSearch('')
    setSelectedLetter('ALL')
    setCurrentPage(1)
  

    loadChannels(country)
  }

  /* =========================
     LOGIN SUCCESS
  ========================= */

  function handleLogin(userData) {
    setUser(userData)

    setAuthLoading(false)
  }

  /* =========================
     REGISTER SUCCESS
  ========================= */

  function handleRegister(userData) {
    /*
     * If registration returned
     * a token, the user is already
     * authenticated.
     */

    if (userData) {
      setUser(userData)
      setAuthLoading(false)
      return
    }

    /*
     * Otherwise send them to
     * the login screen.
     */

    setAuthPage('login')
  }

  /* =========================
     LOGOUT
  ========================= */

  function handleLogout() {
    logout()

    setUser(null)
    setFavorites([])
    setStream(null)
    setPlayingChannel(null)
    setChannels([])

    setAuthPage('login')
  }

  /* =========================
     INITIAL CHANNEL LOAD
  ========================= */

  useEffect(() => {
    if (!user) {
      return
    }

    loadChannels('US')
  }, [user])

  /* =========================
     AUTH LOADING SCREEN
  ========================= */

  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="message">
          Checking authentication...
        </div>
      </div>
    )
  }

  /* =========================
     LOGIN / REGISTER
  ========================= */

  if (!user) {
    if (authPage === 'register') {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() =>
            setAuthPage('login')
          }
        />
      )
    }

    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() =>
          setAuthPage('register')
        }
      />
    )
  }

  /* =========================
     MAIN APPLICATION
  ========================= */

  return (
    <div className="app">
      <Header
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        onLogout={handleLogout}
      />
<section className="hero-section">
  <div className="hero-content">
    <span className="hero-eyebrow">
      ● LIVE TELEVISION
    </span>

    <h1>
      Watch television
      <br />
      <span>from anywhere.</span>
    </h1>

    <p>
      Explore live channels from around the world.
      Discover news, sports, entertainment and more.
    </p>

    <div className="hero-actions">
      <button
        className="hero-primary-button"
        onClick={() => {
          document
            .querySelector(".channels-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <span>▶</span>
        Browse Channels
      </button>

      <button
        className="hero-secondary-button"
        onClick={() => {
          document
            .querySelector(".favorites-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        ★ My Favorites
      </button>
    </div>
  </div>

  <div className="hero-visual">
    <div className="hero-glow"></div>

    <div className="hero-screen">
      <div className="hero-screen-top">
        <span className="hero-live-dot"></span>
        LIVE NOW
      </div>

      <div className="hero-screen-center">
        <span>▶</span>
      </div>

      <div className="hero-screen-bottom">
        <span>STREAMTV</span>
        <span>LIVE</span>
      </div>
    </div>
  </div>
</section>
      <div className="layout">
        <Sidebar
  selectedCountry={selectedCountry}
  onCountryChange={changeCountry}
  favorites={favorites}
  channels={channels}
  onFavoriteSelect={handlePlay}
/>

        <main className="content channels-section">
          <div className="content-header">
            <div>
              <p className="eyebrow">
                LIVE TELEVISION
              </p>

              <h2>
  {search
    ? `Search results for "${search}"`
    : selectedLetter !== 'ALL'
      ? `${selectedLetter} Channels`
      : selectedCountry === 'NG'
        ? 'Nigerian Channels'
        : 'Live Channels'}
</h2>
            </div>

            <div className="channel-count">
              {filteredChannels.length} channels
            </div>
          </div>

          {loading && (
            <div className="message">
              Loading channels...
            </div>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            channels.length === 0 && (
              <div className="message">
                No channels found.
              </div>
            )}

<div className="channel-count">
  {channels.length} channels
</div>
<div className="alphabet-filter">
  {alphabet.map(letter => {
    const hasChannels =
      letter === 'ALL'
        ? channels.length > 0
        : channels.some(channel => {
            const name =
              channel.name?.trim() || ''

            if (!name) {
              return false
            }

            if (letter === '0-9') {
              return /^[0-9]/.test(name)
            }

            return name
              .toUpperCase()
              .startsWith(letter)
          })

    return (
      <button
        key={letter}
        className={
          `alphabet-button ${
            selectedLetter === letter
              ? 'alphabet-active'
              : ''
          }`
        }
        disabled={!hasChannels}
        onClick={() => changeLetter(letter)}
      >
        {letter}
      </button>
    )
  })}
</div>
         <div className="channel-grid">
  {filteredChannels
    .slice(
  (currentPage - 1) * channelsPerPage,
  currentPage * channelsPerPage
)
    .map(channel => (
      <ChannelCard
        key={channel.id}
        channel={channel}
        onPlay={handlePlay}
        isFavorite={isFavorite(
          channel.id
        )}
        onFavorite={
          handleFavorite
        }
      />
    ))}
    
</div>
{totalPages > 1 && (
  <div className="pagination">

    <button
      className="pagination-button"
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage(currentPage - 1)
      }
    >
      ← Previous
    </button>

    <span className="pagination-info">
      Page {currentPage} of {totalPages}
    </span>

    <button
      className="pagination-button"
      disabled={currentPage === totalPages}
      onClick={() =>
        setCurrentPage(currentPage + 1)
      }
    >
      Next →
    </button>

  </div>
)}

{visibleCount < channels.length && (
  <button
    className="load-more-button"
    onClick={() =>
      setVisibleCount(current =>
        current + 48
      )
    }
  >
    Load More
  </button>
)}
        </main>
      </div>

      {stream && (
        <Suspense
          fallback={
            <div className="player-overlay">
              <div className="message">
                Loading player...
              </div>
            </div>
          }
        >
          <Player
            stream={stream}
            onClose={closePlayer}
          />
        </Suspense>
      )}
    </div>
  )
}

export default App