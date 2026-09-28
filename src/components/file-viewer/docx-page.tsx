import * as React from "react"
import mammoth from "mammoth"

import { ViewerLoading, ViewerMessage } from "@/components/file-viewer/viewer-states"

/* A Word file as one reflowing sheet (mammoth: the text, headings, lists, tables and pictures, not
   the page layout), so it reads on a phone as well as in the modal. Typography: `.doc-view` in
   index.css. */
export default function DocxPage({ url, onError }: { url: string; onError?: () => void }) {
  const [html, setHtml] = React.useState<string | null>(null)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    let live = true
    fetch(url)
      .then((response) => { if (!response.ok) throw new Error("Не удалось загрузить документ"); return response.arrayBuffer() })
      .then((arrayBuffer) => mammoth.convertToHtml({ arrayBuffer }))
      .then(({ value }) => live && setHtml(clean(value)))
      .catch(() => { if (live) { setFailed(true); onError?.() } })
    return () => {
      live = false
    }
  }, [url, onError])

  if (failed) return <ViewerMessage />
  if (html === null) return <ViewerLoading />
  if (!html.trim()) return <ViewerMessage title="В документе нет текста" description="Откройте его на своём устройстве, чтобы увидеть всё содержимое." />
  return (
    <article
      className="doc-view mx-auto max-w-[720px] rounded-md bg-background px-5 py-6 shadow-[0_1px_3px_rgb(0_0_0/0.08)] ring-1 ring-foreground/6 md:px-14 md:py-12"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/* mammoth builds the markup itself, but a document's links and pictures come from the file: only
   web and mail links stay (opening in a new tab), only embedded pictures stay, no handlers. */
function clean(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html")
  for (const element of doc.body.querySelectorAll("*")) {
    for (const { name } of [...element.attributes]) if (name.startsWith("on")) element.removeAttribute(name)
  }
  for (const link of doc.body.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href") ?? ""
    if (href.startsWith("#")) continue
    if (/^(https?:|mailto:)/i.test(href)) {
      link.setAttribute("target", "_blank")
      link.setAttribute("rel", "noopener noreferrer")
    } else link.removeAttribute("href")
  }
  for (const image of doc.body.querySelectorAll("img")) {
    if (!image.getAttribute("src")?.startsWith("data:image/")) image.remove()
  }
  return doc.body.innerHTML
}
