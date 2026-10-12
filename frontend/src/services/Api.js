const API_URL = '/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers
    }
  )

  let data = {}

  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    const error = new Error(
      data.message ||
      `Request failed: ${response.status}`
    )

    error.status = response.status

    throw error
  }

  return data
}


/* =========================
   AUTH
========================= */

export async function register(user) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(user)
  })
}

export async function login(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
}

export async function getCurrentUser() {
  return request('/auth/me')
}


/* =========================
   CHANNELS
========================= */

export async function getChannels(country) {
  const query = country
    ? `?country=${encodeURIComponent(country)}`
    : ''

  return request(`/channels${query}`)
}

export async function searchChannels(query) {
  return request(
    `/channels/search?q=${encodeURIComponent(query)}`
  )
}

export async function getChannel(id) {
  return request(
    `/channels/${encodeURIComponent(id)}`
  )
}


/* =========================
   STREAMS
========================= */

export async function getBestStream(channelId) {
  return request(
    `/streams/channel/${encodeURIComponent(channelId)}/best`
  )
}


/* =========================
   FAVORITES
========================= */

export async function getFavorites() {
  return request('/favorites')
}

export async function addFavorite(channelId) {
  return request(
    `/favorites/${encodeURIComponent(channelId)}`,
    {
      method: 'POST'
    }
  )
}

export async function removeFavorite(channelId) {
  return request(
    `/favorites/${encodeURIComponent(channelId)}`,
    {
      method: 'DELETE'
    }
  )
}

export async function checkFavorite(channelId) {
  return request(
    `/favorites/${encodeURIComponent(channelId)}`
  )
}


/* =========================
   LOGOUT
========================= */

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}