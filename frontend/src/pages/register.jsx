import { useState } from 'react'
import { register } from '../services/Api'

function Register({
  onRegister,
  onSwitchToLogin
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    if (!name || !email || !password) {
      setError('All fields are required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    try {
      setLoading(true)

      const result = await register({
        name,
        email,
        password
      })

      if (result.token) {
        localStorage.setItem(
          'token',
          result.token
        )

        if (result.user) {
          localStorage.setItem(
            'user',
            JSON.stringify(result.user)
          )
        }

        onRegister(result.user || null)

        return
      }

      onRegister(null)

    } catch (error) {
      console.error(error)

      setError(
        error.message ||
        'Unable to create account.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      {/* Background */}
      <div className="auth-background">
        <div className="auth-background-overlay" />
      </div>

      {/* Branding */}
      <div className="auth-brand">
        <div className="auth-logo">
          ▶
        </div>

        <div>
          <strong>Live Channels</strong>
          <span>Live television</span>
        </div>
      </div>

      {/* Main content */}
      <div className="auth-content">

        <div className="auth-showcase">

          <p className="auth-kicker">
            YOUR WORLD. LIVE.
          </p>

          <h1>
            Television without
            <span> limits.</span>
          </h1>

          <p className="auth-description">
            Watch live channels from around
            the world and keep all your
            favorites in one place.
          </p>

          <div className="auth-stats">
            <div>
              <strong>40K+</strong>
              <span>Live channels</span>
            </div>

            <div>
              <strong>🌎</strong>
              <span>Worldwide</span>
            </div>

            <div>
              <strong>★</strong>
              <span>Your favorites</span>
            </div>
          </div>

        </div>

        {/* Register card */}
        <div className="auth-card">

          <div className="auth-header">

            <div className="mobile-brand">
              <div className="auth-logo">
                ▶
              </div>
            </div>

            <p className="eyebrow">
              GET STARTED
            </p>

            <h2>
              Create your account
            </h2>

            <p>
              Join Live Channels and start
              watching live television.
            </p>

          </div>

          {error && (
            <div className="error auth-error">
              <span>!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label htmlFor="name">
                Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={event =>
                  setName(event.target.value)
                }
                placeholder="Your name"
                autoComplete="name"
              />

            </div>

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={event =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
              />

            </div>

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={event =>
                  setPassword(event.target.value)
                }
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />

              <small>
                Use at least 6 characters.
              </small>

            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Creating account...'
                : 'Create account'}

              {!loading && (
                <span>→</span>
              )}
            </button>

          </form>

          <div className="auth-switch">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={onSwitchToLogin}
            >
              Sign in
            </button>

          </div>

        </div>

      </div>

      <div className="auth-footer">
        © 2026 Live Channels
      </div>

    </div>
  )
}

export default Register
