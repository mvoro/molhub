/* What the file viewer can show. Kept apart from the components so the composer can ask «is this
   viewable?» without pulling the viewers in. */

export type ViewerFile = { name: string; type: string; size: number; url: string }
export type ViewerKind = "image" | "video" | "pdf" | "docx"

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

const extensionOf = (name: string) => {
  const dot = name.lastIndexOf(".")
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : ""
}

/* A picture or a clip opens full-screen, a PDF or a Word file in the modal; anything else has no viewer. */
export function viewerKind(file: { name: string; type: string }): ViewerKind | null {
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  const extension = extensionOf(file.name)
  if (file.type === "application/pdf" || extension === "pdf") return "pdf"
  if (file.type === DOCX || extension === "docx") return "docx"
  return null
}

const EXTENSION: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "video/webm": "webm" }

/* The name a download is saved under: the file's own, or — for a made picture, named by its prompt —
   the prompt's first words, without the characters file systems refuse, with an extension from the type. */
export function downloadName(file: { name: string; type: string }) {
  if (/^[a-z0-9]{2,5}$/.test(extensionOf(file.name)) && file.name.length <= 80) return file.name
  const clean = file.name.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim()
  // Cut on a word boundary, and drop the punctuation it leaves at the end.
  const cut = clean.length > 60 ? clean.slice(0, clean.lastIndexOf(" ", 60) > 30 ? clean.lastIndexOf(" ", 60) : 60) : clean
  const base = cut.replace(/[\s,.;:!?—-]+$/, "") || "molecula"
  return `${base}.${EXTENSION[file.type] ?? file.type.split("/")[1] ?? "bin"}`
}
