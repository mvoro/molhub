import { test } from "node:test"
import assert from "node:assert/strict"
import { needsNormalize, normalizeProject } from "../src/lib/project-normalize.ts"

test("старый проект: hex → id, без дат → 0", () => {
  const raw = { id: "p1", name: "Старый", color: "#2f80ff" }
  assert.equal(needsNormalize(raw), true)
  assert.deepEqual(normalizeProject(raw), { id: "p1", name: "Старый", color: "blue", createdAt: 0, updatedAt: 0 })
})
test("новый проект не меняется", () => {
  const raw = { id: "p2", name: "Новый", color: "green" as const, createdAt: 5, updatedAt: 7, instructions: "x", files: [] }
  assert.equal(needsNormalize(raw), false)
  assert.deepEqual(normalizeProject(raw), raw)
})
test("неизвестный цвет убирается", () => {
  assert.equal(normalizeProject({ id: "p3", name: "X", color: "#000", createdAt: 1, updatedAt: 1 }).color, undefined)
})
