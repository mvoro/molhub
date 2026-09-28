import type { ChatType } from "./chats"

// Catalog checked against the visible composer at moleculai.ru/dashboard on 2026-09-27.
// Molly is a recommended model in text and image, never an output mode.
export type ComposerMode = ChatType
export const COMPOSER_MODES: ComposerMode[] = ["text", "image", "video", "audio"]
export const MODE_LABEL: Record<ComposerMode, string> = { text: "Текст", image: "Фото", video: "Видео", audio: "Аудио" }

export type ModelVersion = {
  name: string
  description: string
  /** Local estimate until generation billing is connected. */
  price: number
  badge?: string
  attachments?: boolean
  /** Number of explicit image slots. Kling 3 supports optional start/end frames. */
  frames?: 1 | 2
  requiresImage?: boolean
  maxFiles?: number
  /** Product batch limit; exposed only for providers that support several outputs per request. */
  maxOutputs?: number
}
export type ModelFamily = { id: string; name: string; vendor: string; logo?: string; versions: ModelVersion[] }
export const MOLLY_NAME = "Молли 1.0"
const model = (name: string, description: string, price = 1, extra: Partial<ModelVersion> = {}): ModelVersion => ({ name, description, price, ...extra })
const family = (id: string, name: string, vendor: string, logo: string, versions: ModelVersion[]): ModelFamily => ({ id, name, vendor, logo, versions })
const molly = (description: string, price: number) => family("molly", "Молли", "Молекула", "molly", [model(MOLLY_NAME, description, price)])
const noFiles = { attachments: false }
const imageRequired = { frames: 1 as const, requiresImage: true, maxFiles: 1 }

export const MODEL_FAMILIES: Record<ChatType, ModelFamily[]> = {
  text: [
    molly("Сама подбирает модель под задачу", 1),
    family("gemini", "Gemini", "Google", "gemini", [
      model("Gemini 3.8 Flash", "Быстрые ответы и работа с файлами"),
      model("Gemini 3.7 Flash", "Повседневные задачи и файлы"),
      model("Gemini 3.1 Pro", "Анализ и длинные документы", 1.5),
    ]),
    family("gemma", "Gemma", "Google", "gemini", [model("Gemma 4", "Текстовые задачи", 1, noFiles)]),
    family("claude", "Claude", "Anthropic", "claude", [
      model("Claude Fable 5.1", "Тексты и творческие задачи", 3.5),
      model("Claude Opus 5.5", "Код, анализ и сложные задачи", 3),
      model("Claude Sonnet 5", "Документы, тексты и код", 1.5),
      model("Claude Haiku 4.5", "Короткие ответы и простые задачи"),
    ]),
    family("chatgpt", "ChatGPT", "OpenAI", "openai", [
      model("ChatGPT 6 Astra", "Сложные вопросы, код и документы", 3),
      model("ChatGPT 6 Sol", "Универсальные задачи", 1.5),
      model("ChatGPT-5.6 Terra", "Тексты, анализ и файлы"),
      model("ChatGPT 6 Luna", "Повседневные вопросы"),
      model("ChatGPT-5.5", "Тексты и ответы на вопросы"),
    ]),
    family("grok", "Grok", "xAI", "grok", [
      model("Grok 4.7", "Тексты, вопросы и файлы", 1.5),
      model("Grok 4.6", "Универсальный помощник", 1.5),
      model("Grok 4.2", "Повседневные вопросы"),
    ]),
    family("kimi", "Kimi", "Moonshot", "kimi", [
      model("Kimi K3", "Анализ и текстовые задачи", 2, noFiles),
      model("Kimi K2.6", "Работа с длинным текстом", 2, noFiles),
      model("Kimi K2 Thinking", "Рассуждения и сложные вопросы", 2, noFiles),
    ]),
    family("deepseek", "DeepSeek", "DeepSeek", "deepseek", [
      model("DeepSeek V4 Flash", "Быстрые ответы и файлы"),
      model("DeepSeek V4 Pro", "Логика, математика и анализ", 1.5),
    ]),
    family("qwen", "Qwen", "Alibaba", "qwen", [
      model("Qwen 3.8 Flash", "Повседневные задачи и файлы"),
      model("Qwen 3.8 Max", "Сложные текстовые задачи", 2, noFiles),
    ]),
    family("llama", "Llama", "Meta", "meta", [model("Llama 4 Scout", "Универсальная текстовая модель", 1, noFiles)]),
    family("perplexity", "Perplexity", "Perplexity", "perplexity", [
      model("Perplexity Sonar", "Поиск с источниками", 1, noFiles),
      model("Perplexity Sonar PRO", "Подробные ответы с источниками", 1.5, noFiles),
      model("Perplexity Sonar Deep Research", "Исследования и отчёты", 3, noFiles),
    ]),
    family("glm", "GLM", "Z.ai", "zai", [
      model("GLM 5.2", "Текстовые задачи и код", 2, noFiles),
      model("GLM 4.7", "Универсальная модель", 1, noFiles),
      model("GLM 4.7 Flash", "Быстрые текстовые ответы", 1, noFiles),
    ]),
  ],
  image: [
    molly("Сама подбирает модель под картинку", 750),
    family("gpt-image", "GPT Image", "OpenAI", "openai", [
      model("GPT Image 2.5 Flare", "Изображения с выбором качества", 500),
      model("GPT Image 2.5 Sunburst", "Изображения с выбором качества", 500),
      model("ChatGPT Image 2", "Генерация и редактирование изображений", 500),
      model("ChatGPT 5 Image Mini", "Картинки в трёх форматах", 250),
    ]),
    family("nano-banana", "Nano Banana", "Google", "nanobanana", [
      model("Nano Banana 2 Lite", "Быстрая генерация и редактирование", 250),
      model("Nano Banana 2", "Изображения до 4K, широкий выбор форматов", 250),
      model("Nano Banana Pro", "Изображения до 4K", 750),
      model("Nano Banana", "Картинки по описанию", 250, noFiles),
      model("Nano Banana Editor", "Редактирование ваших изображений", 250),
    ]),
    family("midjourney", "Midjourney", "Midjourney", "midjourney", [model("Midjourney", "Художественные изображения", 500)]),
    family("grok", "Grok", "xAI", "grok", [model("Grok Imagine", "Картинки по описанию", 500)]),
    family("seedream", "Seedream", "ByteDance", "seedream", [model("Seedream v4.5", "Генерация и редактирование", 500, { maxOutputs: 4 }), model("Seedream v4", "Изображения по описанию", 500, { maxOutputs: 4 })]),
    family("ideogram", "Ideogram", "Ideogram", "ideogram", [model("Ideogram v3", "Изображения с текстом", 500, { maxOutputs: 4 })]),
    family("flux", "Flux", "Black Forest Labs", "flux", [model("Flux 1.1 PRO", "Фотореалистичные изображения", 500)]),
  ],
  video: [
    family("veo", "Veo", "Google", "deepmind", [
      model("Veo 3.1", "Ролики длительностью 8 секунд", 1000),
      model("Veo Omni", "До 10 секунд, до четырёх референсов", 240, { maxFiles: 4 }),
    ]),
    family("kling", "Kling", "Kuaishou", "kling", [
      model("Kling 3.0", "До 15 секунд, звук и начальный/конечный кадр", 400, { frames: 2, maxFiles: 2 }),
      model("Kling 2.1 Standard", "До 10 секунд · нужна картинка", 52, imageRequired),
    ]),
    family("seedance", "Seedance", "ByteDance", "seedance", [
      model("Seedance 2", "До 15 секунд, со звуком", 400),
      model("Seedance 2.0 Mini", "До 15 секунд, со звуком", 200),
      model("Seedance v1 Lite", "До 10 секунд · нужна картинка", 60, imageRequired),
    ]),
    family("happyhorse", "HappyHorse", "HappyHorse", "happyhorse", [model("HappyHorse", "Видео до 15 секунд", 320)]),
    family("grok", "Grok", "xAI", "grok", [model("Grok Imagine", "Видео до 30 секунд", 480)]),
    family("hailuo", "Hailuo", "MiniMax", "minimax", [model("Hailuo 02 Standard", "До 10 секунд · нужна картинка", 42, imageRequired)]),
    family("wan", "Wan", "Alibaba", "wan", [model("Wan 2.6", "До 15 секунд · нужна картинка", 160, imageRequired)]),
  ],
  audio: [family("suno", "Suno", "Suno", "suno", [
    model("Suno V5", "Музыка с вокалом или без", 600, noFiles),
    model("Suno V4.5 Plus", "Музыка по описанию или вашему тексту", 500, noFiles),
    model("Suno V4.5", "Стиль и текст песни вручную", 400, noFiles),
    model("Suno V4", "Музыка по описанию", 300, noFiles),
    model("Suno V3.5", "Музыка по описанию", 300, noFiles),
  ])],
}

