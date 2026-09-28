import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  Download04Icon,
  FolderAddIcon,
  FolderRemoveIcon,
  MusicNote01Icon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { AutoClip } from "@/components/auto-clip"
import { FileViewer } from "@/components/file-viewer/file-viewer"
import { GenerationEffect } from "@/components/generation-effect"
import { MoreActionButton } from "@/components/more-action-button"
import { ModelLogo } from "@/components/model-logo"
import { ProjectGlyph } from "@/components/project/project-appearance"
import {
  AppMenu,
  AppMenuContent,
  AppMenuItem,
  AppMenuSeparator,
  AppMenuSub,
  AppMenuSubContent,
  AppMenuSubTrigger,
  AppMenuTrigger,
} from "@/components/ui/app-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Project } from "@/data/chats"
import { findModel } from "@/data/models"
import { formatDuration, type Song } from "@/data/music"
import type { PromptPreset } from "@/data/prompt-presets"
import { useEntityActions } from "@/hooks/use-entity-actions"
import { useGenerationReveal } from "@/hooks/use-generation-reveal"
import { useHub } from "@/hooks/use-hub"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  DEFAULT_FEED_SIZE,
  FEED_SIZES,
  isFresh,
  markRevealed,
  removeGeneration,
  setGenerationProject,
  type Generation,
} from "@/hooks/use-media-feed"
import { useMusic } from "@/hooks/use-music"
import { ICON_STROKE, projectIcon } from "@/lib/icons"
import { projectColor } from "@/lib/project-colors"
import { cn } from "@/lib/utils"

/* What the photo and video tools show under their toolbar.

   MediaFeed — «История»: the user's results as Higgsfield lays them out, justified rows of rounded
   tiles 4px apart, newest first. Each row fills the width at one height; where a row breaks is
   chosen so its height lands as close to the target as it can (a greedy flex-wrap stretched a row to
   1.8× when a wide picture didn't fit). The target follows the width (larger previews on a phone, four or
   five on desktop) times the toolbar's size step; the last row keeps the target and doesn't stretch.
   A click opens the result full-screen (no «Последний просмотр» mark after it — the user's ask, 27.09).
   Hover (fine pointer) or focus shows the prompt and the actions; on touch only «Ещё» stays. A clip
   plays on hover, over its poster.
   Motion: a new request's placeholders fade and grow in, one after another; the tiles already there
   glide to their new places (FLIP on the WAAPI, translate only, so they stay inside the scroller and
   under the composer). While a result is made, the chat's img-fx mosaic churns on its tile, and the
   landed result dissolves in out of it (generation-effect.tsx; the user's ask, 27.09 — it replaced a
   sheen and a blur-in). A resize or a size step reflows without motion — it follows the user's hand.

   IdeaGrid — «Стили» / «Шаблоны» (ChatGPT's image styles, the user's reference, 27.09): an even grid
   of 4:5 cards with the name on the picture; a click puts the idea's prompt in the composer, and
   pointing at one previews it there. Cards are about 240px wide, whatever the history's size step. */

const IDEA_WIDTH = 240

type SizeProps = { size: number; className?: string }

/* A song among a project's media (spec §4): a square tile — its cover, play and title. */
export type SongItem = { id: string; kind: "song"; ratio: number; createdAt: number; status: Song["status"]; song: Song }
export type FeedItem = Generation | SongItem

/* `projectId`: a project's «Медиа» — the menu offers «Убрать из проекта» and the tiles carry no project badge.
   Without it, a studio's «История»: «Добавить в проект ▸» and a badge on the tiles that belong to one. */
