import {
  ROLE_CATALOG,
  ROLE_CATEGORIES,
  REVIEW_ASPECTS,
  REVIEW_MAX_LENGTH,
  type Role,
  type RoleCategoryId,
  type RoleReview,
} from "../data/roles.ts"

export function normalizeRoleText(value: unknown): string {
  return typeof value === "string"
    ? value.normalize("NFKC").toLocaleLowerCase("ru").replace(/ё/g, "е").replace(/[‐‑–—-]/g, " ").replace(/\s+/g, " ").trim()
    : ""
}

const aliases: Record<string, string> = {
  "менеджер маркетплейсов": "marketplace-content",
  "контент менеджер маркетплейса": "marketplace-content",
  "промпт инженер": "prompt-engineer",
  "сценарист рилс": "reels-scenarist",
  "инста карусели": "carousels",
  "телеграм копирайтер": "telegram-copywriter",
  "телеграм редактор": "telegram-copywriter",
  "smm стратег": "smm-manager",
  "сторис мейкер": "stories",
}

export function resolveRole(value: unknown): Role | undefined {
  const query = normalizeRoleText(value)
  if (!query) return undefined
  return ROLE_CATALOG.find(role => normalizeRoleText(role.id) === query || normalizeRoleText(role.name) === query || role.id === aliases[query])
}

export function normalizeRoleIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(item => resolveRole(item)?.id).filter((id): id is string => Boolean(id)))]
}

type RoleSearchOptions = {
  category?: RoleCategoryId | "all"
  favoriteIds?: string[]
  favoritesOnly?: boolean
}

const indexedRoles = ROLE_CATALOG.map(role => ({
  role,
  name: normalizeRoleText(role.name),
  description: normalizeRoleText(role.description),
  category: normalizeRoleText(ROLE_CATEGORIES.find(category => category.id === role.group)?.label),
  prompts: normalizeRoleText(role.prompts.join(" ")),
}))

/** Exact names and aliases precede prefix/partial names, then descriptions and
 * task examples. Every query word must match; catalog order breaks equal scores. */
export function searchRoles(query: string, options: RoleSearchOptions = {}): Role[] {
  const text = normalizeRoleText(query)
  const words = text.split(" ").filter(Boolean)
  const exactRole = resolveRole(text)
  const favorites = new Set(normalizeRoleIds(options.favoriteIds))
  return indexedRoles
    .filter(({ role }) => (!options.category || options.category === "all" || role.group === options.category) && (!options.favoritesOnly || favorites.has(role.id)))
    .map(entry => {
      if (!text) return { role: entry.role, score: 0 }
      if (entry.role.id === exactRole?.id) return { role: entry.role, score: 1000 }
      const haystack = `${entry.name} ${entry.description} ${entry.category} ${entry.prompts}`
      if (!words.every(word => haystack.includes(word))) return { role: entry.role, score: -1 }
      const score = entry.name.startsWith(text) ? 800
        : entry.name.includes(text) ? 700
        : words.every(word => entry.name.includes(word)) ? 600
        : entry.description.includes(text) ? 400
        : entry.category.includes(text) ? 300
        : entry.prompts.includes(text) ? 200 : 100
      return { role: entry.role, score }
    })
    .filter(entry => entry.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.role)
}

export type RolePreferences = {
  favorites: string[]
  likes: string[]
  usage: Record<string, number>
  sessions: Record<string, string[]>
  reviews: Record<string, RoleReview>
}

export const EMPTY_ROLE_PREFERENCES: RolePreferences = { favorites: [], likes: [], usage: {}, sessions: {}, reviews: {} }
export const ROLE_PREFERENCES_KEY = "ai-hub-role-preferences-v1"

export type RoleStorage = Pick<Storage, "getItem" | "setItem">

