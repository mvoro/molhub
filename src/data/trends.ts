import { normalizeSettings, type Settings } from "./composer-settings.ts"
import { PROMPT_PRESETS, type PresetType, type PromptPreset } from "./prompt-presets.ts"

export const TREND_CATEGORIES = [
  { id: "all", label: "Все" },
  { id: "new", label: "Новое" },
  { id: "with-you", label: "С вами" },
  { id: "popular", label: "Популярное" },
  { id: "anime", label: "Аниме" },
  { id: "cartoons", label: "Мультфильмы" },
  { id: "cinema", label: "Кино" },
  { id: "fantasy", label: "Фантастика" },
  { id: "fashion", label: "Мода" },
  { id: "products", label: "Продукты" },
  { id: "realism", label: "Реализм" },
] as const

export type TrendCategoryId = (typeof TREND_CATEGORIES)[number]["id"]
type AssignedCategory = Exclude<TrendCategoryId, "all">

export type Trend = {
  /** Preset ids can repeat between photo and video, so selection always uses a scoped id. */
  id: `${PresetType}:${string}`
  type: PresetType
  preset: PromptPreset
  categories: readonly AssignedCategory[]
  model: string
  settings: Settings
}

// Editorial groups, including new/popular, are curated without invented usage counts.
// The source presets remain the only copy of prompts, titles and media paths.
const CATEGORIES: Record<PresetType, Record<string, readonly [AssignedCategory, ...AssignedCategory[]]>> = {
  image: {
    "red-pencil-sketch": ["new", "with-you", "popular", "fashion"],
    "brick-world": ["new", "cartoons", "fantasy"],
    "fisheye-editorial": ["new", "with-you", "fashion", "realism"],
    "mirror-portrait": ["new", "with-you", "fantasy"],
    "floating-product-ad": ["new", "popular", "products", "realism"],
    "cubist-portrait": ["new", "with-you", "cartoons"],
    "plush-world": ["new", "popular", "cartoons"],
    "red-light-portrait": ["new", "with-you", "fashion", "realism"],
    "dandelion-journey": ["new", "with-you", "fantasy"],
    "product-on-ice": ["new", "products", "realism"],
    "crayon-naive": ["new", "cartoons"],
    "iridescent-sculpture": ["new", "with-you", "fantasy"],
    "slow-shutter-portrait": ["new", "with-you", "fashion", "realism"],
    "real-in-painted-world": ["new", "with-you", "cartoons", "fantasy"],
    "nature-product-display": ["new", "products", "realism"],
    "storybook-interior": ["new", "cartoons"],
    "point-cloud-portrait": ["new", "with-you", "fantasy"],
    "editorial-triptych": ["new", "with-you", "fashion", "realism"],
    "sunken-room": ["new", "fantasy", "cinema"],
    "outfit-try-on": ["new", "with-you", "fashion", "realism"],
    "action-figure": ["with-you", "popular", "products", "cartoons"],
    "anime": ["with-you", "popular", "anime", "cartoons"],
    "underwater": ["with-you", "cinema", "realism"],
    "chibi-stickers": ["with-you", "anime", "cartoons"],
    "film-35mm": ["with-you", "popular", "realism"],
    "3d-avatar": ["with-you", "cartoons"],
    "restore": ["with-you", "realism"],
    "comic": ["with-you", "cartoons"],
    "royal-portrait": ["with-you", "cinema", "fashion"],
    "hug-younger-self": ["with-you", "popular", "realism"],
    "disco": ["with-you", "fashion", "fantasy"],
    "pixel-game": ["with-you", "cartoons"],
    "headshot": ["with-you", "realism"],
    "magazine-cover": ["with-you", "fashion"],
    "crochet": ["with-you", "popular", "cartoons"],
    "flash-2000s": ["with-you", "fashion", "realism"],
    "tarot": ["with-you", "fantasy"],
    "mini-me": ["with-you", "popular", "fantasy"],
    "marble-statue": ["with-you", "fantasy"],
    "caricature": ["with-you", "cartoons"],
    "movie-still": ["with-you", "cinema", "realism"],
    "soviet-card": ["with-you", "cartoons"],
    "claymation": ["with-you", "cartoons"],
    "hairstyles": ["with-you", "fashion", "realism"],
    "newspaper": ["with-you", "realism"],
    "studio-portrait": ["with-you", "fashion", "realism"],
    "doodles": ["with-you", "cartoons"],
    "photo-booth": ["with-you", "realism"],
    "color-type": ["with-you", "fashion", "realism"],
    "scrapbook": ["with-you", "fashion"],
    "product-infographic": ["products"],
    "ad-poster": ["products"],
    "event-poster": ["products"],
    "product-shot": ["products", "realism"],
  },
  video: {
    "marina-selfie": ["new", "with-you", "realism"],
    "lake-dive": ["new", "cinema", "fantasy"],
    "harbor-leap": ["new", "with-you", "cinema", "realism"],
    "desert-orbit": ["new", "with-you", "cinema", "fashion", "realism"],
    "earth-zoom-out": ["with-you", "popular", "cinema", "fantasy"],
    "eyes-in": ["with-you", "cinema", "fantasy"],
    "bullet-time": ["with-you", "popular", "cinema"],
    "fpv-flight": ["with-you", "cinema", "realism"],
    "liquid-chrome": ["with-you", "popular", "fantasy"],
    "melting": ["with-you", "fantasy"],
    "disintegration": ["with-you", "cinema", "fantasy"],
    "inflate": ["with-you", "cartoons", "fantasy"],
    "anime-film": ["with-you", "popular", "anime", "cartoons"],
    "superhero": ["with-you", "cinema", "fantasy"],
    "outfit-switch": ["with-you", "popular", "fashion", "realism"],
    "living-painting": ["with-you", "cartoons", "fantasy"],
    "fairytale-castle": ["with-you", "cinema", "fantasy"],
    "angel-wings": ["with-you", "fantasy"],
    "zero-gravity": ["with-you", "cinema", "fantasy"],
    "blue-depth": ["with-you", "cinema", "fantasy"],
    "cloud-surf": ["with-you", "fantasy"],
    "power-up": ["with-you", "anime", "fantasy"],
    "knight": ["with-you", "cinema", "fantasy"],
    "street-giant": ["with-you", "cinema", "fantasy"],
    "drift": ["with-you", "cinema", "realism"],
    "explosion-walk": ["with-you", "cinema"],
    "red-carpet": ["with-you", "fashion", "realism"],
    "money-rain": ["with-you", "popular", "fantasy"],
    "dance-loop": ["with-you", "popular", "realism"],
    "mini-me": ["with-you", "popular", "fantasy"],
    "meet-yourself": ["with-you", "realism"],
    "old-photo-alive": ["with-you", "realism"],
    "clones": ["with-you", "fantasy"],
    "hall-dance": ["with-you", "realism"],
    "mountain-walk": ["with-you", "realism"],
    "evening-party": ["with-you", "realism"],
  },
}

