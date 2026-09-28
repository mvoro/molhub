import { test } from "node:test"
import assert from "node:assert/strict"
import { migrateColor, projectColor, PROJECT_COLOR_IDS, PROJECT_COLOR_NAMES } from "../src/lib/project-colors.ts"

test("старые значения цвета переводятся в id", () => {
  assert.equal(migrateColor("var(--primary)"), "purple")
  assert.equal(migrateColor("#ff5a5f"), "red")
  assert.equal(migrateColor("#ff9f1a"), "orange")
  assert.equal(migrateColor("#1fb35c"), "green")
  assert.equal(migrateColor("#2f80ff"), "blue")
  assert.equal(migrateColor("#e14fd0"), "pink")
})
test("id остаётся id, мусор — без цвета", () => {
  assert.equal(migrateColor("yellow"), "yellow")
  assert.equal(migrateColor(undefined), undefined)
  assert.equal(migrateColor("#123456"), undefined)
  assert.equal(migrateColor(42), undefined)
})
test("CSS-значение цвета — токен или currentColor", () => {
  assert.equal(projectColor("red"), "var(--project-red)")
  assert.equal(projectColor(undefined), "currentColor")
})
test("7 цветов, у каждого русское имя", () => {
  assert.deepEqual([...PROJECT_COLOR_IDS], ["red", "orange", "yellow", "green", "blue", "purple", "pink"])
  for (const id of PROJECT_COLOR_IDS) assert.ok(PROJECT_COLOR_NAMES[id].length > 0)
})
