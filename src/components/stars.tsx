import * as React from "react"

import { cn } from "@/lib/utils"

type Dot = { x: number; y: number; r: number; v: number }

/* Dots per CSS pixel: about 110 on an 1100×800 workspace (mashagpt's density). */
const DENSITY = 125e-6
/* Rise per frame at 60 fps, divided by the radius: the small dots move faster (mashagpt). */
const DRIFT = 0.1

const dot = (width: number, height: number): Dot => {
  const r = Math.random() + 0.75
  return { x: Math.random() * width, y: Math.random() * height, r, v: DRIFT / r }
}

/* Kept, unused since 27.09: the dots came off every screen at the user's request.
   Drifting dots behind a new chat (mashagpt.ru/chat): a canvas the size of its parent with a
   sprinkle of 0.75–1.75 px dots in the --stars colour, all rising slowly and wrapping round at
   the top. Purely decorative: hidden from assistive tech, no pointer events, painted before the
   screen in DOM order so the screen sits over it. The layer fades in once, the way the new chat's glow
   lights up (.stars-enter in index.css); reduced motion keeps the dots still. Drawn at device resolution, so the dots stay crisp on Retina.
   `size` scales the drawn dots, not their speed: the new chat draws them a little bigger over its
   glow (27.09). */
export function StarsBackground({
  density = DENSITY,
  size = 1,
  className,
}: {
  density?: number
  size?: number
  className?: string
}) {
  const ref = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = ref.current
    const box = canvas?.parentElement
    const ctx = canvas?.getContext("2d")
    if (!canvas || !box || !ctx) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)")
    let dots: Dot[] = []
    let width = 0
    let height = 0
    let color = ""
    let frame = 0
    let last = 0

    const paint = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = color
      for (const item of dots) {
        ctx.beginPath()
        ctx.arc(item.x, item.y, item.r * size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      // Frame-rate independent (60 fps = one step), capped so a tab coming back doesn't jump.
      const step = Math.min((now - last) / (1000 / 60), 3)
      last = now
      for (const item of dots) {
        item.y -= item.v * step
        if (item.y + item.r * size < 0) item.y = height + item.r * size
      }
      paint()
    }
    const start = () => {
      cancelAnimationFrame(frame)
      paint()
      if (still.matches || !width || !height) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    const recolor = () => {
      color = getComputedStyle(canvas).color
    }

    // The canvas follows its box; the dots already there stay put (no reshuffle while the
    // sidebar animates), the count is topped up or trimmed to the new area.
    const observer = new ResizeObserver(([entry]) => {
      const size = entry.contentBoxSize[0]
      width = Math.round(size.inlineSize)
      height = Math.round(size.blockSize)
      const scale = window.devicePixelRatio || 1
      canvas.width = width * scale
      canvas.height = height * scale
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      const count = Math.floor(width * height * density)
      dots = dots.filter((item) => item.x <= width && item.y <= height + item.r).slice(0, count)
      while (dots.length < count) dots.push(dot(width, height))
      recolor()
      start()
    })
    observer.observe(box)
    // The theme switches by a class on <html>: pick up the new colour.
    const theme = new MutationObserver(() => {
      recolor()
      paint()
    })
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    still.addEventListener("change", start)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      theme.disconnect()
      still.removeEventListener("change", start)
    }
  }, [density, size])

  return (
    <div
      aria-hidden="true"
      className={cn(
        "stars-enter pointer-events-none absolute inset-0 overflow-hidden text-stars",
        className
      )}
    >
      <canvas ref={ref} className="block size-full" />
    </div>
  )
}
