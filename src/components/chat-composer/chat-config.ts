import type { Settings } from "../../data/composer-settings.ts"
import { normalizeSettings } from "../../data/composer-settings.ts"
import { resolveModelName, type ComposerMode } from "../../data/models.ts"

export type ChatConfig = { model: string; settings: Settings }
const configs = new Map<string, ChatConfig>()
const key = (chatId: string) => `ai-hub:chat-config:${chatId}`
export function saveChatConfig(chatId: string, config: ChatConfig) {
  configs.set(chatId, config)
  try { localStorage.setItem(key(chatId), JSON.stringify(config)) } catch { /* Keep the in-memory copy. */ }
}
export function getChatConfig(chatId: string, mode: ComposerMode): ChatConfig | undefined {
  try {
    const saved = configs.get(chatId) ?? JSON.parse(localStorage.getItem(key(chatId)) ?? "null")
    if (!saved || typeof saved.model !== "string") return undefined
    const kind = mode
    const model = resolveModelName(kind, saved.model)
    const config = { model, settings: normalizeSettings(kind, model, saved.settings) }
    configs.set(chatId, config)
    return config
  } catch { return undefined }
}
