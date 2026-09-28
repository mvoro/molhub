import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

import { ProjectDialog } from "@/components/project-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useSidebar } from "@/components/ui/sidebar"
import type { Chat, ChatType, Project } from "@/data/chats"
import { NEW_CHAT } from "@/data/tools"
import { useHub, type PinKey } from "@/hooks/use-hub"
import type { ProjectColor } from "@/lib/project-colors"
import { rememberTab, type ProjectTab } from "@/lib/project-tabs"
import { copyText } from "@/lib/clipboard"
import { withBasePath } from "@/lib/base-path"

/* What chat and project menus do, wherever they are (sidebar rows, the project page, a chat's header):
   navigation plus the flows that live above a single row — the project dialog, delete confirmations,
   archive and move with «Отменить», leaving a screen that's gone. One provider under the app, so every
   menu shows the same items and opens the same dialogs (spec §9). */

export type ConfirmTarget =
  | { kind: "chat"; chat: Chat }
  | { kind: "project"; project: Project }
  | { kind: "history"; count: number }

export type EntityActions = {
  /* Opens a screen; on the phone the menu gives way to it. */
  navigate: (id: string) => void
  /* A project page, on the given tab or the one it was left on. */
  openProject: (id: string, tab?: ProjectTab) => void
  share: (kind: "chat" | "project", id: string) => void
  archiveChat: (chat: Chat) => void
  archiveProject: (project: Project) => void
  /* Into a project, or out of it (undefined) with «Отменить». */
  moveChat: (chat: Chat, projectId: string | undefined) => void
  confirmDelete: (target: ConfirmTarget) => void
  /* Edit `project`, or create one: then move `moveChatId` into it, hand it to `onCreated` (staying where the
     user is — a studio, the song form), or open its page. */
  openProjectDialog: (options?: { project?: Project; moveChatId?: string; onCreated?: (project: Project) => void }) => void
}

const EntityActionsContext = React.createContext<EntityActions | null>(null)

const CONFIRM_COPY = {
  chat: { title: "Удалить чат?", action: "Удалить" },
  project: { title: "Удалить проект?", action: "Удалить" },
  history: { title: "Очистить историю?", action: "Очистить" },
} as const

/* «1 чат», «3 чата», «7 чатов». */
function chatsWord(count: number) {
  const tens = count % 100
  const ones = count % 10
  if (tens >= 11 && tens <= 14) return "чатов"
  if (ones === 1) return "чат"
  if (ones >= 2 && ones <= 4) return "чата"
  return "чатов"
}

function confirmDescription(target: ConfirmTarget) {
  if (target.kind === "chat") return `Чат «${target.chat.title}» будет удалён навсегда. Восстановить его не получится.`
  if (target.kind === "project")
    return `Проект «${target.project.name}», его чаты, инструкции и файлы удалятся навсегда. Фото, видео и песни останутся в студиях.`
  // Only what the list shows goes: the history is text chats; photo, video and audio are not listed here.
  return `${target.count} ${chatsWord(target.count)} из истории будут удалены навсегда. Чаты с фото, видео и аудио, проекты и архив не пострадают.`
}

type DialogState = { open: boolean; project?: Project; moveChatId?: string; onCreated?: (project: Project) => void }

