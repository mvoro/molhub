import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './hooks/use-auth'
import { initTheme } from './hooks/use-theme'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider><App /></AuthProvider>
  </StrictMode>,
)