export function MediaFeed({
  items,
  size,
  onReuse,
  projectId,
  label,
  className,
}: SizeProps & {
  items: FeedItem[]
  /* «Повторить запрос»; none — no such action (a project's grid: nothing is made there for now). */
  onReuse?: (item: Generation) => void
  projectId?: string
  label?: string
}) {
  const list = React.useRef<HTMLDivElement>(null)
  const width = useWidth(list)
  const mobile = useIsMobile()
  const target = targetHeight(width, size, mobile)
  const layout = React.useMemo(() => place(justify(items, width, target), width), [items, width, target])
  const [viewed, setViewed] = React.useState<Generation | null>(null)
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const video = items[0]?.kind === "video"
  const current = items.find((item) => item.id === viewed?.id)
  const viewedItem = current && current.kind !== "song" ? current : viewed

  useFlip(list, items, `${width}:${target}`)

  return (
    <>
      {/* Tiles sit at computed spots in one flat list: a tile keeps its node when it moves to
          another row, so nothing reloads or blinks. */}
      <div ref={list} role="list" aria-label={label ?? (video ? "Ваши видео" : "Ваши фото")} className={cn("relative", className)}>
        <div aria-hidden="true" style={{ height: layout.height }} />
        {layout.tiles.map(({ item, box }) =>
          item.kind === "song" ? (
            <SongTile key={item.id} item={item} box={box} />
          ) : (
            <FeedTile
              key={item.id}
              item={item}
              box={box}
              projectId={projectId}
              onOpen={() => {
                setViewed(item)
                setViewerOpen(true)
              }}
              onReuse={onReuse && (() => onReuse(item))}
            />
          )
        )}
      </div>
      <FileViewer
        file={viewed && { name: viewed.prompt, type: viewed.video ? "video/mp4" : "image/jpeg", size: 0, url: viewed.video ?? viewed.src }}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        actions={viewedItem && (
          <GenerationMenuItems item={viewedItem} projectId={projectId} includeDownload={false}
            onReuse={onReuse && (() => onReuse(viewedItem))} onDismiss={() => setViewerOpen(false)} />
        )}
      />
    </>
  )
}

