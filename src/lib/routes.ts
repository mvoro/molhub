import { NEW_CHAT } from "@/data/tools"

/* Addresses of the workspace (the user's ask, 27.09: «каждый режим имеет свой роут»). The app keeps
   one `active` id — a tool (`new:<type>`), a chat, a project or a section — and the address mirrors
   it through the History API; no router library. Every tool has its own path, the text tool (the
   default screen) is the root:
     /            Текст (new chat)       /c/<id>        a chat
     /photo       Фото                   /project/<id>  a project
     /video       Видео                  /<section>     Проекты, Роли, Профиль…
     /audio       Аудио
   Chat and project ids have no common prefix, so telling them apart takes the hub's lists. */

const TOOL_PATHS: Record<string, string> = {
  "new:text": "/",
  "new:image": "/photo",
  "new:video": "/video",
  "new:audio": "/audio",
}

/* Sections with a screen of their own (or its placeholder) in the workspace. */
const SECTIONS = new Set(["projects", "roles", "carousel", "trends", "profile", "subscription", "referral", "billing", "memory"])

/* The path for `active`, or null when it names nothing the app knows (a deleted chat). */
export function pathFromActive(
  active: string,
  { isChat, isProject }: { isChat: (id: string) => boolean; isProject: (id: string) => boolean }
): string | null {
  if (active === "new") return "/"
  if (active in TOOL_PATHS) return TOOL_PATHS[active]
  if (SECTIONS.has(active)) return `/${active}`
  if (isChat(active)) return `/c/${encodeURIComponent(active)}`
  if (isProject(active)) return `/project/${encodeURIComponent(active)}`
  return null
}

/* The `active` id an address opens; anything unknown opens the text tool. */
export function activeFromPath(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/"
  const tool = Object.keys(TOOL_PATHS).find((id) => TOOL_PATHS[id] === path)
  if (tool) return tool
  const [, first = "", second] = path.split("/")
  if ((first === "c" || first === "project") && second) return decodeURIComponent(second)
  if (SECTIONS.has(first)) return first
  return NEW_CHAT
}
