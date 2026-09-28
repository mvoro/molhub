import { clientId } from "@/lib/client-id"
import * as React from "react"
import { toast } from "sonner"

import type { Settings } from "@/data/composer-settings"
import { findModel } from "@/data/models"
import { PROMPT_PRESETS } from "@/data/prompt-presets"

/* The feeds of the photo and video tools (Krea, Higgsfield): everything made there, newest first,
   mirrored to localStorage until the API lands. A request puts all its results in at once as
   placeholders; each lands a few seconds later with a demo picture or clip. It lives outside React,
   so results keep «generating» while the user is in another section; a batch that lands off-screen
   raises a toast that opens its tool (Krea: «Видео готово · Открыть»). */

export type FeedKind = "image" | "video"

export type Generation = {
  id: string
  kind: FeedKind
  /* One request makes 1–4 pictures (a video request, one clip); they share the batch and its shape. */
  batch: string
  prompt: string
  model: string
  settings?: Settings
  /* Width / height of the tile. */
  ratio: number
  /* The picture, or the clip's poster. */
  src: string
  /* The clip, when the demo has real footage for it; a still otherwise. */
  video?: string
  /* «5 с», for clips. */
  duration?: string
  status: "generating" | "ready"
  createdAt: number
  /* The project this batch was made for (project page composer, or «Добавить в проект»). */
  projectId?: string
}

const KEY = "ai-hub:media-feed"
/* Before video joined (27.09) the feed held pictures only, under this key. */
const OLD_KEY = "ai-hub:image-feed"

/* Size steps of the toolbar's slider, as multiples of the feed's row height and the ideas' card
   width (media-feed.tsx). */
export const FEED_SIZES = [0.6, 0.8, 1, 1.25, 1.55]
export const DEFAULT_FEED_SIZE = 2

type Demo = { src: string; ratio: number; video?: string }

/* Demo pictures until the API lands: the idea pictures, with their own shapes for «Авто». */
export const PICTURES: Demo[] = [
  { src: "/presets/ad-poster.jpg", ratio: 640 / 1000 },
  { src: "/presets/aurora.jpg", ratio: 640 / 799 },
  { src: "/presets/blueprint.jpg", ratio: 640 / 799 },
  { src: "/presets/butterfly.jpg", ratio: 640 / 799 },
  { src: "/presets/carousel-post.jpg", ratio: 1 },
  { src: "/presets/chair-hill.jpg", ratio: 640 / 794 },
  { src: "/presets/city-walk.jpg", ratio: 640 / 1137 },
  { src: "/presets/collage.jpg", ratio: 640 / 799 },
  { src: "/presets/dance-studio.jpg", ratio: 640 / 1137 },
  { src: "/presets/embroidery.jpg", ratio: 640 / 799 },
  { src: "/presets/event-poster.jpg", ratio: 1 },
  { src: "/presets/flowers-wind.jpg", ratio: 640 / 426 },
  { src: "/presets/liquid-light.jpg", ratio: 640 / 799 },
  { src: "/presets/moss-notes.jpg", ratio: 640 / 794 },
  { src: "/presets/noir.jpg", ratio: 640 / 799 },
  { src: "/presets/pink-notes.jpg", ratio: 640 / 857 },
  { src: "/presets/plane-window.jpg", ratio: 640 / 799 },
  { src: "/presets/product-infographic.jpg", ratio: 640 / 1000 },
  { src: "/presets/product-shot.jpg", ratio: 640 / 799 },
  { src: "/presets/reels-cover.jpg", ratio: 640 / 1000 },
  { src: "/presets/risograph.jpg", ratio: 640 / 799 },
  { src: "/presets/summer-splash.jpg", ratio: 640 / 1000 },
  { src: "/presets/sunset-terrace.jpg", ratio: 640 / 1137 },
  { src: "/presets/watercolor.jpg", ratio: 640 / 799 },
  // The photo styles' covers (4:5): a style's demo result is its own cover.
  ...PROMPT_PRESETS.image
    .filter((preset) => preset.image.startsWith("/presets/styles/"))
    .map((preset) => ({ src: preset.image, ratio: 800 / 999 })),
]
/* Demo clips: the video templates' own footage (all 9:16), so a template's result is its clip. */
const CLIPS: Demo[] = PROMPT_PRESETS.video
  .filter((preset) => preset.video)
  .map((preset) => ({ src: preset.image, video: preset.video, ratio: 9 / 16 }))

