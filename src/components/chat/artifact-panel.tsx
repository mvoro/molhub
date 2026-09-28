import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowExpand01Icon, ArrowShrink01Icon, Cancel01Icon, Download04Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import type { PanelImperativeHandle } from "react-resizable-panels"

import { DocumentContent } from "@/components/chat/document-content"
import { ViewerLoading, ViewerMessage } from "@/components/file-viewer/viewer-states"
import { AppSheet, AppSheetContent, AppSheetTitle, AppSheetDescription, AppSheetCloseButton } from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useChatFile } from "@/hooks/use-chat-file"
import { useIsMobile } from "@/hooks/use-mobile"
import { attachmentKind, type ChatArtifact } from "@/lib/chat-attachments"
import { formatFileSize } from "@/lib/project-file-limits"
import { ICON_STROKE } from "@/lib/icons"

const PdfPages = React.lazy(() => import("@/components/file-viewer/pdf-pages"))
const DocxPage = React.lazy(() => import("@/components/file-viewer/docx-page"))
const scrollPositions = new Map<string, number>()

export function ChatArtifactWorkspace({ children, file, open, onClose }: { children: React.ReactNode; file: ChatArtifact | null; open: boolean; onClose: () => void }) {
  const mobile = useIsMobile()
  const panel = React.useRef<PanelImperativeHandle>(null)
  const [expanded, setExpanded] = React.useState(false)
  const width = React.useRef(50)
  const trigger = React.useRef<HTMLElement | null>(null)
  const content = React.useRef<HTMLDivElement>(null)
  const docked = open && !mobile
  const fullWidth = docked && expanded

  React.useEffect(() => {
    // v4 re-registers panels when their constraints change. Resize after that render has settled;
    // otherwise the previous maxSize clamps an expansion or the previous minSize blocks restore.
    const target = open && !mobile ? expanded ? "100%" : `${width.current}%` : "0%"
    const frame = window.requestAnimationFrame(() => panel.current?.resize(target))
    return () => window.cancelAnimationFrame(frame)
  }, [open, mobile, expanded])
  React.useEffect(() => {
    if (!open || mobile) return
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    content.current?.focus({ preventScroll: true })
    return () => { if (trigger.current?.isConnected) trigger.current.focus({ preventScroll: true }) }
  }, [open, mobile])

  return (
    <>
    <ResizablePanelGroup orientation="horizontal" data-artifact-open={docked ? "true" : undefined} className="min-h-0 flex-1"
      onLayoutChanged={(layout, { isUserInteraction }) => {
        // Constraint reconciliation and imperative expand/collapse must not overwrite the last
        // user-selected split width. Keyboard and pointer resizes both report user interaction.
        if (isUserInteraction && docked && !expanded && layout.artifact >= 35 && layout.artifact <= 65) width.current = layout.artifact
      }}>
      <ResizablePanel id="chat" defaultSize="100%" minSize={mobile ? "100%" : fullWidth ? "0%" : "35%"} className="flex min-w-0 flex-col" inert={fullWidth || undefined}>
        {children}
      </ResizablePanel>
      <ResizableHandle disabled={!docked || expanded} withHandle aria-label="Изменить ширину документа" className={docked && !expanded ? "mx-2 w-px bg-border/60" : "hidden"} />
      <ResizablePanel
        id="artifact" panelRef={panel} defaultSize="0%" minSize={mobile ? "0%" : fullWidth ? "100%" : "35%"} maxSize={mobile ? "0%" : fullWidth ? "100%" : "65%"} collapsible collapsedSize="0%" collapsedThreshold="0%"
        className="min-w-0"
      >
        <div ref={content} role="region" aria-label={file ? `Документ: ${file.name}` : "Документ"} tabIndex={-1} inert={!docked || undefined} aria-hidden={!docked || undefined}
          onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); onClose() } }}
          className="flex h-full min-w-0 flex-col bg-background outline-none">
          {!mobile && file && <ArtifactContents key={file.id} file={file} onClose={onClose} expanded={expanded} onExpand={() => setExpanded((value) => !value)} />}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
    <AppSheet open={mobile && open && !!file} onOpenChange={(next) => { if (!next) onClose() }}>
      <AppSheetContent className="h-[85dvh]">
        {mobile && file && <ArtifactContents key={file.id} file={file} mobile />}
      </AppSheetContent>
    </AppSheet>
    </>
  )
}

