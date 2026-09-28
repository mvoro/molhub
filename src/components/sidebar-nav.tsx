import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { MoreHorizontalIcon, Search01Icon } from "@hugeicons/core-free-icons"

import { SETTING_ICON } from "@/components/chat-composer/icons"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Hotkey, LABEL, ROW } from "@/components/sidebar-row"
import { MORE_TOOLS, NEW_CHAT, TOOLS } from "@/data/tools"
import { useStoredState } from "@/hooks/use-stored-state"
import { ICON_STROKE, NEW_CHAT_ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

/* Krea-style navigation: «Новый чат» and places on top, then tools (data/tools.ts); rarer tools
   wait under «Больше». The places use outline Hugeicons glyphs, the tools their colour tiles from
   public/icons/sm (the user's choice, 26.09 evening). */
type NavItem = {
  id: string
  label: string
  icon: string | IconSvgElement
  /* An action row (ChatGPT's «Новый чат»): it opens something but is never the current place. */
  action?: boolean
  hotkey?: { keys: string[]; aria: string }
}

// «Новый чат» opens the text tool — the default screen; there is no separate home page (26.09).
const NEW_CHAT_ITEM: NavItem = { id: NEW_CHAT, label: "Новый чат", icon: NEW_CHAT_ICON, action: true, hotkey: { keys: ["⇧", "⌘", "O"], aria: "Shift+Meta+O Shift+Control+O" } }
/* Roles belong to the text chat, so they sit next to «Новый чат» (where ChatGPT keeps its GPTs), with the glyph
   of the role setting in the composer's «+». Projects moved to their own section under the tools (app-sidebar). */
const ROLES_ITEM: NavItem = { id: "roles", label: "Роли", icon: SETTING_ICON.role }

const toolItems = (tools: { id: string; label: string; icon: string }[]): NavItem[] =>
  tools.map((tool) => ({ id: tool.id, label: tool.label, icon: tool.icon }))

/* A 20px tile in the rows' 18px icon slot: -mx-px keeps labels and the rail centre where the other rows have them.
   max-w-none: preflight caps images at 100%, and the rail's content box is only 18px wide. */
function NavIcon({ src }: { src: string }) {
  return <img src={src} alt="" width={20} height={20} draggable={false} className="-mx-px size-5 max-w-none shrink-0 select-none" />
}

function NavRow({ item, active, onSelect }: { item: NavItem; active: string; onSelect: (id: string) => void }) {
  const current = !item.action && active === item.id
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.hotkey ? { children: <>{item.label} <Hotkey keys={item.hotkey.keys} /></> } : item.label}
        isActive={current}
        aria-current={current ? "page" : undefined}
        aria-keyshortcuts={item.hotkey?.aria}
        onClick={() => onSelect(item.id)}
        className={ROW}
      >
        {typeof item.icon === "string" ? <NavIcon src={item.icon} /> : <HugeiconsIcon strokeWidth={ICON_STROKE} icon={item.icon} />}
        <span className={LABEL}>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/* Search sits in the header while the panel is open; in the rail it drops in as the third row, under «Роли».
   sidebar-reveal grows the row in step with the panel (the header button fades out meanwhile),
   so the rows below glide instead of jumping. */
function RailSearch({ collapsed, onSearch }: { collapsed: boolean; onSearch: () => void }) {
  return (
    <SidebarMenuItem className="sidebar-reveal" inert={!collapsed}>
      <div>
        <SidebarMenuButton
          tooltip={{ children: <>Поиск <Hotkey keys={["⌘", "K"]} /></> }}
          aria-keyshortcuts="Meta+K Control+K"
          onClick={onSearch}
          className={ROW}
        >
          <HugeiconsIcon strokeWidth={ICON_STROKE} icon={Search01Icon} />
          <span className={LABEL}>Поиск</span>
        </SidebarMenuButton>
      </div>
    </SidebarMenuItem>
  )
}

export function SidebarNewChat({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <SidebarMenu>
      <NavRow item={NEW_CHAT_ITEM} active={active} onSelect={onSelect} />
    </SidebarMenu>
  )
}

export function SidebarNav({
  active,
  collapsed,
  onSelect,
  onSearch,
}: {
  active: string
  collapsed: boolean
  onSelect: (id: string) => void
  onSearch: () => void
}) {
  const [moreOpen, setMoreOpen] = useStoredState("ai-hub:sidebar-more", false)
  const moreId = React.useId()
  const moreLabel = moreOpen ? "Меньше" : "Больше"

  return (
    <>
      <SidebarGroup className="px-1.5 pt-0 pb-2">
        <SidebarMenu>
          <NavRow item={ROLES_ITEM} active={active} onSelect={onSelect} />
          <RailSearch collapsed={collapsed} onSearch={onSearch} />
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="px-1.5 pt-3 pb-2">
        {/* The heading folds away with the panel, so the rail keeps just a small gap between places and tools. */}
        <div className="sidebar-conceal">
          <div>
            {/* Same type as the history section headings («Закреплённые», «Недавние чаты»). */}
            <SidebarGroupLabel className="h-8 px-[9px] text-sm font-normal text-sidebar-muted-foreground">
              Инструменты
            </SidebarGroupLabel>
          </div>
        </div>
        <SidebarMenu>
          {/* The text tool is «Новый чат» above, so it is not repeated here (chips and ⌘K still list it). */}
          {toolItems(TOOLS.filter((item) => item.id !== NEW_CHAT)).map((item) => (
            <NavRow key={item.id} item={item} active={active} onSelect={onSelect} />
          ))}

          {/* Extra tools slide in above the toggle, which moves down and turns into «Меньше» (as in Krea).
              grid-rows transition instead of keyframes: interruptible, and closing is faster than opening. */}
          <SidebarMenuItem>
            <Collapsible open={moreOpen} onOpenChange={setMoreOpen}>
              <CollapsibleContent
                id={moreId}
                forceMount
                inert={!moreOpen}
                className="grid transition-[grid-template-rows] duration-200 ease-(--ease-out) data-[state=closed]:grid-rows-[0fr] data-[state=closed]:duration-150 data-[state=open]:grid-rows-[1fr] motion-reduce:transition-none"
              >
                <SidebarMenu className="min-h-0 overflow-hidden">
                  {toolItems(MORE_TOOLS).map((item) => (
                    <NavRow key={item.id} item={item} active={active} onSelect={onSelect} />
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={moreOpen ? "Скрыть инструменты" : "Больше инструментов"}
              aria-expanded={moreOpen}
              aria-controls={moreId}
              onClick={() => setMoreOpen((open) => !open)}
              className={cn(ROW, "text-sidebar-muted-foreground hover:text-sidebar-foreground")}
            >
              <HugeiconsIcon strokeWidth={ICON_STROKE} icon={MoreHorizontalIcon} />
              <span className={LABEL}>{moreLabel}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
