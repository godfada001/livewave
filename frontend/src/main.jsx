import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './app.jsx'

import './index.css'
import './App.css'
import './mobile.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element with id "root" was not found.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)