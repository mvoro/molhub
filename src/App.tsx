import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu02Icon } from "@hugeicons/core-free-icons"

import { AppSidebar } from "@/components/app-sidebar"
import { BalanceButton } from "@/components/balance/balance-button"
import { ChatView } from "@/components/chat-view"
import { NewChat, type RoleLaunch } from "@/components/new-chat"
import { RolesView } from "@/components/roles/roles-view"
import { TrendsView } from "@/components/trends/trends-view"
import { CarouselStudio } from "@/components/carousel/carousel-studio"
import { ProjectChatMobileTitle, ProjectView } from "@/components/project/project-view"
import { ProjectChatMenu } from "@/components/project/project-chat-header"
import { RenameField, useRename } from "@/components/rename-field"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { EntityActionsProvider } from "@/hooks/use-entity-actions"
import { HubProvider, useHub } from "@/hooks/use-hub"
import { setFeedOpener } from "@/hooks/use-media-feed"
import { MusicProvider } from "@/hooks/use-music"
import { RolesProvider } from "@/hooks/use-roles"
import { WorkspaceVisibilityContext } from "@/hooks/workspace-visibility"
import type { Role } from "@/data/roles"
import type { Trend } from "@/data/trends"
import { NEW_CHAT } from "@/data/tools"
import { ICON_STROKE, NEW_CHAT_ICON } from "@/lib/icons"
import { rememberTab, type ProjectTab } from "@/lib/project-tabs"
import { activeFromPath, pathFromActive } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { withBasePath } from "@/lib/base-path"

/* Mobile workspace header. When the menu pushes the workspace aside (ChatGPT app style)
   the burger stays put and toggles it back; everything else sits under the tap-catcher.
   «Новый чат» is left out on the new chat itself, where it would lead nowhere, and in the photo and
   video studios, whose tabs take the row under it (the user's asks, 27.09).
   Projects: a project page has no «Новый чат» (its composer is one) and keeps its name and «⋯» in its own
   first row, over the tabs (the user's ask, 27.09); a project's chat shows the project over the chat's title
   (spec D8), and «Новый чат» starts a new one in the project — its page. */
function MobileHeader({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  const { openMobile, toggleSidebar } = useSidebar()
  const { chats, projects, renameChat } = useHub()
  const rename = useRename()
  const project = projects.find((item) => item.id === active)
  const chat = project ? undefined : chats.find((item) => item.id === active)
  const home = chat?.projectId ? projects.find((item) => item.id === chat.projectId && !item.archived) : undefined
  const onNewChat = project || NO_NEW_CHAT.has(active) ? undefined : () => onSelect(home ? home.id : NEW_CHAT)
  const tabIndex = openMobile ? -1 : undefined
  const title = chat && home ? (
    rename.renaming ? (
      <RenameField value={chat.title} label="Название чата" className="w-full min-w-0 bg-background" inputClassName="min-w-0 text-base"
        onDone={(next) => {
          rename.stop()
          if (next) renameChat(chat.id, next)
        }}
      />
    ) : <ProjectChatMobileTitle project={home} onOpen={() => onSelect(home.id)} tabIndex={tabIndex} />
  ) : null

  // h-16 puts the burger on the same line as the menu's top buttons (centre at 32px). Both buttons are
  // 36px, the app's control height, as the tabs the photo and video studios put on this row (the
  // user's ask, 27.09; new-chat.tsx). The burger sits at z-30, over the studio toolbar's scrim.
  // Pinned over the workspace with no fill: content scrolls under it and fades out through the
  // gradient mask hanging below (z-[5]: over the content, under the menu's tap-catcher at z-10).

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 flex h-16 items-center justify-between gap-2 px-3 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[5] before:h-24 before:bg-linear-to-b before:from-background before:from-35% before:to-transparent md:hidden">
      {/* «Новый чат» right of the burger, 8px after it as the studios' tabs (the user's ask, 27.09). */}
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={toggleSidebar}
          aria-label={openMobile ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={openMobile}
          className="pointer-events-auto relative z-30 size-9 rounded-[10px] active:translate-y-0 active:scale-[0.96] aria-expanded:bg-transparent"
        >
          <HugeiconsIcon icon={Menu02Icon} strokeWidth={ICON_STROKE} className="size-5" />
        </Button>
        {onNewChat && (
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onNewChat}
            aria-label="Новый чат"
            tabIndex={openMobile ? -1 : undefined}
            className="pointer-events-auto relative z-[6] size-9 rounded-[10px] active:translate-y-0 active:scale-[0.96]"
          >
            <HugeiconsIcon icon={NEW_CHAT_ICON} strokeWidth={ICON_STROKE} className="size-5" />
          </Button>
        )}
      </div>
      {title && <div className="pointer-events-auto relative z-[6] flex min-w-0 flex-1">{title}</div>}
      {/* The balance, on every screen (balance-button.tsx). Over the studios' toolbar scrim like the
          burger, but under the menu's tap-catcher while the menu is open. */}
      <div className={cn("pointer-events-auto relative ml-auto flex shrink-0 items-center gap-2", openMobile ? "z-[6]" : "z-30")}>
        {chat && home && <ProjectChatMenu chat={chat} tabIndex={tabIndex} onRename={rename.start} onCloseAutoFocus={rename.onCloseAutoFocus} />}
        <BalanceButton tabIndex={tabIndex} />
      </div>
    </header>
  )
}

