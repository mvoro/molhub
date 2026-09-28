import * as React from "react"

/* useState mirrored to localStorage. Storage can be missing or blocked
   (private mode, previews), so every access is guarded and the default wins. */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })

  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* not persisted — fine for a convenience */
    }
  }, [key, value])

  return [value, setValue] as const
}
