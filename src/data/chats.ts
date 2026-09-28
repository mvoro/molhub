import { withBasePath } from "../lib/base-path.ts"
import type { ProjectColor } from "@/lib/project-colors"

export type ChatType = "text" | "image" | "video" | "audio"

export type Chat = {
  id: string
  title: string
  type: ChatType
  /* Chats moved into a project leave the main history and show under the project. */
  projectId?: string
  archived?: boolean
  /* Sorting and the list's date column; touched by sending a message. */
  updatedAt?: number
  /* Last message, one line, for the chats list. */
  preview?: string
}

/* A file attached to a project. Metadata lives here (localStorage via the hub); the Blob is in
   IndexedDB (lib/project-files.ts), except demo files, whose bytes are static assets under public/. */
export type ProjectFile = {
  id: string
  name: string
  size: number
  type: string
  addedAt: number
  src?: string
}

/* A project name's cap, measured in the app (27.09, Geist, average Russian names at 7.5px a character in
   14px): the desktop project page's title (24px semibold, ~610px) holds 46–47 characters, so 45 is the
   longest name still read whole somewhere, with room for wider letters. The sidebar and menus show
   22–29 characters and the phone's tongue 15–18, cut with «…», so a name should lead with what tells
   projects apart. */
export const PROJECT_NAME_MAX = 45

export type Project = {
  id: string
  name: string
  description?: string
  /* Icon tint id; none = currentColor. */
  color?: ProjectColor
  /* Icon id from PROJECT_ICONS (lib/icons); none = the folder. */
  icon?: string
  /* What Molly should know in every chat of this project, up to 8000 characters. */
  instructions?: string
  files?: ProjectFile[]
  archived?: boolean
  createdAt: number
  updatedAt: number
}

export const CHAT_TYPE_LABEL: Record<ChatType, string> = {
  text: "Текст",
  image: "Изображения",
  video: "Видео",
  audio: "Аудио",
}

const DAY = 24 * 60 * 60 * 1000
const ago = (days: number) => Date.now() - days * DAY

// Demo history until the API lands.
export const REVIEW_CHATS: Chat[] = [
  { id: "demo-photo", title: "Фото: ревью съёмки десерта", type: "text", updatedAt: ago(0.1), preview: "Фото во вьювере и рекомендации по съёмке" },
  { id: "demo-files", title: "Файлы: PDF, Word и артефакт", type: "text", updatedAt: ago(0.2), preview: "Бриф, меню и план запуска отдельным документом" },
  { id: "demo-video", title: "Видео: разбор сцены", type: "text", updatedAt: ago(0.3), preview: "Видеовложение и рекомендации по монтажу" },
]
export const CHATS: Chat[] = [
  ...REVIEW_CHATS,
  { id: "c1", title: "Логотип для кофейни в стиле баухаус", type: "image", updatedAt: ago(1) },
  { id: "c2", title: "Сравни GPT-5 и Claude для кода", type: "text", updatedAt: ago(2) },
  { id: "c3", title: "Видео 10 сек: закат над морем", type: "video", updatedAt: ago(3) },
  { id: "c4", title: "Озвучка для рилса про путешествия", type: "audio", updatedAt: ago(4) },
  {
    id: "c5",
    title: "Тексты для hero-блока",
    type: "text",
    projectId: "coffee",
    preview: "Сделай короче и добавь призыв к действию",
    updatedAt: ago(1),
  },
  {
    id: "c6",
    title: "Меню на осень",
    type: "text",
    projectId: "coffee",
    preview: "Добавь цены в рублях и отметь новинки",
    updatedAt: ago(15),
  },
  { id: "c7", title: "SQL-запрос по когортам", type: "text", updatedAt: ago(7) },
  { id: "c8", title: "Портрет в стиле аниме", type: "image", updatedAt: ago(8) },
  { id: "c9", title: "Перевод презентации на английский", type: "text", updatedAt: ago(9) },
  { id: "c10", title: "Сценарий для YouTube Shorts", type: "text", updatedAt: ago(10) },
  { id: "c11", title: "Как настроить Vite и shadcn", type: "text", updatedAt: ago(11) },
  { id: "c12", title: "Музыка для подкаста", type: "audio", updatedAt: ago(12) },
]

export const PROJECTS: Project[] = [
  { id: "molecula", name: "Молекула", color: "purple", createdAt: ago(40), updatedAt: ago(2) },
  {
    id: "coffee",
    name: "Лендинг кофейни",
    color: "orange",
    icon: "design",
    instructions: "Пишите тепло и на «вы»: это лендинг кофейни у моря. Цены — в рублях, без «от».",
    files: [
      { id: "demo-brief", name: "Бриф.pdf", size: 608, type: "application/pdf", addedAt: ago(3), src: withBasePath("/demo/brief.pdf") },
      {
        id: "demo-menu",
        name: "Меню.docx",
        size: 1008,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        addedAt: ago(12),
        src: withBasePath("/demo/menu.docx"),
      },
      { id: "demo-cream", name: "Десерт.jpg", size: 14833, type: "image/jpeg", addedAt: ago(20), src: withBasePath("/uploads/cream.jpg") },
    ],
    createdAt: ago(30),
    updatedAt: ago(1),
  },
  { id: "q4", name: "Презентация Q4", createdAt: ago(20), updatedAt: ago(5) },
  { id: "reels", name: "Рилсы для блога", color: "pink", createdAt: ago(10), updatedAt: ago(8) },
]
