import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ICON_STROKE } from "@/lib/icons"
import { copyText } from "@/lib/clipboard"
import { cn } from "@/lib/utils"

/* How long the tick stays before the copy icon comes back. */
const COPIED_MS = 2000

/* Copy to the clipboard: a stock ghost icon Button whose copy icon swaps for a tick on success
   (transitions.dev «Icon swap», `.icon-swap` in index.css) and back after 2 s. No toast: a local live
   region announces the outcome. `value` may be a function, so streaming text is read on press. */
function CopyButton({
  value,
  label = "Копировать",
  copiedLabel = "Скопировано",
  side = "bottom",
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "value" | "onClick" | "children"> & {
  value: string | (() => string)
  label?: string
  copiedLabel?: string
  side?: React.ComponentProps<typeof TooltipContent>["side"]
}) {
  const mobile = useIsMobile()
  const [copied, setCopied] = React.useState(false)
  const [notice, setNotice] = React.useState("")
  const timer = React.useRef(0)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    window.clearTimeout(timer.current)
    setCopied(false)
    setNotice("")
    try {
      await copyText(typeof value === "function" ? value() : value)
    } catch {
      setNotice("Не удалось скопировать. Попробуйте ещё раз.")
      return
    }
    setNotice(copiedLabel)
    setCopied(true)
    timer.current = window.setTimeout(() => { setCopied(false); setNotice("") }, COPIED_MS)
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            data-slot="copy-button"
            variant="ghost"
            size="icon"
            aria-label={copied ? copiedLabel : label}
            onClick={copy}
            className={cn("text-muted-foreground", className)}
            {...props}
          >
            <span aria-hidden="true" data-state={copied ? "b" : "a"} className="icon-swap">
              <HugeiconsIcon icon={Copy01Icon} strokeWidth={ICON_STROKE} />
              <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} />
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side} hidden={mobile}>
          {copied ? copiedLabel : label}
        </TooltipContent>
      </Tooltip>
      <span role="status" className="sr-only">{notice}</span>
    </>
  )
}

export { CopyButton }
