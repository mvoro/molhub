import * as React from "react"
import { ImageGeneration, type ImageGenerationHandle } from "img-fx"

/* The generation effect, exactly as composer-chat's GenerationEffect.jsx (the user's ask, 27.09): img-fx
   `pixels-organic` — the organic pixel mosaic churning while the result is made — at 0.8 cells, no auto
   loop; when the result is ready it dissolves in cell by cell and holds (`triggerReveal({ hold:
   "manual" })`). Loaded lazily with three.js. The theme, the card colour and the corner radius follow
   the card it lies on (composer-chat had only the light one, on #f7f7f7, at 20px). */
export default function RevealEffect({
  src,
  surface,
  radius,
  dark,
  reveal,
  onRevealed,
}: {
  src: string
  /* The card's colour, opaque, as #rrggbb. */
  surface: string
  radius: number
  dark: boolean
  reveal: boolean
  onRevealed: () => void
}) {
  const effect = React.useRef<ImageGenerationHandle>(null)

  React.useEffect(() => {
    if (reveal) effect.current?.triggerReveal({ hold: "manual" })
  }, [reveal])

  return (
    <ImageGeneration
      ref={effect}
      preset="pixels-organic"
      theme={dark ? "dark" : "light"}
      cardBg={surface}
      images={src}
      autoReveal={false}
      borderRadius={radius}
      pixelScale={0.8}
      onCycle={({ phase }) => phase === "visible" && onRevealed()}
      className="pointer-events-none absolute! inset-0 size-full"
    >
      <div className="size-full" style={{ borderRadius: radius }} />
    </ImageGeneration>
  )
}
