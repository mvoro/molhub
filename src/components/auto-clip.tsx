import * as React from "react"

import { cn } from "@/lib/utils"

/* A template's clip that plays on its own, muted and looping, over its poster (the clip's first frame):
   the ideas fan and the «Шаблоны» grid of the video tool (the user's ask, 27.09). It loads and plays
   only while it is on screen and pauses off it; it fades in once it really plays, so the poster never
   blinks to black. `delay` holds back the first start, so neighbouring loops never run in step.
   Reduced motion keeps the poster. */
export function AutoClip({ src, delay = 0, className }: { src: string; delay?: number; className?: string }) {
  const ref = React.useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = React.useState(false)

  React.useEffect(() => {
    const video = ref.current
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let timer: number | undefined
    let started = false
    let inView = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer)
        inView = entry.isIntersecting
        if (!inView) return video.pause()
        // Loading starts at once, the first play after the delay.
        video.preload = "auto"
        timer = window.setTimeout(
          () => {
            started = true
            void video.play().catch(() => {})
          },
          started ? 0 : delay
        )
      },
      { threshold: 0.2 }
    )
    observer.observe(video)
    // Chrome pauses silent video in a background tab and does not always resume it: a page opened in
    // the background came up with every clip standing still.
    const resume = () => {
      if (document.visibilityState === "visible" && inView && started && video.paused) void video.play().catch(() => {})
    }
    document.addEventListener("visibilitychange", resume)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
      document.removeEventListener("visibilitychange", resume)
    }
  }, [delay])

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onPlaying={() => setPlaying(true)}
      data-playing={playing || undefined}
      className={cn(
        "pointer-events-none absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 ease-out data-playing:opacity-100",
        className
      )}
    />
  )
}
