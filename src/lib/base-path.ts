/** Vite's base is / locally and /molhub/ on GitHub Pages. Node tests use /. */
export const APP_BASE = import.meta.env?.BASE_URL ?? "/"

export function withBasePath(path: string, base = APP_BASE): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path
  const prefix = base.replace(/\/+$/, "")
  if (prefix && (path === prefix || path.startsWith(`${prefix}/`))) return path
  return `${prefix}${path}`
}

export function withoutBasePath(path: string, base = APP_BASE): string {
  const prefix = base.replace(/\/+$/, "")
  if (prefix && path === prefix) return "/"
  return prefix && path.startsWith(`${prefix}/`) ? path.slice(prefix.length) : path
}