export function IdeaGrid({
  presets,
  label,
  action = "взять запрос",
  onPick,
  onPreview,
  className,
}: {
  presets: PromptPreset[]
  label: string
  /* What a click does, for screen readers: «Акварель: взять запрос», «Танец в зале: выбрать шаблон». */
  action?: string
  onPick: (preset: PromptPreset) => void
  onPreview?: (preset: PromptPreset | null) => void
  className?: string
}) {
  const list = React.useRef<HTMLDivElement>(null)
  const width = useWidth(list)
  // About 240px a card (the slider's middle step), never fewer than two columns. Fixed: the size slider
  // is the history's only (the user's ask, 27.09).
  const columns = Math.max(2, Math.round(width / IDEA_WIDTH))

  return (
    <div
      ref={list}
      role="list"
      aria-label={label}
      className={cn("grid content-start gap-3 md:gap-4", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {presets.map((preset, i) => (
        <div key={preset.id} role="listitem">
          <IdeaCard preset={preset} index={i} action={action} onPick={() => onPick(preset)} onPreview={onPreview} />
        </div>
      ))}
    </div>
  )
}

/* A video template plays its clip on its own while on screen (the user's ask, 27.09: «автоанимация в
   шаблонах»). Neighbours start 120ms apart, in runs of eight, so the cards scrolled into view together
   never loop in step. */
const ideaClipDelay = (index: number) => (index % 8) * 120

function IdeaCard({
  preset,
  index,
  action,
  onPick,
  onPreview,
}: {
  preset: PromptPreset
  index: number
  action: string
  onPick: () => void
  onPreview?: (preset: PromptPreset | null) => void
}) {
  return (
    <Button
      variant="ghost"
      onClick={onPick}
      aria-label={`${preset.title}: ${action}`}
      onPointerEnter={(event) => event.pointerType === "mouse" && onPreview?.(preset)}
      onPointerLeave={() => onPreview?.(null)}
      onFocus={() => onPreview?.(preset)}
      onBlur={() => onPreview?.(null)}
      className={cn(
        // The history tile's radius (the user's ask, 27.09: the ideas were 20/24px against its 14px).
        "group/idea relative isolate aspect-4/5 h-auto w-full items-end justify-start overflow-hidden rounded-xl border-0 p-0 text-left whitespace-normal hover:bg-transparent",
        "transition-[scale] duration-150 ease-(--ease-out) active:scale-[0.98] motion-reduce:active:scale-100",
        "focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-solid focus-visible:outline-ring/70"
      )}
    >
      <img
        src={preset.image}
        alt=""
        decoding="async"
        draggable={false}
        className="absolute inset-0 -z-10 size-full object-cover select-none transition-[scale] duration-300 ease-(--ease-out) pointer-fine:group-hover/idea:scale-[1.03] motion-reduce:transition-none"
      />
      {preset.video && (
        <AutoClip
          src={preset.video}
          delay={ideaClipDelay(index)}
          // The picture's hover growth, over the clip too.
          className="-z-10 transition-[opacity,scale] duration-300 ease-(--ease-out) pointer-fine:group-hover/idea:scale-[1.03] motion-reduce:transition-none"
        />
      )}
      {/* The name sits on the picture, as in ChatGPT: a dark wash under it keeps it readable. */}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t from-black/60 to-transparent" />
      <span className="p-3.5 text-[15px] leading-snug font-medium text-white md:p-4 md:text-base">{preset.title}</span>
    </Button>
  )
}

/* ── clips ── */

/* A clip that plays while the pointer is on its card (or the card has keyboard focus) and fades in
   only once it really plays, so the poster never blinks to black. Paused and rewound on leave;
   reduced motion keeps the poster. */
function useHoverPlay() {
  const ref = React.useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const start = () => {
    const video = ref.current
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    video.onplaying = () => setPlaying(true)
    void video.play().catch(() => {})
  }
  const stop = () => {
    const video = ref.current
    if (!video) return
    video.pause()
    video.currentTime = 0
    setPlaying(false)
  }
  return {
    ref,
    playing,
    triggers: {
      onPointerEnter: (event: React.PointerEvent) => event.pointerType === "mouse" && start(),
      onPointerLeave: stop,
      onFocus: start,
      onBlur: stop,
    },
  }
}

function ClipLayer({ ref, src, playing, className }: { ref: React.Ref<HTMLVideoElement>; src: string; playing: boolean; className?: string }) {
  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      data-playing={playing || undefined}
      className={cn(
        "pointer-events-none absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-200 ease-out data-playing:opacity-100",
        className
      )}
    />
  )
}

/* ── layout ── */

const GAP = 4

type Tile = { id: string; ratio: number }
type Row<T> = { items: T[]; height: number; full: boolean }
type Box = { left: number; top: number; width: number; height: number }

/* Target row height for the list's width at a size step: 200–300px (a quarter of the width in
   between) at the middle step. */
const targetHeight = (width: number, size: number, mobile: boolean) =>
  (mobile ? Math.max(280, width * 0.85) : Math.min(300, Math.max(200, width / 4))) *
  (FEED_SIZES[size] ?? FEED_SIZES[DEFAULT_FEED_SIZE])

/* Splits the results into rows. A row takes results while it stays taller than the target; the one
   that would bring it to (or under) the target joins it only if that lands closer to the target, in
   proportion, than stopping before it. */
function justify<T extends Tile>(items: T[], width: number, target: number): Row<T>[] {
  if (width <= 0) return []
  const heightOf = (count: number, ratios: number) => (width - GAP * (count - 1)) / ratios
  const off = (height: number) => Math.abs(Math.log(height / target))
  const rows: Row<T>[] = []
  let row: T[] = []
  let sum = 0
  for (const item of items) {
    const joined = heightOf(row.length + 1, sum + item.ratio)
    if (joined > target) {
      row.push(item)
      sum += item.ratio
      continue
    }
    const before = heightOf(row.length, sum)
    if (row.length && off(before) < off(joined)) {
      rows.push({ items: row, height: before, full: true })
      row = [item]
      sum = item.ratio
      // A result wide enough to fill a row alone.
      if (heightOf(1, sum) <= target) {
        rows.push({ items: row, height: heightOf(1, sum), full: true })
        row = []
        sum = 0
      }
    } else {
      rows.push({ items: [...row, item], height: joined, full: true })
      row = []
      sum = 0
    }
  }
  if (row.length) rows.push({ items: row, height: target, full: false })
  return rows
}

/* Rows → spots. The last tile of a full row runs to the edge, so rounding never leaves a hairline. */
function place<T extends Tile>(rows: Row<T>[], width: number) {
  const tiles: { item: T; box: Box }[] = []
  let top = 0
  for (const row of rows) {
    let left = 0
    row.items.forEach((item, index) => {
      const last = row.full && index === row.items.length - 1
      const tile = last ? width - left : item.ratio * row.height
      tiles.push({ item, box: { left, top, width: tile, height: row.height } })
      left += tile + GAP
    })
    top += row.height + GAP
  }
  return { tiles, height: Math.max(0, top - GAP) }
}

/* The list's width, measured before the first paint and on every resize. */
function useWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = React.useState(0)
  React.useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    setWidth(node.clientWidth)
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])
  return width
}

