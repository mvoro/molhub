import { ROLE_CATALOG, ROLE_CATEGORIES } from "./roles.ts"
import { DEFAULT_MODEL, findModel, MOLLY_NAME, resolveModelName, type ComposerMode } from "./models.ts"

export type ChoiceKey = "speed" | "role" | "ratio" | "resolution" | "quality" | "count" | "duration" | "voice" | "language" | "gender" | "styleWeight" | "creativity" | "audioWeight"
export type ToggleKey = "sound" | "backgroundMusic" | "lastImage" | "chatImages" | "web" | "custom" | "instrumental"
export type SettingKey = ChoiceKey | ToggleKey
export type Settings = Record<ChoiceKey, string> & Record<ToggleKey, boolean> & { styles: string; title: string; negative: string }
export const NO_ROLE = ""
export type SettingOption = { value: string; description?: string; hint?: string; boost?: number }
type Profile = { choices?: Partial<Record<ChoiceKey, SettingOption[]>>; toggles?: ToggleKey[]; defaults?: Partial<Settings> }
const options = (...values: string[]): SettingOption[] => values.map(value => ({ value }))
const ratio = (...values: string[]): SettingOption[] => values.map(value => ({ value, hint: value === "16:9" ? "YouTube" : value === "9:16" ? "Reels / Stories" : value === "21:9" ? "Кино" : undefined }))
const seconds = (...values: number[]) => options(...values.map(value => `${value} с`))
const range = (min: number, max: number) => seconds(...Array.from({ length: max - min + 1 }, (_, i) => min + i))
const priced = (...values: [string, number][]): SettingOption[] => values.map(([value, boost]) => ({ value, boost }))
const percentages = options(...Array.from({ length: 21 }, (_, i) => `${i * 5}%`))
const imageQuality = options("Авто", "Низкое", "Среднее", "Высокое", "Очень высокое", "Максимальное")
const standardRatios = ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9", "Авто"]
const videoRatios = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"]
const contextImages: ToggleKey[] = ["lastImage", "chatImages"]
const reasoning: SettingOption[] = [
  { value: "Быстро", description: "Мгновенный ответ (по умолчанию)" },
  { value: "Оптимально", description: "Баланс скорости и глубины" },
  { value: "Глубоко", description: "Максимальное размышление, дороже" },
]