export const RECOMMENDED: Record<ChatType, string[]> = {
  text: [MOLLY_NAME, "Gemini 3.8 Flash", "Claude Sonnet 5"],
  image: [MOLLY_NAME, "Nano Banana 2", "ChatGPT Image 2"],
  video: ["Veo 3.1", "Kling 3.0"],
  audio: ["Suno V5"],
}
export const DEFAULT_MODEL: Record<ComposerMode, string> = {
  text: MOLLY_NAME, image: MOLLY_NAME, video: "Veo 3.1", audio: "Suno V5",
}

// Only renamed versions are migrated; retired models fall back to the current mode's default.
const LEGACY_NAMES: Record<string, string> = {
  "ChatGPT 5.5": "ChatGPT-5.5", "Perplexity Sonar Pro": "Perplexity Sonar PRO",
  "Suno v5": "Suno V5", "Suno v4.5+": "Suno V4.5 Plus", "Suno V4.5+": "Suno V4.5 Plus",
  "Suno v4.5": "Suno V4.5", "Suno v4": "Suno V4", "Suno v3.5": "Suno V3.5",
}
export type ModelMatch = { family: ModelFamily; version: ModelVersion; type: ChatType }
export function findModel(name: string, type?: ChatType): ModelMatch | undefined {
  const canonical = LEGACY_NAMES[name] ?? name
  for (const kind of type ? [type] : COMPOSER_MODES) {
    for (const family of MODEL_FAMILIES[kind]) {
      const version = family.versions.find((item) => item.name === canonical)
      if (version) return { family, version, type: kind }
    }
  }
}
export const resolveModelName = (mode: ComposerMode, name?: string) => (name && findModel(name, mode)?.version.name) || DEFAULT_MODEL[mode]
export const isMolly = (name: string) => name === MOLLY_NAME
