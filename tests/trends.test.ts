import test from "node:test"
import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { TRENDS, TREND_CATEGORIES } from "../src/data/trends.ts"
import { PROMPT_PRESETS } from "../src/data/prompt-presets.ts"
import { findModel } from "../src/data/models.ts"
import { isToggle, modelSettings, normalizeSettings, settingOptions } from "../src/data/composer-settings.ts"

test("trends reuse every source preset once and keep photo/video identities separate", () => {
  assert.equal(TRENDS.length, PROMPT_PRESETS.image.length + PROMPT_PRESETS.video.length)
  assert.equal(new Set(TRENDS.map(trend => trend.id)).size, TRENDS.length)
  for (const type of ["image", "video"] as const) {
    for (const preset of PROMPT_PRESETS[type]) {
      const trend = TRENDS.find(item => item.id === `${type}:${preset.id}`)
      assert.ok(trend, `${type}:${preset.id}`)
      assert.equal(trend.type, type)
      assert.equal(trend.preset, preset, "Titles, prompts and media must remain linked to the source preset")
    }
  }
  assert.notEqual(TRENDS.find(trend => trend.id === "image:mini-me"), TRENDS.find(trend => trend.id === "video:mini-me"))
})

test("every trend has meaningful categories and every category has content", () => {
  const categoryIds = new Set(TREND_CATEGORIES.map(category => category.id))
  assert.equal(categoryIds.size, TREND_CATEGORIES.length)
  for (const trend of TRENDS) {
    assert.ok(trend.categories.length, trend.id)
    assert.equal(new Set(trend.categories).size, trend.categories.length, trend.id)
    assert.ok(trend.categories.some(category => !["new", "popular", "with-you"].includes(category)), `${trend.id}: needs a subject category`)
    for (const category of trend.categories) assert.ok(categoryIds.has(category), `${trend.id}: ${category}`)
  }
  for (const category of TREND_CATEGORIES) {
    if (category.id !== "all") assert.ok(TRENDS.some(trend => trend.categories.some(id => id === category.id)), category.id)
  }
})

test("repeat recipes select real models and settings that survive composer normalization", () => {
  for (const trend of TRENDS) {
    assert.ok(findModel(trend.model, trend.type), `${trend.id}: ${trend.model}`)
    assert.deepEqual(normalizeSettings(trend.type, trend.model, trend.settings), trend.settings, trend.id)
    assert.equal(trend.settings.ratio, trend.preset.ratio, `${trend.id}: preserve the template aspect ratio`)
    assert.equal(trend.settings.count, "1 шт")
    for (const key of modelSettings(trend.type, trend.model, trend.settings)) {
      if (isToggle(key)) continue
      assert.ok(settingOptions(trend.type, key, trend.model).some(option => option.value === trend.settings[key]), `${trend.id}: ${key}`)
    }
  }
})

test("all trend previews and downloadable media exist in public", () => {
  for (const trend of TRENDS) {
    if (trend.type === "video") assert.ok(trend.preset.video, `${trend.id}: missing video`)
    for (const source of [trend.preset.image, trend.preset.video].filter((value): value is string => Boolean(value))) {
      assert.ok(source.startsWith("/"), `${trend.id}: media must resolve from the app base`)
      assert.ok(existsSync(new URL(`../public${source}`, import.meta.url)), `${trend.id}: ${source}`)
    }
  }
})
