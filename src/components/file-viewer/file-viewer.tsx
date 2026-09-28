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

/* pdf.js and mammoth are heavy and needed only once a document is opened. */
const PdfPages = React.lazy(() => import("@/components/file-viewer/pdf-pages"))
const DocxPage = React.lazy(() => import("@/components/file-viewer/docx-page"))

/* Opens an attached file (the user's ask, 27.09): a picture full-screen, a PDF or a Word file in the
   app's modal (a bottom sheet on the phone). Keep `file` set while closing, so the modal leaves with
   its content; files without a viewer render nothing. */
export function FileViewer({
  file,
  open,
  onOpenChange,
  actions,
}: {
  file: ViewerFile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  actions?: React.ReactNode
}) {
  const kind = file && viewerKind(file)
  if (!file || !kind) return null
  return kind === "image" || kind === "video" ? (
    <PhotoViewer key={file.url} file={file} open={open} onOpenChange={onOpenChange} actions={actions} />
  ) : (
    <DocumentViewer key={file.url} kind={kind} file={file} open={open} onOpenChange={onOpenChange} />
  )
}

type ViewerProps = { file: ViewerFile; open: boolean; onOpenChange: (open: boolean) => void }

/* Full-screen media fits the viewport. The dark header keeps the name, download, actions and close;
   clicking the stage around the media also closes it. */
function PhotoViewer({ file, open, onOpenChange, actions }: ViewerProps & { actions?: React.ReactNode }) {
  const mobile = useIsMobile()
  const [failed, setFailed] = React.useState(false)
  // A clip (the video tool's results, attached videos) plays on the same stage, with the browser's controls.
  const clip = file.type.startsWith("video/")
  const closeOnStage = (event: React.MouseEvent) => event.target === event.currentTarget && onOpenChange(false)

  return (
    <AppSheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent variant="fullscreen" aria-describedby={undefined} className="dark bg-background/75 text-foreground">
        <div className="flex shrink-0 items-center gap-2 px-4 pt-3 pb-3 md:px-6 md:pt-5 md:pb-4">
          <AppSheetTitle className="min-w-0 flex-1 truncate text-base md:max-w-md">{file.name}</AppSheetTitle>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {!mobile && !failed && <DownloadButton file={file} />}
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
        {failed ? (
          <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-4 md:px-10 md:pb-10">
            <ViewerMessage
              description={
                clip
                  ? "Браузер не воспроизводит такое видео. Откройте его на своём устройстве."
                  : "Браузер не показывает такие изображения. Откройте его на своём устройстве."
              }
            />
          </div>
        ) : clip ? (
          <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-4 md:px-10 md:pb-10" onClick={closeOnStage}>
            <video
              src={file.url}
              controls
              autoPlay
              loop
              playsInline
              aria-label={file.name}
              onError={() => setFailed(true)}
              className="max-h-full max-w-full rounded-xl object-contain"
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-4 md:px-10 md:pb-10" onClick={closeOnStage}>
            <img
              src={file.url}
              alt={file.name}
              draggable={false}
              onError={() => setFailed(true)}
              className="max-h-full max-w-full rounded-xl object-contain select-none"
            />
          </div>
        )}
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
