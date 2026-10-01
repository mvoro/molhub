import test from "node:test"
import assert from "node:assert/strict"
import { defaultSettings } from "../src/data/composer-settings.ts"
import { DEFAULT_MODEL } from "../src/data/models.ts"
import type { Trend } from "../src/data/trends.ts"
import { createTrendDraft } from "../src/lib/trend-launch.ts"

function fixture(type: Trend["type"], model: string): Trend {
  return {
    id: `trend-${type}`,
    type,
    categories: [],
    model,
    settings: defaultSettings(type, model),
    preset: {
      id: "portrait",
      title: "Портрет",
      prompt: "Сохраните черты лица, добавьте мягкий свет.",
      image: "/presets/portrait.jpg",
      category: "photo",
      ...(type === "video" && { video: "/presets/portrait.mp4" }),
    },
  }
}

test("repeating a photo carries its prompt, model and settings only into the photo mode", () => {
  const trend = fixture("image", "Nano Banana 2")
  Object.assign(trend.settings, { ratio: "3:4", resolution: "4K" })
  const draft = createTrendDraft(trend)

  assert.equal(draft.text, trend.preset.prompt)
  assert.equal(draft.models?.image, trend.model)
  assert.deepEqual(draft.settings?.image, trend.settings)
  assert.equal(draft.models?.video, DEFAULT_MODEL.video)
  assert.deepEqual(draft.settings?.video, defaultSettings("video"))
  assert.deepEqual(draft.settings?.text, defaultSettings("text"))
})

test("repeating a video exposes its editable prompt without installing a hidden template or sample attachment", () => {
  const trend = fixture("video", "Seedance 2")
  Object.assign(trend.settings, { ratio: "9:16", resolution: "1080p", duration: "11 с", sound: true })
  const draft = createTrendDraft(trend)

  assert.equal(draft.text, trend.preset.prompt)
  assert.equal(draft.models?.video, "Seedance 2")
  assert.deepEqual(draft.settings?.video, trend.settings)
  assert.equal(draft.template, null)
  assert.equal(draft.photo, null)
  assert.deepEqual(draft.files, [])
  assert.deepEqual(draft.frames, [null, null])
})

test("a launch normalizes unsupported options against its selected model", () => {
  const trend = fixture("video", "Veo 3.1")
  Object.assign(trend.settings, { ratio: "3:4", resolution: "4K", duration: "15 с", count: "4 шт", sound: true, role: "Редактор" })
  const draft = createTrendDraft(trend)

  assert.deepEqual(draft.settings?.video, defaultSettings("video", "Veo 3.1"))
  assert.equal(draft.models?.video, "Veo 3.1")
})

test("editing a repeated draft never mutates its trend or another repeated draft", () => {
  const trend = fixture("image", "Nano Banana 2")
  const first = createTrendDraft(trend)
  const next = createTrendDraft(trend)
  first.text = "Другой промпт"
  first.settings!.image.resolution = "4K"
  first.models!.image = "Nano Banana Pro"

  assert.equal(next.text, trend.preset.prompt)
  assert.equal(next.models?.image, trend.model)
  assert.equal(next.settings?.image.resolution, "1K")
  assert.equal(trend.settings.resolution, "1K")
  assert.notEqual(first.files, next.files)
  assert.notEqual(first.frames, next.frames)
})