const GLIDE = { duration: 400, easing: "cubic-bezier(0.32, 0.72, 0, 1)" }
const ENTER = { duration: 350, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }

/* Remembers where every tile sat (relative to the list, so scrolling doesn't count) and, after the
   items change, slides the ones that moved from their old spot and fades the new ones in. The first
   pass after mounting animates only placeholders: opening the screen shows the feed as it is. A new
   width or size step only records the new places. */
function useFlip(list: React.RefObject<HTMLDivElement | null>, items: ReadonlyArray<{ id: string }>, layoutKey: string) {
  const places = React.useRef<Map<string, { x: number; y: number }> | null>(null)
  const lastKey = React.useRef(layoutKey)

  React.useLayoutEffect(() => {
    const root = list.current
    if (!root || layoutKey.startsWith("0:")) return
    const origin = root.getBoundingClientRect()
    const after = new Map<string, { x: number; y: number }>()
    root.querySelectorAll<HTMLElement>("[data-tile]").forEach((tile) => {
      const rect = tile.getBoundingClientRect()
      after.set(tile.dataset.tile!, { x: rect.left - origin.left, y: rect.top - origin.top })
    })
    const relaid = lastKey.current !== layoutKey && places.current !== null
    const before = relaid ? null : places.current
    lastKey.current = layoutKey
    places.current = after
    if (relaid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let entering = 0
    root.querySelectorAll<HTMLElement>("[data-tile]").forEach((tile) => {
      const id = tile.dataset.tile!
      const from = before?.get(id)
      const to = after.get(id)!
      if (from) {
        const dx = from.x - to.x
        const dy = from.y - to.y
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          tile.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], GLIDE)
        }
      } else if (before || tile.dataset.status === "generating") {
        tile.animate([{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "none" }], {
          ...ENTER,
          delay: entering++ * 50,
          fill: "backwards",
        })
      }
    })
  }, [items, layoutKey, list])
}

/* ── feed tile ── */

