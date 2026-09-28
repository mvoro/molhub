import {
  Airplane01Icon,
  Book03Icon,
  BracesIcon,
  Brain03Icon,
  Briefcase01Icon,
  Chart01Icon,
  CommandLineIcon,
  DollarCircleIcon,
  Dumbbell03Icon,
  FavouriteIcon,
  FlaskConicalIcon,
  Folder01Icon,
  FlowerIcon,
  Globe02Icon,
  GlobeIcon,
  Image02Icon,
  JusticeScale01Icon,
  KettlebellIcon,
  Mortarboard02Icon,
  MusicNote02Icon,
  MusicNote03Icon,
  NotebookIcon,
  PaintBoardIcon,
  PawPrintIcon,
  PenTool03Icon,
  PencilEdit01Icon,
  PencilEdit02Icon,
  PencilRulerIcon,
  Plant02Icon,
  PopcornIcon,
  StethoscopeIcon,
  TextIcon,
  Video01Icon,
  Wrench01Icon,
  Yoga03Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import type { ChatType } from "@/data/chats"

/* App icons are half a step heavier than Hugeicons' 1.5 default. */
export const ICON_STROKE = 1.75

export const NEW_CHAT_ICON = PencilEdit02Icon

export const CHAT_TYPE_ICON: Record<ChatType, IconSvgElement> = {
  text: TextIcon,
  image: Image02Icon,
  video: Video01Icon,
  audio: MusicNote02Icon,
}

/* Project icons, in the order of the picker in the project dialog (ChatGPT's set, matched in Hugeicons).
   A project stores the id; the label names the icon for screen readers. */
export const PROJECT_ICONS: { id: string; label: string; icon: IconSvgElement }[] = [
  { id: "folder", label: "Папка", icon: Folder01Icon },
  { id: "money", label: "Деньги", icon: DollarCircleIcon },
  { id: "book", label: "Книга", icon: Book03Icon },
  { id: "study", label: "Учёба", icon: Mortarboard02Icon },
  { id: "pencil", label: "Карандаш", icon: PencilEdit01Icon },
  { id: "pen", label: "Перо", icon: PenTool03Icon },
  { id: "code", label: "Код", icon: BracesIcon },
  { id: "terminal", label: "Терминал", icon: CommandLineIcon },
  { id: "music", label: "Музыка", icon: MusicNote03Icon },
  { id: "movies", label: "Кино", icon: PopcornIcon },
  { id: "design", label: "Дизайн", icon: PencilRulerIcon },
  { id: "art", label: "Палитра", icon: PaintBoardIcon },
  { id: "health", label: "Медицина", icon: StethoscopeIcon },
  { id: "flower", label: "Цветок", icon: FlowerIcon },
  { id: "lotus", label: "Лотос", icon: Yoga03Icon },
  { id: "work", label: "Работа", icon: Briefcase01Icon },
  { id: "chart", label: "График", icon: Chart01Icon },
  { id: "kettlebell", label: "Гиря", icon: KettlebellIcon },
  { id: "dumbbell", label: "Гантель", icon: Dumbbell03Icon },
  { id: "notebook", label: "Блокнот", icon: NotebookIcon },
  { id: "law", label: "Весы", icon: JusticeScale01Icon },
  { id: "globe", label: "Глобус", icon: GlobeIcon },
  { id: "travel", label: "Самолёт", icon: Airplane01Icon },
  { id: "world", label: "Планета", icon: Globe02Icon },
  { id: "tools", label: "Гаечный ключ", icon: Wrench01Icon },
  { id: "pets", label: "Лапа", icon: PawPrintIcon },
  { id: "science", label: "Колба", icon: FlaskConicalIcon },
  { id: "brain", label: "Мозг", icon: Brain03Icon },
  { id: "heart", label: "Сердце", icon: FavouriteIcon },
  { id: "plant", label: "Растение", icon: Plant02Icon },
]

/* A project without an icon of its own shows the folder. */
export const DEFAULT_PROJECT_ICON = PROJECT_ICONS[0].id

export function projectIcon(id?: string) {
  return (PROJECT_ICONS.find((item) => item.id === id) ?? PROJECT_ICONS[0]).icon
}
