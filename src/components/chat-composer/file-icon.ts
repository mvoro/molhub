import {
  Archive02Icon,
  File01Icon,
  File02Icon,
  GridTableIcon,
  Image01Icon,
  Music01Icon,
  SourceCodeIcon,
  Video02Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

/* What an attached file is, for its card in the composer: the glyph, the tile's colour (tokens) and
   the line under the name. The user's reference, 27.09: a violet tile for documents and video, red for
   PDF, black for audio, a white glyph on each. */
export type FileKind = { icon: IconSvgElement; tile: string; label: string }

const DOCUMENT: FileKind = { icon: File02Icon, tile: "bg-primary text-primary-foreground", label: "Документ" }
const TEXT: FileKind = { ...DOCUMENT, label: "Текст" }
const SLIDES: FileKind = { ...DOCUMENT, label: "Презентация" }
const PDF: FileKind = { icon: File02Icon, tile: "bg-file-pdf text-primary-foreground", label: "PDF" }
const SHEET: FileKind = { icon: GridTableIcon, tile: "bg-file-sheet text-primary-foreground", label: "Таблица" }
const ARCHIVE: FileKind = { icon: Archive02Icon, tile: "bg-muted-foreground text-background", label: "Архив" }
const CODE: FileKind = { icon: SourceCodeIcon, tile: "bg-muted-foreground text-background", label: "Код" }
const IMAGE: FileKind = { icon: Image01Icon, tile: "bg-primary text-primary-foreground", label: "Изображение" }
const VIDEO: FileKind = { icon: Video02Icon, tile: "bg-primary text-primary-foreground", label: "Видео" }
const AUDIO: FileKind = { icon: Music01Icon, tile: "bg-foreground text-background", label: "Аудио" }

const BY_EXTENSION: Record<string, FileKind> = {
  pdf: PDF,
  doc: DOCUMENT,
  docx: DOCUMENT,
  rtf: DOCUMENT,
  odt: DOCUMENT,
  pages: DOCUMENT,
  txt: TEXT,
  md: TEXT,
  ppt: SLIDES,
  pptx: SLIDES,
  key: SLIDES,
  odp: SLIDES,
  xls: SHEET,
  xlsx: SHEET,
  numbers: SHEET,
  csv: SHEET,
  tsv: SHEET,
  zip: ARCHIVE,
  rar: ARCHIVE,
  "7z": ARCHIVE,
  gz: ARCHIVE,
  js: CODE,
  ts: CODE,
  jsx: CODE,
  tsx: CODE,
  json: CODE,
  py: CODE,
  html: CODE,
  css: CODE,
  sql: CODE,
}

/* By media type first, then by extension; any other file is a grey tile with its extension. */
export function fileKind(file: { name: string; type: string }): FileKind {
  if (file.type.startsWith("image/")) return IMAGE
  if (file.type.startsWith("video/")) return VIDEO
  if (file.type.startsWith("audio/")) return AUDIO
  if (file.type === "application/pdf") return PDF
  const dot = file.name.lastIndexOf(".")
  const extension = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : ""
  return (
    BY_EXTENSION[extension] ?? {
      icon: File01Icon,
      tile: "bg-muted-foreground text-background",
      label: extension ? extension.toUpperCase() : "Файл",
    }
  )
}

/* The glyph alone, for the places that show just an icon. */
export const fileIcon = (file: { name: string; type: string }): IconSvgElement => fileKind(file).icon
