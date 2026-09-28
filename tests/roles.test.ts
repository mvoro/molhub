import test from "node:test"
import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { ROLE_CATALOG, ROLE_CATEGORIES, REVIEW_MAX_LENGTH } from "../src/data/roles.ts"
import { createRoleReview, EMPTY_ROLE_PREFERENCES, normalizeRoleIds, normalizeRolePreferences, readStoredRolePreferences, recordRoleSession, resolveRole, ROLE_PREFERENCES_KEY, searchRoles, updateStoredRolePreferences, type RoleStorage } from "../src/lib/roles.ts"

test("all 40 roles have unique stable IDs, real illustrations and three task examples", () => {
  assert.equal(ROLE_CATALOG.length, 40)
  assert.equal(new Set(ROLE_CATALOG.map(role => role.id)).size, 40)
  assert.equal(new Set(ROLE_CATALOG.map(role => role.image)).size, 40)
  for (const role of ROLE_CATALOG) {
    assert.ok(ROLE_CATEGORIES.some(category => category.id === role.group))
    assert.equal(role.prompts.length, 3)
    assert.ok(role.prompts.every(prompt => prompt.trim().length > 15))
    assert.ok(existsSync(new URL(`../public${role.image}`, import.meta.url)))
    assert.ok(role.about.length && role.steps.length)
  }
})

test("role lookup handles stored IDs, legacy names and typography variations", () => {
  assert.equal(resolveRole("  ПРОМПТ—ИНЖЕНЕР  ")?.id, "prompt-engineer")
  assert.equal(resolveRole("Промпт   Инженер")?.id, "prompt-engineer")
  assert.equal(resolveRole("Менеджер маркетплейсов")?.id, "marketplace-content")
  assert.equal(resolveRole("Подсчёт калорий")?.id, "calories")
  assert.equal(resolveRole("content-manager")?.name, "Контент-менеджер")
  assert.equal(resolveRole("Контент-менеджер")?.id, "content-manager")
  assert.equal(resolveRole("Неизвестная роль"), undefined)
  assert.deepEqual(normalizeRoleIds(["Коуч", "coach", "unknown", null, 12]), ["coach"])
})

test("search ranks exact and prefix names before description matches and finds task examples", () => {
  assert.equal(searchRoles("копирайтер")[0]?.id, "copywriter")
  assert.equal(searchRoles("копи")[0]?.id, "copywriter")
  assert.equal(searchRoles("промпт-инженер")[0]?.id, "prompt-engineer")
  assert.ok(searchRoles("первого клиента").some(role => role.id === "storytelling"))
  assert.ok(searchRoles("психолог стресс").some(role => role.id === "psychologist"))
  assert.equal(searchRoles("несуществующий запрос qwertyzxc").length, 0)
})

test("category and favorite filters compose without losing query ordering", () => {
  assert.equal(searchRoles("", { category: "social" }).length, 9)
  assert.equal(searchRoles("", { category: "all" }).length, 40)
  assert.deepEqual(searchRoles("", { favoriteIds: ["coach", "psychologist"], favoritesOnly: true, category: "work" }).map(role => role.id), ["coach"])
  assert.deepEqual(searchRoles("", { favoritesOnly: true }), [])
  assert.equal(searchRoles("копирайтер", { category: "work" }).length, 0)
})

test("local reviews accept aspects alone, cap comments and reject empty submissions", () => {
  assert.equal(createRoleReview({ text: "  ", aspects: [] }), undefined)
  assert.deepEqual(createRoleReview({ text: "", aspects: ["Точные ответы", "Точные ответы", "unknown"] }, new Date("2026-09-27T12:00:00Z")), {
    text: "", aspects: ["Точные ответы"], date: "2026-09-27T12:00:00.000Z",
  })
  assert.equal(createRoleReview({ text: "а".repeat(700), aspects: [] })?.text.length, REVIEW_MAX_LENGTH)
})

test("malformed persisted data cannot introduce unknown roles, invalid counters or broken reviews", () => {
  const date = "2026-09-27T12:00:00.000Z"
  const state = normalizeRolePreferences({
    favorites: ["Коуч", "coach", null, "unknown"],
    likes: "coach",
    usage: { coach: 2, psychologist: -1, teacher: "7", unknown: 4, translator: 1.5 },
    reviews: { coach: { text: "  Полезно  ", aspects: ["Легко работать", 1], date }, teacher: { text: "x", date: "bad" }, unknown: { text: "x", date } },
  })
  assert.deepEqual(state.favorites, ["coach"])
  assert.deepEqual(state.likes, [])
  assert.deepEqual(state.usage, { coach: 2 })
  assert.deepEqual(state.reviews, { coach: { text: "Полезно", aspects: ["Легко работать"], date } })
  assert.deepEqual(normalizeRolePreferences(null), { favorites: [], likes: [], usage: {}, sessions: {}, reviews: {} })
})