export function EntityActionsProvider({
  active,
  onNavigate,
  historyType,
  children,
}: {
  active: string
  onNavigate: (id: string) => void
  /* The chats «Очистить историю» clears: the ones «Недавние чаты» lists. */
  historyType: ChatType
  children: React.ReactNode
}) {
  const hub = useHub()
  const { requireAuth } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()
  const [projectDialog, setProjectDialog] = React.useState<DialogState>({ open: false })
  const [copyNotice, setCopyNotice] = React.useState("")
  /* Kept after closing so the dialog doesn't go blank while it animates out. */
  const [confirm, setConfirm] = React.useState<{ open: boolean; target: ConfirmTarget }>({
    open: false,
    target: { kind: "history", count: 0 },
  })

  const navigate = (id: string) => {
    onNavigate(id)
    if (isMobile) setOpenMobile(false)
  }
  const openProject = (id: string, tab?: ProjectTab) => {
    if (tab) rememberTab(id, tab)
    navigate(id)
  }

  /* When the open chat or project goes (deleted, archived): a project's chat falls back to its project's page
     (unless the project goes too, `gone`), anything else to a new chat. The menu stays open on the phone —
     the user is still in it. */
  const leaveIfOpen = (ids: string[], gone?: string) => {
    if (!ids.includes(active)) return
    const home = hub.chats.find((chat) => chat.id === active)?.projectId
    const alive = home && home !== gone && hub.projects.some((project) => project.id === home && !project.archived)
    onNavigate(alive ? home : NEW_CHAT)
  }
  const chatIdsOf = (projectId: string) => hub.chats.filter((chat) => chat.projectId === projectId).map((chat) => chat.id)

  const actions: EntityActions = {
    navigate,
    openProject,
    share: (kind, id) => {
      const url = `${window.location.origin}${withBasePath(`/${kind === "chat" ? "c" : "project"}/${encodeURIComponent(id)}`)}`
      setCopyNotice("")
      void copyText(url).then(
        () => setCopyNotice("Ссылка скопирована"),
        () => setCopyNotice("Не удалось скопировать ссылку. Попробуйте ещё раз.")
      )
    },
    archiveChat: (chat) => {
      const key: PinKey = `chat:${chat.id}`
      const wasPinned = hub.pins.includes(key)
      hub.archiveChat(chat.id)
      leaveIfOpen([chat.id])
      toast("Чат перенесён в архив", {
        action: {
          label: "Отменить",
          onClick: () => {
            hub.restore("chat", chat.id)
            if (wasPinned) hub.setPinned(key, true)
          },
        },
      })
    },
    archiveProject: (project) => {
      const key: PinKey = `project:${project.id}`
      const wasPinned = hub.pins.includes(key)
      hub.archiveProject(project.id)
      leaveIfOpen([project.id, ...chatIdsOf(project.id)], project.id)
      toast("Проект перенесён в архив", {
        action: {
          label: "Отменить",
          onClick: () => {
            hub.restore("project", project.id)
            if (wasPinned) hub.setPinned(key, true)
          },
        },
      })
    },
    moveChat: (chat, projectId) => {
      if (projectId === chat.projectId) return
      const before = chat.projectId
      hub.moveChat(chat.id, projectId)
      const target = projectId ? hub.projects.find((project) => project.id === projectId) : undefined
      if (target) toast(`Чат перенесён в «${target.name}»`)
      else toast("Чат убран из проекта", { action: { label: "Отменить", onClick: () => hub.moveChat(chat.id, before) } })
    },
    confirmDelete: (target) => setConfirm({ open: true, target }),
    openProjectDialog: (options) => { if (requireAuth()) setProjectDialog({ open: true, ...options }) },
  }

  const runConfirm = () => {
    const { target } = confirm
    if (target.kind === "chat") {
      hub.deleteChat(target.chat.id)
      leaveIfOpen([target.chat.id])
      toast("Чат удалён")
    } else if (target.kind === "project") {
      leaveIfOpen([target.project.id, ...chatIdsOf(target.project.id)], target.project.id)
      hub.deleteProject(target.project.id)
      toast("Проект удалён")
    } else {
      leaveIfOpen(hub.chats.filter((chat) => !chat.projectId && !chat.archived && chat.type === historyType).map((chat) => chat.id))
      hub.clearHistory(historyType)
      toast("История очищена")
    }
  }

  const submitProject = ({ name, description, color, icon }: { name: string; description?: string; color?: ProjectColor; icon?: string }) => {
    const { project, moveChatId, onCreated } = projectDialog
    if (project) {
      hub.updateProject(project.id, { name, description, color, icon })
    } else {
      const created = hub.createProject({ name, description, color, icon })
      if (moveChatId) {
        hub.moveChat(moveChatId, created.id)
        toast(`Чат перенесён в «${name}»`)
      } else if (onCreated) {
        onCreated(created)
      } else {
        navigate(created.id)
      }
    }
    setProjectDialog((prev) => ({ ...prev, open: false }))
  }

  const copy = CONFIRM_COPY[confirm.target.kind]

  return (
    <EntityActionsContext.Provider value={actions}>
      {children}
      <span role="status" className="sr-only">{copyNotice}</span>
      <ProjectDialog
        open={projectDialog.open}
        onOpenChange={(open) => setProjectDialog((prev) => ({ ...prev, open }))}
        project={projectDialog.project}
        onSubmit={submitProject}
      />
      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm((prev) => ({ ...prev, open }))}
        title={copy.title}
        description={confirmDescription(confirm.target)}
        actionLabel={copy.action}
        onConfirm={runConfirm}
      />
    </EntityActionsContext.Provider>
  )
}

export function useEntityActions() {
  const actions = React.useContext(EntityActionsContext)
  if (!actions) throw new Error("useEntityActions must be used within EntityActionsProvider")
  return actions
}
