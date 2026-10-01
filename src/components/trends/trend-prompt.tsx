import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { copyText } from "@/lib/clipboard"
import { ICON_STROKE } from "@/lib/icons"

export function TrendPrompt({ prompt }: { prompt: string }) {
  const [copied, setCopied] = React.useState(false)
  const [notice, setNotice] = React.useState("")
  const timer = React.useRef(0)
  const gesture = React.useRef({ x: 0, y: 0, moved: false })
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    window.clearTimeout(timer.current)
    setCopied(false)
    setNotice("")
    try {
      await copyText(prompt, "Промпт скопирован")
      setCopied(true)
      timer.current = window.setTimeout(() => {
        setCopied(false)
        setNotice("")
      }, 2000)
    } catch {
      setNotice("Не удалось скопировать. Попробуйте ещё раз.")
    }
  }

  const copyField = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Keep dragging to select text or scroll separate from a click to copy.
    if (event.detail > 0) {
      const selection = window.getSelection()
      const selecting = selection && !selection.isCollapsed && (
        event.currentTarget.contains(selection.anchorNode) ||
        event.currentTarget.contains(selection.focusNode)
      )
      if (gesture.current.moved || selecting) return
    }
    void copy()
  }

  return (
    <section aria-label="Промпт">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Промпт</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={copied ? "Промпт скопирован" : "Копировать промпт"}
          onClick={() => void copy()}
          className="size-8 rounded-full text-muted-foreground"
        >
          <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} strokeWidth={ICON_STROKE} />
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        aria-label="Копировать текст промпта"
        onClick={copyField}
        onPointerDown={(event) => { gesture.current = { x: event.clientX, y: event.clientY, moved: false } }}
        onPointerMove={(event) => {
          if (event.buttons && Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y) > 6) {
            gesture.current.moved = true
          }
        }}
        onPointerCancel={() => { gesture.current.moved = true }}
        onScroll={() => { gesture.current.moved = true }}
        className="block h-auto max-h-[min(220px,30dvh)] w-full overflow-y-auto overscroll-contain rounded-xl border-0 bg-muted p-4 text-left text-sm leading-relaxed font-normal whitespace-pre-wrap text-foreground select-text hover:bg-muted hover:text-foreground active:scale-100"
      >
        <span className="block wrap-anywhere">{prompt}</span>
      </Button>
      <span role="status" className="sr-only">{notice}</span>
    </section>
  )
}