function FeedTile({
  item,
  box,
  projectId,
  onOpen,
  onReuse,
}: {
  item: Generation
  box: Box
  /* Shown inside this project's page (see MediaFeed). */
  projectId?: string
  onOpen: () => void
  onReuse?: () => void
}) {
  const { projects } = useHub()
  // In a studio a card that belongs to a live project wears its badge.
  const home = !projectId && item.projectId ? projects.find((project) => project.id === item.projectId && !project.archived) : undefined
  const ready = item.status === "ready"
  const clip = item.kind === "video"
  const [loaded, setLoaded] = React.useState(false)
  // A result that landed while its tile wasn't on screen still dissolves in when the tile shows up.
  const { revealing, effect, onRevealed, onFailed } = useGenerationReveal(ready, ready && isFresh(item.id))
  // The result is there: it opens, plays on hover and shows its actions.
  const shown = ready && !revealing
  const { ref: clipRef, playing, triggers } = useHoverPlay()
  const noun = clip ? "видео" : "фото"

  // The reveal plays once: a tile that remounts later just shows its result.
  React.useEffect(() => {
    if (shown) markRevealed(item.id)
  }, [shown, item.id])



  return (
    <div
      role="listitem"
      data-tile={item.id}
      data-status={item.status}
      aria-busy={!shown}
      className={TILE}
      style={box}
      {...(shown && item.video && { onPointerEnter: triggers.onPointerEnter, onPointerLeave: triggers.onPointerLeave })}
    >
      {ready && (
        <Button
          variant="ghost"
          onClick={onOpen}
          disabled={revealing}
          onFocus={item.video ? triggers.onFocus : undefined}
          onBlur={item.video ? triggers.onBlur : undefined}
          aria-label={`Открыть ${noun}: ${item.prompt}${home ? ` — проект «${home.name}»` : ""}`}
          className="absolute inset-0 size-full rounded-none p-0 hover:bg-transparent active:scale-100 disabled:opacity-100 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-solid focus-visible:outline-ring/70"
        >
          <img
            src={item.src}
            alt=""
            decoding="async"
            draggable={false}
            onLoad={() => setLoaded(true)}
            data-loaded={loaded || undefined}
            className="image-feed-picture size-full object-cover select-none"
          />
          {item.video && <ClipLayer ref={clipRef} src={item.video} playing={playing} />}
        </Button>
      )}
      {shown && (
        <>

          {/* Hover veil: darker at the bottom for the prompt, a touch at the top for the actions. */}
          <div
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent via-45% to-black/20", REVEAL)}
          />
          <p aria-hidden="true" className={cn("pointer-events-none absolute inset-x-3 bottom-2.5 line-clamp-2 text-[13px] leading-snug text-white", REVEAL)}>
            {item.prompt}
          </p>

          {/* One row in the corner: the model that made it, the project's badge, with no duration overlay.
              No motion (spec §11). */}
          <div className="absolute top-2 left-2 flex gap-1">
            <ModelBadge item={item} />
            {home && <ProjectBadge project={home} compact={box.width < 160} />}

          </div>

          <div className={cn("absolute top-2 right-2 flex gap-1 has-data-[state=open]:opacity-100 max-md:opacity-100 pointer-coarse:opacity-100", REVEAL)}>
            {onReuse && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon-sm" aria-label="Повторить запрос" onClick={onReuse} className={cn(ACTION, "max-md:hidden pointer-coarse:hidden")}>
                    <HugeiconsIcon icon={RepeatIcon} strokeWidth={ICON_STROKE} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Повторить запрос</TooltipContent>
              </Tooltip>
            )}
            <AppMenu>
              <AppMenuTrigger asChild>
                <MoreActionButton variant="secondary" className={cn(ACTION, MORE)} />
              </AppMenuTrigger>
              <AppMenuContent align="end" className="w-56">
                <GenerationMenuItems item={item} projectId={projectId} onReuse={onReuse} />
              </AppMenuContent>
            </AppMenu>
          </div>
        </>
      )}
      {/* The mosaic says it's being made; without it (reduced motion, no WebGL) the grey card says it in words. */}
      {!ready && (
        <div role="status" className={cn("absolute inset-0 flex items-center justify-center", effect && "sr-only")}>
          <span className="text-[13px] text-muted-foreground">{clip ? "Снимаем…" : "Рисуем…"}</span>
        </div>
      )}
      {effect && <GenerationEffect src={item.src} reveal={ready} onRevealed={onRevealed} onFailed={onFailed} />}
    </div>
  )
}

/* A tile: rounded, grey behind its picture until the picture shows. Pressing the picture presses the
   whole tile (0.98, with its corners), not the picture inside it. `scale`, apart from the FLIP's
   `transform`. */
const TILE = cn(
  "group/tile absolute isolate overflow-hidden rounded-xl bg-muted",
  "transition-[scale] duration-150 ease-out has-[>[data-slot=button]:active]:scale-[0.98] motion-reduce:transition-none"
)
/* Shown on hover with a mouse, on keyboard focus inside the tile and while its menu is open. */
const REVEAL =
  "opacity-0 transition-opacity duration-150 ease-out pointer-fine:group-hover/tile:opacity-100 group-focus-within/tile:opacity-100 group-has-data-[state=open]/tile:opacity-100 motion-reduce:transition-none"
/* Round buttons over the picture: the secondary fill, lifted off it with a soft shadow. */
const ACTION = "rounded-full shadow-sm"
/* A compact desktop control with a full-size mobile target. */
const MORE = "relative size-9 md:size-7 pointer-coarse:after:absolute pointer-coarse:after:-inset-1"

/* The same actions are available on a tile and in its full-screen viewer. */
function GenerationMenuItems({ item, projectId, onReuse, onDismiss, includeDownload = true }: {
  item: Generation
  projectId?: string
  onReuse?: () => void
  onDismiss?: () => void
  includeDownload?: boolean
}) {
  return (
    <>
      {onReuse && <AppMenuItem icon={RepeatIcon} onSelect={() => { onDismiss?.(); onReuse() }}>Повторить запрос</AppMenuItem>}
      {includeDownload && (
        <AppMenuItem icon={Download04Icon} onSelect={() => {
          const link = document.createElement("a")
          link.href = item.video ?? item.src
          link.download = `molecula-${item.id}.${item.video ? "mp4" : "jpg"}`
          link.click()
        }}>
          Скачать
        </AppMenuItem>
      )}
      {projectId ? (
        <AppMenuItem icon={FolderRemoveIcon} onSelect={() => { onDismiss?.(); unlinkGeneration(item) }}>Убрать из проекта</AppMenuItem>
      ) : <AddToProject item={item} onDismiss={onDismiss} />}
      <AppMenuSeparator />
      <AppMenuItem icon={Delete02Icon} variant="destructive" onSelect={() => { onDismiss?.(); removeGeneration(item.id) }}>Удалить</AppMenuItem>
    </>
  )
}