function ArtifactContents({ file, onClose, expanded, onExpand, mobile = false }: { file: ChatArtifact; onClose?: () => void; expanded?: boolean; onExpand?: () => void; mobile?: boolean }) {
  const { resource, failed, retry } = useChatFile(file)
  const [text, setText] = React.useState<string | null>(file.content ?? null)
  const [textFailed, setTextFailed] = React.useState(false)
  const [mode, setMode] = React.useState("preview")
  const [previewFailed, setPreviewFailed] = React.useState(false)
  const [attempt, setAttempt] = React.useState(0)
  const kind = attachmentKind(file)
  const textual = kind === "markdown" || kind === "text"
  const scroll = React.useRef<HTMLDivElement>(null)
  const onPreviewError = React.useCallback(() => setPreviewFailed(true), [])
  React.useEffect(() => {
    if (!resource || !textual || file.content !== undefined) return
    let live = true
    // Large source files remain downloadable without freezing the document preview.
    const reading = resource.blob.size > 2 * 1024 * 1024 ? Promise.reject(new Error("Документ слишком большой для предпросмотра")) : resource.blob.text()
    reading.then((value) => { if (live) { setText(value); setTextFailed(false) } }).catch(() => live && setTextFailed(true))
    return () => { live = false }
  }, [resource, textual, file.content])
  React.useEffect(() => {
    const viewport = scroll.current?.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")
    if (!viewport) return
    viewport.scrollTop = scrollPositions.get(file.id) ?? 0
    const save = () => scrollPositions.set(file.id, viewport.scrollTop)
    viewport.addEventListener("scroll", save, { passive: true })
    return () => viewport.removeEventListener("scroll", save)
  }, [file.id, resource, text, mode])

  return (
    <>
      <header className="flex min-w-0 shrink-0 items-center gap-1 border-b px-3 py-3">
        <div className="min-w-0 flex-1 pl-1">
          {mobile ? <><AppSheetTitle className="truncate text-sm">{file.name}</AppSheetTitle><AppSheetDescription className="sr-only">Предпросмотр документа</AppSheetDescription></> : <h2 className="truncate text-sm font-medium" title={file.name}>{file.name}</h2>}
          <p className="text-xs text-muted-foreground">{file.name.split(".").at(-1)?.toUpperCase()} · {formatFileSize(file.size)}</p>
        </div>
        {text !== null && <CopyButton value={text} label="Копировать текст документа" className="rounded-full" />}
        <Button variant="ghost" size="icon" className="rounded-full" disabled={!resource} asChild={!!resource} aria-label="Скачать документ">
          {resource ? <a href={resource.url} download={file.name}><HugeiconsIcon icon={Download04Icon} strokeWidth={ICON_STROKE} /></a> : <HugeiconsIcon icon={Download04Icon} strokeWidth={ICON_STROKE} />}
        </Button>
        {onExpand && <Button variant="ghost" size="icon" className="rounded-full" aria-label={expanded ? "Свернуть документ" : "Развернуть документ"} onClick={onExpand}><HugeiconsIcon icon={expanded ? ArrowShrink01Icon : ArrowExpand01Icon} strokeWidth={ICON_STROKE} /></Button>}
        {onClose && <Button variant="ghost" size="icon" className="rounded-full" aria-label="Закрыть документ" onClick={onClose}><HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} /></Button>}
        {mobile && <AppSheetCloseButton label="Закрыть документ" className="size-9" />}
      </header>
      <Tabs value={mode} onValueChange={setMode} className="min-h-0 flex-1 gap-0">
      {kind === "markdown" && <div className="shrink-0 px-4 pt-4"><TabsList aria-label="Вид документа"><TabsTrigger value="preview">Документ</TabsTrigger><TabsTrigger value="source">Исходный текст</TabsTrigger></TabsList></div>}
      <ScrollArea ref={scroll} className="min-h-0 min-w-0 flex-1 [&_[data-slot=scroll-area-viewport]>div]:block! [&_[data-slot=scroll-area-viewport]>div]:w-full [&_[data-slot=scroll-area-viewport]>div]:min-w-0" aria-label="Содержимое документа">
        <div className="px-5 py-6">
          {failed ? <div className="flex flex-col items-center gap-3"><ViewerMessage title="Файл недоступен" description="Не удалось прочитать файл из истории. Попробуйте ещё раз." /><Button variant="outline" className="rounded-full" onClick={retry}><HugeiconsIcon icon={RefreshIcon} strokeWidth={ICON_STROKE} />Повторить</Button></div>
            : !resource ? <ViewerLoading />
              : textual ? textFailed ? <ViewerMessage title="Предпросмотр недоступен" description="Скачайте файл, чтобы открыть полный документ на устройстве." /> : text === null ? <ViewerLoading /> : kind === "markdown" ? <><TabsContent value="preview"><DocumentContent text={text} /></TabsContent><TabsContent value="source"><pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6">{text}</pre></TabsContent></> : <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6">{text}</pre>
                : <React.Suspense fallback={<ViewerLoading />}>
                  {previewFailed ? <div className="flex flex-col items-center gap-3"><ViewerMessage /><Button variant="outline" className="rounded-full" onClick={() => { setPreviewFailed(false); setAttempt((value) => value + 1) }}><HugeiconsIcon icon={RefreshIcon} strokeWidth={ICON_STROKE} />Повторить</Button></div> : kind === "pdf" ? <PdfPages key={`${resource.url}:${attempt}`} url={resource.url} onError={onPreviewError} /> : kind === "docx" ? <DocxPage key={`${resource.url}:${attempt}`} url={resource.url} onError={onPreviewError} /> : <ViewerMessage title="Предпросмотр этого формата недоступен" description="Скачайте файл, чтобы открыть его на устройстве." />}
                </React.Suspense>}
        </div>
      </ScrollArea>
      </Tabs>
    </>
  )
}
