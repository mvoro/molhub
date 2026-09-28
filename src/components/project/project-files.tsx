import { clientId } from "@/lib/client-id"
import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon, Download04Icon, FileUploadIcon, ViewIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { fileKind } from "@/components/chat-composer/file-icon"
import { FileViewer } from "@/components/file-viewer/file-viewer"
import { viewerKind, type ViewerFile } from "@/components/file-viewer/viewable"
import { AppMenu, AppMenuContent, AppMenuItem, AppMenuSeparator, AppMenuTrigger } from "@/components/ui/app-menu"
import { AppSheet, AppSheetContent, AppSheetDescription, AppSheetFooter, AppSheetHeader, AppSheetTitle } from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"
import { MoreActionButton } from "@/components/more-action-button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia } from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import type { Project, ProjectFile } from "@/data/chats"
import { useHub } from "@/hooks/use-hub"
import { ICON_STROKE } from "@/lib/icons"
import { formatListDate } from "@/lib/project-dates"
import { fileAddMessages, formatFileSize, MAX_PROJECT_FILE_SIZE, MAX_PROJECT_FILES, planFileAdds } from "@/lib/project-file-limits"
import { deleteFiles, getFile, hasFile, putFile } from "@/lib/project-files"
import { cn } from "@/lib/utils"

/* «Файлы» of a project page (spec §8): what Молли reads in every chat of the project. Up to 20 files of up
   to 25 MB; their contents sit in IndexedDB (lib/project-files.ts), the list in the project. Files are added
   with «Добавить файлы» or dropped anywhere on the page while this tab is open (the composer's window drop
   zone takes them then — see ProjectView). A file whose content is gone (site data cleared) stays listed as
   unavailable and can be uploaded again. */

/* Files being written, per project: the list and the tab's action read the same rows («Добавляем…»). */
type Writing = { id: string; name: string }
const writing = new Map<string, Writing[]>()
const listeners = new Set<() => void>()
const NONE: Writing[] = []
const setWriting = (projectId: string, update: (list: Writing[]) => Writing[]) => {
  writing.set(projectId, update(writing.get(projectId) ?? NONE))
  listeners.forEach((listener) => listener())
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

const newId = () => `f${clientId()}`

const writeFailed = (name: string, error: unknown) =>
  error instanceof DOMException && error.name === "QuotaExceededError"
    ? `Не удалось сохранить «${name}»: в браузере не хватает места. Удалите ненужные файлы и попробуйте ещё раз.`
    : `Не удалось сохранить «${name}». Попробуйте ещё раз.`

export function useAddProjectFiles(project: Project) {
  const { addProjectFiles } = useHub()
  const pending = React.useSyncExternalStore(subscribe, () => writing.get(project.id) ?? NONE)
  const add = React.useCallback(
    async (files: File[]) => {
      const existing = (project.files?.length ?? 0) + (writing.get(project.id)?.length ?? 0)
      const plan = planFileAdds(existing, files)
      for (const message of fileAddMessages(plan)) toast.error(message)
      await Promise.all(
        plan.accepted.map(async (file) => {
          const id = newId()
          setWriting(project.id, (list) => [{ id, name: file.name }, ...list])
          try {
            await putFile(id, file)
            addProjectFiles(project.id, [{ id, name: file.name, size: file.size, type: file.type, addedAt: Date.now() }])
          } catch (error) {
            toast.error(writeFailed(file.name, error))
          } finally {
            setWriting(project.id, (list) => list.filter((item) => item.id !== id))
          }
        })
      )
    },
    [project.id, project.files, addProjectFiles]
  )
  return { add, writing: pending }
}

/* The OS picker behind a button: a hidden file input (as the composer's). */
function useFilePicker(onPick: (files: File[]) => void, multiple = true) {
  const input = React.useRef<HTMLInputElement>(null)
  const node = (
    <input
      ref={input}
      type="file"
      multiple={multiple}
      hidden
      onChange={(event) => {
        const files = [...(event.target.files ?? [])]
        event.target.value = ""
        if (files.length) onPick(files)
      }}
    />
  )
  return { pick: () => input.current?.click(), input: node }
}

/* The tab's action: «Добавить файлы» and how many there are of the 20 (the limit shows before it bites). */
export function ProjectFilesAction({ project }: { project: Project }) {
  const { add, writing: pending } = useAddProjectFiles(project)
  const { pick, input } = useFilePicker((files) => void add(files))
  const count = (project.files?.length ?? 0) + pending.length
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground tabular-nums">
        {count} из {MAX_PROJECT_FILES}
      </span>
      <Button variant="ghost" size="sm" onClick={pick} disabled={project.archived} className="h-9 gap-1.5 rounded-full px-3 text-sm">
        <HugeiconsIcon icon={Add01Icon} strokeWidth={ICON_STROKE} className="size-4!" />
        Добавить файлы
      </Button>
      {input}
    </div>
  )
}

