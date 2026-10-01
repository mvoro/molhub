import test from "node:test"
import assert from "node:assert/strict"
import type { ComposerDraft, ComposerFile } from "../src/components/chat-composer/chat-composer.tsx"
import type { PromptPreset } from "../src/data/prompt-presets.ts"
import { selectComposerPreset } from "../src/components/chat-composer/preset-draft.ts"

const zoom: PromptPreset = { id: "zoom", title: "Наезд", prompt: "Камера приближается к герою.", image: "/zoom.jpg", video: "/zoom.mp4", category: "camera" }
const orbit: PromptPreset = { id: "orbit", title: "Облёт", prompt: "Камера облетает героя по кругу.", image: "/orbit.jpg", video: "/orbit.mp4", category: "camera" }
const sketch: PromptPreset = { id: "sketch", title: "Скетч", prompt: "Перерисуй фото карандашом.", image: "/sketch.jpg", category: "drawing" }
const empty = (): ComposerDraft => ({ text: "", files: [], frames: [null, null] })
const file = (id: string, type = "image/jpeg"): ComposerFile => ({
  id, type, name: `${id}.jpg`, size: 1, url: `blob:${id}`, file: new File(["x"], `${id}.jpg`, { type }),
})

test("a video template populates the editable prompt and replaces it when another template is chosen", () => {
  const first = selectComposerPreset(empty(), zoom, "video")
  assert.equal(first.draft.text, zoom.prompt)
  assert.equal(first.draft.template, zoom)

  first.draft.text += " Добавьте тёплый свет."
  const next = selectComposerPreset(first.draft, orbit, "video")
  assert.equal(next.draft.text, orbit.prompt)
  assert.equal(next.draft.template, orbit)
})

test("switching video templates keeps the uploaded source photo and unrelated attachments", () => {
  const portrait = file("portrait")
  const attachment = file("notes", "text/plain")
  const first = selectComposerPreset({ ...empty(), files: [portrait, attachment] }, zoom, "video")
  assert.equal(first.draft.photo, portrait)
  assert.deepEqual(first.draft.files, [attachment])
  assert.deepEqual(first.releasedUrls, [])

  const next = selectComposerPreset(first.draft, orbit, "video")
  assert.equal(next.draft.photo, portrait)
  assert.deepEqual(next.draft.files, [attachment])
  assert.deepEqual(next.releasedUrls, [])
})

test("a photo style clears video template media without removing generic attachments", () => {
  const portrait = file("portrait")
  const start = file("start")
  const end = file("end")
  const reference = file("reference")
  const previous: ComposerDraft = { text: zoom.prompt, files: [reference], template: zoom, photo: portrait, frames: [start, end] }
  const next = selectComposerPreset(previous, sketch, "image")

  assert.equal(next.draft.text, sketch.prompt)
  assert.equal(next.draft.template, null)
  assert.equal(next.draft.photo, null)
  assert.deepEqual(next.draft.frames, [null, null])
  assert.deepEqual(next.draft.files, [reference])
  assert.deepEqual(next.releasedUrls.toSorted(), [portrait.url, start.url, end.url].toSorted())
  assert.equal(previous.template, zoom, "a selection must not mutate the previous draft")
})

test("returning to video after a photo style never restores the old template photo", () => {
  const previous = { ...empty(), template: zoom, photo: file("portrait") }
  const photo = selectComposerPreset(previous, sketch, "image")
  const video = selectComposerPreset(photo.draft, orbit, "video")
  assert.equal(video.draft.photo, null)
  assert.deepEqual(video.draft.frames, [null, null])
  assert.equal(video.draft.template, orbit)
  assert.equal(video.draft.text, orbit.prompt)
})

test("clearing video slots never revokes a URL still used by a generic attachment", () => {
  const shared = file("shared")
  const previous = { ...empty(), files: [shared], template: zoom, photo: shared, frames: [shared, shared] as ComposerDraft["frames"] }
  const next = selectComposerPreset(previous, sketch, "image")
  assert.deepEqual(next.releasedUrls, [])
  assert.deepEqual(next.draft.files, [shared])
})
