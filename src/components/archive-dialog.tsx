import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Archive02Icon,
  ArchiveRestoreIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  AppSheet,
  AppSheetContent,
  AppSheetDescription,
  AppSheetHeader,
  AppSheetTitle,
} from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia } from "@/components/ui/item"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useHub } from "@/hooks/use-hub"
import { CHAT_TYPE_ICON, ICON_STROKE, projectIcon } from "@/lib/icons"
import { projectColor } from "@/lib/project-colors"
import { cn } from "@/lib/utils"

type ArchiveTab = "chats" | "projects"

type PendingDelete = { kind: "chat" | "project"; id: string; title: string; chatCount: number }

const chatsWord = (count: number) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return "чат"
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "чата"
  return "чатов"
}

/* Archived chats and projects in the app modal (AppSheet: bottom sheet on mobile, centered
   640px dialog on desktop). Fixed height, so switching tabs or emptying a list doesn't jump. Rows restore or delete for good;
   deleting always goes through a confirmation. */
export function ArchiveDialog({
  open,
  onOpenChange,
  tab,
  onTabChange,
  onOpenChat,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tab: ArchiveTab
  onTabChange: (tab: ArchiveTab) => void
  onOpenChat: (id: string) => void
}) {
  const { chats, projects, restore, deleteChat, deleteProject } = useHub()
  // Target outlives the open flag so the confirmation text doesn't flip during its exit animation.
  const [pending, setPending] = React.useState<PendingDelete | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const askDelete = (target: PendingDelete) => {
    setPending(target)
    setConfirmOpen(true)
  }

  const archivedChats = chats.filter((chat) => chat.archived)
  const archivedProjects = projects.filter((project) => project.archived)
  const projectName = (id?: string) => projects.find((project) => project.id === id)?.name

  const restoreItem = (kind: "chat" | "project", id: string) => {
    restore(kind, id)
    toast(kind === "chat" ? "Чат восстановлен" : "Проект восстановлен")
  }

  const confirmDelete = () => {
    if (!pending) return
    if (pending.kind === "chat") deleteChat(pending.id)
    else deleteProject(pending.id)
    toast(pending.kind === "chat" ? "Чат удалён" : "Проект удалён")
  }

  const tabs: { value: ArchiveTab; label: string; count: number }[] = [
    { value: "chats", label: "Чаты", count: archivedChats.length },
    { value: "projects", label: "Проекты", count: archivedProjects.length },
  ]

  return (
    <>
      <AppSheet open={open} onOpenChange={onOpenChange}>
        <AppSheetContent className="max-md:h-[85dvh] md:h-[min(560px,calc(100dvh-8rem))] md:max-w-[640px]">
          <AppSheetHeader closeLabel="Закрыть архив" className="pb-3">
            <AppSheetTitle>Архив</AppSheetTitle>
            <AppSheetDescription className="sr-only">
              Архивные чаты и проекты: восстановите или удалите навсегда
            </AppSheetDescription>
          </AppSheetHeader>

          <Tabs
            value={tab}
            onValueChange={(value) => onTabChange(value as ArchiveTab)}
            className="min-h-0 flex-1 flex-col gap-0"
          >
            <div className="shrink-0 px-5 pb-3 md:px-6">
              <TabsList>
                {tabs.map(({ value, label, count }) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                    {count > 0 && (
                      <span className="text-muted-foreground tabular-nums">{count}</span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="chats" className="min-h-0 flex-col overflow-y-auto overscroll-contain px-3 pb-3 data-[state=active]:flex md:px-4">
              {archivedChats.length === 0 ? (
                <ArchiveEmpty kind="chats" />
              ) : (
                <ItemGroup className="gap-0">
                  {archivedChats.map((chat) => {
                    const project = projectName(chat.projectId)
                    return (
                      <ArchiveRow
                        key={chat.id}
                        icon={CHAT_TYPE_ICON[chat.type]}
                        title={chat.title}
                        description={project}
                        onOpen={() => onOpenChat(chat.id)}
                        onRestore={() => restoreItem("chat", chat.id)}
                        onDelete={() => askDelete({ kind: "chat", id: chat.id, title: chat.title, chatCount: 0 })}
                      />
                    )
                  })}
                </ItemGroup>
              )}
            </TabsContent>

            <TabsContent value="projects" className="min-h-0 flex-col overflow-y-auto overscroll-contain px-3 pb-3 data-[state=active]:flex md:px-4">
              {archivedProjects.length === 0 ? (
                <ArchiveEmpty kind="projects" />
              ) : (
                <ItemGroup className="gap-0">
                  {archivedProjects.map((project) => {
                    const chatCount = chats.filter((chat) => chat.projectId === project.id).length
                    return (
                      <ArchiveRow
                        key={project.id}
                        icon={projectIcon(project.icon)}
                        iconColor={projectColor(project.color)}
                        title={project.name}
                        description={chatCount > 0 ? `${chatCount} ${chatsWord(chatCount)}` : "Без чатов"}
                        onRestore={() => restoreItem("project", project.id)}
                        onDelete={() =>
                          askDelete({ kind: "project", id: project.id, title: project.name, chatCount })
                        }
                      />
                    )
                  })}
                </ItemGroup>
              )}
            </TabsContent>
          </Tabs>
        </AppSheetContent>
      </AppSheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pending?.kind === "project" ? "Удалить проект?" : "Удалить чат?"}
        description={
          pending?.kind === "project"
            ? // The same consequences as the menu's (spec D10): the media stays, unlinked, in the studios.
              `Проект «${pending.title}», его чаты, инструкции и файлы удалятся навсегда. Фото, видео и песни останутся в студиях.`
            : `Чат «${pending?.title}» будет удалён навсегда. Восстановить его не получится.`
        }
        actionLabel="Удалить навсегда"
        onConfirm={confirmDelete}
      />
    </>
  )
}

/* One archived chat or project. For chats the title is a stretched button, so the whole row
   opens the chat while the actions stay separate, reachable buttons. */
function ArchiveRow({
  icon,
  iconColor,
  title,
  description,
  onOpen,
  onRestore,
  onDelete,
}: {
  icon: IconSvgElement
  iconColor?: string
  title: string
  description?: string
  onOpen?: () => void
  onRestore: () => void
  onDelete: () => void
}) {
  return (
    <Item
      role="listitem"
      size="sm"
      className={cn(
        "relative min-h-12 gap-3 rounded-xl py-1 pr-1.5 pl-3 transition-colors duration-75",
        onOpen && "hover:bg-muted has-[[data-row-open]:active]:bg-muted"
      )}
    >
      <ItemMedia variant="icon">
        <HugeiconsIcon
          icon={icon}
          strokeWidth={ICON_STROKE}
          color={iconColor ?? "currentColor"}
          className="size-5 text-foreground"
        />
      </ItemMedia>
      <ItemContent className="min-w-0 gap-0.5">
        {onOpen ? (
          <Button
            variant="ghost"
            data-row-open=""
            onClick={onOpen}
            className="static block h-auto w-full truncate rounded-none border-0 p-0 text-left text-base font-normal hover:bg-transparent focus-visible:ring-0 active:scale-none motion-reduce:active:scale-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50 md:text-sm"
          >
            {title}
          </Button>
        ) : (
          <span className="truncate text-base md:text-sm">{title}</span>
        )}
        {description && <ItemDescription className="line-clamp-1 text-sm md:text-xs">{description}</ItemDescription>}
      </ItemContent>
      <ItemActions className="relative z-10 gap-0.5">
        <RowAction icon={ArchiveRestoreIcon} label="Восстановить" onClick={onRestore} onMutedRow={Boolean(onOpen)} />
        <RowAction icon={Delete02Icon} label="Удалить навсегда" onClick={onDelete} destructive />
      </ItemActions>
    </Item>
  )
}

function RowAction({
  icon,
  label,
  onClick,
  destructive,
  onMutedRow,
}: {
  icon: IconSvgElement
  label: string
  onClick: () => void
  destructive?: boolean
  /* The row itself turns muted on hover, so the neutral action lifts to the canvas colour. */
  onMutedRow?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={label}
          onClick={onClick}
          className={cn(
            "rounded-full text-muted-foreground active:translate-y-0 active:scale-[0.96] max-md:size-10 [&_svg]:size-[18px]",
            destructive
              ? "hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
              : cn(
                  "hover:bg-muted hover:text-foreground",
                  onMutedRow && "group-hover/item:hover:bg-background dark:group-hover/item:hover:bg-background"
                )
          )}
        >
          <HugeiconsIcon icon={icon} strokeWidth={ICON_STROKE} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-md:hidden">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function ArchiveEmpty({ kind }: { kind: ArchiveTab }) {
  return (
    <Empty className="p-8">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-10 rounded-xl [&_svg]:size-5">
          <HugeiconsIcon icon={Archive02Icon} strokeWidth={ICON_STROKE} />
        </EmptyMedia>
        <EmptyTitle className="text-base">В архиве пусто</EmptyTitle>
        <EmptyDescription>
          {kind === "chats"
            ? "Чаты, которые вы уберёте в архив, появятся здесь. Их можно открыть, вернуть в историю или удалить."
            : "Проекты, которые вы уберёте в архив, появятся здесь вместе со своими чатами."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