const download = (url: string, name: string) => {
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
}

export function ProjectFiles({ project }: { project: Project }) {
  const { removeProjectFile, replaceProjectFile } = useHub()
  const { add, writing: pending } = useAddProjectFiles(project)
  const files = React.useMemo(() => project.files ?? [], [project.files])
  // Rows added while the tab is open come in (opacity + 4px); the ones already there just stand.
  const [openedAt] = React.useState(() => Date.now())

  // Files whose content isn't in IndexedDB any more (demo files are served from /public and always there).
  const [missing, setMissing] = React.useState<ReadonlySet<string>>(new Set())
  React.useEffect(() => {
    let alive = true
    Promise.all(files.filter((file) => !file.src).map(async (file) => [file.id, await hasFile(file.id)] as const)).then((results) => {
      if (alive) setMissing(new Set(results.filter(([, stored]) => !stored).map(([id]) => id)))
    })
    return () => {
      alive = false
    }
  }, [files])

  const [viewed, setViewed] = React.useState<ViewerFile | null>(null)
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const objectUrl = React.useRef<string | null>(null)
  const release = () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = null
  }
  React.useEffect(() => release, [])

  const [gone, setGone] = React.useState<ProjectFile | null>(null)
  const [goneOpen, setGoneOpen] = React.useState(false)
  const [doomed, setDoomed] = React.useState<ProjectFile | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const reuploadTarget = React.useRef<ProjectFile | null>(null)
  const reupload = useFilePicker(async ([file]) => {
    const target = reuploadTarget.current
    if (!target || !file) return
    if (file.size > MAX_PROJECT_FILE_SIZE) {
      toast.error(`Не удалось добавить «${file.name}»: файл больше 25 МБ. Сожмите его или разделите на части.`)
      return
    }
    try {
      await putFile(target.id, file)
      replaceProjectFile(project.id, { ...target, name: file.name, size: file.size, type: file.type, addedAt: Date.now(), src: undefined })
      setMissing((prev) => new Set([...prev].filter((id) => id !== target.id)))
      setGoneOpen(false)
    } catch (error) {
      toast.error(writeFailed(file.name, error))
    }
  }, false)
  const { pick, input } = useFilePicker((list) => void add(list))

  /* The content as a URL: the demo's own, or the stored Blob's (revoked when the next one opens). */
  const urlOf = async (file: ProjectFile) => {
    if (file.src) return file.src
    const blob = await getFile(file.id)
    if (!blob) return null
    release()
    objectUrl.current = URL.createObjectURL(blob)
    return objectUrl.current
  }

  const showGone = (file: ProjectFile) => {
    setMissing((prev) => new Set([...prev, file.id]))
    setGone(file)
    setGoneOpen(true)
  }

  const open = async (file: ProjectFile) => {
    const url = await urlOf(file)
    if (!url) return showGone(file)
    // Only photos, videos, PDF and DOCX have a viewer; anything else is simply saved.
    if (!viewerKind(file)) return download(url, file.name)
    setViewed({ name: file.name, type: file.type, size: file.size, url })
    setViewerOpen(true)
  }

  const save = async (file: ProjectFile) => {
    const url = await urlOf(file)
    if (!url) return showGone(file)
    download(url, file.name)
  }

  const askReupload = (file: ProjectFile) => {
    reuploadTarget.current = file
    reupload.pick()
  }

  const remove = () => {
    if (!doomed) return
    removeProjectFile(project.id, doomed.id)
    if (!doomed.src) void deleteFiles([doomed.id])
    toast("Файл удалён")
  }

  const empty = files.length === 0 && pending.length === 0

  return (
    <>
      {empty ? (
        <Empty className="px-6 py-14">
          <EmptyHeader>
            <EmptyTitle className="text-base">Здесь появятся файлы проекта</EmptyTitle>
            <EmptyDescription>Добавьте бриф, прайс или примеры{"\u00a0"}— Молли будет опираться на них во всех чатах проекта.</EmptyDescription>
          </EmptyHeader>
          {!project.archived && (
            <EmptyContent>
              <Button variant="outline" onClick={pick} className="h-10 rounded-full px-4">
                Добавить файлы
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div role="list" aria-label="Файлы проекта" className="flex flex-col">
          {pending.map((item) => (
            <Item key={item.id} role="listitem" size="sm" className="gap-3 rounded-xl border-0 px-3 py-2.5">
              <ItemMedia>
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <Spinner className="size-5 text-muted-foreground" />
                </span>
              </ItemMedia>
              <ItemContent className="min-w-0 gap-0.5">
                <span className="truncate text-base font-medium md:text-[15px]">{item.name}</span>
                <ItemDescription className="text-sm">Добавляем…</ItemDescription>
              </ItemContent>
            </Item>
          ))}
          {files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              fresh={file.addedAt > openedAt}
              missing={missing.has(file.id)}
              onOpen={() => void open(file)}
              onSave={() => void save(file)}
              onReupload={() => askReupload(file)}
              onDelete={() => {
                setDoomed(file)
                setConfirmOpen(true)
              }}
            />
          ))}
        </div>
      )}
      {input}
      {reupload.input}

      <FileViewer
        file={viewed}
        open={viewerOpen}
        onOpenChange={(next) => {
          setViewerOpen(next)
        }}
      />

      <AppSheet open={goneOpen} onOpenChange={setGoneOpen}>
        <AppSheetContent className="md:max-w-[420px]">
          <AppSheetHeader>
            <AppSheetTitle>Файл недоступен</AppSheetTitle>
            <AppSheetDescription>Похоже, данные браузера очищены. Загрузите файл снова.</AppSheetDescription>
          </AppSheetHeader>
          <AppSheetFooter>
            <Button type="button" variant="outline" onClick={() => gone && askReupload(gone)} className="h-10 rounded-full px-4">
              Загрузить снова
            </Button>
          </AppSheetFooter>
        </AppSheetContent>
      </AppSheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Удалить файл?"
        description={`Файл «${doomed?.name ?? ""}» удалится из проекта, и Молли перестанет его учитывать. Восстановить его не получится.`}
        actionLabel="Удалить"
        onConfirm={remove}
      />
    </>
  )
}

