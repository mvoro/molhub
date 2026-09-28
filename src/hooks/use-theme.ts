import * as React from "react"

/* The app's theme is the `.dark` class on <html> (toasts and the stars already follow it).
   The choice is «system», «dark» or «light»; «system» tracks the OS setting live.
   Kept in localStorage; storage can be missing or blocked, so every access is guarded. */
export type Theme = "system" | "dark" | "light"

const KEY = "ai-hub:theme"
const listeners = new Set<() => void>()
const media = () => window.matchMedia("(prefers-color-scheme: dark)")

function read(): Theme {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw === "dark" || raw === "light" ? raw : "system"
  } catch {
    return "system"
  }
}

let current: Theme = typeof window === "undefined" ? "system" : read()

function apply() {
  const root = document.documentElement
  const dark = current === "dark" || (current === "system" && media().matches)
  if (root.classList.contains("dark") === dark) return
  // Swap every colour at once: without this, elements with colour transitions lag behind the rest.
  const freeze = document.createElement("style")
  freeze.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.appendChild(freeze)
  root.classList.toggle("dark", dark)
  root.style.colorScheme = dark ? "dark" : "light"
  void getComputedStyle(root).opacity
  // A timer, not rAF: rAF never fires in a hidden tab, and the freeze would outlive the swap.
  setTimeout(() => freeze.remove(), 1)
}

/* Called once from main.tsx (not on import, so Storybook's own theme toggle stays in charge there). */
export function initTheme() {
  apply()
  media().addEventListener("change", () => current === "system" && apply())
}

export function setTheme(next: Theme) {
  current = next
  try {
    window.localStorage.setItem(KEY, next)
  } catch {
    /* not persisted — fine for a convenience */
  }
  apply()
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  const theme = React.useSyncExternalStore(subscribe, () => current, () => "system" as Theme)
  return [theme, setTheme] as const
}
