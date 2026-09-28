import { withBasePath } from "../lib/base-path.ts"
import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Add01Icon,
  AiBrain01Icon,
  Archive01Icon,
  ArrowRight01Icon,
  ComputerIcon,
  CreditCardIcon,
  Delete02Icon,
  FolderAddIcon,
  Logout03Icon,
  MessageCircleIcon,
  Moon02Icon,
  MoreHorizontalIcon,
  PinIcon,
  Search01Icon,
  SidebarLeftIcon,
  Sun03Icon,
  TransactionHistoryIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription } from "@/components/ui/empty"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AppMenu,
  AppMenuContent,
  AppMenuItem,
  AppMenuRadioGroup,
  AppMenuRadioItem,
  AppMenuSeparator,
  AppMenuSub,
  AppMenuSubContent,
  AppMenuSubTrigger,
  AppMenuTrigger,
} from "@/components/ui/app-menu"
import { ArchiveDialog } from "@/components/archive-dialog"
import { ChatSearch } from "@/components/chat-search"
import { ChatMenuItems, ProjectMenuItems } from "@/components/entity-menus"
import { RenameField, useRename } from "@/components/rename-field"
import { SidebarNav, SidebarNewChat } from "@/components/sidebar-nav"
import { Hotkey, LABEL, LABEL_BASE, ROW } from "@/components/sidebar-row"
import { PROJECT_NAME_MAX, type Chat, type Project } from "@/data/chats"
import { NEW_CHAT } from "@/data/tools"
import { useEntityActions, type EntityActions } from "@/hooks/use-entity-actions"
import { useHub, type PinKey } from "@/hooks/use-hub"
import { useStoredState } from "@/hooks/use-stored-state"
import { useTheme, type Theme } from "@/hooks/use-theme"
import { ICON_STROKE, NEW_CHAT_ICON, projectIcon } from "@/lib/icons"
import { projectColor } from "@/lib/project-colors"
import { lastInput } from "@/lib/input-modality"
import { authAccountName } from "@/lib/auth"
import { cn } from "@/lib/utils"


/* Projects live in their own section under the tools, below «Закреплённые», like ChatGPT («Роли» took their
   place in the navigation). Pinned projects show under «Закреплённые» instead. */
const SHOW_PROJECT_LIST = true
/* «Закреплённые» and «Недавние чаты» under the navigation (back since 26.09 evening). The history belongs to
   the text tool: only text chats are listed — photo, video and audio results get their own feeds. */
const SHOW_HISTORY = true
const HISTORY_TYPE = "text"

/* Project chats sit under their project, text aligned with the project's name. */
const INDENT = "ml-7 w-[calc(100%-28px)]"
/* Row actions: on hover/focus with a mouse, always visible on touch. */
const ACTION =
  "top-1.5 size-6 rounded-md data-[state=open]:bg-sidebar-accent pointer-coarse:top-2 pointer-coarse:after:absolute pointer-coarse:after:-inset-2 [&>svg]:size-4!"
const HOVER_ONLY =
  "md:pointer-fine:opacity-0 md:pointer-fine:group-hover/menu-item:opacity-100 md:pointer-fine:group-focus-within/menu-item:opacity-100 md:pointer-fine:data-[state=open]:opacity-100"
/* Section header actions (new / more): shown while the section is hovered, always on touch. */
const SECTION_ACTION =
  "top-4 pointer-coarse:top-4 md:pointer-fine:opacity-0 md:pointer-fine:group-hover/section:opacity-100 md:pointer-fine:focus-visible:opacity-100 md:pointer-fine:data-[state=open]:opacity-100"
const ICON_BUTTON =
  "size-9 rounded-[10px] text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground active:translate-y-0 active:scale-[0.96] [&_svg]:size-[18px]"

type PinnedItem =
  | { key: PinKey; kind: "chat"; chat: Chat }
  | { key: PinKey; kind: "project"; project: Project }

type SectionId = "pinned" | "projects" | "chats"

/* What rows need: the sidebar's navigation (a picked screen closes the phone menu) plus the app's chat and
   project actions (hooks/use-entity-actions.tsx — dialogs, undo toasts, leaving a screen that's gone). */
