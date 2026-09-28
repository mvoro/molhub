import * as React from "react"
import type { ChatArtifact } from "@/lib/chat-attachments"
import { readChatFile } from "@/lib/chat-storage"

type Resource = { id: string; url: string; blob: Blob } | null

export function useChatFile(file: ChatArtifact) {
  const [resource, setResource] = React.useState<Resource>(null)
  const [failure, setFailure] = React.useState<string | null>(null)
  const [attempt, retry] = React.useReducer((value) => value + 1, 0)
  React.useEffect(() => {
    let live = true
    let url: string | undefined
    const request = file.content !== undefined
      ? Promise.resolve(new Blob([file.content], { type: file.type }))
      : file.src ? fetch(file.src).then((response) => {
        if (!response.ok) throw new Error("Файл недоступен")
        return response.blob()
      }) : readChatFile(file.id)
    request.then((blob) => {
      if (!live) return
      if (!blob) { setFailure(`${file.id}:${attempt}`); return }
      url = URL.createObjectURL(blob)
      setResource({ id: file.id, url, blob })
    }).catch(() => live && setFailure(`${file.id}:${attempt}`))
    return () => { live = false; if (url) URL.revokeObjectURL(url) }
  }, [file.id, file.content, file.src, file.type, attempt])
  return { resource: resource?.id === file.id ? resource : null, failed: failure === `${file.id}:${attempt}`, retry }
}
