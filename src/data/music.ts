import type { Settings } from "./composer-settings"

/* Music studio (Аудио, Suno-style, after mashagpt.ru/chat/suno): ideas, style tags, voices, sounds and
   the demo library. Covers are mocks from public/presets and public/uploads until real art lands. */

export type SongIdea = { id: string; title: string; description: string; prompt: string }

/* «Предложения» under the description in Авто: four at a time, «Обновить» deals the next four. */
export const SONG_IDEAS: SongIdea[] = [
  { id: "rock-ballad", title: "Рок-баллада", description: "Песня о любви на разрыв", prompt: "Эмоциональная рок-баллада о любви, которая пережила расставание: тихий куплет под гитару и мощный припев" },
  { id: "electro", title: "Электронный бит", description: "Танцевальный трек для вечеринки", prompt: "Энергичный танцевальный электронный трек: плотный бас, синтезаторы и припев, который хочется подпевать" },
  { id: "jazz", title: "Вечерний джаз", description: "Спокойно, как в баре у окна", prompt: "Спокойная джазовая композиция для вечера: мягкий контрабас, щётки по малому барабану и саксофон" },
  { id: "hip-hop", title: "Хип-хоп", description: "Ритмичный городской стиль", prompt: "Ритмичный городской хип-хоп о ночном городе: уверенная читка, жёсткий бит и мелодичный хук" },
  { id: "lullaby", title: "Колыбельная", description: "Нежная песня перед сном", prompt: "Нежная колыбельная на русском про звёзды и тёплое одеяло: тихое пианино и мягкий женский вокал" },
  { id: "birthday", title: "День рождения", description: "Весёлая песня с именем", prompt: "Весёлая поп-песня на день рождения Маши: про путешествия и кофе, припев, который легко подпеть" },
  { id: "synthwave", title: "Синтвейв", description: "Ночная трасса в стиле 80-х", prompt: "Синтвейв в духе 80-х про поездку по ночной трассе: аналоговые синтезаторы, драм-машина и эхо в вокале" },
  { id: "folk", title: "Инди-фолк", description: "Гитара, костёр и друзья", prompt: "Тёплый инди-фолк о летнем вечере у костра с друзьями: акустическая гитара, хлопки и многоголосый припев" },
  { id: "lofi", title: "Лоу-фай", description: "Фон для учёбы без слов", prompt: "Инструментальный лоу-фай для концентрации: мягкие биты, треск винила и тёплые клавишные" },
  { id: "anthem", title: "Гимн команды", description: "Кричалка для стадиона", prompt: "Мощный стадионный гимн для спортивной команды: барабаны, хоровые выкрики и простой запоминающийся припев" },
  { id: "bossa", title: "Босса-нова", description: "Лёгкое летнее настроение", prompt: "Лёгкая босса-нова про утро у моря: нейлоновая гитара, шейкер и расслабленный вокал" },
  { id: "punk", title: "Поп-панк", description: "Быстро, громко, про школу", prompt: "Задорный поп-панк про последний школьный звонок: быстрые гитары, громкие барабаны и припев хором" },
]

/* «Случайная идея»: a whole description at once. */
export const RANDOM_DESCRIPTIONS = [
  "Меланхоличная песня про осенний трамвай и старые письма, женский вокал и виолончель",
  "Бодрый фанк про понедельник, который неожиданно удался, с медными духовыми",
  "Кинематографичный трек про полёт над облаками, без слов, с оркестром и хором",
  "Уютная акустическая песня про кота, который ждёт хозяина у окна",
  "Танцевальный хаус про летнюю ночь в большом городе, с вокальными чопами",
  "Сказочная баллада про маяк на краю света, кельтская арфа и флейта",
]

/* Chips under the styles field: «+ тег» adds it; the shuffle button deals another handful. */
export const STYLE_TAGS = [
  "gaita", "afropiano", "latin fusion", "ambient", "synthwave", "lo-fi", "indie folk", "dream pop",
  "drum and bass", "city pop", "bossa nova", "trap", "shoegaze", "neo soul", "disco", "jazz hop",
  "post-punk", "orchestral", "celtic", "reggaeton", "hyperpop", "blues rock", "chillwave", "gospel",
]

/* «Улучшить стиль» leans on these to make a short style richer. */
export const STYLE_BOOST = ["warm analog", "wide stereo", "catchy hook", "punchy drums", "lush pads", "intimate vocals", "live feel"]

export const STYLES_PLACEHOLDER = "Жанр, настроение, инструменты: indie pop, dreamy, female vocals…"

export type Voice = { id: string; name: string; description: string }

