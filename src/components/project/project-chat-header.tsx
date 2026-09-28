import * as React from "react"
import { ChatMenuItems } from "@/components/entity-menus"
import { MoreActionButton } from "@/components/more-action-button"
import { ProjectGlyph } from "@/components/project/project-appearance"
import { RenameField, useRename } from "@/components/rename-field"
import { AppMenu, AppMenuContent, AppMenuTrigger } from "@/components/ui/app-menu"
import { Button } from "@/components/ui/button"
import type { Chat } from "@/data/chats"
import { useEntityActions } from "@/hooks/use-entity-actions"
import { useHub } from "@/hooks/use-hub"

export function ProjectChatMenu({ chat, onRename, onCloseAutoFocus, tabIndex }: {
  chat: Chat
  onRename: () => void
  onCloseAutoFocus: (event: Event) => void
  tabIndex?: number
}) {
  const { pins } = useHub()
  const renameAfterClose = React.useRef(false)
  return (
    <AppMenu>
      <AppMenuTrigger asChild>
        <MoreActionButton tabIndex={tabIndex} aria-label={`Действия с чатом «${chat.title}»`} />
      </AppMenuTrigger>
      <AppMenuContent align="end" className="w-60" onCloseAutoFocus={(event) => {
        // Mount the field after the menu releases focus, so its closing click cannot blur it.
        if (renameAfterClose.current) {
          renameAfterClose.current = false
          event.preventDefault()
          onRename()
        }
        onCloseAutoFocus(event)
      }}>
        <ChatMenuItems chat={chat} pinned={pins.includes(`chat:${chat.id}`)} onRename={() => { renameAfterClose.current = true }} />
      </AppMenuContent>
    </AppMenu>
  )
}

/* The top of a project's chat on desktop (ChatGPT, the user's reference 27.09): the project — its icon in its
   colour and its name — top left, a way back to the project's page; the chat's «⋯» top right, 8px left of the
   balance button (the user's ask, 27.09), as the header's other neighbours. An overlay: the thread scrolls under it and fades out through ChatView's scrim, so nothing
   moves when it comes or goes. «Убрать из проекта» takes the project away but leaves «⋯» while the chat is
   open (its menu may be the one that did it). Regular chats have no such bar. The phone shows the project in
   App's header instead. */
export function ProjectChatHeader({ chat }: { chat: Chat }) {
  const { projects, renameChat } = useHub()
  const actions = useEntityActions()
  const rename = useRename()
  // ChatView is keyed by the chat: whether this one started in a project holds for as long as it's open.
  const [inProject] = React.useState(Boolean(chat.projectId))
  const project = chat.projectId ? projects.find((item) => item.id === chat.projectId && !item.archived) : undefined
  if (!inProject && !project) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 max-md:hidden">
      <div className="pointer-events-auto absolute top-3.5 left-4 flex max-w-[calc(100%-20rem)] min-w-0 items-center">
        {rename.renaming ? (
          <RenameField
            value={chat.title}
            label="Название чата"
            className="h-9 w-80 rounded-[10px] bg-background"
            onDone={(next) => {
              rename.stop()
              if (next) renameChat(chat.id, next)
            }}
          />
        ) : (
          project && (
            <Button
              variant="ghost"
              onClick={() => actions.openProject(project.id)}
              aria-label={`Проект «${project.name}»`}
              className="h-9 min-w-0 shrink gap-2 rounded-[10px] px-2.5 text-base font-normal active:translate-y-0"
            >
              <ProjectGlyph project={project} className="size-5! shrink-0" />
              <span className="truncate">{project.name}</span>
            </Button>
          )
        )}
      </div>
      {/* 116px = the balance's 24px from the edge (App.tsx) + its ~84px + 8px. */}
      <div className="pointer-events-auto absolute top-3.5 right-29">
        <ProjectChatMenu chat={chat} onRename={rename.start} onCloseAutoFocus={rename.onCloseAutoFocus} />
      </div>
    </div>
  )
}
