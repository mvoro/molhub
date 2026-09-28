import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { COMPOSER_MODES, DEFAULT_MODEL, MODEL_FAMILIES, MOLLY_NAME, RECOMMENDED, findModel, resolveModelName } from "../src/data/models.ts"
import { audioStyleLimit, barSettings, defaultSettings, estimateCost, isToggle, modelSettings, normalizeSettings, settingOptions } from "../src/data/composer-settings.ts"

const audit = JSON.parse(readFileSync(new URL("../design/audits/moleculai-composer-2026-09-27.json", import.meta.url), "utf8"))

test("the selectable catalogs match the observed source, with Molly in text and photo only", () => {
  assert.deepEqual(COMPOSER_MODES, ["text", "image", "video", "audio"])
  for (const mode of COMPOSER_MODES) {
    const names = MODEL_FAMILIES[mode].flatMap(family => family.versions.map(model => model.name))
    const expected = audit.observed[mode].map((item: { name: string }) => item.name)
    if (mode === "text" || mode === "image") expected.push(MOLLY_NAME)
    assert.deepEqual([...names].sort(), [...expected].sort(), mode)
    assert.equal(new Set(names).size, names.length)
    for (const name of RECOMMENDED[mode]) assert.ok(names.includes(name))
    assert.ok(names.includes(DEFAULT_MODEL[mode]))
  }
  assert.equal(RECOMMENDED.text[0], MOLLY_NAME)
  assert.equal(RECOMMENDED.image[0], MOLLY_NAME)
  assert.equal(findModel(MOLLY_NAME, "image")?.type, "image")
  assert.equal(findModel("Grok Imagine", "video")?.type, "video")
})

test("every exposed setting starts with a valid option and unsupported controls stay hidden", () => {
  for (const mode of COMPOSER_MODES) for (const family of MODEL_FAMILIES[mode]) for (const model of family.versions) {
    const initial = defaultSettings(mode, model.name)
    const keys = modelSettings(mode, model.name, { ...initial, custom: true })
    for (const key of keys) {
      if (isToggle(key) || key === "role") continue
      assert.ok(settingOptions(mode, key, model.name).some(option => option.value === initial[key]), `${model.name}: ${key}`)
    }
  }
  assert.deepEqual(barSettings("image", "GPT Image 2.5 Flare"), ["quality"])
  assert.deepEqual(barSettings("image", "Midjourney"), [])
  assert.deepEqual(barSettings("image", MOLLY_NAME), [])
  assert.deepEqual(modelSettings("text", MOLLY_NAME), ["speed", "role"])
  assert.equal(modelSettings("image", "Nano Banana 2").includes("count"), false)
  assert.equal(modelSettings("video", "Veo 3.1").includes("sound"), false)
})

test("Molly reasoning is a text setting and survives saved chat configuration", () => {
  assert.deepEqual(settingOptions("text", "speed", MOLLY_NAME).map(option => option.value), ["Быстро", "Оптимально", "Глубоко"])
  assert.equal(normalizeSettings("text", MOLLY_NAME, { speed: "Глубоко" }).speed, "Глубоко")
  assert.equal(normalizeSettings("image", MOLLY_NAME, { speed: "Глубоко" }).speed, "Быстро")
  assert.deepEqual(barSettings("text", MOLLY_NAME), ["speed"])
  assert.deepEqual(settingOptions("image", "speed", MOLLY_NAME), [])
  assert.deepEqual(settingOptions("text", "speed", "Gemini 3.8 Flash"), [])
})

test("batch quantity follows model support, resets on model changes and scales the estimate", () => {
  for (const name of ["Seedream v4", "Seedream v4.5", "Ideogram v3"]) {
    assert.deepEqual(settingOptions("image", "count", name).map(option => option.value), ["1 шт", "2 шт", "3 шт", "4 шт"])
    assert.ok(barSettings("image", name).includes("count"))
    assert.equal(estimateCost("image", { ...defaultSettings("image", name), count: "3 шт" }, 500, name), 1500)
    assert.equal(normalizeSettings("image", name, { count: "8 шт" }).count, "1 шт")
  }
  assert.equal(normalizeSettings("image", MOLLY_NAME, { count: "4 шт" }).count, "1 шт")
  assert.equal(estimateCost("image", { ...defaultSettings("image"), count: "4 шт" }, 750, MOLLY_NAME), 750)
})