const nounOf = (item: Generation) => (item.kind === "video" ? "Видео" : "Фото")

/* «Убрать из проекта»: the card leaves the project, not the studio; «Отменить» puts it back. */
function unlinkGeneration(item: Generation) {
  const before = item.projectId
  setGenerationProject(item.id, undefined)
  toast(`${nounOf(item)} убрано из проекта`, {
    description: "Оно осталось в студии",
    action: { label: "Отменить", onClick: () => setGenerationProject(item.id, before) },
  })
}

/* «Добавить в проект ▸» on a studio card (D9: this card, not its whole batch). «Новый проект» creates one and
   stays in the studio. */
function AddToProject({ item, onDismiss }: { item: Generation; onDismiss?: () => void }) {
  const { projects } = useHub()
  const actions = useEntityActions()
  const live = projects.filter((project) => !project.archived)
  const add = (project: Project) => {
    if (project.id === item.projectId) return
    setGenerationProject(item.id, project.id)
    toast(`${nounOf(item)} добавлено в «${project.name}»`, {
      action: { label: "Открыть", onClick: () => actions.openProject(project.id, "media") },
    })
  }
  return (
    <AppMenuSub>
      <AppMenuSubTrigger icon={FolderAddIcon}>Добавить в проект</AppMenuSubTrigger>
      <AppMenuSubContent title="Добавить в проект" className="w-60">
        <AppMenuItem icon={FolderAddIcon} onSelect={() => { onDismiss?.(); actions.openProjectDialog({ onCreated: add }) }}>
          Новый проект
        </AppMenuItem>
        {live.length > 0 && <AppMenuSeparator />}
        {live.map((project) => (
          <AppMenuItem key={project.id} onSelect={() => add(project)}>
            <HugeiconsIcon strokeWidth={ICON_STROKE} icon={projectIcon(project.icon)} color={projectColor(project.color)} />
            <span className="min-w-0 flex-1 truncate">{project.name}</span>
            {project.id === item.projectId && <HugeiconsIcon strokeWidth={ICON_STROKE} icon={Tick02Icon} className="ml-2 size-4!" />}
          </AppMenuItem>
        ))}
        {item.projectId && (
          <>
            <AppMenuSeparator />
            <AppMenuItem icon={FolderRemoveIcon} onSelect={() => unlinkGeneration(item)}>
              Убрать из проекта
            </AppMenuItem>
          </>
        )}
      </AppMenuSubContent>
    </AppMenuSub>
  )
}

/* The model a card was made with (the user's ask, 27.09): its mark in the brand's colours on the same
   frosted dot as the project's; the name on hover. An unknown model shows the studio's glyph. */
function ModelBadge({ item }: { item: Generation }) {
  const model = findModel(item.model)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="secondary"
          aria-label={`Модель: ${item.model}`}
          className="size-6 justify-center rounded-full bg-background/85 p-0 backdrop-blur-sm"
        >
          <ModelLogo logo={model?.family.logo} mode={item.kind === "video" ? "video" : "image"} color className="size-3.5 text-foreground" />
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-md:hidden">
        {item.model}
      </TooltipContent>
    </Tooltip>
  )
}

/* The project a studio card belongs to: a frosted pill with its icon in its colour and its name, unlike the
   model's round mark next to it; on a narrow card only the icon, the name on hover. Screen readers hear the
   project in the card's own label. */
function ProjectBadge({ project, compact }: { project: Project; compact: boolean }) {
  const pill = (
    <Badge
      variant="secondary"
      aria-hidden="true"
      className={cn(
        "h-6 rounded-full bg-background/85 backdrop-blur-sm [&>svg]:size-3.5!",
        compact ? "w-6 justify-center p-0" : "max-w-36 min-w-0 gap-1 px-2"
      )}
    >
      <ProjectGlyph project={project} className="shrink-0" />
      {!compact && <span className="truncate">{project.name}</span>}
    </Badge>
  )
  if (!compact) return pill
  return (
    <Tooltip>
      <TooltipTrigger asChild>{pill}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-md:hidden">
        {project.name}
      </TooltipContent>
    </Tooltip>
  )
}