function createTrend(type: PresetType, preset: PromptPreset): Trend {
  const categories = CATEGORIES[type][preset.id]
  if (!categories) throw new Error(`Missing trend categories: ${type}:${preset.id}`)

  // These are supported repeat recipes, not claims about which model made the demo assets.
  const model = preset.generation?.model ?? (type === "video"
    ? categories.includes("fantasy") || categories.includes("anime") ? "Seedance 2" : "Kling 3.0"
    : categories.includes("cartoons") ? "ChatGPT Image 2"
      : categories.includes("products") || categories.includes("realism") ? "Nano Banana Pro" : "Nano Banana 2")
  const settings = normalizeSettings(type, model, {
    ratio: preset.ratio,
    resolution: type === "video" ? "1080p" : model === "ChatGPT Image 2" ? "1K" : "2K",
    ...(type === "video" ? { duration: preset.generation?.duration ?? "5 с", sound: false } : {}),
  })

  return { id: `${type}:${preset.id}`, type, preset, categories, model, settings }
}

const images = PROMPT_PRESETS.image.map(preset => createTrend("image", preset))
const videos = PROMPT_PRESETS.video.map(preset => createTrend("video", preset))

// Distribute videos across the whole feed despite the larger photo library.
export const TRENDS: Trend[] = images.length ? images.flatMap((trend, index) => [
  trend,
  ...videos.slice(Math.floor(index * videos.length / images.length), Math.floor((index + 1) * videos.length / images.length)),
]) : videos
