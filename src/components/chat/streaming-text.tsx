import * as React from "react"

import { tokenize } from "@/hooks/use-chat-messages"
import { cn } from "@/lib/utils"

/* A reply's words as they stream (transitions.dev «Streaming text»): `shown` of the text's tokens are
   out, and each word that arrives while this view is on screen resolves out of a light blur
   (`.stream-word`). Words that were out before it mounted — a finished reply, a chat opened mid-stream —
   stay still. A blank line starts a paragraph, a single break a new line. */
export function StreamingText({ text, shown, className }: { text: string; shown: number; className?: string }) {
  const tokens = React.useMemo(() => tokenize(text), [text])
  const [settled] = React.useState(shown)

  const paragraphs: React.ReactNode[][] = [[]]
  for (let index = 0; index < Math.min(shown, tokens.length); index++) {
    const token = tokens[index]
    const paragraph = paragraphs[paragraphs.length - 1]
    if (/^\s+$/.test(token)) {
      const breaks = token.split("\n").length - 1
      if (breaks >= 2) paragraphs.push([])
      else paragraph.push(breaks === 1 ? <br key={index} /> : " ")
    } else {
      paragraph.push(
        index < settled ? (
          token
        ) : (
          <span key={index} className="stream-word">
            {token}
          </span>
        )
      )
    }
  }

  return (
    <div className={cn("flex flex-col gap-3 text-base leading-7 text-foreground", className)}>
      {paragraphs.map((words, index) => words.length > 0 && <p key={index}>{words}</p>)}
    </div>
  )
}