// The profile is mode-scoped: Grok Imagine exists in both image and video with different controls.
const IMAGE_PROFILES: Record<string, Profile> = {
  "GPT Image 2.5 Flare": { choices: { quality: imageQuality } },
  "GPT Image 2.5 Sunburst": { choices: { quality: imageQuality } },
  "Nano Banana 2": { choices: { ratio: ratio("1:1", "1:4", "1:8", "2:3", "3:2", "3:4", "4:1", "4:3", "4:5", "5:4", "8:1", "9:16", "16:9", "21:9", "Авто"), resolution: options("1K", "2K", "4K") } },
  "Nano Banana Pro": { choices: { ratio: ratio(...standardRatios), resolution: options("1K", "2K", "4K") } },
  "Nano Banana": { choices: { ratio: ratio("1:1", "9:16", "16:9", "3:4", "4:3", "3:2", "2:3", "5:4", "4:5", "21:9", "Авто") } },
  "ChatGPT Image 2": { choices: { ratio: ratio("Авто", "1:1", "3:2", "2:3", "4:3", "3:4", "5:4", "4:5", "16:9", "9:16", "2:1", "1:2", "3:1", "1:3", "21:9", "9:21"), resolution: options("1K") } },
  "ChatGPT 5 Image Mini": { choices: { ratio: ratio("1:1", "2:3", "3:2"), quality: options("Среднее", "Высокое") }, defaults: { ratio: "1:1", quality: "Среднее" } },
}
const VIDEO_PROFILES: Record<string, Profile> = {
  "Veo 3.1": { choices: { ratio: ratio("16:9", "9:16"), resolution: options("720p", "1080p") }, toggles: ["lastImage"], defaults: { duration: "8 с" } },
  "Kling 3.0": { choices: { ratio: ratio("1:1", "16:9", "9:16"), duration: range(3, 15), resolution: priced(["720p", 0], ["1080p", 800], ["4K", 1600]) }, toggles: ["sound", ...contextImages] },
  "Veo Omni": { choices: { ratio: ratio("16:9", "9:16"), duration: priced(["4 с", 0], ["6 с", 0], ["8 с", 96], ["10 с", 192]), resolution: priced(["720p", 0], ["1080p", 240], ["4K", 720]) }, toggles: contextImages, defaults: { duration: "6 с" } },
  "Kling 2.1 Standard": { choices: { duration: priced(["5 с", 0], ["10 с", 52]) }, toggles: contextImages },
  "Seedance 2": { choices: { ratio: ratio(...videoRatios), duration: range(4, 15), resolution: priced(["480p", -200], ["720p", 0], ["1080p", 400]) }, toggles: ["sound", ...contextImages], defaults: { duration: "6 с" } },
  "Seedance 2.0 Mini": { choices: { ratio: ratio(...videoRatios, "Adaptive"), duration: range(4, 15), resolution: priced(["480p", -100], ["720p", 0]) }, toggles: ["sound", ...contextImages] },
  "Seedance v1 Lite": { choices: { duration: priced(["5 с", 0], ["10 с", 60]), resolution: priced(["480p", -30], ["720p", 0], ["1080p", 60]) }, toggles: contextImages },
  "HappyHorse": { choices: { ratio: ratio("1:1", "16:9", "9:16", "4:3", "3:4"), duration: range(3, 15), resolution: priced(["720p", 0], ["1080p", 320]) }, toggles: ["lastImage"] },
  "Grok Imagine": { choices: { ratio: ratio("1:1", "16:9", "9:16", "2:3", "3:2"), duration: range(6, 30), resolution: options("480p", "720p") }, toggles: ["lastImage"], defaults: { duration: "8 с" } },
  "Hailuo 02 Standard": { choices: { duration: priced(["6 с", 0], ["10 с", 48]), resolution: options("480p", "720p") }, toggles: contextImages, defaults: { duration: "6 с" } },
  "Wan 2.6": { choices: { duration: priced(["5 с", 0], ["10 с", 160], ["15 с", 321]), resolution: priced(["720p", 0], ["1080p", 160]) }, toggles: contextImages },
}
const AUDIO_PROFILE: Profile = {
  choices: { gender: options("Любой", "Мужской", "Женский"), styleWeight: percentages, creativity: percentages, audioWeight: percentages },
  toggles: ["custom", "instrumental"],
}
function profile(mode: ComposerMode, model = DEFAULT_MODEL[mode]): Profile {
  const name = resolveModelName(mode, model)
  if (mode === "image") {
    const image = IMAGE_PROFILES[name] ?? {}
    const max = findModel(name, mode)?.version.maxOutputs ?? 1
    return max > 1 ? { ...image, choices: { ...image.choices, count: options(...Array.from({ length: max }, (_, index) => `${index + 1} шт`)) } } : image
  }
  if (mode === "video") return VIDEO_PROFILES[name] ?? VIDEO_PROFILES[DEFAULT_MODEL.video]
  if (mode === "audio") return AUDIO_PROFILE
  return { choices: name === MOLLY_NAME ? { speed: reasoning, role: [] } : { role: [] } }
}

export function defaultSettings(mode: ComposerMode, model = DEFAULT_MODEL[mode]): Settings {
  const schema = profile(mode, model)
  const defaults: Settings = {
    speed: "Быстро", role: NO_ROLE, ratio: mode === "video" ? "16:9" : "Авто",
    resolution: mode === "video" ? "720p" : "1K", quality: "Авто", count: "1 шт", duration: mode === "video" ? "5 с" : "Авто",
    voice: "", language: "", sound: false, backgroundMusic: false, lastImage: false, chatImages: false, web: false,
    custom: false, instrumental: false, gender: "Любой", styleWeight: "50%", creativity: "50%", audioWeight: "50%",
    styles: "", title: "", negative: "", ...schema.defaults,
  }
  for (const [key, choices] of Object.entries(schema.choices ?? {}) as [ChoiceKey, SettingOption[]][]) {
    if (choices.length && !choices.some(option => option.value === defaults[key])) defaults[key] = choices[0].value
  }
  return defaults
}
export function settingOptions(mode: ComposerMode, key: ChoiceKey, model = DEFAULT_MODEL[mode]): SettingOption[] {
  return profile(mode, model).choices?.[key] ?? []
}
export function modelSettings(mode: ComposerMode, model = DEFAULT_MODEL[mode], settings?: Settings): SettingKey[] {
  const schema = profile(mode, model)
  if (mode === "audio") return [...(schema.toggles ?? []), ...(settings?.custom ? Object.keys(schema.choices ?? {}) as ChoiceKey[] : [])]
  return [...Object.keys(schema.choices ?? {}) as ChoiceKey[], ...(schema.toggles ?? [])]
}
export const barSettings = (mode: ComposerMode, model?: string) =>
  modelSettings(mode, model).filter((key): key is ChoiceKey => ["speed", "ratio", "resolution", "quality", "duration", "count"].includes(key))