/* Shape of a demo picture or clip poster (the ideas tab lays its cards out by it). */
export const ratioOf = (src: string) => [...PICTURES, ...CLIPS].find((demo) => demo.src === src)?.ratio ?? 0.8

/* «3:2» → 1.5; «Авто» (the model's choice) → null. */
const parseRatio = (value: string) => {
  const [w, h] = value.split(":").map(Number)
  return w > 0 && h > 0 ? w / h : null
}

const newId = () =>
  `g${clientId()}`

function read(): Generation[] {
  try {
    const raw = window.localStorage.getItem(KEY) ?? window.localStorage.getItem(OLD_KEY)
    const list = raw ? (JSON.parse(raw) as Generation[]) : []
    // Timers don't survive a reload: whatever was still generating has landed by now.
    return list.map((item) => ({ ...item, kind: item.kind ?? "image", status: "ready" }))
  } catch {
    return []
  }
}

const split = (list: Generation[]): Record<FeedKind, Generation[]> => ({
  image: list.filter((item) => item.kind === "image"),
  video: list.filter((item) => item.kind === "video"),
})

let items: Generation[] = typeof window === "undefined" ? [] : read()
/* One stable snapshot per tool, so a change in one feed doesn't re-render the other. */
let feeds = split(items)
const listeners = new Set<() => void>()
/* Results that landed in this session: they get the reveal, the ones from storage just appear. */
const fresh = new Set<string>()
let visible: FeedKind | null = null
/* The project page whose «Медиа» tab is on screen, if any (glues the readiness toast, like `visible`). */
let visibleProject: string | null = null
let openFeed: (kind: FeedKind, projectId?: string) => void = () => {}

function commit(next: Generation[]) {
  items = next
  const byKind = split(items)
  // Keep the untouched feed's array, so its subscribers see no change.
  feeds = {
    image: sameList(feeds.image, byKind.image) ? feeds.image : byKind.image,
    video: sameList(feeds.video, byKind.video) ? feeds.video : byKind.video,
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items))
    window.localStorage.removeItem(OLD_KEY)
  } catch {
    /* not persisted — the feed still works for this visit */
  }
  listeners.forEach((listener) => listener())
}

const sameList = (a: Generation[], b: Generation[]) => a.length === b.length && a.every((item, index) => item === b[index])

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

export function useMediaFeed(kind: FeedKind) {
  return React.useSyncExternalStore(subscribe, () => feeds[kind])
}

/* One stable snapshot per project: photos and videos together, newest first (project-media.tsx). */
const projectCache = new Map<string, { source: Generation[]; list: Generation[] }>()

function projectSnapshot(projectId: string) {
  const cached = projectCache.get(projectId)
  if (cached && cached.source === items) return cached.list
  const list = items.filter((item) => item.projectId === projectId)
  projectCache.set(projectId, { source: items, list })
  return list
}

export function useProjectMedia(projectId: string) {
  return React.useSyncExternalStore(subscribe, () => projectSnapshot(projectId))
}

export const isFresh = (id: string) => fresh.has(id)
/* The reveal plays once: a tile that remounts later just shows its result. */
export const markRevealed = (id: string) => void fresh.delete(id)

/* The tool on screen says so (finished batches toast only when theirs isn't) and the app says how to
   open a tool. */
export const setFeedVisible = (kind: FeedKind | null) => void (visible = kind)
/* The project page's «Медиа» tab says the same, for project batches (music toasts read it too). */
export const setProjectFeedVisible = (id: string | null) => void (visibleProject = id)
export const isProjectFeedVisible = (id: string) => visibleProject === id
export const setFeedOpener = (open: (kind: FeedKind, projectId?: string) => void) => void (openFeed = open)

