import * as React from "react"

import { cn } from "@/lib/utils"

type Line = { key: number; text: string; shimmer: boolean; state: "idle" | "enter" | "exit" }

/* One line of status next to the model's icon (transitions.dev «Thinking states»): while the model
   works it shimmers, and every new `text` swaps in — the old line rises out, the new one rises in from
   below (`.think-line` in index.css). When the work is done the same swap brings in the model's name,
   still. The first text is simply there: the message itself fades in. */
export function ThinkingStatus({ text, shimmer, className }: { text: string; shimmer: boolean; className?: string }) {
  const [lines, setLines] = React.useState<Line[]>(() => [{ key: 0, text, shimmer, state: "idle" }])
  const current = lines[lines.length - 1]

  // A new text: the line on screen leaves (a line already leaving is dropped), the new one enters.
  if (current.text !== text) {
    setLines([
      { ...current, state: "exit" },
      { key: current.key + 1, text, shimmer, state: "enter" },
    ])
  } else if (current.shimmer !== shimmer) {
    setLines([...lines.slice(0, -1), { ...current, shimmer }])
  }

  // The leaving line goes when its 150ms exit is over — by a timer, not `animationend`, which never
  // comes in a tab that isn't painting.
  const leaving = lines.find((line) => line.state === "exit")?.key
  React.useEffect(() => {
    if (leaving === undefined) return
    const timer = window.setTimeout(() => setLines((all) => all.filter((line) => line.key !== leaving)), 160)
    return () => window.clearTimeout(timer)
  }, [leaving])

  return (
    <span role="status" className={cn("grid min-w-0", className)}>
      {lines.map((line) => (
        <span
          key={line.key}
          data-state={line.state}
          aria-hidden={line.state === "exit" || undefined}
          className="think-line truncate"
        >
          {/* The shimmer (library `shimmer`, one pass every 2 s, constant motion so linear) sweeps the
              glyphs only; reduced motion keeps plain text. */}
          <span className={cn(line.shimmer && "shimmer [--shimmer-duration:2s] motion-reduce:shimmer-none")}>{line.text}</span>
        </span>
      ))}
    </span>
  )
}
