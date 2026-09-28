import * as React from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { clientId } from "@/lib/client-id"
import { attachmentMimeType } from "@/lib/chat-attachments"

export type ComposerFile = { id: string; name: string; size: number; type: string; url: string; file: File }

/* What the OS picker offers: any file, photos, photos and videos, or the camera (phones). */
export type PickKind = "file" | "photo" | "media" | "camera"

const MAX_FILES = 10
const MAX_FILE_SIZE = 25 * 1024 * 1024

export const isMediaFile = (file: { type: string }) => file.type.startsWith("image/") || file.type.startsWith("video/")

/* Files attached to a composer: from the OS picker, drag and drop or paste. Previews are blob URLs,
   revoked when a file is removed or the composer unmounts. */
export function useComposerFiles({ disabled = false }: { disabled?: boolean } = {}) {
  const [files, setFiles] = React.useState<ComposerFile[]>([])
  const [dragging, setDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Blob previews live as long as the composer holds the file.
  const filesRef = React.useRef(files)
  React.useEffect(() => {
    filesRef.current = files
  }, [files])
  React.useEffect(() => () => filesRef.current.forEach((item) => URL.revokeObjectURL(item.url)), [])

  const toFile = (file: File): ComposerFile => ({
    id: clientId(),
    name: file.name,
    size: file.size,
    type: attachmentMimeType(file),
    url: URL.createObjectURL(file),
    file,
  })

  const add = (incoming: FileList | File[]) => {
    const room = MAX_FILES - files.length
    const next: ComposerFile[] = []
    for (const file of Array.from(incoming).slice(0, Math.max(0, room))) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Файл «${file.name}» больше 25 МБ`)
        continue
      }
      next.push(toFile(file))
    }
    if (incoming.length > room) toast(`Можно прикрепить до ${MAX_FILES} файлов`)
    setFiles((prev) => [...prev, ...next])
    return next
  }

  const remove = (id: string) =>
    setFiles((prev) => {
      const gone = prev.find((item) => item.id === id)
      if (gone) URL.revokeObjectURL(gone.url)
      return prev.filter((item) => item.id !== id)
    })

  /* After sending: the message keeps the previews, so nothing is revoked here. */
  const clear = () => {
    // Sending may navigate away before the effect observes the empty list.
    filesRef.current = []
    setFiles([])
    setDragging(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  // One hidden input serves every source: the kind only changes what the OS picker offers.
  const pick = (kind: PickKind = "file") => {
    const input = inputRef.current
    if (!input) return
    input.accept = kind === "file" ? "" : kind === "media" ? "image/*,video/*" : "image/*"
    if (kind === "camera") input.setAttribute("capture", "environment")
    else input.removeAttribute("capture")
    input.click()
  }

  const dragProps = {
    onDragOver: (event: React.DragEvent) => {
      if (!event.dataTransfer.types.includes("Files")) return
      event.preventDefault()
      if (!disabled) setDragging(true)
    },
    onDragLeave: (event: React.DragEvent) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault()
      setDragging(false)
      if (!disabled) add(event.dataTransfer.files)
    },
  }

  const onPaste = (event: React.ClipboardEvent) => {
    if (!event.clipboardData.files.length) return
    event.preventDefault()
    add(event.clipboardData.files)
  }

  const input = (
    <Input
      ref={inputRef}
      type="file"
      multiple
      hidden
      tabIndex={-1}
      aria-hidden
      onChange={(event) => {
        if (event.target.files) add(event.target.files)
        event.target.value = ""
      }}
    />
  )

  return { files, dragging, add, remove, clear, pick, dragProps, onPaste, input }
}
