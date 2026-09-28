import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download04Icon, PencilEdit01Icon, RefreshIcon, ThumbsDownIcon, ThumbsUpIcon } from "@hugeicons/core-free-icons"

import { ImageGeneration } from "@/components/chat/image-generation"
import { DocumentCard, MessageAttachments } from "@/components/chat/message-attachments"
import { FileViewer } from "@/components/file-viewer/file-viewer"
import { ModelLogo } from "@/components/model-logo"
import { downloadName } from "@/components/file-viewer/viewable"
import { StreamingText } from "@/components/chat/streaming-text"
import { ThinkingStatus } from "@/components/chat/thinking-status"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { Message, MessageContent } from "@/components/ui/message"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { THINKING_STEPS } from "@/data/demo-replies"
import { findModel, isMolly } from "@/data/models"
import { isActive, tokenize, type AssistantMessage, type UserMessage } from "@/hooks/use-chat-messages"
import { useIsMobile } from "@/hooks/use-mobile"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { ChatArtifact } from "@/lib/chat-attachments"

/* How long each thinking state holds before the next swaps in (transitions.dev: 2 s; a little quicker
   here so a short think still shows a change). The last state holds until the work is done. */
const STEP_MS = 1800

/* The user's request: a grey bubble on the right, «Копировать» and «Изменить» under it — shown on
   hover with a mouse (they keep their room, so nothing shifts), always on touch. */
export function UserChatMessage({ message, onEdit, onOpenDocument }: { message: UserMessage; onEdit: (text: string) => void; onOpenDocument: (file: ChatArtifact) => void }) {
  return (
    <Message align="end" className="animate-in duration-200 ease-(--ease-out) fade-in-0 slide-in-from-bottom-1">
      <MessageContent className="gap-1">
        {!!message.attachments?.length && <MessageAttachments files={message.attachments} onOpenDocument={onOpenDocument} />}
        {message.text && <Bubble variant="muted" align="end" className="max-w-[85%] md:max-w-[70%]">
          <BubbleContent className="rounded-[20px] px-4 py-2.5 text-base leading-6 whitespace-pre-wrap">{message.text}</BubbleContent>
        </Bubble>}
        {message.text && <div className="-mr-2 flex items-center gap-0.5 self-end opacity-0 transition-opacity duration-150 group-hover/message:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100">
          <CopyButton value={message.text} />
          <ActionButton label="Изменить" icon={PencilEdit01Icon} onClick={() => onEdit(message.text)} />
        </div>}
      </MessageContent>
    </Message>
  )
}

/* The model's reply. A header line — the model's icon and, while it works, its thinking line
   (shimmering, a new state every ~2 s), then its name — over what it made: Молли's picture (the dots,
   then the dissolve), the streamed words. When it is done the actions fade in: copy, rate, again; a
   picture adds «Скачать». */
export function AssistantChatMessage({
  message,
  busy,
  onRate,
  onRegenerate,
  onOpenDocument,
}: {
  message: AssistantMessage
  /* Another reply in the chat is running: «Повторить» waits. */
  busy: boolean
  onRate: (rating: "up" | "down") => void
  onRegenerate: () => void
  onOpenDocument: (file: ChatArtifact) => void
}) {
  const model = findModel(message.model)
  const name = isMolly(message.model) ? "Молли" : (model?.version.name ?? message.model)
  const working = message.status === "thinking" || message.status === "drawing"
  const step = useStep(message.status === "drawing" ? THINKING_STEPS.drawing : message.steps, working)
  const finished = !isActive(message.status)
  const visibleText = () => tokenize(message.text).slice(0, message.shown).join("")
  const [viewerOpen, setViewerOpen] = React.useState(false)

  return (
    <Message className="animate-in duration-200 ease-(--ease-out) fade-in-0">
      <MessageContent className="gap-3">
        <div className="flex h-6 min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <ModelLogo logo={model?.family.logo} color className="size-5 text-foreground" />
          <ThinkingStatus text={working ? step : name} shimmer={working} />
        </div>

        {message.image && (
          <>
            <ImageGeneration
              src={message.image.src}
              ratio={message.image.ratio}
              ready={message.image.status === "ready"}
              alt={message.request}
              name={message.request}
              onOpen={() => setViewerOpen(true)}
              className="w-full max-w-sm animate-in duration-300 ease-(--ease-out) fade-in-0"
            />
            <FileViewer
              file={{ name: message.request, type: "image/jpeg", size: 0, url: message.image.src }}
              open={viewerOpen}
              onOpenChange={setViewerOpen}
            />
          </>
        )}

        {message.shown > 0 && <StreamingText text={message.text} shown={message.shown} />}
        {message.status === "done" && message.artifacts?.map((file) => <DocumentCard key={file.id} file={file} onOpen={onOpenDocument} />)}
        {message.status === "stopped" && <p className="text-sm text-muted-foreground">Ответ остановлен</p>}

        {finished && (
          <div className="-ml-2 flex items-center gap-0.5 animate-in duration-200 ease-(--ease-out) fade-in-0">
            {message.shown > 0 && <CopyButton value={visibleText} />}
            {message.image?.status === "ready" && (
              <ActionButton label="Скачать" icon={Download04Icon} asChild>
                <a href={message.image.src} download={downloadName({ name: message.request, type: "image/jpeg" })} />
              </ActionButton>
            )}
            <ActionButton label="Хороший ответ" icon={ThumbsUpIcon} pressed={message.rating === "up"} onClick={() => onRate("up")} />
            <ActionButton label="Плохой ответ" icon={ThumbsDownIcon} pressed={message.rating === "down"} onClick={() => onRate("down")} />
            <ActionButton label="Повторить" icon={RefreshIcon} disabled={busy} onClick={onRegenerate} />
          </div>
        )}
      </MessageContent>
    </Message>
  )
}

/* A message action: a stock ghost icon Button with its name in a tooltip (hidden on touch). */
function ActionButton({
  label,
  icon,
  pressed,
  asChild,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { label: string; icon: typeof ThumbsUpIcon; pressed?: boolean }) {
  const mobile = useIsMobile()
  const glyph = <HugeiconsIcon icon={icon} strokeWidth={ICON_STROKE} />
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-pressed={pressed}
          asChild={asChild}
          className={cn("text-muted-foreground aria-pressed:text-foreground", className)}
          {...props}
        >
          {asChild && React.isValidElement<{ children?: React.ReactNode }>(children)
            ? React.cloneElement(children, undefined, glyph)
            : glyph}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" hidden={mobile}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

/* The current state of a thinking line: the steps in turn, `STEP_MS` each, holding at the last one.
   A new list (thinking → drawing) starts from its first. */
function useStep(steps: string[], running: boolean) {
  const [state, setState] = React.useState({ steps, index: 0 })
  if (state.steps !== steps) setState({ steps, index: 0 })
  const index = state.steps === steps ? state.index : 0
  React.useEffect(() => {
    if (!running || index >= steps.length - 1) return
    const timer = window.setTimeout(() => setState({ steps, index: index + 1 }), STEP_MS)
    return () => window.clearTimeout(timer)
  }, [running, index, steps])
  return steps[Math.min(index, steps.length - 1)]
}
