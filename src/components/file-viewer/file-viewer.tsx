import * as React from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { Download04Icon } from "@hugeicons/core-free-icons"
import { MoreActionButton } from "@/components/more-action-button"

import { ViewerLoading, ViewerMessage } from "@/components/file-viewer/viewer-states"
import { downloadName, viewerKind, type ViewerFile } from "@/components/file-viewer/viewable"
import { AppMenu, AppMenuContent, AppMenuItem, AppMenuSeparator, AppMenuTrigger } from "@/components/ui/app-menu"
import {
  AppSheet,
  AppSheetBody,
  AppSheetCloseButton,
  AppSheetContent,
  AppSheetHeader,
  AppSheetTitle,
} from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

/* pdf.js and mammoth are heavy and needed only once a document is opened. */
const PdfPages = React.lazy(() => import("@/components/file-viewer/pdf-pages"))
const DocxPage = React.lazy(() => import("@/components/file-viewer/docx-page"))

export type FileViewerDetails = {
  gallery: React.ReactNode
  info: React.ReactNode
  primaryAction: React.ReactNode
  onPrevious?: () => void
  onNext?: () => void
  position?: string
}

/* Opens an attached file (the user's ask, 27.09): a picture full-screen, a PDF or a Word file in the
   app's modal (a bottom sheet on the phone). Keep `file` set while closing, so the modal leaves with
   its content; files without a viewer render nothing. */
export function FileViewer({
  file,
  open,
  onOpenChange,
  actions,
  details,
}: {
  file: ViewerFile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  actions?: React.ReactNode
  details?: FileViewerDetails
}) {
  const kind = file && viewerKind(file)
  if (!file || !kind) return null
  return kind === "image" || kind === "video" ? (
    details ? (
      <DetailedMediaViewer file={file} open={open} onOpenChange={onOpenChange} details={details} />
    ) : (
      <PhotoViewer file={file} open={open} onOpenChange={onOpenChange} actions={actions} />
    )
  ) : (
    <DocumentViewer key={file.url} kind={kind} file={file} open={open} onOpenChange={onOpenChange} />
  )
}

type ViewerProps = { file: ViewerFile; open: boolean; onOpenChange: (open: boolean) => void }

/* Keep the dialog mounted when its selected file changes. Only the media node restarts, and an
   error belongs to that particular visit to a file, so returning to it can load it again. */
function useMediaFailure(url: string) {
  const [state, setState] = React.useState({ url, failed: false })
  if (state.url !== url) setState({ url, failed: false })
  return {
    failed: state.url === url && state.failed,
    onError: () => setState({ url, failed: true }),
  }
}

function MediaStage({
  file,
  failed,
  onError,
  className,
  onClick,
}: {
  file: ViewerFile
  failed: boolean
  onError: () => void
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
}) {
  const clip = file.type.startsWith("video/")
  return (
    <div className={cn("flex min-h-0 min-w-0 flex-1 items-center justify-center", className)} onClick={onClick}>
      {failed ? (
        <ViewerMessage
          description={
            clip
              ? "Браузер не воспроизводит такое видео. Откройте его на своём устройстве."
              : "Браузер не показывает такие изображения. Откройте его на своём устройстве."
          }
        />
      ) : clip ? (
        <video
          key={file.url}
          src={file.url}
          controls
          autoPlay
          loop
          playsInline
          aria-label={file.name}
          onError={onError}
          className="max-h-full max-w-full rounded-xl object-contain"
        />
      ) : (
        <img
          key={file.url}
          src={file.url}
          alt={file.name}
          draggable={false}
          onError={onError}
          className="max-h-full max-w-full rounded-xl object-contain select-none"
        />
      )}
    </div>
  )
}

/* Trends add context around the same media stage. Desktop keeps navigation and settings visible;
   the mobile sheet gives its available space to the media and its one primary action. */