/* A song in a project's «Медиа»: the cover is the play button (the studio's mock player — the bars dance in
   the round mark at the bottom right while it «plays»); a «♪ 2:56» badge in the corner says it's a song; the
   title with its styles under it tells two takes apart. «⋯» on hover. Deleting asks first, as in the library. */
function SongTile({ item, box }: { item: SongItem; box: Box }) {
  const { playingId, togglePlay, setSongProject, deleteSong } = useMusic()
  const [confirm, setConfirm] = React.useState(false)
  const { song } = item
  const playing = playingId === song.id
  const ready = song.status === "ready"

  const unlink = () => {
    const before = song.projectId
    setSongProject(song.id, undefined)
    toast("Песня убрана из проекта", {
      description: "Она осталась в студии",
      action: { label: "Отменить", onClick: () => setSongProject(song.id, before) },
    })
  }

  return (
    <div role="listitem" data-tile={item.id} data-status={song.status} className={TILE} style={box}>
      {ready ? (
        <>
          <img src={song.cover} alt="" decoding="async" draggable={false} className="absolute inset-0 size-full object-cover select-none" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-transparent via-55% to-transparent" />
          <Button
            variant="ghost"
            onClick={() => togglePlay(song.id)}
            aria-pressed={playing}
            aria-label={playing ? `Пауза: «${song.title}»` : `Слушать «${song.title}»`}
            className="absolute inset-0 size-full rounded-none p-0 hover:bg-transparent active:scale-100 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-solid focus-visible:outline-ring/70"
          >
            <span className="absolute right-2.5 bottom-2.5 flex size-9 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-sm">
              {playing ? (
                <span className="equalizer flex h-3.5 items-end" data-playing="">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <HugeiconsIcon icon={PlayIcon} strokeWidth={ICON_STROKE} className="size-4! fill-current" />
              )}
            </span>
          </Button>
          <Badge variant="secondary" className="pointer-events-none absolute top-2 left-2 gap-1 bg-background/85 tabular-nums backdrop-blur-sm">
            <HugeiconsIcon icon={MusicNote01Icon} strokeWidth={ICON_STROKE} />
            {formatDuration(song.duration)}
          </Badge>
          <div aria-hidden="true" className="pointer-events-none absolute right-14 bottom-2.5 left-3 grid gap-0.5 text-white">
            <span className="truncate text-[13px] leading-snug font-medium">{song.title}</span>
            <span className="truncate text-xs leading-snug text-white/75">{song.tags}</span>
          </div>
          <div className={cn("absolute top-2 right-2 flex gap-1 has-data-[state=open]:opacity-100 max-md:opacity-100 pointer-coarse:opacity-100", REVEAL)}>
            <AppMenu>
              <AppMenuTrigger asChild>
                <MoreActionButton variant="secondary" aria-label={`Действия с песней «${song.title}»`} className={cn(ACTION, MORE)} />
              </AppMenuTrigger>
              <AppMenuContent align="end" className="w-56">
                <AppMenuItem icon={playing ? PauseIcon : PlayIcon} onSelect={() => togglePlay(song.id)}>
                  {playing ? "Пауза" : "Воспроизвести"}
                </AppMenuItem>
                <AppMenuItem icon={FolderRemoveIcon} onSelect={unlink}>
                  Убрать из проекта
                </AppMenuItem>
                <AppMenuSeparator />
                <AppMenuItem icon={Delete02Icon} variant="destructive" onSelect={() => setConfirm(true)}>
                  Удалить
                </AppMenuItem>
              </AppMenuContent>
            </AppMenu>
          </div>
        </>
      ) : (
        <div role="status" className="image-feed-pending absolute inset-0 flex items-center justify-center">
          <span className="relative text-[13px] text-muted-foreground">Пишем…</span>
        </div>
      )}
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Удалить песню?"
        description={`Песня «${song.title}» удалится без возможности восстановить.`}
        actionLabel="Удалить"
        onConfirm={() => {
          deleteSong(song.id)
          toast("Песня удалена")
        }}
      />
    </div>
  )
}
