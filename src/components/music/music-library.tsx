import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowUpDownIcon,
  Delete02Icon,
  Folder01Icon,
  FolderAddIcon,
  FolderRemoveIcon,
  MoreHorizontalIcon,
  MusicNote01Icon,
  PauseIcon,
  PencilEdit01Icon,
  PlayIcon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { ProjectDialog } from "@/components/project-dialog"
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
import {
  AppSheet,
  AppSheetBody,
  AppSheetContent,
  AppSheetFooter,
  AppSheetHeader,
  AppSheetTitle,
} from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { formatDuration, NO_PROJECT, songsLabel, timeAgo, type Song } from "@/data/music"
import type { Project } from "@/data/chats"
import { useEntityActions } from "@/hooks/use-entity-actions"
import { useHub } from "@/hooks/use-hub"
import { useMusic } from "@/hooks/use-music"
import { ICON_STROKE, projectIcon } from "@/lib/icons"
import { projectColor } from "@/lib/project-colors"
import { cn } from "@/lib/utils"

/* Right side of the music studio (mashagpt.ru/chat/suno): «Проекты» with search, sort and
   «Создать новый проект», each project with its cover, song count and when it last changed.
   Opening one lists its songs: the two takes of every request side by side in time, a cover
   that plays (a mock — the equalizer dances, there is no audio yet), what it sounds like and how
   long it is. New takes appear at the top while they are being made.
   27.09 (spec D4): the projects are the hub's — the ones that hold songs — plus «Без проекта» for songs
   that belong to none. A project is created with the app's project dialog and deleted only from the
   sidebar, its page or the archive (it holds chats too), so the library offers no «Удалить» for it. */

/* A row of the library: a hub project, or «Без проекта» (no project behind it). */
type Group = { id: string; name: string; updatedAt: number; project?: Project }

type Sort = "new" | "old" | "name"
const SORTS: { id: Sort; label: string }[] = [
  { id: "new", label: "Новые" },
  { id: "old", label: "Старые" },
  { id: "name", label: "По названию" },
]

const PRESS = "active:not-aria-[haspopup]:translate-y-0 active:scale-[0.98] motion-reduce:active:scale-100"
/* Row actions: on hover/focus with a mouse, always visible on touch (as in the sidebar). */
const ROW_ACTION =
  "size-9 shrink-0 rounded-full text-foreground/70 hover:bg-background hover:text-foreground data-[state=open]:bg-background dark:hover:bg-background/40 md:pointer-fine:opacity-0 md:pointer-fine:group-hover/row:opacity-100 md:pointer-fine:group-focus-within/row:opacity-100 md:pointer-fine:data-[state=open]:opacity-100"

type Dialog =
  | { kind: "new-project" }
  | { kind: "rename-song"; song: Song }
  | { kind: "delete-song"; song: Song }
  | null

/* A project's row dates from its last song: its chats and files don't move it here. */
const toGroup = (project: Project, songs: Song[]): Group => {
  const own = songs.filter((song) => song.projectId === project.id)
  return { id: project.id, name: project.name, updatedAt: own.length ? Math.max(...own.map((song) => song.createdAt)) : project.updatedAt, project }
}

/* The library's rows: «Без проекта» (when some songs belong to no project) and the live projects that hold
   songs. A project without songs isn't listed, but opens all the same (a new one, just created here). */
function useGroups() {
  const { songs } = useMusic()
  const { projects } = useHub()
  return React.useMemo(() => {
    const loose = songs.filter((song) => !song.projectId)
    const held = new Set(songs.map((song) => song.projectId))
    // An archived project keeps its songs in view (marked), as photos and videos stay in their studio.
    const list = projects.filter((project) => held.has(project.id)).map((project) => toGroup(project, songs))
    const none: Group | null = loose.length
      ? { id: NO_PROJECT, name: "Без проекта", updatedAt: Math.max(...loose.map((song) => song.createdAt)) }
      : null
    return { list, none }
  }, [songs, projects])
}

