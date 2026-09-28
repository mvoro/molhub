export type ChatAttachment = {
  id: string
  name: string
  type: string
  size: number
  /** Static local file used by a demo conversation. Uploaded files use IndexedDB. */
  src?: string
}

export type ChatArtifact = ChatAttachment & { content?: string }

export type AttachmentKind = "image" | "video" | "audio" | "pdf" | "docx" | "markdown" | "text" | "file"

/** Camera/library exports can omit MIME; preserve their real media type for validation and preview. */
export function attachmentMimeType(file: { name: string; type: string }) {
  if (file.type && file.type !== "application/octet-stream") return file.type
  const extension = file.name.split(".").at(-1)?.toLowerCase() ?? ""
  const types: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
    gif: "image/gif", avif: "image/avif", heic: "image/heic", heif: "image/heif",
    mp4: "video/mp4", mov: "video/quicktime", webm: "video/webm",
  }
  return types[extension] ?? file.type
}

export function attachmentKind(file: Pick<ChatAttachment, "name" | "type">): AttachmentKind {
  const extension = file.name.split(".").at(-1)?.toLowerCase() ?? ""
  if (file.type.startsWith("image/") || /^(png|jpe?g|webp|gif|avif|heic|heif)$/.test(extension)) return "image"
  if (file.type.startsWith("video/") || /^(mp4|webm|mov|m4v)$/.test(extension)) return "video"
  if (file.type.startsWith("audio/") || /^(mp3|wav|ogg|m4a|aac|flac)$/.test(extension)) return "audio"
  if (file.type === "application/pdf" || extension === "pdf") return "pdf"
  if (extension === "docx" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx"
  if (file.type === "text/markdown" || /^(md|markdown)$/.test(extension)) return "markdown"
  if (file.type.startsWith("text/") || /^(txt|csv|tsv|json|html|xml|js|ts|py|css|sql)$/.test(extension)) return "text"
  return "file"
}

// The current reply provider is a local demo. A document request exposes that reply as an actual
// downloadable Markdown document; it never pretends that a Markdown blob is a PDF or Word file.
export function replyDocument(request: string, reply: string, id: string): ChatArtifact | undefined {
  if (!/(документ|отч[её]т|бриф|конспект|чек[- ]?лист|markdown|\bpdf\b|\bdocx\b)/i.test(request)) return
  const title = request.replace(/[\\/:*?"<>|\n]+/g, " ").trim().slice(0, 64) || "Документ"
  const content = `# ${title}\n\n${reply}\n`
  return { id: `${id}-document`, name: `${title}.md`, type: "text/markdown", size: new TextEncoder().encode(content).length, content }
}