/* Screens whose mobile header has no «Новый чат». */
const NO_NEW_CHAT = new Set([NEW_CHAT, "new:image", "new:video", "trends", "carousel"])

/* Section names also supply the browser's title. Unbuilt sections use them in a placeholder. */
const SECTION_TITLE: Record<string, string> = {
  roles: "Роли",
  carousel: "Карусель",
  trends: "Тренды",
  profile: "Профиль",
  subscription: "Подписка",
  referral: "Партнёрская программа",
  billing: "История списаний",
  memory: "Память",
}

/* Keeps the address in step with `active` (lib/routes.ts): a new screen adds a history entry, so the
   browser's back and forward walk the tools, chats and sections. It runs after the render, when the
   hub already lists a chat that was just created. An address naming nothing (a deleted or unknown
   chat) is replaced by the text tool's, without a history entry. The tab's title follows too. */
function RouteSync({ active, onUnknown }: { active: string; onUnknown: () => void }) {
  const { chats, projects } = useHub()
  React.useEffect(() => {
    const path = pathFromActive(active, {
      isChat: (id) => chats.some((chat) => chat.id === id),
      isProject: (id) => projects.some((project) => project.id === id),
    })
    if (path === null) {
      window.history.replaceState(null, "", withBasePath("/"))
      onUnknown()
      return
    }
    if (path !== window.location.pathname) window.history.pushState(null, "", path)
    const name =
      TOOL_TITLE[active] ??
      chats.find((chat) => chat.id === active)?.title ??
      projects.find((project) => project.id === active)?.name ??
      SECTION_TITLE[active]
    document.title = name ? `${name} · AI Hub` : "AI Hub"
  }, [active, chats, projects, onUnknown])
  return null
}

const TOOL_TITLE: Record<string, string> = {
  new: "Новый чат",
  "new:text": "Новый чат",
  "new:image": "Фото",
  "new:video": "Видео",
  "new:audio": "Аудио",
}

/* What the workspace shows for the current `active`: a new chat (plain or in a mode), an open chat,
   a project's page, or a placeholder for sections that aren't built yet. */
type WorkspaceProps = {
  active: string
  onSelect: (id: string) => void
  onHeaderSelect: (id: string) => void
  roleLaunch?: RoleLaunch
  trendLaunch?: Trend
  newChatKey: number
  onStartRole: (role: Role, prompt?: string) => void
  onRepeatTrend: (trend: Trend) => void
}

function Workspace(props: WorkspaceProps) {
  const browsingRoles = props.active === "roles"
  const [previous, setPrevious] = React.useState(browsingRoles ? NEW_CHAT : props.active)
  if (!browsingRoles && previous !== props.active) setPrevious(props.active)
  const contentActive = browsingRoles ? previous : props.active
  return (
    <>
      <MobileHeader key={contentActive} active={contentActive} onSelect={props.onHeaderSelect} />
      <RolesView open={browsingRoles} onOpenChange={(open) => { if (!open) props.onSelect(previous) }} onStart={props.onStartRole} />
      {/* Browsing roles preserves the current composer, attachments and project. An explicit
          «Начать чат» changes newChatKey and starts a fresh draft. */}
      <div className="contents" inert={browsingRoles}>
        <WorkspaceVisibilityContext value={!browsingRoles}>
          <WorkspaceContent {...props} active={contentActive} visible={!browsingRoles} />
        </WorkspaceVisibilityContext>
      </div>
    </>
  )
}

