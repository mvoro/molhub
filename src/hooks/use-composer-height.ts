import * as React from "react"

/* The pinned composer's height as `--composer-h` on the section, so content can scroll under it and
   still end above it (a chat, the project page on the phone). `pinned` false: the composer isn't docked
   (the project page on desktop keeps it in the flow), nothing to measure. */
export function useComposerHeight(pinned = true) {
  const section = React.useRef<HTMLElement>(null)
  const dock = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    const node = dock.current
    if (!pinned || !node) return
    const observer = new ResizeObserver(([entry]) =>
      section.current?.style.setProperty("--composer-h", `${entry.borderBoxSize[0].blockSize}px`)
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [pinned])
  return { section, dock }
}