export const menuSettings = (mode: ComposerMode, model?: string, settings?: Settings) => modelSettings(mode, model, settings).filter(key => key !== "role")

// Drop unsupported options on reload or model changes; migrate the old quality=resolution field.
// Free-text drafts and roles survive when they still belong to this mode.
export function normalizeSettings(mode: ComposerMode, model: string, value?: Partial<Settings>): Settings {
  const next = defaultSettings(mode, model)
  if (!value || typeof value !== "object") return next
  const saved = { ...value }
  if (!saved.resolution && saved.quality && /^(\dK|\d+p)$/.test(saved.quality)) saved.resolution = saved.quality
  const schema = profile(mode, model)
  for (const [key, choices] of Object.entries(schema.choices ?? {}) as [ChoiceKey, SettingOption[]][]) {
    const current = saved[key]
    if (typeof current === "string" && (key === "role" || choices.some(option => option.value === current))) next[key] = current
  }
  for (const key of schema.toggles ?? []) if (typeof saved[key] === "boolean") next[key] = saved[key]
  if (mode === "audio") for (const key of ["styles", "title", "negative"] as const) if (typeof saved[key] === "string") next[key] = saved[key]
  return next
}
export const audioStyleLimit = (model: string) => ["Suno V4", "Suno V3.5"].includes(resolveModelName("audio", model)) ? 200 : 1000

export const SETTING_TITLE: Record<ChoiceKey, string> = {
  speed: "Режим рассуждения", role: "Роль", ratio: "Формат", resolution: "Разрешение", quality: "Качество", count: "Количество", duration: "Длительность",
  voice: "Голос", language: "Язык", gender: "Пол вокала", styleWeight: "Сила стиля", creativity: "Креативность", audioWeight: "Аудио-референс",
}
export const TOGGLE_BOOST: Partial<Record<ToggleKey, number>> = {}
export const TOGGLE_LABEL: Record<ToggleKey, string> = {
  sound: "Звук", backgroundMusic: "Фоновая музыка", lastImage: "Последняя картинка", chatImages: "Картинки из чата", web: "Поиск",
  custom: "Расширенный режим", instrumental: "Без вокала",
}
export const isToggle = (key: SettingKey): key is ToggleKey => key in TOGGLE_LABEL
export const barLabel = (key: ChoiceKey, settings: Settings) => settings[key] === "Авто" ? SETTING_TITLE[key] : settings[key]

// Estimate only active, supported parameters; never charge hidden settings from an earlier model.
export function estimateCost(mode: ComposerMode, settings: Settings, base = 1, model = DEFAULT_MODEL[mode]) {
  const normalized = normalizeSettings(mode, model, settings)
  const boost = modelSettings(mode, model, normalized).reduce((total, key) => total + (isToggle(key) ? 0 : settingOptions(mode, key, model).find(option => option.value === normalized[key])?.boost ?? 0), 0)
  return Math.max(0, base + boost) * Number.parseInt(normalized.count, 10)
}

/* «1 молекула», «3 молекулы», «250 молекул», «1,5 молекулы». */
export function moleculesWord(value: number) {
  if (!Number.isInteger(value)) return "молекулы"
  const tens = value % 100
  const ones = value % 10
  if (tens >= 11 && tens <= 14) return "молекул"
  if (ones === 1) return "молекула"
  if (ones >= 2 && ones <= 4) return "молекулы"
  return "молекул"
}

export const formatCost = (value: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value)

/* The role picker and catalogue share the same names and descriptions. */
export const ROLE_GROUPS = ROLE_CATEGORIES.map((category) => ({
  label: category.label,
  roles: ROLE_CATALOG.filter((role) => role.group === category.id),
}))