test("switching models clears stale options, hidden surcharges and unsupported image context", () => {
  const prev = { ...defaultSettings("video", "Kling 3.0"), duration: "15 с", resolution: "4K", sound: true, chatImages: true, count: "4 шт" }
  const next = normalizeSettings("video", "Veo 3.1", prev)
  assert.equal(next.duration, "8 с")
  assert.equal(next.resolution, "720p")
  assert.equal(next.sound, false)
  assert.equal(next.chatImages, false)
  assert.equal(next.count, "1 шт")
  assert.equal(estimateCost("video", prev, 1000, "Veo 3.1"), 1000)
  assert.equal(normalizeSettings("image", "ChatGPT 5 Image Mini", { ratio: "21:9", quality: "Максимальное" }).ratio, "1:1")
  assert.equal(normalizeSettings("image", "Nano Banana 2", { quality: "4K" }).resolution, "4K")
  assert.equal(normalizeSettings("image", "Nano Banana 2", { quality: "8K" }).resolution, "1K")
})

test("model-specific limits and image requirements reflect the source", () => {
  assert.equal(settingOptions("video", "duration", "Grok Imagine").at(-1)?.value, "30 с")
  assert.equal(settingOptions("video", "duration", "Kling 3.0")[0]?.value, "3 с")
  assert.equal(settingOptions("video", "duration", "Veo 3.1").length, 0)
  assert.equal(findModel("Veo Omni", "video")?.version.maxFiles, 4)
  assert.equal(findModel("Kling 3.0", "video")?.version.requiresImage, undefined)
  for (const name of ["Kling 2.1 Standard", "Seedance v1 Lite", "Hailuo 02 Standard", "Wan 2.6"]) {
    assert.equal(findModel(name, "video")?.version.requiresImage, true)
  }
  assert.equal(findModel("Nano Banana", "image")?.version.attachments, false)
  assert.equal(findModel("Kimi K3", "text")?.version.attachments, false)
  assert.equal(audioStyleLimit("Suno V3.5"), 200)
  assert.equal(audioStyleLimit("Suno V5"), 1000)
  assert.equal(settingOptions("audio", "styleWeight").length, 21)
})

test("only renamed models migrate; removed models return to the mode's supported default", () => {
  assert.equal(resolveModelName("audio", "Suno v4.5+"), "Suno V4.5 Plus")
  assert.equal(resolveModelName("text", "ChatGPT 5.5"), "ChatGPT-5.5")
  assert.equal(resolveModelName("video", "Sora 2"), DEFAULT_MODEL.video)
  assert.equal(resolveModelName("image", "Grok Imagine"), "Grok Imagine")
  assert.equal(resolveModelName("text", "Grok Imagine"), DEFAULT_MODEL.text)
})

test("all photo and video choices and defaults match the recorded source controls", () => {
  for (const mode of ["image", "video"] as const) for (const entry of audit.observed[mode]) {
    for (const [label, snapshot] of Object.entries(entry.options) as [string, string][]) {
      const key = label === "Качество" ? "quality" : label === "Разрешение" || /p$/.test(label) ? "resolution" : label === "Формат" || label.includes(":") ? "ratio" : label.includes("сек") ? "duration" : undefined
      if (!key) continue // The source also puts image upload controls in the video settings panel.
      const clean = (value: string) => value.replace(/^"|"$/g, "").replace(/ сек$/, " с")
      let values = [...snapshot.matchAll(/- option [^\n]+\n\s+- generic: ([^\n]+)/g)].map(match => clean(match[1]))
      if (snapshot.includes('- slider:')) {
        const limits = JSON.parse(snapshot.slice(snapshot.lastIndexOf('{')))
        values = Array.from({ length: Number(limits.max) - Number(limits.min) + 1 }, (_, i) => `${Number(limits.min) + i} с`)
      }
      assert.deepEqual(settingOptions(mode, key, entry.name).map(option => option.value).sort(), values.sort(), `${entry.name}: ${key}`)
      const selected = snapshot.match(/- option [^\n]+\[selected\]:\n\s+- generic: ([^\n]+)/)?.[1]
      if (selected) assert.equal(defaultSettings(mode, entry.name)[key], clean(selected), `${entry.name}: default ${key}`)
    }
  }
})
