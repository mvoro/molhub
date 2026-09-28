import test from "node:test"
import assert from "node:assert/strict"
import { getChatConfig, saveChatConfig } from "../src/components/chat-composer/chat-config.ts"
import { defaultSettings } from "../src/data/composer-settings.ts"
import { DEFAULT_MODEL } from "../src/data/models.ts"

test("retiring a text model keeps the chat's role when its config is restored", () => {
  saveChatConfig("role-retired-model", { model: "Retired model", settings: { ...defaultSettings("text"), role: "Промпт Инженер" } })
  const restored = getChatConfig("role-retired-model", "text")
  assert.equal(restored?.model, DEFAULT_MODEL.text)
  assert.equal(restored?.settings.role, "Промпт Инженер")
})

test("shared model names restore settings for the chat's own mode", () => {
  saveChatConfig("role-video-mode", { model: "Grok Imagine", settings: { ...defaultSettings("video", "Grok Imagine"), duration: "30 с" } })
  const restored = getChatConfig("role-video-mode", "video")
  assert.equal(restored?.model, "Grok Imagine")
  assert.equal(restored?.settings.duration, "30 с")
})

test("stored aliases migrate and malformed persisted config is ignored", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage")
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => key.endsWith("role-stored-alias")
      ? JSON.stringify({ model: "ChatGPT 5.5", settings: { role: "Копирайтер" } })
      : "{broken json",
  } })
  try {
    const restored = getChatConfig("role-stored-alias", "text")
    assert.equal(restored?.model, "ChatGPT-5.5")
    assert.equal(restored?.settings.role, "Копирайтер")
    assert.equal(getChatConfig("role-broken-config", "text"), undefined)
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original)
    else Reflect.deleteProperty(globalThis, "localStorage")
  }
})
