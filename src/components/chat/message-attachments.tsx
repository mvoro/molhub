import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowExpand01Icon, Download04Icon, Image01Icon, RefreshIcon } from "@hugeicons/core-free-icons"

import { fileKind } from "@/components/chat-composer/file-icon"
import { FileViewer } from "@/components/file-viewer/file-viewer"
import { Attachment, AttachmentActions, AttachmentAction, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle, AttachmentTrigger } from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useChatFile } from "@/hooks/use-chat-file"
import { attachmentKind, type ChatArtifact, type ChatAttachment } from "@/lib/chat-attachments"
import { formatFileSize } from "@/lib/project-file-limits"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

export function DocumentCard({ file, onOpen }: { file: ChatArtifact; onOpen: (file: ChatArtifact) => void }) {
  const kind = fileKind(file)
  return (
    <Attachment className="w-full max-w-sm flex-nowrap">
      <AttachmentMedia className={kind.tile}><HugeiconsIcon icon={kind.icon} strokeWidth={ICON_STROKE} /></AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{file.name}</AttachmentTitle>
        <AttachmentDescription>{kind.label} · {formatFileSize(file.size)}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentTrigger aria-label={`Открыть документ ${file.name}`} onClick={() => onOpen(file)} />
      <AttachmentActions className="pointer-events-none text-muted-foreground"><HugeiconsIcon icon={ArrowExpand01Icon} size={16} strokeWidth={ICON_STROKE} /></AttachmentActions>
    </Attachment>
  )
}

export function MessageAttachments({ files, onOpenDocument }: { files: ChatAttachment[]; onOpenDocument: (file: ChatArtifact) => void }) {
  return (
    <div className="flex w-full max-w-md flex-wrap justify-end gap-2 self-end" aria-label="Прикреплённые файлы">
      {files.map((file) => <MessageAttachment key={file.id} file={file} onOpenDocument={onOpenDocument} />)}
    </div>
  )
}

function MessageAttachment({ file, onOpenDocument }: { file: ChatAttachment; onOpenDocument: (file: ChatArtifact) => void }) {
  const kind = attachmentKind(file)
  const { resource, failed, retry } = useChatFile(file)
  const [open, setOpen] = React.useState(false)
  const [mediaFailed, setMediaFailed] = React.useState(false)
  const media = kind === "image" || kind === "video" || kind === "audio"
  if (!media) return <div className="flex w-full justify-end"><DocumentCard file={file} onOpen={onOpenDocument} /></div>

  const exclusive = (event: React.SyntheticEvent<HTMLMediaElement>) => {
    document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((element) => { if (element !== event.currentTarget) element.pause() })
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border bg-muted/40", kind === "image" ? "size-20 shrink-0 rounded-xl" : "w-full", kind === "audio" && "p-3")}>
      {failed && kind === "image" ? (
        <Button variant="ghost" className="size-full rounded-none" aria-label={`Повторить загрузку фото ${file.name}`} onClick={retry}><HugeiconsIcon icon={RefreshIcon} strokeWidth={ICON_STROKE} /></Button>
      ) : failed ? (
        <div className="flex min-h-28 flex-col items-center justify-center gap-2 p-4 text-center text-sm">
          <p className="text-muted-foreground">Файл «{file.name}» недоступен. Попробуйте открыть его ещё раз.</p>
          <Button variant="outline" size="sm" onClick={retry}><HugeiconsIcon icon={RefreshIcon} strokeWidth={ICON_STROKE} />Повторить</Button>
        </div>
      ) : !resource ? (
        <Skeleton className={kind === "image" ? "size-full" : kind === "audio" ? "h-20 w-full" : "aspect-video w-full"} aria-label={`Загружается ${file.name}`} />
      ) : (
        <>
          {kind === "image" && (
            <Button variant="ghost" className="block size-full rounded-none p-0 hover:bg-transparent" aria-label={`Открыть фото ${file.name}`} onClick={() => setOpen(true)}>
              {mediaFailed ? <HugeiconsIcon icon={Image01Icon} strokeWidth={ICON_STROKE} className="mx-auto size-6 text-muted-foreground" /> : <img src={resource.url} alt="" className="size-full object-cover" loading="lazy" onError={() => setMediaFailed(true)} />}
            </Button>
          )}
          {kind === "video" && !mediaFailed && <video src={resource.url} controls playsInline preload="metadata" aria-label={file.name} className="max-h-96 w-full" onPlay={exclusive} onError={() => setMediaFailed(true)} />}
          {kind === "audio" && (
            <>
              <p className="mb-2 truncate px-1 text-sm font-medium" title={file.name}>{file.name}</p>
              {!mediaFailed && <audio src={resource.url} controls preload="metadata" aria-label={file.name} className="h-11 w-full" onPlay={exclusive} onError={() => setMediaFailed(true)} />}
            </>
          )}
          {mediaFailed && kind !== "image" && <p className="p-4 text-sm text-muted-foreground">Этот формат не воспроизводится в браузере. Скачайте файл, чтобы открыть его на устройстве.</p>}
          {kind !== "image" && <div className="flex min-w-0 items-center gap-2 px-3 py-1.5">
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={file.name}>{kind === "audio" ? formatFileSize(file.size) : file.name}</span>
            {kind === "video" && <Button variant="ghost" size="icon-sm" aria-label={`Развернуть видео ${file.name}`} onClick={() => setOpen(true)}><HugeiconsIcon icon={ArrowExpand01Icon} strokeWidth={ICON_STROKE} /></Button>}
            <AttachmentAction size="icon-sm" asChild><a href={resource.url} download={file.name} aria-label={`Скачать ${file.name}`}><HugeiconsIcon icon={Download04Icon} strokeWidth={ICON_STROKE} /></a></AttachmentAction>
          </div>}
          {(kind === "image" || kind === "video") && <FileViewer file={{ ...file, type: file.type || (kind === "image" ? "image/jpeg" : "video/mp4"), url: resource.url }} open={open} onOpenChange={setOpen} />}
        </>
      )}
    </div>
  )
}
