
import { ChatMenuItems } from "@/components/entity-menus"
import { RenameField, useRename } from "@/components/rename-field"
import { AppMenu, AppMenuContent, AppMenuTrigger } from "@/components/ui/app-menu"
import { Button } from "@/components/ui/button"
import { MoreActionButton } from "@/components/more-action-button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemActions, ItemContent, ItemDescription } from "@/components/ui/item"
import type { Chat, Project } from "@/data/chats"
import { useHub } from "@/hooks/use-hub"
import { formatListDate } from "@/lib/project-dates"
import { cn } from "@/lib/utils"

/* «Чаты» of a project page (ChatGPT): title, the last line said in grey, the date on the right; newest
   first, dateless old chats last. The whole row opens the chat; «⋯» is the chat's usual menu — on hover
   or focus with a mouse, always on touch — with room kept for it, so the date never shifts. The rows keep to
   the edges of the composer and the tabs (the user's ask, 27.09): the text sits inside, not on the line. */
export function ProjectChats({ project, onSelect }: { project: Project; onSelect: (id: string) => void }) {
  const { chats, pins } = useHub()
  const list = chats
    .filter((chat) => chat.projectId === project.id && !chat.archived)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))

  if (list.length === 0) {
    return (
      <Empty className="px-6 py-14">
        <EmptyHeader>
          {project.archived ? (
            // An archived project takes no new chats (its composer is «Восстановить»): no call to write.
            <EmptyTitle className="text-base">В проекте нет чатов</EmptyTitle>
          ) : (
            <>
              <EmptyTitle className="text-base">Здесь появятся чаты проекта</EmptyTitle>
              <EmptyDescription>Напишите первое сообщение{"\u00a0"}— Молли учтёт инструкции и файлы проекта.</EmptyDescription>
            </>
          )}
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div role="list" aria-label="Чаты проекта" className="flex flex-col">
      {list.map((chat) => (
        <ChatRow key={chat.id} chat={chat} pinned={pins.includes(`chat:${chat.id}`)} onOpen={() => onSelect(chat.id)} />
      ))}
    </div>
  )
}

function ChatRow({ chat, pinned, onOpen }: { chat: Chat; pinned: boolean; onOpen: () => void }) {
  const { renameChat } = useHub()
  const rename = useRename()
  const date = formatListDate(chat.updatedAt)

  if (rename.renaming) {
    return (
      <div role="listitem" className="py-1.5">
        <RenameField
          value={chat.title}
          label="Название чата"
          className="h-12 rounded-xl bg-background pointer-coarse:h-12"
          inputClassName="px-3 text-base md:text-[15px]"
          onDone={(next) => {
            rename.stop()
            if (next) renameChat(chat.id, next)
          }}
        />
      </div>
    )
  }

  return (
    <Item
      role="listitem"
      size="sm"
      className={cn(
        "group/row relative gap-3 rounded-xl border-0 px-3 py-3",
        // A hairline between rows (ChatGPT), hidden where the pointer is.
        "after:pointer-events-none after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-border last:after:hidden hover:after:opacity-0",
        "transition-[background-color,scale] duration-75 hover:bg-muted/60 has-[[data-row-open]:active]:scale-[0.99] has-data-[state=open]:bg-muted/60 motion-reduce:transition-none"
      )}
    >
      <ItemContent className="min-w-0 gap-0.5">
        {/* Stretched over the row, so the row is one button and «⋯» sits above it (no button in a button). */}
        <Button
          variant="ghost"
          data-row-open=""
          onClick={onOpen}
          className="static block h-auto w-full truncate rounded-none border-0 p-0 text-left text-base font-medium hover:bg-transparent focus-visible:ring-0 active:scale-none motion-reduce:active:scale-none before:absolute before:inset-0 before:rounded-xl focus-visible:before:ring-3 focus-visible:before:ring-ring/50 md:text-[15px]"
        >
          {chat.title}
        </Button>
        {chat.preview && <ItemDescription className="line-clamp-1 text-sm">{chat.preview}</ItemDescription>}
      </ItemContent>
      {/* Over the stretched button, but only «⋯» takes the pointer: a click on the date opens the chat. */}
      <ItemActions className="pointer-events-none relative z-10 gap-1 self-center">
        {date && <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">{date}</span>}
        <AppMenu>
          <AppMenuTrigger asChild>
            <MoreActionButton
              variant="ghost"
              size="icon"
              aria-label={`Действия с чатом «${chat.title}»`}
              className="pointer-events-auto text-muted-foreground transition-opacity duration-(--duration-fast) ease-out hover:bg-background hover:text-foreground data-[state=open]:bg-background data-[state=open]:opacity-100 md:pointer-fine:opacity-0 md:pointer-fine:group-hover/row:opacity-100 md:pointer-fine:group-focus-within/row:opacity-100 [&_svg]:size-[18px]"
            />
          </AppMenuTrigger>
          <AppMenuContent align="end" className="w-60" onCloseAutoFocus={rename.onCloseAutoFocus}>
            <ChatMenuItems chat={chat} pinned={pinned} onRename={rename.start} />
          </AppMenuContent>
        </AppMenu>
      </ItemActions>
    </Item>
  )
}
