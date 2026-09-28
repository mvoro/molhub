import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { MessageCircleIcon, Search01Icon } from "@hugeicons/core-free-icons"

import {
  AppSheet,
  AppSheetCloseButton,
  AppSheetContent,
  AppSheetDescription,
  AppSheetTitle,
} from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ProjectGlyph } from "@/components/project/project-appearance"
import { Separator } from "@/components/ui/separator"
import { MORE_TOOLS, NEW_CHAT, TOOLS } from "@/data/tools"
import { useHub } from "@/hooks/use-hub"
import { useIsMobile } from "@/hooks/use-mobile"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

/* No «Текст»: it is the new chat (the user's ask, 27.09), as in the sidebar's list. */
const ALL_TOOLS = [...TOOLS.filter((tool) => tool.id !== NEW_CHAT), ...MORE_TOOLS]

const GROUP =
  "p-0 **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:pt-1 **:[[cmdk-group-heading]]:pb-2 **:[[cmdk-group-heading]]:text-sm **:[[cmdk-group-heading]]:font-normal"

/* Tools first, then chats (like Krea's palette). ChatGPT-style search in the app modal: a centered 680×460 dialog on desktop, a bottom sheet
   on mobile (filter chips removed on the user's ask, 27.09). ⌘K is pressed dozens of times a day, so on desktop it never
   animates (instant); on mobile only a tap slides the sheet up, a keyboard open is instant.
   Fixed height: the modal doesn't jump while typing. */
export function ChatSearch({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (id: string) => void
}) {
  const isMobile = useIsMobile()
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const { chats: all, projects } = useHub()
  const chats = all.filter((chat) => !chat.archived)
  // A project's chat says where it lives (spec §5): the project's icon and name, grey, on the right.
  const projectOf = (chat: (typeof chats)[number]) =>
    chat.projectId ? projects.find((project) => project.id === chat.projectId && !project.archived) : undefined

  const handleOpenChange = (next: boolean) => {
    if (!next) setQuery("")
    onOpenChange(next)
  }

  const clear = () => {
    setQuery("")
    inputRef.current?.focus()
  }

  return (
    <AppSheet open={open} onOpenChange={handleOpenChange} instant={isMobile ? "keyboard" : true}>
      <AppSheetContent
        className="max-md:h-[85dvh] md:h-[min(460px,calc(100dvh-8rem))] md:max-w-[680px]"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          inputRef.current?.focus({ preventScroll: true })
        }}
      >
        <AppSheetTitle className="sr-only">Поиск</AppSheetTitle>
        <AppSheetDescription className="sr-only">Найдите инструмент или чат по названию</AppSheetDescription>

        <Command className="min-h-0 flex-1 rounded-none! bg-transparent p-0">
          <div data-vaul-no-drag="" className="flex h-14 shrink-0 items-center gap-1 pr-3 pl-5 md:h-[72px] md:pr-4 md:pl-7">
            <CommandInput
              bare
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder="Поиск…"
              className="h-10 flex-1"
            />
            {query && (
              <>
                <Button variant="ghost" onClick={clear} className="h-9 rounded-full px-3 text-base font-normal text-muted-foreground">
                  Очистить
                </Button>
                <Separator orientation="vertical" className="mx-1 h-5! self-center" />
              </>
            )}
            <AppSheetCloseButton label="Закрыть поиск" />
          </div>

          <CommandList className="max-h-none min-h-0 flex-1 px-3 pb-3 overscroll-contain md:px-4">
            <CommandEmpty className="flex min-h-48 items-center justify-center gap-2 text-base text-muted-foreground md:min-h-72">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} className="size-5" />
              Нет результатов
            </CommandEmpty>
            {/* Rows show the name only (the user's ask, 27.09), but the description stays searchable: «suno» finds Аудио. */}
            <CommandGroup heading="Инструменты" className={cn(GROUP, "pb-2")}>
              {ALL_TOOLS.map((tool) => (
                <CommandItem
                  key={tool.id}
                  value={tool.id}
                  keywords={[tool.label, tool.description]}
                  onSelect={() => onSelect(tool.id)}
                  className="h-12 gap-3 rounded-xl! px-3 text-base pointer-coarse:data-selected:bg-transparent pointer-coarse:active:bg-muted [&>svg:last-child]:hidden"
                >
                  <img src={tool.icon} alt="" width={32} height={32} draggable={false} className="size-8 max-w-none shrink-0 select-none" />
                  <span className="min-w-0 flex-1 truncate">{tool.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {/* Every chat gets the sidebar's pinned-chat glyph, whatever its type (the user's ask, 27.09). */}
            <CommandGroup heading={query ? "Чаты" : "Недавние чаты"} className={GROUP}>
              {chats.map((chat) => {
                const project = projectOf(chat)
                return (
                  <CommandItem
                    key={chat.id}
                    value={chat.title}
                    // «кофе» finds the chats of «Кофе у моря» too.
                    keywords={project ? [project.name] : undefined}
                    onSelect={() => onSelect(chat.id)}
                    className="h-12 gap-3 rounded-xl! px-3 text-base pointer-coarse:data-selected:bg-transparent pointer-coarse:active:bg-muted"
                  >
                    <HugeiconsIcon icon={MessageCircleIcon} strokeWidth={ICON_STROKE} className="size-5" />
                    <span className="min-w-0 flex-1 truncate">{chat.title}</span>
                    {project && (
                      <span className="ml-auto flex max-w-36 min-w-0 shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                        <ProjectGlyph project={project} className="size-3.5! shrink-0" />
                        {/* The phone keeps the row for the chat's title: the glyph says the project, the name is read out. */}
                        <span className="truncate max-md:sr-only">{project.name}</span>
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </AppSheetContent>
    </AppSheet>
  )
}
