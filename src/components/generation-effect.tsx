import * as React from "react"

const RevealEffect = React.lazy(() => import("@/components/reveal-effect"))

/* The generation animation of composer-chat's MediaResult, shared by Molly's pictures in the chat and
   the photo and video feeds (the user's ask, 27.09: the chat's animation on both tools). The card
   stays in its placeholder colour, the img-fx mosaic churns over it until the result is ready, then the
   picture (a clip's poster) dissolves in; when the effect reports it visible, the effect goes and the
   real picture, already under it, stays. When it plays — useGenerationReveal. */

/* The effect itself, laid over the card it sits in: it takes the card's colour and corner radius, so
   the mosaic starts from the card as it is. `reveal` — the result is ready, dissolve it in. */
export function GenerationEffect({
  src,
  reveal,
  onRevealed,
  onFailed,
}: {
  src: string
  reveal: boolean
  onRevealed: () => void
  onFailed: () => void
}) {
  const dark = useDarkTheme()
  const probe = React.useRef<HTMLSpanElement>(null)
  const [card, setCard] = React.useState<{ surface: string; radius: number } | null>(null)

  React.useLayoutEffect(() => {
    const host = probe.current?.parentElement
    if (!host) return
    const style = getComputedStyle(host)
    setCard({ surface: opaque(style.backgroundColor), radius: Number.parseFloat(style.borderTopLeftRadius) || 0 })
  }, [dark])

  return (
    <>
      <span ref={probe} hidden />
      {card && (
        <EffectBoundary onError={onFailed}>
          <React.Suspense fallback={null}>
            <RevealEffect src={src} surface={card.surface} radius={card.radius} dark={dark} reveal={reveal} onRevealed={onRevealed} />
          </React.Suspense>
        </EffectBoundary>
      )}
    </>
  )
}

class EffectBoundary extends React.Component<{ children: React.ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/* Any CSS colour (the tokens are oklch) as an opaque #rrggbb, read back off a one-pixel canvas: the
   effect's shader needs plain RGB. */
function opaque(color: string) {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  if (!context) return "#f5f5f5"
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`
}

const subscribeTheme = (change: () => void) => {
  const observer = new MutationObserver(change)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}
function useDarkTheme() {
  return React.useSyncExternalStore(subscribeTheme, () => document.documentElement.classList.contains("dark"))
}