export function MusicLibrary({ openProjectId, onOpenProject }: { openProjectId: string | null; onOpenProject: (id: string | null) => void }) {
  const music = useMusic()
  const hub = useHub()
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<Sort>("new")
  const [dialog, setDialog] = React.useState<Dialog>(null)
  const groups = useGroups()
  const openProject = hub.projects.find((item) => item.id === openProjectId)
  const group = openProjectId === NO_PROJECT ? groups.none : openProject ? toGroup(openProject, music.songs) : null

  const close = () => setDialog(null)
  const dialogs = (
    <>
      <ProjectDialog
        open={dialog?.kind === "new-project"}
        onOpenChange={(open) => !open && close()}
        onSubmit={(value) => onOpenProject(hub.createProject(value).id)}
      />
      {/* A project is renamed in the app's project dialog (name, colour, icon), as on its page. */}
      <NameSheet
        open={dialog?.kind === "rename-song"}
        onOpenChange={(open) => !open && close()}
        title="Переименовать песню"
        initial={dialog?.kind === "rename-song" ? dialog.song.title : ""}
        placeholder="Название песни"
        maxLength={80}
        action="Сохранить"
        onSubmit={(name) => {
          if (dialog?.kind === "rename-song") music.renameSong(dialog.song.id, name)
          close()
        }}
      />
      <ConfirmDialog
        open={dialog?.kind === "delete-song"}
        onOpenChange={(open) => !open && close()}
        title="Удалить песню?"
        description={dialog?.kind === "delete-song" ? `Песня «${dialog.song.title}» удалится без возможности восстановить.` : ""}
        actionLabel="Удалить"
        onConfirm={() => {
          if (dialog?.kind === "delete-song") {
            music.deleteSong(dialog.song.id)
            toast("Песня удалена")
          }
          close()
        }}
      />
    </>
  )

  if (group) {
    return (
      <>
        <GroupView group={group} onBack={() => onOpenProject(null)} onDialog={setDialog} />
        {dialogs}
      </>
    )
  }

  const needle = query.trim().toLowerCase()
  const projects = groups.list
    .filter((item) => !needle || item.name.toLowerCase().includes(needle))
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name, "ru") : sort === "old" ? a.updatedAt - b.updatedAt : b.updatedAt - a.updatedAt))
  // «Без проекта» leads the list; the search reaches it by its name too.
  const none = groups.none && (!needle || groups.none.name.toLowerCase().includes(needle)) ? groups.none : null

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 md:px-6 md:pt-5">
      <h2 className="flex h-9 items-center text-[17px] font-[500] tracking-[-0.01em] max-md:sr-only">Проекты</h2>
      <div className="flex gap-2">
        <InputGroup className="h-11 flex-1 rounded-full border-0 bg-muted shadow-none dark:bg-muted">
          <InputGroupAddon className="pl-4">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} className="size-[18px] text-foreground/60" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск"
            aria-label="Поиск проектов"
            className="text-base md:text-[15px]"
          />
        </InputGroup>
        <AppMenu>
          <AppMenuTrigger asChild>
            <Button variant="outline" aria-label={`Сортировка: ${SORTS.find((item) => item.id === sort)?.label}`} className={cn("h-11 shrink-0 gap-1.5 rounded-full px-4 max-sm:w-11 max-sm:px-0", PRESS)}>
              <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={ICON_STROKE} className="size-4!" />
              <span className="max-sm:hidden">{SORTS.find((item) => item.id === sort)?.label}</span>
              <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="size-4! opacity-60 max-sm:hidden" />
            </Button>
          </AppMenuTrigger>
          <AppMenuContent align="end" className="min-w-44">
            {SORTS.map((item) => (
              <AppMenuItem key={item.id} onSelect={() => setSort(item.id)}>
                <span className="flex-1">{item.label}</span>
                {item.id === sort && <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} />}
              </AppMenuItem>
            ))}
          </AppMenuContent>
        </AppMenu>
      </div>

      <div role="list" aria-label="Проекты" className="-mx-2 flex flex-col gap-1">
        <div role="listitem">
          <Button variant="ghost" onClick={() => setDialog({ kind: "new-project" })} className={cn("h-auto w-full justify-start gap-4 rounded-2xl p-2 text-[15px] font-normal", PRESS)}>
            <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted">
              <HugeiconsIcon icon={Add01Icon} strokeWidth={ICON_STROKE} className="size-5!" />
            </span>
            Создать новый проект
          </Button>
        </div>
        {none && <GroupRow group={none} onOpen={() => onOpenProject(none.id)} />}
        {projects.map((item) => (
          <GroupRow key={item.id} group={item} onOpen={() => onOpenProject(item.id)} />
        ))}
        {needle && projects.length === 0 && !none && (
          <p className="px-2 py-6 text-sm text-muted-foreground">Проектов с «{query.trim()}» нет. Попробуйте другое название.</p>
        )}
      </div>
      {dialogs}
    </div>
  )
}

