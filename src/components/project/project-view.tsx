import * as React from "react"
import { FolderAddIcon, NoteEditIcon } from "@hugeicons/core-free-icons"

import { saveChatConfig } from "@/components/chat-composer/chat-config"
import { ChatComposer, emptyDraft, type ComposerDraft, type ComposerMessage } from "@/components/chat-composer/chat-composer"
import { ProjectMenuItems } from "@/components/entity-menus"
import { ProjectAppearance, ProjectGlyph } from "@/components/project/project-appearance"
import { ProjectChats } from "@/components/project/project-chats"
import { ProjectFiles, ProjectFilesAction, useAddProjectFiles } from "@/components/project/project-files"
import { InstructionsSheet, openInstructions } from "@/components/project/project-instructions"
import { ProjectMedia, ProjectMediaAction, type MediaFilter } from "@/components/project/project-media"
import { AppMenu, AppMenuContent, AppMenuItem, AppMenuTrigger } from "@/components/ui/app-menu"
import { Button } from "@/components/ui/button"
import { MoreActionButton } from "@/components/more-action-button"
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Project } from "@/data/chats"
import { sendChatMessage } from "@/hooks/use-chat-messages"
import { useComposerHeight } from "@/hooks/use-composer-height"
import { useEntityActions } from "@/hooks/use-entity-actions"
import { useHub } from "@/hooks/use-hub"
import { useProjectMedia } from "@/hooks/use-media-feed"
import { useIsMobile } from "@/hooks/use-mobile"
import { useMusic } from "@/hooks/use-music"
import { useRoles } from "@/hooks/use-roles"
import { titleFrom } from "@/lib/chat-title"
import { resolveRole } from "@/lib/roles"
import { initialTab, rememberTab, searchForTab, type ProjectTab } from "@/lib/project-tabs"

/* A project's page (spec §4, ChatGPT Projects): its name and «⋯», a composer that starts a new chat in it,
   and three tabs — Чаты · Медиа · Файлы. Photos, videos and songs aren't made here for now (the user's
   ask, 27.09): they come into «Медиа» from the studios («Добавить в проект»).
   Desktop: the composer sits under the title, in the flow. Phone: the name and «⋯» are the page's first row,
   the composer is pinned to the bottom and the page scrolls under it (ChatGPT iOS).
   The tab lives in the address (`?tab=`, replaceState — no history entry), so «Назад» from a chat comes back
   to it; the scroll position is remembered per project for the same reason. */

/* Where each project page was scrolled to, for «Назад» and the sidebar. */
const scrollTops = new Map<string, number>()

