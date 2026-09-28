import * as React from "react"
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy, type RenderTask } from "pdfjs-dist"
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url"

import { ViewerLoading, ViewerMessage } from "@/components/file-viewer/viewer-states"

GlobalWorkerOptions.workerSrc = workerSrc

/* A PDF as a column of pages (pdf.js, so it reads the same on a phone, where browsers can't show a
   PDF inline). Every page keeps its place from the start at the first page's proportions and is
   drawn only as it nears the view, at the column's width and the screen's density (capped at 2×). */
export default function PdfPages({ url, onError }: { url: string; onError?: () => void }) {
  const [pdf, setPdf] = React.useState<PDFDocumentProxy | null>(null)
  const [ratio, setRatio] = React.useState(Math.SQRT2)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    let live = true
    const task = getDocument({ url })
    task.promise
      .then(async (loaded) => {
        const first = await loaded.getPage(1)
        const { width, height } = first.getViewport({ scale: 1 })
        if (!live) return
        setRatio(height / width)
        setPdf(loaded)
      })
      .catch(() => { if (live) { setFailed(true); onError?.() } })
    return () => {
      live = false
      void task.destroy()
    }
  }, [url, onError])

  if (failed) return <ViewerMessage />
  if (!pdf) return <ViewerLoading />
  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-3 md:gap-4">
      {Array.from({ length: pdf.numPages }, (_, index) => (
        <PdfPage key={index} pdf={pdf} number={index + 1} ratio={ratio} />
      ))}
    </div>
  )
}

function PdfPage({ pdf, number, ratio }: { pdf: PDFDocumentProxy; number: number; ratio: number }) {
  const box = React.useRef<HTMLDivElement>(null)
  const canvas = React.useRef<HTMLCanvasElement>(null)
  const [near, setNear] = React.useState(false)
  const [width, setWidth] = React.useState(0)
  const [pageRatio, setPageRatio] = React.useState(ratio)

  React.useEffect(() => {
    const element = box.current
    if (!element) return
    // Near = within a screen of the modal's own scroll, not of the window.
    const visibility = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), {
      root: element.closest("[data-slot=scroll-area-viewport], [data-slot=app-sheet-body]"),
      rootMargin: "100% 0px",
    })
    const size = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    visibility.observe(element)
    size.observe(element)
    return () => {
      visibility.disconnect()
      size.disconnect()
    }
  }, [])

  React.useEffect(() => {
    if (!near || !width) return
    let live = true
    let task: RenderTask | null = null
    pdf
      .getPage(number)
      .then((page) => {
        const element = canvas.current
        if (!live || !element) return
        const base = page.getViewport({ scale: 1 })
        setPageRatio(base.height / base.width)
        const density = Math.min(window.devicePixelRatio || 1, 2)
        const viewport = page.getViewport({ scale: (width * density) / base.width })
        element.width = Math.floor(viewport.width)
        element.height = Math.floor(viewport.height)
        task = page.render({ canvas: element, viewport })
        return task.promise
      })
      .catch(() => {})
    return () => {
      live = false
      task?.cancel()
    }
  }, [pdf, number, near, width])

  return (
    <div
      ref={box}
      role="img"
      aria-label={`Страница ${number}`}
      style={{ aspectRatio: `1 / ${pageRatio}` }}
      className="w-full overflow-hidden rounded-md bg-paper shadow-[0_1px_3px_rgb(0_0_0/0.08)] ring-1 ring-foreground/6"
    >
      <canvas ref={canvas} className="block size-full" />
    </div>
  )
}
