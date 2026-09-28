import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Archive01Icon,
  ArchiveRestoreIcon,
  Delete02Icon,
  Folder01Icon,
  FolderAddIcon,
  FolderRemoveIcon,
  FolderTransferIcon,
  PencilEdit01Icon,
  PinIcon,
  PinOffIcon,
  Share08Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import {
  AppMenuItem,
  AppMenuSeparator,
  AppMenuSub,
  AppMenuSubContent,
  AppMenuSubTrigger,
} from "@/components/ui/app-menu"
import type { Chat, Project } from "@/data/chats"
import { useEntityActions } from "@/hooks/use-entity-actions"
import { useHub } from "@/hooks/use-hub"
import { ICON_STROKE, projectIcon } from "@/lib/icons"
import { projectColor } from "@/lib/project-colors"

/* The items of the chat and project menus (spec §9): one set wherever the menu opens — a sidebar row, the
   project page's header and chat rows, a chat's header. Each goes inside the caller's AppMenuContent. */

export function PinMenuItem({ pinned, noun = "", onToggle }: { pinned: boolean; noun?: string; onToggle: () => void }) {
  return (
    <AppMenuItem icon={pinned ? PinOffIcon : PinIcon} onSelect={onToggle}>
      {pinned ? "Открепить" : "Закрепить"}
      {noun && ` ${noun}`}
    </AppMenuItem>
  )
}

export function ProjectMenuItems({
  project,
  pinned,
  onRename,
  showOpen = false,
  children,
}: {
  project: Project
  pinned: boolean
  /* Inline rename in the sidebar; the project dialog elsewhere. */
  onRename: () => void
  /* «Главная страница проекта» — not on the page itself. */
  showOpen?: boolean
  /* Screen-specific items after the project's own (the page adds «Инструкции»). */
  children?: React.ReactNode
}) {
  const { togglePin, restore } = useHub()
  const actions = useEntityActions()
  return (
    <>
      <AppMenuItem icon={Share08Icon} onSelect={() => actions.share("project", project.id)}>
        Поделиться проектом
      </AppMenuItem>
      <AppMenuItem icon={PencilEdit01Icon} onSelect={onRename}>
        Переименовать проект
      </AppMenuItem>
      {showOpen && (
        <AppMenuItem icon={Folder01Icon} onSelect={() => actions.navigate(project.id)}>
          Главная страница проекта
        </AppMenuItem>
      )}
      {children}
      <AppMenuSeparator />
      {/* An archived project (opened through «Назад» or its address) comes back instead of going again. */}
      {project.archived ? (
        <AppMenuItem icon={ArchiveRestoreIcon} onSelect={() => restore("project", project.id)}>
          Восстановить проект
        </AppMenuItem>
      ) : (
        <>
          <PinMenuItem pinned={pinned} noun="проект" onToggle={() => togglePin(`project:${project.id}`)} />
          <AppMenuItem icon={Archive01Icon} onSelect={() => actions.archiveProject(project)}>
            Архивировать проект
          </AppMenuItem>
        </>
      )}
      <AppMenuItem icon={Delete02Icon} variant="destructive" onSelect={() => actions.confirmDelete({ kind: "project", project })}>
        Удалить проект
      </AppMenuItem>
    </>
  )
}

export function ChatMenuItems({ chat, pinned, onRename }: { chat: Chat; pinned: boolean; onRename: () => void }) {
  const { projects, togglePin } = useHub()
  const actions = useEntityActions()
  const targets = projects.filter((project) => !project.archived)
  return (
    <>
      <AppMenuItem icon={Share08Icon} onSelect={() => actions.share("chat", chat.id)}>
        Поделиться
      </AppMenuItem>
      <AppMenuItem icon={PencilEdit01Icon} onSelect={onRename}>
        Переименовать
      </AppMenuItem>
      <AppMenuSub>
        <AppMenuSubTrigger icon={FolderTransferIcon}>Перенести в проект</AppMenuSubTrigger>
        <AppMenuSubContent title="Перенести в проект">
          <AppMenuItem icon={FolderAddIcon} onSelect={() => actions.openProjectDialog({ moveChatId: chat.id })}>
            Новый проект
          </AppMenuItem>
          {targets.length > 0 && <AppMenuSeparator />}
          {targets.map((project) => (
            <AppMenuItem key={project.id} onSelect={() => actions.moveChat(chat, project.id)}>
              <HugeiconsIcon strokeWidth={ICON_STROKE} icon={projectIcon(project.icon)} color={projectColor(project.color)} />
              <span className="min-w-0 flex-1 truncate">{project.name}</span>
              {project.id === chat.projectId && <HugeiconsIcon strokeWidth={ICON_STROKE} icon={Tick02Icon} className="ml-2 size-4!" />}
            </AppMenuItem>
          ))}
          {chat.projectId && (
            <>
              <AppMenuSeparator />
              <AppMenuItem icon={FolderRemoveIcon} onSelect={() => actions.moveChat(chat, undefined)}>
                Убрать из проекта
              </AppMenuItem>
            </>
          )}
        </AppMenuSubContent>
      </AppMenuSub>
      <AppMenuSeparator />
      <PinMenuItem pinned={pinned} noun="чат" onToggle={() => togglePin(`chat:${chat.id}`)} />
      <AppMenuItem icon={Archive01Icon} onSelect={() => actions.archiveChat(chat)}>
        Архивировать
      </AppMenuItem>
      <AppMenuItem icon={Delete02Icon} variant="destructive" onSelect={() => actions.confirmDelete({ kind: "chat", chat })}>
        Удалить
      </AppMenuItem>
    </>
  )
}
