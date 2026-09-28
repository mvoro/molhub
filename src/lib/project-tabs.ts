/* The project page's tabs. The address carries the tab (`?tab=media`; «Чаты» has none) through replaceState,
   so «Назад» from a chat lands on it; the session remembers each project's last tab for links without it. */
export type ProjectTab = "chats" | "media" | "files"
const TABS: readonly ProjectTab[] = ["chats", "media", "files"]

export function tabFromSearch(search: string): ProjectTab | null {
  const value = new URLSearchParams(search).get("tab")
  return value && (TABS as readonly string[]).includes(value) ? (value as ProjectTab) : null
}

export const searchForTab = (tab: ProjectTab) => (tab === "chats" ? "" : `?tab=${tab}`)

const lastTabs = new Map<string, ProjectTab>()
export const rememberTab = (projectId: string, tab: ProjectTab) => void lastTabs.set(projectId, tab)
export const recallTab = (projectId: string): ProjectTab => lastTabs.get(projectId) ?? "chats"
/* The tab a project page opens on: the address's, when the address is this project's own (a direct load,
   «Назад»); otherwise — coming from another project's page, whose `?tab` is still in the address for a moment —
   the one this project was left on. */
export const initialTab = (projectId: string, search: string, pathname?: string) =>
  (pathname === undefined || pathname === `/project/${encodeURIComponent(projectId)}` ? tabFromSearch(search) : null) ?? recallTab(projectId)