export function ProjectView({ project, onSelect }: { project: Project; onSelect: (id: string) => void }) {
  const hub = useHub()
  const { recordUse } = useRoles()
  const actions = useEntityActions()
  const mobile = useIsMobile()
  const [tab, setTab] = React.useState<ProjectTab>(() => initialTab(project.id, window.location.search, window.location.pathname))
  const [filter, setFilter] = React.useState<MediaFilter>("all")
  // The composer's text and files outlive it: it moves between the flow and the dock across the breakpoint.
  const [draft] = React.useState(emptyDraft)
  const keepDraft = React.useCallback((next: ComposerDraft) => void Object.assign(draft, next), [draft])
  const scroller = React.useRef<HTMLDivElement>(null)
  const { section, dock } = useComposerHeight(mobile)
  const files = useAddProjectFiles(project)
  const hasFiles = (project.files?.length ?? 0) + files.writing.length > 0
  const media = useProjectMedia(project.id)
  const { songs } = useMusic()
  const hasMedia = media.length > 0 || songs.some((song) => song.projectId === project.id)

  // The tab → the address (no history entry) and the session's memory.
  React.useEffect(() => {
    rememberTab(project.id, tab)
    const url = `${window.location.pathname}${searchForTab(tab)}`
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", url)
  }, [project.id, tab])

  // Back where it was, at once.
  React.useLayoutEffect(() => {
    const top = scrollTops.get(project.id)
    if (top && scroller.current) scroller.current.scrollTop = top
  }, [project.id])

  const send = ({ text, files, model, settings }: ComposerMessage) => {
    const body = text || files.map((file) => file.name).join(", ")
    const chat = hub.createChat({ title: titleFrom(body), type: "text", projectId: project.id, preview: body })
    saveChatConfig(chat.id, { model, settings })
    const role = resolveRole(settings.role)
    if (role) recordUse(role.id, chat.id)
    sendChatMessage(chat.id, text, model, files)
    onSelect(chat.id)
  }

  // The project's name is right above: no name in here (long ones ran the line out, quotes inside quotes).
  const placeholder = mobile ? "Начните чат в проекте" : "Начните новый чат в проекте"

  const composerNode = project.archived ? (
    <ArchivedNotice project={project} />
  ) : (
    // Text only (no onModeChange): «+» attaches files, the model picker keeps to text models.
    <ChatComposer
      mode="text"
      placeholder={placeholder}
      onSend={send}
      autoFocus
      draft={draft}
      onDraftChange={keepDraft}
      // On «Файлы» a file dropped anywhere goes to the project, not into the message (spec §8).
      drop={
        tab === "files"
          ? {
              title: "Отпустите, чтобы добавить в проект",
              limit: "До 25 МБ, до 20 файлов в проекте",
              icon: FolderAddIcon,
              onDrop: (list) => void files.add(list),
            }
          : undefined
      }
    />
  )

  // An empty tab has its own call to action in the empty state: no filter or «Добавить файлы» over it.
  const tabAction =
    tab === "media" && hasMedia ? (
      <ProjectMediaAction value={filter} onChange={setFilter} />
    ) : tab === "files" && hasFiles ? (
      <ProjectFilesAction project={project} />
    ) : null

  return (
    <section ref={section} aria-label={project.name} className="relative flex min-h-0 flex-1 flex-col [--composer-h:8rem]">
      <div
        ref={scroller}
        onScroll={(event) => scrollTops.set(project.id, event.currentTarget.scrollTop)}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pt-20 pb-[calc(var(--composer-h)+1.5rem)] md:px-6 md:pt-[12svh] md:pb-16">
          {/* The project's row (the user's ask, 27.09): the icon opens «цвет + иконка», the name the project's
              settings (cut short when long), «⋯» the project's menu at the row's end. On the phone it's the
              page's first row, over the tabs — the header keeps only the burger and the balance. */}
          {/* The page's heading for screen readers: the visible name is a button (it opens the settings). */}
          <h1 className="sr-only">{project.name}</h1>
          {/* -ml-2: the glyph (not its button) lines up with the composer's and the tabs' edge below. */}
          <div className="mb-3 flex min-w-0 items-center gap-0 md:mb-5">
            <ProjectAppearance color={project.color} icon={project.icon} onChange={(next) => hub.updateProject(project.id, next)}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Цвет и иконка проекта"
                className="-ml-2 size-9 shrink-0 rounded-xl md:size-11 [&_svg]:size-5! md:[&_svg]:size-7!"
              >
                <ProjectGlyph project={project} />
              </Button>
            </ProjectAppearance>
            <Button
              variant="ghost"
              onClick={() => actions.openProjectDialog({ project })}
              aria-label={`${project.name} — настройки проекта`}
              className="mr-auto h-9 min-w-0 shrink justify-start rounded-xl px-1 text-xl font-semibold tracking-[-0.02em] md:h-11 md:px-1.5 md:text-2xl"
            >
              <span className="truncate">{project.name}</span>
            </Button>
            <ProjectMenuButton project={project} className="shrink-0" />
          </div>

          {!mobile && composerNode}

          <Tabs value={tab} onValueChange={(value) => setTab(value as ProjectTab)} className="mt-2 gap-3 md:mt-10">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <TabsList aria-label="Разделы проекта">
                <TabsTrigger value="chats">Чаты</TabsTrigger>
                <TabsTrigger value="media">Медиа</TabsTrigger>
                <TabsTrigger value="files">Файлы</TabsTrigger>
              </TabsList>
              {/* The tab's action: right of the tabs on desktop, left-aligned under them on the phone. */}
              {tabAction && <div className="flex h-9 items-center justify-start md:justify-end">{tabAction}</div>}
            </div>
            <TabsContent value="chats" className="flex flex-col gap-2">
              <ProjectChats project={project} onSelect={onSelect} />
            </TabsContent>
            <TabsContent value="media">
              <ProjectMedia project={project} filter={filter} onFilterChange={setFilter} onSelect={onSelect} />
            </TabsContent>
            <TabsContent value="files">
              <ProjectFiles project={project} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {mobile && (
        <div ref={dock} className="absolute inset-x-0 bottom-0 z-20 mx-auto w-full max-w-3xl px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {composerNode}
        </div>
      )}

      <InstructionsSheet project={project} />
    </section>
  )
}

/* An archived project opened through «Назад» or its address: nothing new starts until it's back. */
function ArchivedNotice({ project }: { project: Project }) {
  const { restore } = useHub()
  return (
    <Item variant="outline" className="rounded-2xl bg-background">
      <ItemContent>
        <ItemTitle>Проект в архиве</ItemTitle>
        <ItemDescription>Восстановите его, чтобы начать новый чат.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" onClick={() => restore("project", project.id)} className="h-9 rounded-full px-4">
          Восстановить
        </Button>
      </ItemActions>
    </Item>
  )
}

/* The project's «⋯»: the sidebar's project menu plus «Инструкции»; «Переименовать проект» opens the
   project dialog here (inline rename is the sidebar's). Also in the phone header. */
export function ProjectMenuButton({ project, className, tabIndex }: { project: Project; className?: string; tabIndex?: number }) {
  const { pins } = useHub()
  const actions = useEntityActions()
  return (
    <AppMenu>
      <AppMenuTrigger asChild>
        <MoreActionButton
          tabIndex={tabIndex}
          aria-label={`Действия с проектом «${project.name}»`}
          className={className}
        />
      </AppMenuTrigger>
      <AppMenuContent align="end" className="w-60">
        <ProjectMenuItems project={project} pinned={pins.includes(`project:${project.id}`)} onRename={() => actions.openProjectDialog({ project })}>
          <AppMenuItem icon={NoteEditIcon} onSelect={() => openInstructions(project.id)}>
            Инструкции
          </AppMenuItem>
        </ProjectMenuItems>
      </AppMenuContent>
    </AppMenu>
  )
}

/* The project link shares the mobile header row with balance and chat actions. */
export function ProjectChatMobileTitle({ project, onOpen, tabIndex }: {
  project: Project
  onOpen: () => void
  tabIndex?: number
}) {
  return (
    <Button
      variant="ghost"
      onClick={onOpen}
      tabIndex={tabIndex}
      aria-label={`Проект «${project.name}»`}
      className="h-9 max-w-full min-w-0 shrink justify-start gap-1.5 rounded-[10px] px-1 text-[15px] font-normal active:translate-y-0"
    >
      <ProjectGlyph project={project} className="size-5! shrink-0" />
      <span className="truncate">{project.name}</span>
    </Button>
  )
}