/** A session is a chat using a role, not every message sent with it. Legacy totals stay intact. */
export function recordRoleSession(previous: RolePreferences, value: string, chatId: string): RolePreferences {
  const role = resolveRole(value)
  if (!role || !chatId.trim()) return previous
  const sessions = previous.sessions[role.id] ?? []
  if (sessions.includes(chatId)) return previous
  return {
    ...previous,
    usage: { ...previous.usage, [role.id]: Math.min(Number.MAX_SAFE_INTEGER, (previous.usage[role.id] || 0) + 1) },
    sessions: { ...previous.sessions, [role.id]: [...sessions, chatId] },
  }
}

/** Storage events are notifications, not snapshots: a delayed event's newValue
 * may already be obsolete. Always read the currently committed value instead. */
export function readStoredRolePreferences(storage: RoleStorage | null, fallback = EMPTY_ROLE_PREFERENCES): RolePreferences {
  if (!storage) return normalizeRolePreferences(fallback)
  try {
    const raw = storage.getItem(ROLE_PREFERENCES_KEY)
    return raw === null ? normalizeRolePreferences(null) : normalizeRolePreferences(JSON.parse(raw))
  } catch {
    return normalizeRolePreferences(fallback)
  }
}

/** Merge each local action into the latest committed preferences. The caller
 * switches to its in-memory snapshot if persistence is unavailable. */
export function updateStoredRolePreferences(
  storage: RoleStorage | null,
  fallback: RolePreferences,
  change: (previous: RolePreferences) => RolePreferences,
): { preferences: RolePreferences; persisted: boolean } {
  const preferences = normalizeRolePreferences(change(readStoredRolePreferences(storage, fallback)))
  try {
    if (storage) {
      storage.setItem(ROLE_PREFERENCES_KEY, JSON.stringify(preferences))
      return { preferences, persisted: true }
    }
  } catch {
    // The current session remains usable when browser storage is full or blocked.
  }
  return { preferences, persisted: false }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

/** Reviews belong to this browser only. Invalid or empty stored reviews never
 * become visible feedback and unknown aspects cannot leak into the UI. */
export function createRoleReview(value: unknown, date = new Date()): RoleReview | undefined {
  if (!isRecord(value)) return undefined
  const text = typeof value.text === "string" ? value.text.trim().slice(0, REVIEW_MAX_LENGTH) : ""
  const aspects = Array.isArray(value.aspects)
    ? [...new Set(value.aspects.filter((aspect): aspect is string => typeof aspect === "string" && REVIEW_ASPECTS.includes(aspect)))]
    : []
  if (!text && !aspects.length) return undefined
  return { text, aspects, date: date.toISOString() }
}

export function normalizeRolePreferences(value: unknown): RolePreferences {
  if (!isRecord(value)) return { favorites: [], likes: [], usage: {}, sessions: {}, reviews: {} }
  const usage: RolePreferences["usage"] = {}
  const sessions: RolePreferences["sessions"] = {}
  const reviews: RolePreferences["reviews"] = {}
  if (isRecord(value.usage)) {
    for (const [id, count] of Object.entries(value.usage)) {
      const role = resolveRole(id)
      if (role && typeof count === "number" && Number.isSafeInteger(count) && count > 0) usage[role.id] = count
    }
  }
  if (isRecord(value.sessions)) {
    for (const [id, entries] of Object.entries(value.sessions)) {
      const role = resolveRole(id)
      if (role && Array.isArray(entries)) {
        sessions[role.id] = [...new Set(entries.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim())))]
      }
    }
  }
  if (isRecord(value.reviews)) {
    for (const [id, entry] of Object.entries(value.reviews)) {
      const role = resolveRole(id)
      if (!role || !isRecord(entry) || typeof entry.date !== "string") continue
      const date = new Date(entry.date)
      if (!Number.isFinite(date.valueOf())) continue
      const review = createRoleReview(entry, date)
      if (review) reviews[role.id] = review
    }
  }
  return { favorites: normalizeRoleIds(value.favorites), likes: normalizeRoleIds(value.likes), usage, sessions, reviews }
}
