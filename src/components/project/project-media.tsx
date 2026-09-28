import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

import { MediaFeed, type FeedItem, type SongItem } from "@/components/media-feed"
import { AppMenu, AppMenuContent, AppMenuRadioGroup, AppMenuRadioItem, AppMenuTrigger } from "@/components/ui/app-menu"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import type { Project } from "@/data/chats"
import { TOOLS } from "@/data/tools"
import { DEFAULT_FEED_SIZE, setProjectFeedVisible, useProjectMedia } from "@/hooks/use-media-feed"
import { useMusic } from "@/hooks/use-music"
import { WorkspaceVisibilityContext } from "@/hooks/workspace-visibility"
import { ICON_STROKE } from "@/lib/icons"

/* «Медиа» of a project page (spec §4): the project's photos, videos and songs in one justified grid by date
   (the studios' feed), a filter by kind, and the grid's own menus («Убрать из проекта»). They come from the
   studios («Добавить в проект»; making them here is off for now — the user's ask, 27.09). While it's on
   screen the «готовы» toasts of this project stay quiet. */

export type MediaFilter = "all" | "image" | "video" | "song"

const STUDIOS = TOOLS.filter((tool) => ["new:image", "new:video", "new:audio"].includes(tool.id))

const FILTERS: { value: MediaFilter; label: string; empty: string }[] = [
  { value: "all", label: "Все", empty: "" },
  { value: "image", label: "Фото", empty: "Фото в проекте пока нет" },
  { value: "video", label: "Видео", empty: "Видео в проекте пока нет" },
  { value: "song", label: "Песни", empty: "Песен в проекте пока нет" },
]

/* The tab's action: «Все ▾» — which kind the grid shows. */
export function ProjectMediaAction({ value, onChange }: { value: MediaFilter; onChange: (value: MediaFilter) => void }) {
  const current = FILTERS.find((item) => item.value === value) ?? FILTERS[0]
  return (
    <AppMenu>
      <AppMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Показать: ${current.label}`} className="h-9 gap-1 rounded-full px-3 text-sm">
          {current.label}
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="size-4! opacity-60" />
        </Button>
      </AppMenuTrigger>
      <AppMenuContent align="end" className="w-44">
        <AppMenuRadioGroup value={value} onValueChange={(next) => onChange(next as MediaFilter)}>
          {FILTERS.map((item) => (
            <AppMenuRadioItem key={item.value} value={item.value}>
              {item.label}
            </AppMenuRadioItem>
          ))}
        </AppMenuRadioGroup>
      </AppMenuContent>
    </AppMenu>
  )
}

export function ProjectMedia({
  project,
  filter,
  onFilterChange,
  onSelect,
}: {
  project: Project
  filter: MediaFilter
  onFilterChange: (value: MediaFilter) => void
  /* Opens a studio from the empty state. */
  onSelect: (id: string) => void
}) {
  const generations = useProjectMedia(project.id)
  const visible = React.useContext(WorkspaceVisibilityContext)
  const { songs } = useMusic()

  const items = React.useMemo(() => {
    const own = songs
      .filter((song) => song.projectId === project.id)
      .map((song): SongItem => ({ id: song.id, kind: "song", ratio: 1, createdAt: song.createdAt, status: song.status, song }))
    const all: FeedItem[] = [...generations, ...own].sort((a, b) => b.createdAt - a.createdAt)
    return filter === "all" ? all : all.filter((item) => item.kind === filter)
  }, [generations, songs, project.id, filter])

  // The open tab can stay mounted behind the role catalogue to preserve the project draft.
  React.useEffect(() => {
    setProjectFeedVisible(visible ? project.id : null)
    return () => setProjectFeedVisible(null)
  }, [project.id, visible])

  if (items.length === 0) {
    const current = FILTERS.find((item) => item.value === filter) ?? FILTERS[0]
    return filter === "all" ? (
      <Empty className="px-6 py-14">
        <EmptyHeader>
          <EmptyTitle className="text-base">Здесь появятся фото, видео и песни проекта</EmptyTitle>
          <EmptyDescription>Добавляйте их из студий через «Добавить в проект».</EmptyDescription>
        </EmptyHeader>
        {/* The way there, not a dead end. */}
        <EmptyContent className="flex-row flex-wrap justify-center gap-2">
          {STUDIOS.map((studio) => (
            <Button key={studio.id} variant="outline" onClick={() => onSelect(studio.id)} className="h-9 rounded-full px-4">
              <img src={studio.icon} alt="" className="size-5 shrink-0" />
              {studio.label}
            </Button>
          ))}
        </EmptyContent>
      </Empty>
    ) : (
      <Empty className="px-6 py-14">
        <EmptyHeader>
          <EmptyTitle className="text-base">{current.empty}</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => onFilterChange("all")} className="h-10 rounded-full px-4">
            Показать всё
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    // A new filter is a new grid: no glide of the tiles that stay (spec §11).
    <MediaFeed key={filter} items={items} size={DEFAULT_FEED_SIZE} projectId={project.id} label="Медиа проекта" />
  )
}
