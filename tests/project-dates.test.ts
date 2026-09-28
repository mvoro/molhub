import { test } from "node:test"
import assert from "node:assert/strict"
import { formatListDate } from "../src/lib/project-dates.ts"

const now = new Date(2026, 8, 27, 17, 30).getTime()
test("сегодня — время", () => assert.equal(formatListDate(new Date(2026, 8, 27, 14, 32).getTime(), now), "14:32"))
test("вчера, даже 23:59", () => assert.equal(formatListDate(new Date(2026, 8, 26, 23, 59).getTime(), now), "вчера"))
test("в этом году — день и месяц", () => {
  assert.equal(formatListDate(new Date(2026, 8, 12).getTime(), now), "12 сент.")
  assert.equal(formatListDate(new Date(2026, 0, 1).getTime(), now), "1 янв.")
})
test("прошлый год — с годом", () => assert.equal(formatListDate(new Date(2025, 2, 3).getTime(), now), "3 мар. 2025"))
test("нет даты — пусто", () => {
  assert.equal(formatListDate(undefined, now), "")
  assert.equal(formatListDate(0, now), "")
})
