import * as React from "react"

import { cn } from "@/lib/utils"

const PATCHES = 6

/* Saved palettes (index.css, --glow-tools-* and --glow-molly-*): «Инструменты» = the tool colours plus
   primary, «Молли» = the stops of the Молли icon. They colour «Акварель». */
export type GlowPalette = "tools" | "molly"
const PALETTES: GlowPalette[] = ["tools", "molly"]

/* Looks (index.css): «Акварель» (mist) = Lovable's soft wash of blurred patches; «Рассвет» (dawn) = a sphere
   of light rising behind the bottom edge on a landscape screen, the phone keeping «Акварель»; «Тёплый центр»
   (warm) = a dome in the Молли colours mirrored around a coral core on a landscape screen, the phone keeping
   «Акварель»; «Из угла» (corner) = the Молли plashka's radial gradient out of the bottom left corner on a
   landscape screen, the phone keeping «Акварель» at the corner's brightness; «Горизонт» (horizon) = a glowing
   band along the bottom edge in the tool colours, on the phone too. */
export type GlowLook = "mist" | "dawn" | "warm" | "corner" | "horizon"
const LOOKS: GlowLook[] = ["mist", "dawn", "warm", "corner", "horizon"]

/* Prototype aids: `?glow=tools` or `?glow=molly` in the address shows the other palette, `?look=warm` (or
   any other look) another look, for comparison. */
function paletteFromAddress(): GlowPalette | null {
  const asked = new URLSearchParams(window.location.search).get("glow")
  return PALETTES.find((item) => item === asked) ?? null
}
function lookFromAddress(): GlowLook | null {
  const asked = new URLSearchParams(window.location.search).get("look")
  return LOOKS.find((item) => item === asked) ?? null
}

/* The glow behind a new chat (27.09): six layers, painted and animated in index.css (.home-glow). They light
   up every time the new chat opens.
   Purely decorative: hidden from assistive tech, no pointer events, placed before the screen in DOM
   order so the screen sits over it; the parent must be positioned (SidebarInset is). Once the light
   is on, the layers drop will-change and leave the GPU. */
export function HomeGlow({
  look = "mist",
  palette = "tools",
  className,
}: {
  look?: GlowLook
  palette?: GlowPalette
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [lit, setLit] = React.useState(false)
  const [override] = React.useState(paletteFromAddress)
  const [lookOverride] = React.useState(lookFromAddress)

  React.useEffect(() => {
    const box = ref.current
    if (!box) return
    let live = true
    Promise.all(box.getAnimations({ subtree: true }).map((animation) => animation.finished)).then(
      () => live && setLit(true),
      () => {}
    )
    return () => {
      live = false
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-look={lookOverride ?? look}
      data-palette={override ?? palette}
      data-lit={lit || undefined}
      className={cn("home-glow", className)}
    >
      <div className="home-glow-stack">
        {Array.from({ length: PATCHES }, (_, index) => (
          <div key={index} className="home-glow-layer">
            <div className="home-glow-paint" />
          </div>
        ))}
        <div className="home-glow-grain" />
      </div>
    </div>
  )
}