/* «Голос»: who sings. None chosen — the model picks. */
export const VOICES: Voice[] = [
  { id: "soft-female", name: "Мягкий женский", description: "Тёплый, с придыханием" },
  { id: "husky-male", name: "Хрипловатый мужской", description: "Для рока и блюза" },
  { id: "bright-teen", name: "Звонкий молодой", description: "Для поп-панка и инди" },
  { id: "velvet-baritone", name: "Бархатный баритон", description: "Для джаза и баллад" },
  { id: "choir", name: "Хор", description: "Многоголосие для гимнов" },
]

/* «Звуки»: layers under the music. */
export const SOUNDS = ["Дождь", "Виниловый треск", "Шум города", "Птицы", "Море", "Аплодисменты", "Костёр"]

export const DURATIONS = ["Авто", "1 мин", "2 мин", "3 мин", "4 мин"]

/* The wand in «Текст»: a draft with Suno's section tags, on the song's theme. */
export function lyricsDraft(theme: string) {
  const about = theme.trim() || "лето, которое не хочется отпускать"
  return `[Куплет 1]
Я помню, как всё начиналось —
${about}.
Город шептал нам на ухо,
и ночь никогда не кончалась.

[Припев]
Не отпускай, не отпускай,
этот момент — наш с тобой.
Не отпускай, не отпускай,
пусть он звучит, как прибой.

[Куплет 2]
Время листает страницы,
но я сохраню этот свет.

[Припев]`
}

export type Song = {
  model?: string
  prompt?: string
  settings?: Settings
  id: string
  /* The hub project this song belongs to; none = «Без проекта». */
  projectId?: string
  title: string
  /* What it sounds like: the styles, or the description in Авто. */
  tags: string
  cover: string
  /* Seconds; 0 while generating. */
  duration: number
  status: "generating" | "ready"
  createdAt: number
}

/* «Без проекта»: the library group for songs with no `projectId` (27.09, D4). */
export const NO_PROJECT = "none"

export const COVERS = [
  "/presets/liquid-light.jpg", "/presets/aurora.jpg", "/presets/sunset-terrace.jpg", "/presets/pink-notes.jpg",
  "/presets/moss-notes.jpg", "/presets/summer-splash.jpg", "/presets/city-walk.jpg", "/presets/plane-window.jpg",
  "/presets/chair-hill.jpg", "/presets/butterfly.jpg", "/presets/flowers-wind.jpg", "/presets/dance-studio.jpg",
]

const DAY = 24 * 60 * 60 * 1000
const ago = (days: number) => Date.now() - days * DAY

/* The seed «Демо» music project never migrates to the hub (lib/music-migration.ts): «Кофе у моря» goes
   to the demo hub project «Лендинг кофейни» (`coffee`), the rest start without a project. */
export const SEED_SONGS: Song[] = [
  { id: "demo-1", title: "Ночной трамвай", tags: "synthwave, female vocals, dreamy", cover: "/presets/liquid-light.jpg", duration: 214, status: "ready", createdAt: ago(180) },
  { id: "demo-2", title: "Ночной трамвай", tags: "synthwave, female vocals, dreamy", cover: "/presets/aurora.jpg", duration: 198, status: "ready", createdAt: ago(180) },
  { id: "demo-3", projectId: "coffee", title: "Кофе у моря", tags: "bossa nova, nylon guitar, relaxed", cover: "/presets/sunset-terrace.jpg", duration: 176, status: "ready", createdAt: ago(181) },
  { id: "demo-4", projectId: "coffee", title: "Кофе у моря", tags: "bossa nova, nylon guitar, relaxed", cover: "/presets/summer-splash.jpg", duration: 189, status: "ready", createdAt: ago(181) },
  { id: "demo-5", title: "Последний звонок", tags: "pop-punk, fast guitars, gang vocals", cover: "/presets/pink-notes.jpg", duration: 152, status: "ready", createdAt: ago(182) },
]

/* «3:34» */
export const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`

const plural = new Intl.PluralRules("ru-RU")
const SONG_FORMS: Record<string, string> = { one: "песня", few: "песни", many: "песен", other: "песни" }
export const songsLabel = (count: number) => `${count} ${SONG_FORMS[plural.select(count)]}`

const relative = new Intl.RelativeTimeFormat("ru-RU", { numeric: "auto" })
/* «только что», «5 минут назад», «вчера», «6 месяцев назад» */
export function timeAgo(time: number, now = Date.now()) {
  const seconds = Math.round((time - now) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 45) return "только что"
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute")
  if (abs < DAY / 1000) return relative.format(Math.round(seconds / 3600), "hour")
  if (abs < (30 * DAY) / 1000) return relative.format(Math.round(seconds / 86400), "day")
  if (abs < (365 * DAY) / 1000) return relative.format(Math.round(seconds / (30 * 86400)), "month")
  return relative.format(Math.round(seconds / (365 * 86400)), "year")
}
