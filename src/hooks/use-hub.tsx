import { clientId } from "@/lib/client-id"
import * as React from "react"

import { CHATS, REVIEW_CHATS, PROJECTS, type Chat, type ChatType, type Project, type ProjectFile } from "@/data/chats"
import { useStoredState } from "@/hooks/use-stored-state"
import { deleteChatMessages } from "@/hooks/use-chat-messages"
import { unsetFeedProject } from "@/hooks/use-media-feed"
import { deleteFiles } from "@/lib/project-files"
import type { ProjectColor } from "@/lib/project-colors"
import { needsNormalize, normalizeProject } from "@/lib/project-normalize"

/* Pins hold both kinds in one list, newest first: "chat:c1", "project:q4". */
export type PinKey = `${"chat" | "project"}:${string}`

type Hub = {
  chats: Chat[]
  projects: Project[]
  pins: PinKey[]
  createChat: (chat: { title: string; type: ChatType; projectId?: string; preview?: string }) => Chat
  /* Bumps a chat's updatedAt/preview on send — and its project's, if it has one. */
  touchChat: (id: string, text: string) => void
  renameChat: (id: string, title: string) => void
  moveChat: (id: string, projectId: string | undefined) => void
  archiveChat: (id: string) => void
  deleteChat: (id: string) => void
  /* Deletes every chat in the main history (not in projects, not archived); with a type, only chats of that type. */
  clearHistory: (type?: ChatType) => void
  createProject: (project: { name: string; description?: string; color?: ProjectColor; icon?: string }) => Project
  updateProject: (id: string, patch: Partial<Pick<Project, "name" | "description" | "color" | "icon" | "instructions">>) => void
  /* Adds the projects among `list` whose id isn't already in the hub, at the end (music migration). */
  importProjects: (list: Project[]) => void
  addProjectFiles: (projectId: string, files: ProjectFile[]) => void
  /* «Загрузить снова»: the same entry, new name, size and type (its content was rewritten under its id). */
  replaceProjectFile: (projectId: string, file: ProjectFile) => void
  removeProjectFile: (projectId: string, fileId: string) => void
  archiveProject: (id: string) => void
  /* Deletes the project together with its chats and files, like ChatGPT. */
  deleteProject: (id: string) => void
  /* Brings an archived chat or project back into the sidebar. */
  restore: (kind: "chat" | "project", id: string) => void
  togglePin: (key: PinKey) => void
  setPinned: (key: PinKey, pinned: boolean) => void
}

const HubContext = React.createContext<Hub | null>(null)

const newId = (prefix: string) =>
  `${prefix}${clientId()}`

/* A chat's preview in lists and search: its first line, one line long. */
const makePreview = (text: string) => text.split("\n")[0].slice(0, 140)

