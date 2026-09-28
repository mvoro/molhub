import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Attachment01Icon, Folder01Icon, FolderAddIcon, FolderRemoveIcon, Tick02Icon } from "@hugeicons/core-free-icons"

import { ProjectDialog } from "@/components/project-dialog"
import { AppMenu, AppMenuContent, AppMenuItem, AppMenuSeparator, AppMenuTrigger } from "@/components/ui/app-menu"
import { Button } from "@/components/ui/button"
import { useHub } from "@/hooks/use-hub"
import { ICON_STROKE, projectIcon } from "@/lib/icons"
import { projectColor } from "@/lib/project-colors"
import { cn } from "@/lib/utils"

/* The tongue under the text composer (the user's ask, 27.09; Kimi's «Выбрать проект · Плагины»): a
   strip in the tray's own grey hanging from its bottom edge, inset like «Молли ждёт…» over its top,
   holding what frames the new chat — the project it goes into and files to hand over. The project
   menu is the sidebar's «Перенести в проект»: a new one first, then the projects with a tick on the
   chosen, and a way out of it. */
export function ComposerTongue({
  projectId,
  onProjectChange,
  onAttach,
  disabled,
  attachmentsDisabled,
}: {
  projectId?: string
  onProjectChange: (projectId: string | undefined) => void
  onAttach: () => void
  disabled?: boolean
  attachmentsDisabled?: boolean
}) {
  const { projects, createProject } = useHub()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const shown = projects.filter((project) => !project.archived)
  const current = shown.find((project) => project.id === projectId)

  return (
    <div className="mx-5 flex h-9 items-center gap-0.5 rounded-b-[18px] bg-muted/50 px-1 dark:bg-card/50">
      <AppMenu>
        <AppMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-label={current ? `Проект: ${current.name}. Изменить` : "Выбрать проект"}
            className={cn(TONGUE_BUTTON, "min-w-0 shrink md:max-w-64", current && "text-foreground")}
          >
            <HugeiconsIcon
              icon={current ? projectIcon(current.icon) : Folder01Icon}
              strokeWidth={ICON_STROKE}
              color={projectColor(current?.color)}
              data-icon="inline-start"
            />
            <span className="truncate">{current ? current.name : "Выбрать проект"}</span>
          </Button>
        </AppMenuTrigger>
        <AppMenuContent side="bottom" align="start" sideOffset={8}>
          <AppMenuItem icon={FolderAddIcon} onSelect={() => setDialogOpen(true)}>
            Новый проект
          </AppMenuItem>
          {shown.length > 0 && <AppMenuSeparator />}
          {shown.map((project) => (
            <AppMenuItem
              key={project.id}
              role="menuitemradio"
              aria-checked={project.id === projectId}
              onSelect={() => onProjectChange(project.id)}
            >
              <HugeiconsIcon strokeWidth={ICON_STROKE} icon={projectIcon(project.icon)} color={projectColor(project.color)} />
              <span className="min-w-0 flex-1 truncate">{project.name}</span>
              {project.id === projectId && <HugeiconsIcon strokeWidth={ICON_STROKE} icon={Tick02Icon} className="ml-2 size-4!" />}
            </AppMenuItem>
          ))}
          {current && (
            <>
              <AppMenuSeparator />
              <AppMenuItem icon={FolderRemoveIcon} onSelect={() => onProjectChange(undefined)}>
                Без проекта
              </AppMenuItem>
            </>
          )}
        </AppMenuContent>
      </AppMenu>
      <Button variant="ghost" size="sm" disabled={disabled} aria-disabled={attachmentsDisabled} onClick={onAttach} className={cn(TONGUE_BUTTON, "aria-disabled:opacity-50")}>
        <HugeiconsIcon icon={Attachment01Icon} strokeWidth={ICON_STROKE} data-icon="inline-start" />
        Загрузить файлы
      </Button>
      {/* A project made from here is the new chat's at once. */}
      <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={(value) => onProjectChange(createProject(value).id)} />
    </div>
  )
}

/* The tongue's buttons: the library's small ghost at the composer's pill radius, in the quiet ink of
   «Молли ждёт…» (13px, 70%); a chosen project reads in full ink. The project gives way to «Загрузить
   файлы»: it shrinks into what's left and cuts its name with «…» (on a 375px phone a fixed 192px
   pushed the upload out of the tongue). */
const TONGUE_BUTTON = "rounded-full text-[13px] font-normal text-foreground/70 [&_svg:not([class*='size-'])]:size-4"