test("role sessions count each chat once, including after persistence and role switches", () => {
  const legacy = normalizeRolePreferences({ usage: { coach: 3 } })
  const first = recordRoleSession(legacy, "coach", "chat-one")
  assert.equal(first.usage.coach, 4)
  const reloaded = normalizeRolePreferences(JSON.parse(JSON.stringify(first)))
  const again = recordRoleSession(reloaded, "coach", "chat-one")
  assert.equal(again.usage.coach, 4)
  const otherRole = recordRoleSession(again, "psychologist", "chat-one")
  assert.equal(otherRole.usage.psychologist, 1)
  assert.equal(recordRoleSession(otherRole, "coach", "chat-one").usage.coach, 4)
  assert.equal(recordRoleSession(otherRole, "coach", "chat-two").usage.coach, 5)
  assert.deepEqual(recordRoleSession(otherRole, "unknown", "chat-two"), otherRole)
})

test("persisted session identifiers are normalized and duplicate tab writes cannot double-count", () => {
  const clean = normalizeRolePreferences({ sessions: { coach: ["chat-one", "chat-one", "", 4], unknown: ["chat-two"], psychologist: "bad" } })
  assert.deepEqual(clean.sessions, { coach: ["chat-one"] })
  let raw: string | null = null
  const storage: RoleStorage = { getItem: () => raw, setItem: (_key, value) => { raw = value } }
  updateStoredRolePreferences(storage, EMPTY_ROLE_PREFERENCES, previous => recordRoleSession(previous, "coach", "chat-one"))
  const secondTab = updateStoredRolePreferences(storage, EMPTY_ROLE_PREFERENCES, previous => recordRoleSession(previous, "coach", "chat-one"))
  assert.equal(secondTab.preferences.usage.coach, 1)
})

test("a delayed tab refresh cannot roll back newer preferences or echo a storage write", () => {
  let value: string | null = null
  let writes = 0
  const storage: RoleStorage = {
    getItem: () => value,
    setItem: (_key, next) => { value = next; writes++ },
  }
  const first = updateStoredRolePreferences(storage, EMPTY_ROLE_PREFERENCES, previous => ({ ...previous, favorites: ["coach"] })).preferences
  updateStoredRolePreferences(storage, first, previous => ({ ...previous, favorites: [...previous.favorites, "psychologist"] }))
  const delayedTab = readStoredRolePreferences(storage, first)
  assert.deepEqual(delayedTab.favorites, ["coach", "psychologist"])
  assert.equal(writes, 2, "an external refresh must never write its old event snapshot back")
  assert.deepEqual(JSON.parse(value!).favorites, ["coach", "psychologist"])
})

test("a local action merges with another tab's newer review and favorites", () => {
  const values = new Map<string, string>()
  const storage: RoleStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value) } }
  const firstTab = updateStoredRolePreferences(storage, EMPTY_ROLE_PREFERENCES, previous => ({ ...previous, favorites: ["coach"] })).preferences
  const review = createRoleReview({ text: "Помогло", aspects: [] })!
  updateStoredRolePreferences(storage, EMPTY_ROLE_PREFERENCES, previous => ({ ...previous, reviews: { coach: review } }))
  const result = updateStoredRolePreferences(storage, firstTab, previous => ({ ...previous, likes: ["psychologist"] })).preferences
  assert.deepEqual(result.favorites, ["coach"])
  assert.deepEqual(result.reviews, { coach: review })
  assert.deepEqual(result.likes, ["psychologist"])
  assert.deepEqual(JSON.parse(values.get(ROLE_PREFERENCES_KEY)!), result)
})

test("blocked persistence preserves consecutive in-session actions and storage removal refreshes empty", () => {
  const blocked: RoleStorage = { getItem: () => null, setItem: () => { throw new Error("Storage blocked") } }
  const first = updateStoredRolePreferences(blocked, EMPTY_ROLE_PREFERENCES, previous => ({ ...previous, favorites: ["coach"] }))
  assert.equal(first.persisted, false)
  const second = updateStoredRolePreferences(null, first.preferences, previous => ({ ...previous, likes: ["psychologist"] }))
  assert.deepEqual(second.preferences.favorites, ["coach"])
  assert.deepEqual(second.preferences.likes, ["psychologist"])
  assert.deepEqual(readStoredRolePreferences(blocked, second.preferences), EMPTY_ROLE_PREFERENCES)
})
