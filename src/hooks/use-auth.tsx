import * as React from "react"
import { AuthModal } from "@/components/auth/auth-modal"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AUTH_STORAGE_KEY, readAuthSession, type AuthSession, type AuthVariant } from "@/lib/auth"

type Auth = {
  session: AuthSession | null
  authenticated: boolean
  requireAuth: (variant?: AuthVariant) => boolean
  signOut: () => void
}
const AuthContext = React.createContext<Auth | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<AuthSession | null>(() => {
    try { return readAuthSession(localStorage.getItem(AUTH_STORAGE_KEY)) } catch { return null }
  })
  const [request, setRequest] = React.useState<{ variant: AuthVariant; id: number; open: boolean } | null>(null)
  const requestId = React.useRef(0)
  const trigger = React.useRef<HTMLElement | null>(null)
  const requireAuth = React.useCallback((variant?: AuthVariant) => {
    if (session) return true
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    // Balance and navigation use the current studio; composers can specify their mode explicitly.
    const resolved = variant ?? (window.location.pathname.replace(/\/$/, "").endsWith("/photo") ? "nano" : "models")
    setRequest((current) => current?.open ? current : { variant: resolved, id: ++requestId.current, open: true })
    return false
  }, [session])
  const close = React.useCallback(() => setRequest(null), [])
  const changeOpen = React.useCallback((open: boolean) => setRequest((current) => current ? { ...current, open } : null), [])
  const complete = React.useCallback((next: AuthSession) => {
    setSession(next)
    try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next)) } catch { /* Session still works in memory. */ }
  }, [])
  const signOut = React.useCallback(() => {
    setSession(null)
    setRequest(null)
    try { localStorage.removeItem(AUTH_STORAGE_KEY) } catch { /* Storage may be blocked. */ }
  }, [])
  const value = React.useMemo(() => ({ session, authenticated: Boolean(session), requireAuth, signOut }), [session, requireAuth, signOut])
  return (
    <AuthContext value={value}>
      {children}
      {request && (
        <TooltipProvider>
          <AuthModal key={request.id} variant={request.variant} open={request.open} onOpenChange={changeOpen} onComplete={complete} onClose={close}
            onRestoreFocus={() => { if (trigger.current?.isConnected) trigger.current.focus({ preventScroll: true }) }} />
        </TooltipProvider>
      )}
    </AuthContext>
  )
}

export function useAuth() {
  const auth = React.useContext(AuthContext)
  if (!auth) throw new Error("useAuth must be used within AuthProvider")
  return auth
}

// Intercept before Radix opens a menu or a native file picker. React capture also covers portals.
// Typing and tabbing remain available; settings, attachments and buttons require sign-in.
export function useComposerAuth(variant: AuthVariant = "models") {
  const { authenticated, requireAuth } = useAuth()
  const capture = (event: React.SyntheticEvent<HTMLElement>) => {
    if (authenticated || !(event.target instanceof Element)) return
    const control = event.target.closest('button, a, select, input[type="file"], [role="slider"], [role="switch"], [role="checkbox"], [role="radio"], [role="combobox"], [role^="menuitem"]')
    if (!control || control.matches(':disabled, [aria-disabled="true"]')) return
    event.preventDefault()
    event.stopPropagation()
    if (control instanceof HTMLElement) control.focus({ preventScroll: true })
    requireAuth(variant)
  }
  return {
    onPointerDownCapture: (event: React.PointerEvent<HTMLElement>) => { if (event.button === 0) capture(event) },
    onClickCapture: capture,
    onKeyDownCapture: (event: React.KeyboardEvent<HTMLElement>) => {
      if (["Enter", " ", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) capture(event)
    },
  }
}