function FileRow({
  file,
  fresh,
  missing,
  onOpen,
  onSave,
  onReupload,
  onDelete,
}: {
  file: ProjectFile
  fresh: boolean
  missing: boolean
  onOpen: () => void
  onSave: () => void
  onReupload: () => void
  onDelete: () => void
}) {
  const kind = fileKind(file)
  const date = formatListDate(file.addedAt)
  const meta = [file.size ? formatFileSize(file.size) : "", date].filter(Boolean).join(" · ")
  return (
    <Item
      role="listitem"
      size="sm"
      className={cn(
        "group/row relative gap-3 rounded-xl border-0 px-3 py-2.5",
        "transition-[background-color,scale] duration-75 hover:bg-muted/60 has-[[data-row-open]:active]:scale-[0.99] has-data-[state=open]:bg-muted/60 motion-reduce:transition-none",
        fresh && "animate-in duration-(--duration-fast) ease-(--ease-out) fade-in-0 slide-in-from-bottom-1"
      )}
    >
      <ItemMedia>
        <span className={cn("flex size-10 items-center justify-center rounded-xl [&_svg]:size-5", kind.tile, missing && "opacity-50")}>
          <HugeiconsIcon icon={kind.icon} strokeWidth={ICON_STROKE} />
        </span>
      </ItemMedia>
      <ItemContent className="min-w-0 gap-0.5">
        <Button
          variant="ghost"
          data-row-open=""
          onClick={missing ? onReupload : onOpen}
          className="static block h-auto w-full truncate rounded-none border-0 p-0 text-left text-base font-medium hover:bg-transparent focus-visible:ring-0 active:scale-none motion-reduce:active:scale-none before:absolute before:inset-0 before:rounded-xl focus-visible:before:ring-3 focus-visible:before:ring-ring/50 md:text-[15px]"
        >
          {file.name}
        </Button>
        <ItemDescription className="line-clamp-1 text-sm">{missing ? "Недоступен — загрузите снова" : meta}</ItemDescription>
      </ItemContent>
      <ItemActions className="pointer-events-none relative z-10">
        <AppMenu>
          <AppMenuTrigger asChild>
            <MoreActionButton
              variant="ghost"
              size="icon"
              aria-label={`Действия с файлом «${file.name}»`}
              className="pointer-events-auto text-muted-foreground transition-opacity duration-(--duration-fast) ease-out hover:bg-background hover:text-foreground data-[state=open]:bg-background data-[state=open]:opacity-100 md:pointer-fine:opacity-0 md:pointer-fine:group-hover/row:opacity-100 md:pointer-fine:group-focus-within/row:opacity-100 [&_svg]:size-[18px]"
            />
          </AppMenuTrigger>
          <AppMenuContent align="end" className="w-56">
            {missing ? (
              <AppMenuItem icon={FileUploadIcon} onSelect={onReupload}>
                Загрузить снова
              </AppMenuItem>
            ) : (
              <>
                <AppMenuItem icon={ViewIcon} onSelect={onOpen}>
                  Открыть
                </AppMenuItem>
                <AppMenuItem icon={Download04Icon} onSelect={onSave}>
                  Скачать
                </AppMenuItem>
              </>
            )}
            <AppMenuSeparator />
            <AppMenuItem icon={Delete02Icon} variant="destructive" onSelect={onDelete}>
              Удалить
            </AppMenuItem>
          </AppMenuContent>
        </AppMenu>
      </ItemActions>
    </Item>
  )
}
