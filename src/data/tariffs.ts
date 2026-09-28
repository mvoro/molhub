import { COMPOSER_MODES, MODEL_FAMILIES } from "./models"

/* The user's balance in tokens (a mock until there is an account). */
export const BALANCE = 1250
export type Billing = "month" | "year"

export type Tariff = {
  id: string
  name: string
  month: number
  originalMonth?: number
  monthDiscount?: number
  once?: boolean
  annual?: { month: number; total: number; originalMonth: number; discount: number; saving: number }
  tokens: number
  counts: { text: string; image: string; video: string; audio: string }
  extends?: string
  perks: string[]
  recommended?: boolean
}

// Prices, rounded monthly equivalents, yearly charges and allowances from the user's 27 Sep
// screenshots. Keep the quoted annual total: it need not equal the rounded monthly price × 12.
export const TARIFFS: Tariff[] = [
  {
    id: "promo", name: "Промо", month: 890, once: true, tokens: 1000,
    counts: { text: "до 200 стр. текста", image: "до 80 картинок", video: "Недоступно", audio: "до 100 аудио" },
    perks: [],
  },
  {
    id: "pro", name: "Про", month: 1649,
    annual: { month: 1401, total: 16820, originalMonth: 1649, discount: 15, saving: 2968 },
    tokens: 2000,
    counts: { text: "до 500 стр. текста", image: "до 200 картинок", video: "до 60 видео", audio: "до 300 аудио" },
    perks: ["Gemini Pro", "Claude Opus", "Suno", "Seedance", "Veo"],
    recommended: true,
  },
  {
    id: "plus", name: "Плюс", month: 2990, tokens: 5000,
    counts: { text: "до 1 500 стр. текста", image: "до 600 картинок", video: "до 160 видео", audio: "до 800 аудио" },
    extends: "Про", perks: ["Приоритет генерации", "Расширенные лимиты"],
  },
  {
    id: "expert", name: "Эксперт", month: 3970, originalMonth: 7940, monthDiscount: 50,
    annual: { month: 3470, total: 41640, originalMonth: 6940, discount: 50, saving: 41640 },
    tokens: 10000,
    counts: { text: "до 3 000 стр. текста", image: "до 1 200 картинок", video: "до 300 видео", audio: "до 1 600 аудио" },
    extends: "Плюс", perks: ["x5 приоритет генерации", "Макс. лимиты видео"],
  },
  {
    id: "max", name: "Максимум", month: 9990, originalMonth: 16650, monthDiscount: 40,
    annual: { month: 6661, total: 79940, originalMonth: 13323, discount: 50, saving: 79940 },
    tokens: 20000,
    counts: { text: "до 8 000 стр. текста", image: "до 3 200 картинок", video: "до 800 видео", audio: "до 4 000 аудио" },
    extends: "Плюс", perks: ["x10 приоритет генерации"],
  },
]

export const tariffsForBilling = (billing: Billing) => TARIFFS.filter((tariff) => billing === "month" || tariff.annual)
export const MAX_SAVING = Math.max(...TARIFFS.map((tariff) => tariff.annual?.saving ?? 0))
export const YEAR_DISCOUNT = 15

// Use the same catalogue and logos as the composer. Promo has no video allowance. Molly and
// cross-tool versions appear once; the list stays current when the shared catalogue changes.
export function tariffModels(tariff: Tariff) {
  const seen = new Set<string>()
  return COMPOSER_MODES.filter((mode) => !(tariff.once && mode === "video")).flatMap((mode) =>
    MODEL_FAMILIES[mode].flatMap((family) => family.versions.flatMap((version) => {
      if (seen.has(version.name)) return []
      seen.add(version.name)
      return [{ name: version.name, logo: family.logo, mode }]
    }))
  )
}

export type TokenPack = {
  tokens: number
  price: number
  badge?: "popular" | "best"
}

/* Packs top the balance up over the tariff and go to any model. */
export const PACKS: TokenPack[] = [
  { tokens: 500, price: 390 },
  { tokens: 1000, price: 757 },
  { tokens: 2000, price: 1402 },
  { tokens: 5000, price: 3033, badge: "popular" },
  { tokens: 10000, price: 4741, badge: "best" },
  { tokens: 20000, price: 8500 },
  { tokens: 50000, price: 18500 },
  { tokens: 100000, price: 30500 },
]

const number = new Intl.NumberFormat("ru-RU")
const kopecks = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* «1 649», «20 000». */
export const formatNumber = (value: number) => number.format(value)
/* «1 649 ₽». */
export const formatRub = (value: number) => `${number.format(value)} ₽`
/* «0,78 ₽ за токен». */
export const perToken = (pack: TokenPack) => `${kopecks.format(pack.price / pack.tokens)} ₽ за токен`

/* «1 токен», «3 токена», «2 000 токенов». */
export function tokensWord(count: number) {
  const tens = count % 100
  const ones = count % 10
  if (tens >= 11 && tens <= 14) return "токенов"
  if (ones === 1) return "токен"
  if (ones >= 2 && ones <= 4) return "токена"
  return "токенов"
}
