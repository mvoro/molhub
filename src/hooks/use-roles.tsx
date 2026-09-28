import * as React from "react"
import { type RoleReviewInput } from "@/data/roles"
import {
  createRoleReview,
  EMPTY_ROLE_PREFERENCES,
  readStoredRolePreferences,
  recordRoleSession,
  ROLE_PREFERENCES_KEY,
  resolveRole,
  updateStoredRolePreferences,
  type RolePreferences,
  type RoleStorage,
} from "@/lib/roles"

export { ROLE_PREFERENCES_KEY } from "@/lib/roles"

type RolesContextValue = RolePreferences & {
  toggleFavorite: (id: string) => void
  toggleLike: (id: string) => void
  recordUse: (id: string, chatId: string) => void
  saveReview: (id: string, input: RoleReviewInput) => boolean
}

const RolesContext = React.createContext<RolesContextValue | null>(null)

function localRoleStorage(): RoleStorage | null {
  try { return window.localStorage } catch { return null }
}

/** A single state keeps catalog, details and picker in sync. Only local actions
 * write storage; external notifications refresh from its latest value. */
export function RolesProvider({ children }: { children: React.ReactNode }) {
  const [initialStorage] = React.useState(localRoleStorage)
  const storage = React.useRef(initialStorage)
  const [preferences, setPreferences] = React.useState(() => readStoredRolePreferences(initialStorage, EMPTY_ROLE_PREFERENCES))
  const current = React.useRef(preferences)

  const update = React.useCallback((change: (previous: RolePreferences) => RolePreferences) => {
    const result = updateStoredRolePreferences(storage.current, current.current, change)
    if (!result.persisted) storage.current = null
    current.current = result.preferences
    setPreferences(result.preferences)
  }, [])

  React.useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key !== ROLE_PREFERENCES_KEY && event.key !== null) return
      if (!storage.current || (event.storageArea && event.storageArea !== storage.current)) return
      const next = readStoredRolePreferences(storage.current, current.current)
      current.current = next
      setPreferences(next)
    }
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])

  const toggle = React.useCallback((key: "favorites" | "likes", value: string) => {
    const role = resolveRole(value)
    if (!role) return
    update(previous => ({ ...previous, [key]: previous[key].includes(role.id) ? previous[key].filter(id => id !== role.id) : [...previous[key], role.id] }))
  }, [update])

  const toggleFavorite = React.useCallback((id: string) => toggle("favorites", id), [toggle])
  const toggleLike = React.useCallback((id: string) => toggle("likes", id), [toggle])
  const recordUse = React.useCallback((value: string, chatId: string) => {
    update(previous => recordRoleSession(previous, value, chatId))
  }, [update])

  const saveReview = React.useCallback((value: string, input: RoleReviewInput) => {
    const role = resolveRole(value)
    const review = createRoleReview(input)
    if (!role || !review) return false
    update(previous => ({ ...previous, reviews: { ...previous.reviews, [role.id]: review } }))
    return true
  }, [update])

  const value = React.useMemo(() => ({ ...preferences, toggleFavorite, toggleLike, recordUse, saveReview }), [preferences, toggleFavorite, toggleLike, recordUse, saveReview])
  return <RolesContext.Provider value={value}>{children}</RolesContext.Provider>
}

export function useRoles() {
  const value = React.useContext(RolesContext)
  if (!value) throw new Error("useRoles must be used within RolesProvider")
  return value
}
