import { useState } from 'react'
import { login } from '../services/Api'

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    try {
      setLoading(true)

      const result = await login({
        email,
        password
      })

      console.log('LOGIN RESPONSE:', result)

      const token = result.data?.token
      const user = result.data?.user

      if (!token) {
        throw new Error(
          'Login succeeded but no token was returned.'
        )
      }

      localStorage.setItem('token', token)

      if (user) {
        localStorage.setItem(
          'user',
          JSON.stringify(user)
        )
      }

      onLogin(user || null)
    } catch (error) {
      console.error('Login error:', error)

      setError(
        error.message ||
        'Unable to log in.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      {/* Background decoration */}
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="auth-container">

        {/* =================================================
            LEFT SIDE — BRAND
           ================================================= */}

        <section className="auth-hero">

          <div className="auth-brand">
            <span className="brand-mark">
              ▶
            </span>

            <span>
              LIVEWAVE
            </span>
          </div>

          <div className="auth-hero-content">

            <div className="live-badge">
              <span className="live-dot" />
              LIVE TELEVISION
            </div>

            <h1>
              Your world.
              <br />
              <span>Live on screen.</span>
            </h1>

            <p>
              Watch live television from around
              the world. Discover channels, stream
              instantly, and keep your favorites
              close.
            </p>

            <div className="auth-features">

              <div className="auth-feature">
                <span>◉</span>
                <div>
                  <strong>Live channels</strong>
                  <small>
                    Television from around the world
                  </small>
                </div>
              </div>

              <div className="auth-feature">
                <span>★</span>
                <div>
                  <strong>Your favorites</strong>
                  <small>
                    Save the channels you watch most
                  </small>
                </div>
              </div>

              <div className="auth-feature">
                <span>▶</span>
                <div>
                  <strong>Instant streaming</strong>
                  <small>
                    Find a channel and start watching
                  </small>
                </div>
              </div>

            </div>

          </div>

          <div className="auth-footer">
            © 2026 LIVEWAVE
          </div>

        </section>


        {/* =================================================
            RIGHT SIDE — LOGIN
           ================================================= */}

        <section className="auth-panel">

          <div className="auth-card">

            <div className="auth-header">

              <p className="eyebrow">
                WELCOME BACK
              </p>

              <h2>
                Sign in
              </h2>

              <p>
                Enter your details to continue
                watching live television.
              </p>

            </div>

            {error && (
              <div className="error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="input-group">

                <label htmlFor="login-email">
                  Email
                </label>

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={event =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                />

              </div>

              <div className="input-group">

                <label htmlFor="login-password">
                  Password
                </label>

                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={event =>
                    setPassword(event.target.value)
                  }
                  placeholder="Your password"
                  autoComplete="current-password"
                />

              </div>

              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Signing in...'
                  : 'Sign in'}
              </button>

            </form>

            <div className="auth-switch">

              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={onSwitchToRegister}
              >
                Create one
              </button>

            </div>

          </div>

        </section>

      </div>
    </div>
  )
}

export default Login