/* Chats, projects and pins for the sidebar and search. Mirrored to localStorage until the API lands. */
export function HubProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useStoredState<Chat[]>("ai-hub:chats", CHATS)
  const [projects, setProjects] = useStoredState<Project[]>("ai-hub:projects", PROJECTS)
  const [pins, setPins] = useStoredState<PinKey[]>("ai-hub:pins", [])
  const [reviewExamplesAdded, setReviewExamplesAdded] = useStoredState("ai-hub:review-examples-v1", false)
  React.useEffect(() => {
    if (reviewExamplesAdded) return
    setChats((current) => [...REVIEW_CHATS.filter((demo) => !current.some((chat) => chat.id === demo.id)), ...current])
    setReviewExamplesAdded(true)
  }, [reviewExamplesAdded, setChats, setReviewExamplesAdded])

  // Older builds kept hex colours and no dates: normalize once per mount, after localStorage has loaded.
  const [normalized, setNormalized] = React.useState(false)
  if (!normalized) {
    setNormalized(true)
    if (projects.some(needsNormalize)) setProjects((prev) => prev.map((p) => normalizeProject(p) as Project))
  }

  const hub = React.useMemo<Hub>(() => {
    const unpin = (...keys: PinKey[]) => setPins((prev) => prev.filter((pin) => !keys.includes(pin)))
    const touchProject = (id: string, when: number) =>
      setProjects((prev) => prev.map((project) => (project.id === id ? { ...project, updatedAt: when } : project)))

    return {
      chats,
      projects,
      pins,
      createChat: ({ title, type, projectId, preview }) => {
        const now = Date.now()
        const chat: Chat = { id: newId("c"), title, type, projectId, updatedAt: now }
        if (preview) chat.preview = makePreview(preview)
        setChats((prev) => [chat, ...prev])
        if (projectId) touchProject(projectId, now)
        return chat
      },
      touchChat: (id, text) => {
        const now = Date.now()
        const preview = makePreview(text)
        setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, updatedAt: now, preview } : chat)))
        const projectId = chats.find((chat) => chat.id === id)?.projectId
        if (projectId) touchProject(projectId, now)
      },
      renameChat: (id, title) => setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, title } : chat))),
      moveChat: (id, projectId) =>
        setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, projectId } : chat))),
      archiveChat: (id) => {
        setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, archived: true } : chat)))
        unpin(`chat:${id}`)
      },
      deleteChat: (id) => {
        deleteChatMessages(id)
        setChats((prev) => prev.filter((chat) => chat.id !== id))
        unpin(`chat:${id}`)
      },
      clearHistory: (type) => {
        const gone = chats
          .filter((chat) => !chat.projectId && !chat.archived && (!type || chat.type === type))
          .map((chat) => chat.id)
        gone.forEach(deleteChatMessages)
        setChats((prev) => prev.filter((chat) => !gone.includes(chat.id)))
        unpin(...gone.map((id): PinKey => `chat:${id}`))
      },
      createProject: ({ name, description, color, icon }) => {
        const now = Date.now()
        const project: Project = { id: newId("p"), name, description, color, icon, createdAt: now, updatedAt: now }
        setProjects((prev) => [project, ...prev])
        return project
      },
      updateProject: (id, patch) =>
        setProjects((prev) =>
          prev.map((project) => (project.id === id ? { ...project, ...patch, updatedAt: Date.now() } : project))
        ),
      importProjects: (list) =>
        setProjects((prev) => [...prev, ...list.filter((project) => !prev.some((existing) => existing.id === project.id))]),
      addProjectFiles: (projectId, files) =>
        setProjects((prev) =>
          prev.map((project) =>
            project.id === projectId
              ? { ...project, files: [...files, ...(project.files ?? [])], updatedAt: Date.now() }
              : project
          )
        ),
      replaceProjectFile: (projectId, file) =>
        setProjects((prev) =>
          prev.map((project) =>
            project.id === projectId
              ? { ...project, files: (project.files ?? []).map((item) => (item.id === file.id ? file : item)), updatedAt: Date.now() }
              : project
          )
        ),
      // Files touch «изменён» both ways (spec §3).
      removeProjectFile: (projectId, fileId) =>
        setProjects((prev) =>
          prev.map((project) =>
            project.id === projectId
              ? { ...project, files: (project.files ?? []).filter((file) => file.id !== fileId), updatedAt: Date.now() }
              : project
          )
        ),
      archiveProject: (id) => {
        setProjects((prev) => prev.map((project) => (project.id === id ? { ...project, archived: true } : project)))
        unpin(`project:${id}`)
      },
      deleteProject: (id) => {
        const target = projects.find((project) => project.id === id)
        const gone = chats.filter((chat) => chat.projectId === id).map((chat) => chat.id)
        gone.forEach(deleteChatMessages)
        setProjects((prev) => prev.filter((project) => project.id !== id))
        setChats((prev) => prev.filter((chat) => chat.projectId !== id))
        unpin(`project:${id}`, ...gone.map((chatId): PinKey => `chat:${chatId}`))
        // Demo files point at a static asset (src) and have no Blob to clean up.
        const fileIds = (target?.files ?? []).filter((file) => !file.src).map((file) => file.id)
        void deleteFiles(fileIds)
        // Photos and videos stay in the studios, just unlinked (D10); songs are reconciled by MusicProvider.
        unsetFeedProject(id)
      },
      restore: (kind, id) => {
        if (kind === "chat") setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, archived: false } : chat)))
        else setProjects((prev) => prev.map((project) => (project.id === id ? { ...project, archived: false } : project)))
      },
      togglePin: (key) => setPins((prev) => (prev.includes(key) ? prev.filter((pin) => pin !== key) : [key, ...prev])),
      setPinned: (key, pinned) =>
        setPins((prev) => (pinned ? (prev.includes(key) ? prev : [key, ...prev]) : prev.filter((pin) => pin !== key))),
    }
  }, [chats, projects, pins, setChats, setProjects, setPins])

  return <HubContext.Provider value={hub}>{children}</HubContext.Provider>
}

export function useHub() {
  const hub = React.useContext(HubContext)
  if (!hub) throw new Error("useHub must be used within HubProvider")
  return hub
}
