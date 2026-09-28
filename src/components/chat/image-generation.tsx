import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download04Icon } from "@hugeicons/core-free-icons"

import { downloadName } from "@/components/file-viewer/viewable"
import { GenerationEffect } from "@/components/generation-effect"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useGenerationReveal } from "@/hooks/use-generation-reveal"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

/* A picture a model is making, as in composer-chat's MediaResult (the user's ask, 27.09): a 20px card in
   the placeholder's colour, the img-fx mosaic churning over it until the picture is ready, then the
   picture dissolving in (generation-effect.tsx, shared with the photo and video feeds). A picture that
   was ready before this view mounted is simply there. Once it is there (the user's ask, 27.09) a
   press opens it in the viewer, and «Скачать» waits in the corner: on hover with a mouse, on keyboard
   focus, always on touch — as on the photo feed's tiles. */
export function ImageGeneration({
  src,
  ratio,
  ready,
  alt,
  name,
  onOpen,
  className,
}: {
  src: string
  /* Width / height. */
  ratio: number
  ready: boolean
  alt: string
  /* What a download is saved as (the prompt, cut short). */
  name: string
  onOpen?: () => void
  className?: string
}) {
  const { revealing, effect, onRevealed, onFailed } = useGenerationReveal(ready)
  const [loaded, setLoaded] = React.useState(false)

  return (
    <div
      aria-busy={!ready}
      style={{ aspectRatio: ratio }}
      className={cn("group/picture relative isolate overflow-hidden rounded-[20px] bg-muted transition-[scale] duration-150 ease-out has-[>[data-slot=button]:active]:scale-[0.98] motion-reduce:transition-none", className)}
    >
      {ready && (
        <Button
          variant="ghost"
          onClick={onOpen}
          disabled={!onOpen || revealing}
          aria-label="Открыть изображение"
          className="absolute inset-0 size-full rounded-none p-0 hover:bg-transparent active:scale-100 disabled:opacity-100 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-solid focus-visible:outline-ring/70"
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            data-loaded={loaded || undefined}
            onLoad={() => setLoaded(true)}
            className="gen-picture size-full object-cover select-none"
          />
        </Button>
      )}
      {ready && !revealing && (
        <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-150 ease-out pointer-fine:group-hover/picture:opacity-100 group-focus-within/picture:opacity-100 pointer-coarse:opacity-100 motion-reduce:transition-none">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon-sm" asChild className="rounded-full shadow-sm">
                <a href={src} download={downloadName({ name, type: "image/jpeg" })} aria-label="Скачать">
                  <HugeiconsIcon icon={Download04Icon} strokeWidth={ICON_STROKE} />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Скачать</TooltipContent>
          </Tooltip>
        </div>
      )}
      {effect && <GenerationEffect src={src} reveal={ready} onRevealed={onRevealed} onFailed={onFailed} />}
    </div>
  )
}