const shuffle = <T,>(list: T[]) => {
  const pool = [...list]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool
}

const LABEL: Record<FeedKind, { one: string; many: string; removed: string }> = {
  image: { one: "Фото готово", many: "Фото готовы", removed: "Фото удалено" },
  video: { one: "Видео готово", many: "Видео готовы", removed: "Видео удалено" },
}

/* One request: `count` pictures of one shape, or one clip. An idea — named by `idea` (a video
   template) or recognised by its own prompt — brings its picture (or its footage) first. Pictures land
   3–6 s in, clips 6–9 s. */
export function generate(
  kind: FeedKind,
  {
    prompt,
    idea: ideaId,
    model,
    settings,
    ratio,
    count = "1",
    duration,
    projectId,
    projectName,
  }: {
    prompt: string
    idea?: string
    model: string
    settings?: Settings
    ratio: string
    count?: string
    duration?: string
    projectId?: string
    projectName?: string
  }
) {
  const pool = kind === "image" ? PICTURES : CLIPS
  const total = kind === "image" ? Math.min(findModel(model, kind)?.version.maxOutputs ?? 1, Math.max(1, Number.parseInt(count, 10) || 1)) : 1
  const idea = PROMPT_PRESETS[kind].find((preset) => (ideaId ? preset.id === ideaId : preset.prompt === prompt))
  const first = idea && pool.find((demo) => demo.src === idea.image)
  const picked = [...(first ? [first] : []), ...shuffle(pool).filter((demo) => demo !== first)].slice(0, total)
  const shape = parseRatio(ratio) ?? picked[0].ratio
  const batch = newId()
  const now = Date.now()
  const made: Generation[] = picked.map((demo) => ({
    id: newId(),
    kind,
    batch,
    prompt,
    model,
    settings,
    ratio: shape,
    src: demo.src,
    video: demo.video,
    duration: kind === "video" ? (duration && duration !== "Авто" ? duration : "5 с") : undefined,
    status: "generating",
    createdAt: now,
    projectId,
  }))

  commit([...made, ...items])

  let left = made.length
  made.forEach((item, index) => {
    const delay = (kind === "image" ? 3000 : 6000) + index * 700 + Math.random() * (kind === "image" ? 800 : 3000)
    window.setTimeout(() => {
      if (!items.some((other) => other.id === item.id)) return
      fresh.add(item.id)
      commit(items.map((other) => (other.id === item.id ? { ...other, status: "ready" } : other)))
      left -= 1
      const onScreen = visible === kind || (projectId !== undefined && visibleProject === projectId)
      if (left === 0 && !onScreen) {
        const title =
          projectId && projectName
            ? `${kind === "image" ? "Фото" : "Видео"} для «${projectName}» ${kind === "image" ? (made.length > 1 ? "готовы" : "готово") : "готово"}`
            : made.length > 1
              ? LABEL[kind].many
              : LABEL[kind].one
        toast(title, { action: { label: "Открыть", onClick: () => openFeed(kind, projectId) } })
      }
    }, delay)
  })
}

/* Assigns or clears one card's project («Добавить в проект» / «Убрать из проекта»), not the whole batch (D9). */
export const setGenerationProject = (id: string, projectId: string | undefined) =>
  commit(items.map((item) => (item.id === id ? { ...item, projectId } : item)))

/* The project is gone (`hub.deleteProject`): its photos and videos stay in the studio, just unlinked (D10). */
export const unsetFeedProject = (projectId: string) =>
  commit(items.map((item) => (item.projectId === projectId ? { ...item, projectId: undefined } : item)))

/* Removes a result and offers it back for a few seconds (the toast's «Отменить»). */
export function removeGeneration(id: string) {
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) return
  const gone = items[index]
  commit(items.filter((item) => item.id !== id))
  toast(LABEL[gone.kind].removed, {
    action: {
      label: "Отменить",
      onClick: () => {
        if (items.some((item) => item.id === id)) return
        const at = Math.min(index, items.length)
        commit([...items.slice(0, at), gone, ...items.slice(at)])
      },
    },
  })
}