type SidebarActions = EntityActions & { select: (id: string) => void }

const SidebarActionsContext = React.createContext<SidebarActions | null>(null)

function useSidebarActions() {
  const actions = React.useContext(SidebarActionsContext)
  if (!actions) throw new Error("useSidebarActions must be used within AppSidebar")
  return actions
}

function Brand({
  collapsed,
  onHome,
  onSearch,
}: {
  collapsed: boolean
  onHome: () => void
  onSearch: () => void
}) {
  const { toggleSidebar, isMobile } = useSidebar()
  const toggleLabel = collapsed ? "Развернуть меню" : "Свернуть меню"

  return (
    <div className="group/brand relative flex h-9 items-center">
      {/* In the rail the mark only marks the spot: hovering it reveals the expand toggle in the same box. */}
      <Button
        variant="ghost"
        onClick={onHome}
        aria-label="Молекула — новый чат"
        tabIndex={collapsed ? -1 : undefined}
        aria-hidden={collapsed || undefined}
        className="h-9 gap-2 rounded-[10px] px-2 hover:bg-transparent active:translate-y-0 group-data-[collapsible=icon]:pointer-events-none"
      >
        <img
          src={withBasePath("/brand/molecula-mark.svg")}
          alt=""
          width={20}
          height={20}
          className="size-5 transition-[opacity,filter,scale] duration-150 ease-(--ease-out) group-data-[collapsible=icon]:group-hover/brand:scale-90 group-data-[collapsible=icon]:group-hover/brand:opacity-0 group-data-[collapsible=icon]:group-hover/brand:blur-[2px] group-data-[collapsible=icon]:group-has-focus-visible/brand:opacity-0 pointer-coarse:group-data-[collapsible=icon]:opacity-0"
        />
        {/* The wordmark's «молекула» is black; the dark theme swaps in a copy with it in white. */}
        <img
          src={withBasePath("/brand/molecula-wordmark.svg")}
          alt="Молекула"
          width={85}
          height={20}
          className="sidebar-fade h-5 w-auto dark:hidden"
        />
        <img
          src={withBasePath("/brand/molecula-wordmark-dark.svg")}
          alt="Молекула"
          width={85}
          height={20}
          className="sidebar-fade hidden h-5 w-auto dark:block"
        />
      </Button>

      {/* Search lives next to the toggle while expanded, muted like it; in the rail it becomes the third row
          (sidebar-nav), full-strength like the other rows. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onSearch}
            aria-label="Поиск"
            tabIndex={collapsed ? -1 : undefined}
            className={cn(
              ICON_BUTTON,
              "sidebar-fade absolute top-0 right-10 group-data-[collapsible=icon]:pointer-events-none",
              isMobile && "right-0"
            )}
          >
            <HugeiconsIcon strokeWidth={ICON_STROKE} icon={Search01Icon} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" hidden={isMobile}>
          Поиск
          <Hotkey keys={["⌘", "K"]} />
        </TooltipContent>
      </Tooltip>

      {/* On mobile the menu closes from the pushed workspace header (X), like MashaGPT. */}
      {!isMobile && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={toggleSidebar}
              aria-label={toggleLabel}
              className={cn(
                ICON_BUTTON,
                "absolute top-0 right-0 transition-[opacity,filter,scale,background-color] duration-150 ease-(--ease-out) group-data-[collapsible=icon]:scale-90 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:blur-[2px] group-data-[collapsible=icon]:group-hover/brand:scale-100 group-data-[collapsible=icon]:group-hover/brand:opacity-100 group-data-[collapsible=icon]:group-hover/brand:blur-none group-data-[collapsible=icon]:focus-visible:scale-100 group-data-[collapsible=icon]:focus-visible:opacity-100 group-data-[collapsible=icon]:focus-visible:blur-none pointer-coarse:group-data-[collapsible=icon]:scale-100 pointer-coarse:group-data-[collapsible=icon]:opacity-100 pointer-coarse:group-data-[collapsible=icon]:blur-none"
              )}
            >
              <HugeiconsIcon strokeWidth={ICON_STROKE} icon={SidebarLeftIcon} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={collapsed ? "right" : "bottom"}>
            {toggleLabel}
            <Hotkey keys={["⌘", "B"]} />
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

/* Long chat/project names scroll to their end after a second of hover or focus,
   and glide back on leave. The shift is measured, so short names never move (see .marquee). */
function MarqueeLabel({ text }: { text: string }) {
  const boxRef = React.useRef<HTMLSpanElement>(null)
  const textRef = React.useRef<HTMLSpanElement>(null)

  React.useLayoutEffect(() => {
    const box = boxRef.current
    const inner = textRef.current
    if (!box || !inner) return
    const measure = () => {
      const overflow = inner.offsetWidth - box.clientWidth
      // +20px clears the right-edge fade, so the last letters end up readable.
      const shift = overflow > 0 ? overflow + 20 : 0
      box.toggleAttribute("data-overflow", shift > 0)
      box.style.setProperty("--marquee-shift", `-${shift}px`)
      box.style.setProperty("--marquee-duration", `${Math.max(600, (shift / 45) * 1000)}ms`)
    }
    measure()
    // The label narrows on hover (room for row actions) and with the panel width.
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [text])

  return (
    <span ref={boxRef} className={cn(LABEL_BASE, "marquee")}>
      <span ref={textRef}>{text}</span>
    </span>
  )
}

function ProjectItem({
  project,
  active,
  pinned,
  expanded,
  onOpenChange,
  children,
}: {
  project: Project
  active: boolean
  pinned: boolean
  expanded: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  const { updateProject } = useHub()
  const actions = useSidebarActions()
  const rename = useRename()
  const [instant, setInstant] = React.useState(false)
  const { name, color } = project
  const icon = projectIcon(project.icon)

  if (rename.renaming) {
    return (
      <SidebarMenuItem>
        <RenameField
          value={name}
          label="Название проекта"
          maxLength={PROJECT_NAME_MAX}
          icon={icon}
          color={projectColor(color)}
          onDone={(next) => {
            rename.stop()
            if (next) updateProject(project.id, { name: next })
          }}
        />
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible open={expanded} onOpenChange={(open) => {
      setInstant(lastInput() === "keyboard")
      onOpenChange(open)
    }} asChild>
      <li className="group/project" data-instant={instant}>
        {/* Keep hover/focus scoped to the header, outside the nested chat list. */}
        <div className="sidebar-project-row relative">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={active}
              aria-current={active ? "page" : undefined}
              className={cn(ROW, "pr-(--project-action-space)")}
            >
              <HugeiconsIcon strokeWidth={ICON_STROKE} icon={icon} color={projectColor(color)} />
              <MarqueeLabel text={name} />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          {/* A new chat in a project starts from the project's page, like ChatGPT. */}
          <SidebarMenuAction
            data-project-action=""
            aria-label={`Новый чат в проекте «${name}»`}
            onClick={() => actions.select(project.id)}
            className={cn(ACTION, "right-8")}
          >
            <HugeiconsIcon strokeWidth={ICON_STROKE} icon={NEW_CHAT_ICON} />
          </SidebarMenuAction>
          <AppMenu>
            <AppMenuTrigger asChild>
              <SidebarMenuAction data-project-action="" aria-label={`Действия с проектом «${name}»`} className={cn(ACTION, "right-1.5")}>
                <HugeiconsIcon strokeWidth={ICON_STROKE} icon={MoreHorizontalIcon} />
              </SidebarMenuAction>
            </AppMenuTrigger>
            <AppMenuContent side="bottom" align="start" onCloseAutoFocus={rename.onCloseAutoFocus}>
              <ProjectMenuItems project={project} pinned={pinned} onRename={rename.start} showOpen />
            </AppMenuContent>
          </AppMenu>
        </div>
        {/* Radix disables transitions on its measured element. Animate an inner grid instead,
            keeping it mounted so rapid toggles reverse smoothly. Closed chats leave the tab order. */}
        <CollapsibleContent
          forceMount
          inert={!expanded}
          aria-hidden={!expanded}
        >
          <div
            data-open={expanded}
            className="grid transition-[grid-template-rows,opacity] duration-(--sidebar-duration) ease-(--ease-out) data-[open=false]:grid-rows-[0fr] data-[open=false]:opacity-0 data-[open=false]:duration-(--duration-fast) data-[open=true]:grid-rows-[1fr] motion-reduce:transition-none group-data-[instant=true]/project:transition-none"
          >
            <div className="min-h-0 overflow-hidden">
              <div className="relative py-1">
                <span aria-hidden="true" className="pointer-events-none absolute top-1 bottom-1 left-[18px] w-px rounded-full" style={{ backgroundColor: projectColor(color) }} />
                {children}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </li>
    </Collapsible>
  )
}

function ChatItem({
  chat,
  indent = false,
  active,
  pinned,
}: {
  chat: Chat
  indent?: boolean
  active: boolean
  /* A pinned row shows a filled pin beside «⋯» (ChatGPT): one tap unpins. */
  pinned: boolean
}) {
  const { renameChat, togglePin } = useHub()
  const actions = useSidebarActions()
  const rename = useRename()

  if (rename.renaming) {
    return (
      <SidebarMenuItem>
        <RenameField
          value={chat.title}
          label="Название чата"
          className={indent ? "ml-7 w-[calc(100%-28px)]" : undefined}
          onDone={(next) => {
            rename.stop()
            if (next) renameChat(chat.id, next)
          }}
        />
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        aria-current={active ? "page" : undefined}
        onClick={() => actions.select(chat.id)}
        className={cn(
          ROW,
          indent && INDENT,
          // Room for the actions while they show: one («⋯») or two (pin + «⋯») on a pinned row.
          pinned
            ? "pr-14 md:pointer-fine:pr-[9px] md:pointer-fine:group-hover/menu-item:pr-14 md:pointer-fine:group-focus-within/menu-item:pr-14 md:pointer-fine:group-has-data-[state=open]/menu-item:pr-14"
            : "pr-8 md:pointer-fine:pr-[9px] md:pointer-fine:group-hover/menu-item:pr-8 md:pointer-fine:group-focus-within/menu-item:pr-8 md:pointer-fine:group-has-data-[state=open]/menu-item:pr-8"
        )}
      >
        {/* Pinned chats carry a speech bubble (ChatGPT), next to the folders of pinned projects. */}
        {pinned && <HugeiconsIcon strokeWidth={ICON_STROKE} icon={MessageCircleIcon} />}
        <MarqueeLabel text={chat.title} />
      </SidebarMenuButton>
      {/* The pin is a flat silhouette in the muted text grey (the user's asks, 27.09: first the tray's
          bg-muted, which read as white on the grey row — now the grey of secondary text, both themes).
          The colour sits on the glyph, so the library's hover and active-row darkening don't reach it,
          and it is opaque, so the stroke doesn't show as a darker ring over the fill. */}
      {pinned && (
        <SidebarMenuAction
          aria-label={`Открепить чат «${chat.title}»`}
          onClick={() => togglePin(`chat:${chat.id}`)}
          className={cn(ACTION, HOVER_ONLY, "right-8")}
        >
          <HugeiconsIcon strokeWidth={ICON_STROKE} icon={PinIcon} className="fill-current text-muted-foreground" />
        </SidebarMenuAction>
      )}
      <AppMenu>
        <AppMenuTrigger asChild>
          <SidebarMenuAction aria-label={`Действия с чатом «${chat.title}»`} className={cn(ACTION, HOVER_ONLY, "right-1.5")}>
            <HugeiconsIcon strokeWidth={ICON_STROKE} icon={MoreHorizontalIcon} />
          </SidebarMenuAction>
        </AppMenuTrigger>
        <AppMenuContent side="bottom" align="start" onCloseAutoFocus={rename.onCloseAutoFocus}>
          <ChatMenuItems chat={chat} pinned={pinned} onRename={rename.start} />
        </AppMenuContent>
      </AppMenu>
    </SidebarMenuItem>
  )
}

function SidebarSection({
  label,
  open,
  onOpenChange,
  actions,
  className,
  children,
}: {
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const [instant, setInstant] = React.useState(false)

  return (
    <Collapsible open={open} onOpenChange={(next) => {
      setInstant(lastInput() === "keyboard")
      onOpenChange(next)
    }} className="group/section">
      <SidebarGroup className={cn("px-1.5 pt-3", className)}>
        <SidebarGroupLabel asChild className="h-8 w-fit gap-1 px-[9px] text-sm font-normal text-sidebar-muted-foreground hover:text-sidebar-foreground">
          <CollapsibleTrigger>
            {label}
            {/* With a mouse on desktop the chevron shows only while the section is hovered or the heading has
                keyboard focus (ChatGPT); on touch it stays. */}
            <HugeiconsIcon
              strokeWidth={ICON_STROKE}
              icon={ArrowRight01Icon}
              className="size-3.5! transition-[rotate,opacity] duration-200 ease-(--ease-out) group-data-[state=open]/section:rotate-90 motion-reduce:transition-none md:pointer-fine:opacity-0 md:pointer-fine:group-hover/section:opacity-100 md:pointer-fine:in-focus-visible:opacity-100"
            />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        {actions}
        <CollapsibleContent forceMount inert={!open} aria-hidden={!open}>
          <div
            data-open={open}
            className={cn("grid transition-[grid-template-rows] duration-(--sidebar-duration) ease-(--ease-out) data-[open=false]:grid-rows-[0fr] data-[open=false]:duration-(--duration-fast) data-[open=true]:grid-rows-[1fr] motion-reduce:transition-none", instant && "transition-none")}
          >
            <SidebarGroupContent className="min-h-0 overflow-hidden">
              <SidebarMenu>{children}</SidebarMenu>
            </SidebarGroupContent>
          </div>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

/* Demo account until auth lands. Initials stay legible on the primary colour in both themes. */
const USER = { initials: "М", plan: "Бесплатный" }

function UserAvatar({ className }: { className?: string }) {
  return (
    <Avatar aria-hidden="true" className={cn("rounded-full after:hidden", className)}>
      <AvatarFallback className="rounded-[inherit] bg-primary text-xs font-semibold text-primary-foreground">{USER.initials}</AvatarFallback>
    </Avatar>
  )
}

const ACCOUNT_LINKS: { id: string; label: string; icon: IconSvgElement }[] = [
  { id: "subscription", label: "Подписка", icon: CreditCardIcon },
  { id: "referral", label: "Партнёрская программа", icon: UserGroupIcon },
  { id: "billing", label: "История списаний", icon: TransactionHistoryIcon },
  { id: "memory", label: "Память", icon: AiBrain01Icon },
]

const THEMES: { value: Theme; label: string; icon: IconSvgElement }[] = [
  { value: "system", label: "Системная", icon: ComputerIcon },
  { value: "dark", label: "Тёмная", icon: Moon02Icon },
  { value: "light", label: "Светлая", icon: Sun03Icon },
]

/* «Тема» in the account menu (the user's ask, 27.09): the row wears the current choice's icon and
   names it on the right, the submenu picks one of three; «Системная» follows the OS. */
function ThemeMenu() {
  const [theme, setTheme] = useTheme()
  const current = THEMES.find((item) => item.value === theme) ?? THEMES[0]

  return (
    <AppMenuSub>
      <AppMenuSubTrigger icon={current.icon}>
        <span className="flex-1">Тема</span>
        <span className="text-muted-foreground!">{current.label}</span>
      </AppMenuSubTrigger>
      <AppMenuSubContent title="Тема" className="min-w-44">
        <AppMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
          {THEMES.map(({ value, label, icon }) => (
            <AppMenuRadioItem key={value} value={value} icon={icon}>
              {label}
            </AppMenuRadioItem>
          ))}
        </AppMenuRadioGroup>
      </AppMenuSubContent>
    </AppMenuSub>
  )
}

function AccountMenu({
  collapsed,
  onSelect,
}: {
  collapsed: boolean
  onSelect: (id: string) => void
}) {
  const { isMobile } = useSidebar()
  const { authenticated, requireAuth, signOut, session } = useAuth()
  const name = session ? authAccountName(session) : ""

  if (!authenticated && collapsed) return null
  if (!authenticated) return (
    <Button onClick={() => requireAuth()} className="h-10 w-full rounded-full" aria-label="Войти">
      Войти
    </Button>
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AppMenu>
          <AppMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip="Аккаунт"
              aria-label={`Аккаунт: ${name}, ${USER.plan}`}
              className="gap-2.5 rounded-[10px] px-[9px] data-[state=open]:bg-sidebar-accent group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0"
            >
              <UserAvatar className="size-7 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:rounded-[10px]" />
              <span className="sidebar-fade grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm">{name}</span>
                <span className="truncate text-xs text-sidebar-muted-foreground">{USER.plan}</span>
              </span>
            </SidebarMenuButton>
          </AppMenuTrigger>
          <AppMenuContent
            side={isMobile ? "top" : collapsed ? "right" : "top"}
            align={collapsed ? "end" : "start"}
            sideOffset={8}
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60"
          >
            <AppMenuItem onSelect={() => onSelect("profile")} className="h-auto py-2 pl-2.5">
              <UserAvatar className="size-8" />
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate">{name}</span>
                <span className="truncate text-muted-foreground!">{USER.plan}</span>
              </span>
              <HugeiconsIcon strokeWidth={ICON_STROKE} icon={ArrowRight01Icon} className="text-muted-foreground!" />
            </AppMenuItem>
            <AppMenuSeparator />
            {ACCOUNT_LINKS.map(({ id, label, icon }) => (
              <AppMenuItem key={id} icon={icon} onSelect={() => onSelect(id)}>
                {label}
              </AppMenuItem>
            ))}
            <ThemeMenu />
            <AppMenuSeparator />
            <AppMenuItem icon={Logout03Icon} onSelect={() => { signOut(); onSelect(NEW_CHAT) }}>Выйти</AppMenuItem>
          </AppMenuContent>
        </AppMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({
  active,
  onSelect,
}: {
  active: string
  onSelect: (id: string) => void
}) {
  const { state, isMobile, setOpenMobile } = useSidebar()
  const collapsed = state === "collapsed" && !isMobile
  const hub = useHub()
  const { authenticated } = useAuth()
  const [sections, setSections] = useStoredState<Record<SectionId, boolean>>("ai-hub:sidebar-sections", {
    pinned: true,
    projects: true,
    chats: true,
  })
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [archive, setArchive] = React.useState<{ open: boolean; tab: "chats" | "projects" }>({ open: false, tab: "chats" })

  /* The rail can't scroll, so collapsing brings the nav rows back into view. */
  React.useEffect(() => {
    const content = contentRef.current
    if (!collapsed || !content) return
    content.scrollTop = 0
    content.removeAttribute("data-scrolled")
  }, [collapsed])

  const select = React.useCallback(
    (id: string) => {
      onSelect(id)
      if (isMobile) setOpenMobile(false)
    },
    [onSelect, isMobile, setOpenMobile]
  )

  const entity = useEntityActions()
  const actions: SidebarActions = { ...entity, select }

  const { pins } = hub
  const isPinned = (key: PinKey) => pins.includes(key)
  const liveChats = hub.chats.filter((chat) => !chat.archived)
  const liveProjects = hub.projects.filter((project) => !project.archived)
  const [expandedProjects, setExpandedProjects] = React.useState<Record<string, boolean>>({})

  /* A pinned item leaves its own list and comes back in place when unpinned. */
  const pinned = pins.flatMap((key): PinnedItem[] => {
    const [kind, id] = key.split(":")
    const chat = kind === "chat" && liveChats.find((item) => item.id === id)
    if (chat) return [{ key, kind: "chat", chat }]
    const project = kind === "project" && liveProjects.find((item) => item.id === id)
    return project ? [{ key, kind: "project", project }] : []
  })
  const projects = liveProjects.filter((project) => !isPinned(`project:${project.id}`))
  // «Недавние чаты» lists the text tool's history; a pinned chat of any kind stays under «Закреплённые».
  const chats = liveChats.filter((chat) => chat.type === HISTORY_TYPE && !chat.projectId && !isPinned(`chat:${chat.id}`))

  const sectionProps = (id: SectionId) => ({
    open: sections[id] ?? true,
    onOpenChange: (open: boolean) => {
      setSections((prev) => ({ ...prev, [id]: open }))
      if (!open && id !== "chats") {
        const sectionProjects = id === "projects" ? projects : liveProjects.filter((project) => isPinned(`project:${project.id}`))
        setExpandedProjects((prev) => ({
          ...prev,
          // Explicit false also overrides automatic expansion of the currently selected project.
          ...Object.fromEntries(sectionProjects.map((project) => [project.id, false])),
        }))
      }
    },
  })

  /* The open project (or the project of the open chat) lists its chats right under its row. */
  const openProjectId =
    liveChats.find((chat) => chat.id === active)?.projectId ??
    (liveProjects.some((project) => project.id === active) ? active : undefined)

  const renderProject = (project: Project, projectPinned: boolean) => {
    const children = liveChats.filter((chat) => chat.projectId === project.id)
    const expanded = expandedProjects[project.id] ?? openProjectId === project.id
    return (
      <ProjectItem key={project.id} project={project} active={active === project.id} pinned={projectPinned}
        expanded={expanded}
        onOpenChange={(open) => {
          setExpandedProjects((prev) => ({ ...prev, [project.id]: open }))
        }}
      >
        {children.length ? (
          <SidebarMenu aria-label={`Чаты проекта «${project.name}»`}>
            {children.map((chat) => <ChatItem key={chat.id} chat={chat} indent active={active === chat.id} pinned={isPinned(`chat:${chat.id}`)} />)}
          </SidebarMenu>
        ) : (
          <Empty className="items-start gap-1 rounded-none py-1 pr-3 pl-[37px] text-left text-wrap">
            <EmptyDescription className="text-sm leading-5">Пока нет чатов</EmptyDescription>
          </Empty>
        )}
      </ProjectItem>
    )
  }

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      const key = event.key.toLowerCase()
      if (key === "k" && !event.shiftKey) {
        event.preventDefault()
        setSearchOpen((open) => !open)
      } else if (key === "o" && event.shiftKey) {
        event.preventDefault()
        select(NEW_CHAT)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [select])


  return (
    <SidebarActionsContext.Provider value={actions}>
      <Sidebar collapsible="icon" variant="inset" className="p-0">
        {/* The brand and new-chat action stay outside the scrolling navigation. */}
        <SidebarHeader className="gap-2 px-3.5 pt-3.5 pb-0">
          <Brand
            collapsed={collapsed}
            onHome={() => select(NEW_CHAT)}
            onSearch={() => setSearchOpen(true)}
          />
          <SidebarNewChat active={active} onSelect={select} />
        </SidebarHeader>

        {/* The top edge fades only once something has scrolled under the header. */}
        <SidebarContent
          ref={contentRef}
          onScroll={(event) => event.currentTarget.toggleAttribute("data-scrolled", event.currentTarget.scrollTop > 0)}
          className="px-2 mask-b-from-[calc(100%-24px)] data-scrolled:mask-t-from-[calc(100%-12px)]"
        >
          <SidebarNav active={active} collapsed={collapsed} onSelect={select} onSearch={() => setSearchOpen(true)} />

          {/* Lists are rail-less: they fade out and leave the tab order when the panel collapses. */}
          {SHOW_HISTORY && (
          <div className="sidebar-fade" inert={collapsed}>
            {pinned.length > 0 && (
              <SidebarSection label="Закреплённые" {...sectionProps("pinned")}>
                {pinned.map((item) =>
                  item.kind === "chat" ? (
                    <ChatItem key={item.key} chat={item.chat} active={active === item.chat.id} pinned />
                  ) : (
                    renderProject(item.project, true)
                  )
                )}
              </SidebarSection>
            )}

            {SHOW_PROJECT_LIST && projects.length > 0 && (
              <SidebarSection
                label="Проекты"
                {...sectionProps("projects")}
                actions={
                  <>
                    {/* With projects the list stays clean and "+" lives in the header (ChatGPT). */}
                    <SidebarGroupAction
                      aria-label="Новый проект"
                      onClick={() => actions.openProjectDialog()}
                      className={cn(ACTION, SECTION_ACTION, "right-10")}
                    >
                      <HugeiconsIcon strokeWidth={ICON_STROKE} icon={Add01Icon} />
                    </SidebarGroupAction>
                    <AppMenu>
                      <AppMenuTrigger asChild>
                        <SidebarGroupAction aria-label="Действия с проектами" className={cn(ACTION, SECTION_ACTION, "right-3")}>
                          <HugeiconsIcon strokeWidth={ICON_STROKE} icon={MoreHorizontalIcon} />
                        </SidebarGroupAction>
                      </AppMenuTrigger>
                      <AppMenuContent side="bottom" align="end">
                        <AppMenuItem icon={Archive01Icon} onSelect={() => setArchive({ open: true, tab: "projects" })}>
                          Архив проектов
                        </AppMenuItem>
                      </AppMenuContent>
                    </AppMenu>
                  </>
                }
              >
                {projects.map((project) => renderProject(project, false))}
              </SidebarSection>
            )}

            {/* No projects yet: no heading, just the row that starts one. */}
            {SHOW_PROJECT_LIST && projects.length === 0 && (
              <SidebarGroup className="px-1.5 pt-3">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => actions.openProjectDialog()} className={ROW}>
                      <HugeiconsIcon strokeWidth={ICON_STROKE} icon={FolderAddIcon} />
                      <span className={LABEL}>Новый проект</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            )}

            {authenticated && <SidebarSection
              label="Недавние чаты"
              className="pb-6"
              {...sectionProps("chats")}
              actions={
                <>
                  <AppMenu>
                    <AppMenuTrigger asChild>
                      <SidebarGroupAction aria-label="Действия с историей чатов" className={cn(ACTION, SECTION_ACTION, "right-3")}>
                        <HugeiconsIcon strokeWidth={ICON_STROKE} icon={MoreHorizontalIcon} />
                      </SidebarGroupAction>
                    </AppMenuTrigger>
                    <AppMenuContent side="bottom" align="end">
                      <AppMenuItem icon={Archive01Icon} onSelect={() => setArchive({ open: true, tab: "chats" })}>
                        Архив чатов
                      </AppMenuItem>
                      <AppMenuSeparator />
                      <AppMenuItem
                        icon={Delete02Icon}
                        variant="destructive"
                        disabled={chats.length === 0}
                        onSelect={() => actions.confirmDelete({ kind: "history", count: chats.length })}
                      >
                        Очистить историю
                      </AppMenuItem>
                    </AppMenuContent>
                  </AppMenu>
                </>
              }
            >
              {chats.length === 0 && (
                <SidebarMenuItem>
                  <p className="px-[9px] py-2 text-sm text-sidebar-muted-foreground">Здесь появятся ваши чаты</p>
                </SidebarMenuItem>
              )}
              {chats.map((chat) => (
                <ChatItem key={chat.id} chat={chat} active={active === chat.id} pinned={false} />
              ))}
            </SidebarSection>}
          </div>
          )}
        </SidebarContent>

        <SidebarFooter className="px-3.5 pt-2 pb-3.5">
          <AccountMenu collapsed={collapsed} onSelect={select} />
        </SidebarFooter>

        <ChatSearch
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onSelect={(id) => {
            setSearchOpen(false)
            select(id)
          }}
        />

        <ArchiveDialog
          open={archive.open}
          onOpenChange={(open) => setArchive((prev) => ({ ...prev, open }))}
          tab={archive.tab}
          onTabChange={(tab) => setArchive((prev) => ({ ...prev, tab }))}
          onOpenChat={(id) => {
            setArchive((prev) => ({ ...prev, open: false }))
            select(id)
          }}
        />

      </Sidebar>
    </SidebarActionsContext.Provider>
  )
}
