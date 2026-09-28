let sequence = 0

/** Local entity identifiers also work on a phone visiting the dev server over HTTP. */
export function clientId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2)}`
}