/* Square cover: the newest finished song's art, or a note on grey while the project is empty. */
function Cover({ songs, className }: { songs: Song[]; className?: string }) {
  const art = songs.find((song) => song.status === "ready")?.cover
  return (
    <span className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted", className)}>
      {art ? (
        <img src={art} alt="" draggable={false} className="size-full object-cover select-none" />
      ) : (
        <HugeiconsIcon icon={MusicNote01Icon} strokeWidth={ICON_STROKE} className="size-5 text-foreground/50" />
      )}
    </span>
  )
}

/* The songs of a row: its project's, or those of no project. */
const songsOf = (songs: Song[], group: Group) =>
  songs.filter((song) => (group.project ? song.projectId === group.id : !song.projectId))

function GroupRow({ group, onOpen }: { group: Group; onOpen: () => void }) {
  const { songs } = useMusic()
  const own = songsOf(songs, group)
  const making = own.some((song) => song.status === "generating")
  const { project } = group
  const actions = useEntityActions()
  return (
    <div role="listitem" className="group/row relative">
      <Button variant="ghost" onClick={onOpen} className={cn("h-auto w-full justify-start gap-4 rounded-2xl p-2 pr-14 text-left", PRESS)}>
        <Cover songs={own} className="size-16" />
        <span className="grid min-w-0 gap-0.5">
          <span className="flex min-w-0 items-center gap-1.5 text-[15px] font-medium">
            {project && <HugeiconsIcon icon={projectIcon(project.icon)} strokeWidth={ICON_STROKE} color={projectColor(project.color)} className="size-4 shrink-0" />}
            <span className="truncate">{group.name}</span>
          </span>
          <span className="flex items-center gap-1.5 truncate text-[13px] font-normal text-foreground/70">
            {making && <Spinner className="size-3.5" />}
            {making ? "Создаём песни…" : `${songsLabel(own.length)} · ${project?.archived ? "в архиве" : timeAgo(group.updatedAt)}`}
          </span>
        </span>
      </Button>
      {project && (
        <div className="absolute inset-y-0 right-3 my-auto flex h-9 items-center">
          <ItemMenu
            label={`Действия с проектом «${project.name}»`}
            onOpen={() => actions.openProject(project.id, "media")}
            onRename={() => actions.openProjectDialog({ project })}
          />
        </div>
      )}
    </div>
  )
}

function GroupView({ group, onBack, onDialog }: { group: Group; onBack: () => void; onDialog: (dialog: Dialog) => void }) {
  const { songs } = useMusic()
  const own = songsOf(songs, group).sort((a, b) => b.createdAt - a.createdAt)
  const ready = own.filter((song) => song.status === "ready").length
  const { project } = group
  const actions = useEntityActions()
  return (
    <div className="flex flex-col gap-3 px-4 pb-8 md:px-6 md:pt-5">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Все проекты" className={cn("-ml-2 size-10 shrink-0 rounded-full", PRESS)}>
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={ICON_STROKE} className="size-5!" />
        </Button>
        <div className="grid min-w-0 flex-1">
          <h2 className="flex min-w-0 items-center gap-1.5 text-[17px] font-[500] tracking-[-0.01em]">
            {project && <HugeiconsIcon icon={projectIcon(project.icon)} strokeWidth={ICON_STROKE} color={projectColor(project.color)} className="size-4 shrink-0" />}
            <span className="truncate">{group.name}</span>
          </h2>
          <span className="text-[13px] text-foreground/70">
            {songsLabel(ready)} · {project?.archived ? "в архиве" : timeAgo(group.updatedAt)}
          </span>
        </div>
        {project && (
          <ItemMenu
            label={`Действия с проектом «${project.name}»`}
            visible
            onOpen={() => actions.openProject(project.id, "media")}
            onRename={() => actions.openProjectDialog({ project })}
          />
        )}
      </div>

      {own.length === 0 ? (
        <div className="flex flex-col items-center gap-1 px-6 py-16 text-center">
          <span className="text-[15px] font-medium">Здесь появятся песни проекта</span>
          <span className="max-w-72 text-sm text-muted-foreground">
            <span className="md:hidden">Опишите идею во вкладке «Создать» — готовые версии лягут сюда.</span>
            <span className="max-md:hidden">Опишите идею слева и нажмите «Создать» — готовые версии лягут сюда.</span>
          </span>
        </div>
      ) : (
        <div role="list" aria-label={`Песни: ${group.name}`} className="-mx-2 flex flex-col gap-0.5">
          {own.map((song) => (
            <SongRow key={song.id} song={song} onDialog={onDialog} />
          ))}
        </div>
      )}
    </div>
  )
}