function WorkspaceContent({ active, onSelect, roleLaunch, trendLaunch, newChatKey, onRepeatTrend, visible }: WorkspaceProps & { visible: boolean }) {
  const { chats, projects } = useHub()

  if (active === "new" || active.startsWith("new:")) return <NewChat key={newChatKey} active={active} onSelect={onSelect} roleLaunch={roleLaunch} trendLaunch={trendLaunch} visible={visible} />

  if (active === "trends") return <TrendsView onRepeat={onRepeatTrend} />
  if (active === "carousel") return <CarouselStudio />

  const chat = chats.find((item) => item.id === active)
  if (chat) return <ChatView key={chat.id} chat={chat} />

  const project = projects.find((item) => item.id === active)
  if (project) return <ProjectView key={project.id} project={project} onSelect={onSelect} />

  const title = SECTION_TITLE[active]
  if (!title) return null

  return (
    <Empty className="pb-[12svh]">
      <EmptyHeader>
        <EmptyTitle className="text-base">{title}</EmptyTitle>
        <EmptyDescription>Раздел скоро появится.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

const PRIVATE_SECTIONS = new Set(["roles", "profile", "subscription", "referral", "billing", "memory"])

export default function App() {
  const { authenticated, requireAuth } = useAuth()
  // The screen comes from the address (lib/routes.ts); the text tool, at «/», is the default screen
  // (26.09): there is no separate home page. Back and forward bring the screen of their address.
  const [requestedActive, setActive] = React.useState(() => activeFromPath(window.location.pathname))
  const active = !authenticated && PRIVATE_SECTIONS.has(requestedActive) ? NEW_CHAT : requestedActive
  const [roleLaunch, setRoleLaunch] = React.useState<RoleLaunch>()
  const [trendLaunch, setTrendLaunch] = React.useState<Trend>()
  const [newChatKey, setNewChatKey] = React.useState(0)
  const navigate = React.useCallback((id: string) => {
    if (PRIVATE_SECTIONS.has(id) && !requireAuth()) return
    setRoleLaunch(undefined)
    setTrendLaunch(undefined)
    setActive(id)
  }, [requireAuth])
  const select = React.useCallback((id: string) => {
    if (id === NEW_CHAT || id === "new") setNewChatKey((key) => key + 1)
    navigate(id)
  }, [navigate])
  const startRole = React.useCallback((role: Role, prompt?: string) => {
    if (!requireAuth()) return
    setRoleLaunch({ role, prompt })
    setTrendLaunch(undefined)
    setNewChatKey((key) => key + 1)
    setActive(NEW_CHAT)
  }, [requireAuth])
  const repeatTrend = React.useCallback((trend: Trend) => {
    setRoleLaunch(undefined)
    setTrendLaunch(trend)
    setNewChatKey((key) => key + 1)
    setActive(`new:${trend.type}`)
  }, [])
  React.useEffect(() => {
    if (!authenticated && PRIVATE_SECTIONS.has(requestedActive)) {
      requireAuth()
      setRoleLaunch(undefined)
      setTrendLaunch(undefined)
      setActive(NEW_CHAT)
    }
  }, [requestedActive, authenticated, requireAuth])
  React.useEffect(() => {
    const restore = () => {
      setRoleLaunch(undefined)
      setTrendLaunch(undefined)
      setActive(activeFromPath(window.location.pathname))
    }
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [])
  const toTextTool = React.useCallback(() => navigate(NEW_CHAT), [navigate])
  // A project page, on the given tab (or the one it was left on): «Открыть» on project toasts.
  const openProject = React.useCallback((id: string, tab?: ProjectTab) => {
    if (tab) rememberTab(id, tab)
    navigate(id)
  }, [navigate])
  // «Открыть» on the «Фото готовы» / «Видео готово» toast: results keep generating while the user is elsewhere.
  // A project's batch opens its project on «Медиа».
  React.useEffect(
    () => setFeedOpener((kind, projectId) => (projectId ? openProject(projectId, "media") : navigate(`new:${kind}`))),
    [openProject, navigate]
  )

  return (
    <HubProvider>
    <RolesProvider>
    <RouteSync active={active} onUnknown={toTextTool} />
    {/* Above the workspace: songs keep generating while the user is in another section. */}
    <MusicProvider onOpenStudio={() => navigate("new:audio")} onOpenProject={(id) => openProject(id, "media")}>
    <TooltipProvider delayDuration={300} skipDelayDuration={400}>
      {/* Clips the mobile row, which is wider than the screen (menu + workspace side by side).
          overflow-clip, not hidden: a hidden box is still scrollable from code, and focusing a
          half-visible control (the mode chips) would scroll the whole shell sideways. */}
      <div className="h-svh overflow-clip">
        <SidebarProvider className="h-svh overflow-clip">
          {/* Chat and project menus act the same everywhere: the sidebar, the project page, a chat's header.
              A context only — no DOM of its own, so the sidebar, workspace and toaster stay siblings. */}
          <EntityActionsProvider active={active} onNavigate={navigate} historyType="text">
          <AppSidebar active={active} onSelect={select} />
          {/* Workspace: white card with 24px corners on the #f7f7f7 shell (desktop); full-bleed on mobile. */}
          <SidebarInset className="group/chat-workspace relative min-h-0 min-w-0 overflow-clip">
            <Workspace active={active} onSelect={navigate} onHeaderSelect={select} roleLaunch={roleLaunch} trendLaunch={trendLaunch} newChatKey={newChatKey} onStartRole={startRole} onRepeatTrend={repeatTrend} />
            {/* The balance on desktop: pinned to the card's top right, on the studios' toolbar row
                (their toolbar keeps room for it, new-chat.tsx); the phone has it in MobileHeader. */}
            <BalanceButton className={cn("absolute top-3.5 right-6 z-30 max-md:hidden", active !== "roles" && "group-has-[[data-artifact-open=true]]/chat-workspace:hidden")} />
          </SidebarInset>
          {/* The portal stays in the viewport; desktop centring accounts for the sidebar width. */}
          <Toaster position="bottom-center" className="md:left-[calc(50%+130px)]! md:in-[body:has([data-slot=sidebar][data-state=collapsed])]:left-[calc(50%+24px)]!" />
          </EntityActionsProvider>
        </SidebarProvider>
      </div>
    </TooltipProvider>
    </MusicProvider>
    </RolesProvider>
    </HubProvider>
  )
}
