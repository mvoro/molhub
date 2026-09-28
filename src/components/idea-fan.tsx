import * as React from "react"

import { AutoClip } from "@/components/auto-clip"
import { Button } from "@/components/ui/button"
import type { PromptPreset } from "@/data/prompt-presets"
import { cn } from "@/lib/utils"

/* Krea's tool page: four ideas fanned out under the tool's name, like a dealt hand.
   Layout and the deal live in index.css (.idea-fan): the cards spread out from a stack under the
   middle of the row, tilting into place on a spring and coming into focus, 50ms apart (Krea's
   choreography, 27.09). Each visit deals a fresh hand: four random ideas (the phone shows the first
   three, index.css), one of a few tilt patterns and a slightly different size per card, as Krea does.
   Hover (fine pointer) or keyboard focus grows a card a little from its bottom edge and brings it to
   the front (Krea's 1.02; hover is seen often, so it stays quiet), and previews its prompt in the
   empty composer; a click puts the prompt there for real. A video template's card plays its clip once
   the hand has landed (the user's ask, 27.09). */

/* Tilts per card, in degrees. Neighbours lean differently so the row reads as hand-placed. */
const HANDS = [
  [-1.5, 3, 1, 4],
  [1.5, -4, -2.5, 3],
  [-2, 2.5, -1, 3.5],
]
/* Drop of each card below the row's top, as a share of the card width: every other card sits lower. */
const DROP = [0, 0.11, 0.02, 0.08]
/* Stacking: the higher cards overlap the lower ones; the first stays on top while the others
   slide out from under it. */
const LAYER = [4, 1, 3, 2]
/* When a card's clip starts: after the deal (index.css: 80ms + 50ms a card + an 800ms spring), each
   card a little later than the one before, so the loops never run in step. */
const clipDelay = (i: number) => 1000 + i * 180

function dealHand(presets: PromptPreset[]) {
  const pool = [...presets]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return {
    cards: pool.slice(0, 4),
    tilts: HANDS[Math.floor(Math.random() * HANDS.length)],
    // 0.96–1.04: the hand reads as placed by hand, not stamped.
    scales: pool.slice(0, 4).map(() => 0.96 + Math.random() * 0.08),
  }
}

type IdeaFanProps = {
  presets: PromptPreset[]
  onPick: (preset: PromptPreset) => void
  /* The idea under the pointer or focus, null when it leaves: the screen previews its prompt. */
  onPreview?: (preset: PromptPreset | null) => void
  className?: string
}

export function IdeaFan({ presets, onPick, onPreview, className }: IdeaFanProps) {
  const [hand] = React.useState(() => dealHand(presets))

  return (
    <div role="group" aria-label="Идеи" className={cn("idea-fan", className)}>
      {hand.cards.map((preset, i) => (
        <div
          key={preset.id}
          className="idea-fan-slot group/slot z-(--z) pointer-fine:hover:z-10 has-focus-visible:z-10"
          style={
            {
              "--i": i,
              "--r": `${hand.tilts[i]}deg`,
              "--s": hand.scales[i],
              "--y": `calc(var(--card-w) * ${DROP[i]})`,
              "--z": LAYER[i],
            } as React.CSSProperties
          }
        >
          {/* Hover layer, apart from the slot's deal: grows the card from its bottom edge. */}
          <div className="size-full origin-bottom transition-[scale] duration-200 ease-(--ease-out) pointer-fine:group-hover/slot:scale-[1.03] group-has-focus-visible/slot:scale-[1.03] motion-reduce:transition-none">
            <Button
              variant="secondary"
              onClick={() => onPick(preset)}
              onPointerEnter={(event) => event.pointerType === "mouse" && onPreview?.(preset)}
              onPointerLeave={() => onPreview?.(null)}
              onFocus={() => onPreview?.(preset)}
              onBlur={() => onPreview?.(null)}
              aria-label={`Идея: ${preset.title}`}
              className={cn(
                "relative isolate size-full flex-col items-start justify-end overflow-hidden rounded-[18px] border-0 p-0 text-left whitespace-normal max-md:rounded-[14px]",
                "shadow-[0_16px_40px_-16px_rgb(0_0_0/0.4)] pointer-fine:group-hover/slot:shadow-[0_28px_56px_-18px_rgb(0_0_0/0.5)]",
                "transition-[scale,box-shadow] duration-150 ease-(--ease-out) active:not-aria-[haspopup]:translate-y-0 active:scale-[0.97] motion-reduce:active:scale-100",
                "focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-solid focus-visible:outline-ring/70"
              )}
            >
              <img src={preset.image} alt="" decoding="async" draggable={false} className="absolute inset-0 size-full object-cover select-none" />
              {preset.video && <AutoClip src={preset.video} delay={clipDelay(i)} />}
              {/* Keeps the white title readable on light pictures. */}
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/65 to-transparent" />
              {/* The phone's cards are ~112px wide: a smaller name on two lines at most, sized so the
                  longest word of the ideas («Инфографика», 88px) still fits a line. */}
              <span className="relative w-full truncate p-4 text-[16px] leading-snug font-medium text-white max-md:line-clamp-2 max-md:p-2.5 max-md:text-[13px] max-md:whitespace-normal">
                {preset.title}
              </span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