function SongRow({ song, onDialog }: { song: Song; onDialog: (dialog: Dialog) => void }) {
  const { playingId, togglePlay } = useMusic()
  const playing = playingId === song.id
  const making = song.status === "generating"

  return (
    <div
      role="listitem"
      className="group/row flex items-center gap-3 rounded-2xl p-2 transition-colors duration-100 hover:bg-muted/70 animate-in fade-in-0 slide-in-from-top-1 duration-300 motion-reduce:animate-none"
    >
      {making ? (
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Spinner className="size-5 text-foreground/60" />
        </span>
      ) : (
        <Button
          variant="ghost"
          onClick={() => togglePlay(song.id)}
          aria-label={playing ? `Пауза: «${song.title}»` : `Слушать «${song.title}»`}
          aria-pressed={playing}
          className={cn("relative size-14 shrink-0 overflow-hidden rounded-xl p-0", PRESS)}
        >
          <img src={song.cover} alt="" draggable={false} className="absolute inset-0 size-full object-cover select-none" />
          {/* Play on hover (always on touch); while playing the bars dance in place of the icon. */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/35 text-white transition-opacity duration-150",
              !playing && "md:pointer-fine:opacity-0 md:pointer-fine:group-hover/row:opacity-100 md:pointer-fine:group-focus-within/row:opacity-100"
            )}
          >
            {playing ? (
              <span className="equalizer flex h-4 items-end" data-playing="">
                <span />
                <span />
                <span />
                <span />
              </span>
            ) : (
              <HugeiconsIcon icon={PlayIcon} strokeWidth={ICON_STROKE} className="size-5! fill-current" />
            )}
          </span>
        </Button>
      )}

      <div className="grid min-w-0 flex-1 gap-0.5">
        <span className={cn("truncate text-[15px] font-medium", playing && "text-primary")}>{song.title}</span>
        <span className="truncate text-[13px] text-foreground/70">{making ? "Создаём песню…" : song.tags}</span>
      </div>

      {!making && (
        <>
          <span className="shrink-0 text-[13px] text-foreground/70 tabular-nums">{formatDuration(song.duration)}</span>
          {playing && (
            <Button variant="ghost" size="icon" onClick={() => togglePlay(song.id)} aria-label="Пауза" className="size-9 shrink-0 rounded-full max-md:hidden">
              <HugeiconsIcon icon={PauseIcon} strokeWidth={ICON_STROKE} className="size-[18px]! fill-current" />
            </Button>
          )}
          <ItemMenu
            label={`Действия с песней «${song.title}»`}
            song={song}
            onRename={() => onDialog({ kind: "rename-song", song })}
            onDelete={() => onDialog({ kind: "delete-song", song })}
          />
        </>
      )}
    </div>
  )
}

/* Row actions. A project has no «Удалить» here: it holds chats and files too (spec D4); it opens its page
   instead. A song can join or leave a project. */
function ItemMenu({
  label,
  visible,
  onOpen,
  onRename,
  song,
  onDelete,
}: {
  label: string
  visible?: boolean
  onOpen?: () => void
  onRename: () => void
  song?: Song
  onDelete?: () => void
}) {
  return (
    <AppMenu>
      <AppMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label} className={cn(ROW_ACTION, visible && "opacity-100 md:pointer-fine:opacity-100")}>
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={ICON_STROKE} className="size-[18px]!" />
        </Button>
      </AppMenuTrigger>
      <AppMenuContent align="end" className="w-56">
        {onOpen && (
          <AppMenuItem icon={Folder01Icon} onSelect={onOpen}>
            Открыть проект
          </AppMenuItem>
        )}
        <AppMenuItem icon={PencilEdit01Icon} onSelect={onRename}>
          Переименовать
        </AppMenuItem>
        {song && <SongProjectMenu song={song} />}
        {onDelete && (
          <>
            <AppMenuSeparator />
            <AppMenuItem icon={Delete02Icon} variant="destructive" onSelect={onDelete}>
              Удалить
            </AppMenuItem>
          </>
        )}
      </AppMenuContent>
    </AppMenu>
  )
}