function DetailedMediaViewer({ file, open, onOpenChange, details }: ViewerProps & { details: FileViewerDetails }) {
  const mobile = useIsMobile()
  const media = useMediaFailure(file.url)
  const returnFocusRef = React.useRef<HTMLElement | null>(null)

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    if (event.target instanceof Element && event.target.closest(
      "input, textarea, select, video, [contenteditable]:not([contenteditable='false']), [role='slider'], [role='combobox'], [role='menu']"
    )) return
    const navigate = event.key === "ArrowLeft" ? details.onPrevious : event.key === "ArrowRight" ? details.onNext : undefined
    if (!navigate) return
    event.preventDefault()
    navigate()
  }

  return (
    <AppSheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent
        aria-describedby={undefined}
        onKeyDown={onKeyDown}
        onOpenAutoFocus={() => {
          returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        }}
        onCloseAutoFocus={(event) => {
          if (!returnFocusRef.current?.isConnected) return
          event.preventDefault()
          returnFocusRef.current.focus({ preventScroll: true })
        }}
        className="max-md:h-[85dvh] md:h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-3rem)] md:w-[calc(100%-3rem)] md:max-w-[1600px]"
      >
        <AppSheetTitle className="sr-only">{file.name}</AppSheetTitle>
        <AppSheetCloseButton variant="secondary" className="absolute top-3 right-3 z-10 size-10 text-foreground max-md:top-5" />
        <div className="flex min-h-0 flex-1 max-md:flex-col">
          {!mobile && (
            <aside
              aria-label="Галерея изображений и видео"
              data-viewer-gallery=""
              className="flex w-28 shrink-0 flex-col overflow-y-auto overscroll-contain border-r px-3 py-5"
            >
              {details.gallery}
            </aside>
          )}
          <div data-vaul-no-drag="" className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted/40 p-3 pt-14 md:p-5">
            <MediaStage file={file} {...media} />
            {!mobile && details.position && (
              <p className="pt-3 text-center text-xs text-muted-foreground" aria-live="polite" aria-atomic="true">
                {details.position}
              </p>
            )}
          </div>
          {mobile ? (
            <div className="shrink-0 px-4 py-4 [&>*]:w-full">
              {details.primaryAction}
            </div>
          ) : (
            <aside aria-label="Информация о файле" className="flex w-[clamp(280px,30vw,360px)] shrink-0 flex-col border-l">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-16 pb-6">
                {details.info}
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 border-t px-6 py-5">
                <DownloadButton file={file} />
                {details.primaryAction}
              </div>
            </aside>
          )}
        </div>
      </AppSheetContent>
    </AppSheet>
  )
}

/* Full-screen media fits the viewport. The dark header keeps the name, download, actions and close;
   clicking the stage around the media also closes it. */
function PhotoViewer({ file, open, onOpenChange, actions }: ViewerProps & { actions?: React.ReactNode }) {
  const mobile = useIsMobile()
  const media = useMediaFailure(file.url)
  const closeOnStage = (event: React.MouseEvent) => event.target === event.currentTarget && onOpenChange(false)

  return (
    <AppSheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent variant="fullscreen" aria-describedby={undefined} className="dark bg-background/75 text-foreground">
        <div className="flex shrink-0 items-center gap-2 px-4 pt-3 pb-3 md:px-6 md:pt-5 md:pb-4">
          <AppSheetTitle className="min-w-0 flex-1 truncate text-base md:max-w-md">{file.name}</AppSheetTitle>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {!mobile && !media.failed && <DownloadButton file={file} />}
            {(mobile || actions) && (
              <AppMenu>
                <AppMenuTrigger asChild>
                  <MoreActionButton variant="secondary" aria-label="Действия с файлом" className="size-10 rounded-full" />
                </AppMenuTrigger>
                <AppMenuContent align="end" className="dark w-60">
                  <AppMenuItem icon={Download04Icon} onSelect={() => {
                    const link = document.createElement("a")
                    link.href = file.url
                    link.download = downloadName(file)
                    link.click()
                  }}>
                    Скачать
                  </AppMenuItem>
                  {actions && <><AppMenuSeparator />{actions}</>}
                </AppMenuContent>
              </AppMenu>
            )}
            <AppSheetCloseButton variant="secondary" className="size-10 text-foreground max-md:size-10 md:hover:bg-secondary-hover" />
          </div>
        </div>
        <MediaStage file={file} {...media} className="px-4 pb-4 md:px-10 md:pb-10" onClick={media.failed ? undefined : closeOnStage} />
      </AppSheetContent>
    </AppSheet>
  )
}

/* «Скачать»: a round pill that saves the file under a readable name (a made picture's is its prompt). */
function DownloadButton({ file }: { file: ViewerFile }) {
  const mobile = useIsMobile()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary" size="icon-lg" asChild className="size-10 rounded-full">
          <a href={file.url} download={downloadName(file)} aria-label="Скачать">
            <HugeiconsIcon icon={Download04Icon} strokeWidth={ICON_STROKE} />
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" hidden={mobile}>
        Скачать
      </TooltipContent>
    </Tooltip>
  )
}

/* PDF and Word in the regular modal: tall on desktop (the window less 4rem, 800px wide), 85% of the
   screen as a sheet on the phone. Just the name on top, no metadata (the user's ask, 27.09). The
   pages sit on the muted ground and scroll under the header; the list is the sheet's scroll, never
   its drag. */
function DocumentViewer({ kind, file, open, onOpenChange }: ViewerProps & { kind: "pdf" | "docx" }) {
  return (
    <AppSheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent aria-describedby={undefined} className="max-md:h-[85dvh] md:h-[calc(100dvh-4rem)] md:max-w-[800px]">
        <AppSheetHeader>
          <AppSheetTitle className="truncate">{file.name}</AppSheetTitle>
        </AppSheetHeader>
        <AppSheetBody data-vaul-no-drag="" className="bg-muted px-3 py-3 md:px-6 md:py-6">
          <React.Suspense fallback={<ViewerLoading />}>
            {kind === "pdf" ? <PdfPages url={file.url} /> : <DocxPage url={file.url} />}
          </React.Suspense>
        </AppSheetBody>
      </AppSheetContent>
    </AppSheet>
  )
}
