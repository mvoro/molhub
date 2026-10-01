import * as React from "react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TREND_CATEGORIES } from "@/data/trends"

/* The pill stays fixed in the toolbar; only its items scroll. Fade the content at an edge only
   while more categories are hidden there, preserving the first and last item's full contrast. */
export function TrendCategories() {
  const viewport = React.useRef<HTMLDivElement>(null)
  const content = React.useRef<HTMLDivElement>(null)
  const [edges, setEdges] = React.useState({ start: false, end: false })
  const measure = React.useCallback(() => {
    const node = viewport.current
    if (!node) return
    const start = node.scrollLeft > 1
    const end = node.scrollWidth - node.clientWidth - node.scrollLeft > 1
    setEdges((previous) => previous.start === start && previous.end === end ? previous : { start, end })
  }, [])

  React.useLayoutEffect(() => {
    measure()
    const observer = new ResizeObserver(measure)
    if (viewport.current) observer.observe(viewport.current)
    if (content.current) observer.observe(content.current)
    return () => observer.disconnect()
  }, [measure])

  return (
    <div className="w-fit min-w-0 max-w-full py-1">
      <TabsList aria-label="Категории трендов" className="trends-category-track w-full min-w-0 overflow-hidden md:w-full">
        <div ref={viewport} onScroll={measure} data-overflow-start={edges.start || undefined} data-overflow-end={edges.end || undefined}
          className="trends-categories h-full min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
          <div ref={content} className="flex h-full w-max">
            {TREND_CATEGORIES.map((item) => <TabsTrigger key={item.id} value={item.id} className="flex-none">{item.label}</TabsTrigger>)}
          </div>
        </div>
      </TabsList>
    </div>
  )
}