/* «Добавить в проект ▸» on a song, as on a studio photo (spec §6): this song only; «Новый проект» creates one
   and stays in the studio; «Убрать из проекта» leaves it in the studio under «Без проекта». */
function SongProjectMenu({ song }: { song: Song }) {
  const { projects } = useHub()
  const { setSongProject } = useMusic()
  const actions = useEntityActions()
  const live = projects.filter((project) => !project.archived)
  const add = (project: Project) => {
    if (project.id === song.projectId) return
    setSongProject(song.id, project.id)
    toast(`Песня добавлена в «${project.name}»`, {
      action: { label: "Открыть", onClick: () => actions.openProject(project.id, "media") },
    })
  }
  const unlink = () => {
    const before = song.projectId
    setSongProject(song.id, undefined)
    toast("Песня убрана из проекта", {
      description: "Она осталась в студии",
      action: { label: "Отменить", onClick: () => setSongProject(song.id, before) },
    })
  }
  return (
    <AppMenuSub>
      <AppMenuSubTrigger icon={FolderAddIcon}>Добавить в проект</AppMenuSubTrigger>
      <AppMenuSubContent title="Добавить в проект" className="w-60">
        <AppMenuItem icon={FolderAddIcon} onSelect={() => actions.openProjectDialog({ onCreated: add })}>
          Новый проект
        </AppMenuItem>
        {live.length > 0 && <AppMenuSeparator />}
        {live.map((project) => (
          <AppMenuItem key={project.id} onSelect={() => add(project)}>
            <HugeiconsIcon strokeWidth={ICON_STROKE} icon={projectIcon(project.icon)} color={projectColor(project.color)} />
            <span className="min-w-0 flex-1 truncate">{project.name}</span>
            {project.id === song.projectId && <HugeiconsIcon strokeWidth={ICON_STROKE} icon={Tick02Icon} className="ml-2 size-4!" />}
          </AppMenuItem>
        ))}
        {song.projectId && (
          <>
            <AppMenuSeparator />
            <AppMenuItem icon={FolderRemoveIcon} onSelect={unlink}>
              Убрать из проекта
            </AppMenuItem>
          </>
        )}
      </AppMenuSubContent>
    </AppMenuSub>
  )
}

/* One-field sheet: new project and renames. Remounts per opening, so it starts from `initial`. */
function NameSheet({
  open,
  onOpenChange,
  title,
  initial,
  placeholder,
  maxLength,
  action,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  initial: string
  placeholder: string
  maxLength: number
  action: string
  onSubmit: (name: string) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  return (
    <AppSheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent
        className="md:max-w-[420px]"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          inputRef.current?.focus({ preventScroll: true })
          inputRef.current?.select()
        }}
      >
        <NameForm key={`${title}-${initial}`} title={title} initial={initial} placeholder={placeholder} maxLength={maxLength} action={action} inputRef={inputRef} onSubmit={onSubmit} />
      </AppSheetContent>
    </AppSheet>
  )
}

function NameForm({
  title,
  initial,
  placeholder,
  maxLength,
  action,
  inputRef,
  onSubmit,
}: {
  title: string
  initial: string
  placeholder: string
  maxLength: number
  action: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onSubmit: (name: string) => void
}) {
  const [name, setName] = React.useState(initial)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (name.trim()) onSubmit(name.trim())
      }}
      className="flex min-h-0 flex-col"
    >
      <AppSheetHeader>
        <AppSheetTitle>{title}</AppSheetTitle>
      </AppSheetHeader>
      <AppSheetBody className="pt-1 pb-1">
        <InputGroup data-vaul-no-drag="" className="h-11 rounded-xl">
          <InputGroupInput
            ref={inputRef}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={placeholder}
            aria-label={title}
            autoComplete="off"
            maxLength={maxLength}
            className="h-full text-base"
          />
        </InputGroup>
      </AppSheetBody>
      <AppSheetFooter>
        <Button type="submit" size="lg" disabled={!name.trim()} className="h-11 w-full rounded-full">
          {action}
        </Button>
      </AppSheetFooter>
    </form>
  )
}
