import * as React from "react"

import { ProjectAppearance, ProjectGlyph } from "@/components/project/project-appearance"
import {
  AppSheet,
  AppSheetBody,
  AppSheetClose,
  AppSheetContent,
  AppSheetDescription,
  AppSheetFooter,
  AppSheetHeader,
  AppSheetTitle,
} from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { PROJECT_NAME_MAX, type Project } from "@/data/chats"
import { DEFAULT_PROJECT_ICON, PROJECT_ICONS } from "@/lib/icons"
import { type ProjectColor } from "@/lib/project-colors"

type ProjectValue = { name: string; description?: string; color?: ProjectColor; icon?: string }

/* Create / edit a project: name, description, icon and colour. The icon in the name field opens «цвет + иконка» (the
   same popover as on the project page, spec D6) and shows the pick. Closes itself after a valid submit,
   so callers only persist the value. */
export function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
  onSubmit: (value: ProjectValue) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <AppSheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent
        // Settings have no description under the title (the user's ask, 27.09); a new project has one.
        {...(project && { "aria-describedby": undefined })}
        className="md:max-w-[440px]"
        onOpenAutoFocus={(event) => {
          // Focus the name and select it when editing, so retyping replaces it (like rename in ChatGPT).
          event.preventDefault()
          inputRef.current?.focus({ preventScroll: true })
          inputRef.current?.select()
        }}
      >
        {/* Remounts on every open (the sheet unmounts closed content), so state starts from `project`. */}
        <ProjectForm
          key={project?.id ?? "new"}
          project={project}
          inputRef={inputRef}
          onSubmit={(value) => {
            onSubmit(value)
            onOpenChange(false)
          }}
        />
      </AppSheetContent>
    </AppSheet>
  )
}

function ProjectForm({
  project,
  inputRef,
  onSubmit,
}: {
  project?: Project
  inputRef: React.RefObject<HTMLInputElement | null>
  onSubmit: (value: ProjectValue) => void
}) {
  const [name, setName] = React.useState(project?.name ?? "")
  const [description, setDescription] = React.useState(project?.description ?? "")
  const [look, setLook] = React.useState<{ color?: ProjectColor; icon?: string }>({ color: project?.color, icon: project?.icon })

  const isEdit = Boolean(project)
  const trimmed = name.trim()
  const iconLabel = (PROJECT_ICONS.find((item) => item.id === look.icon) ?? PROJECT_ICONS[0]).label

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!trimmed) return
    onSubmit({
      name: trimmed,
      description: description.trim() || undefined,
      color: look.color,
      icon: look.icon === DEFAULT_PROJECT_ICON ? undefined : look.icon,
    })
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <AppSheetHeader>
        <AppSheetTitle>{isEdit ? "Настройки проекта" : "Новый проект"}</AppSheetTitle>
        {!isEdit && <AppSheetDescription>Чаты, фото, видео и файлы одной задачи{"\u00a0"}— в{"\u00a0"}одном месте.</AppSheetDescription>}
      </AppSheetHeader>

      <AppSheetBody className="flex flex-col gap-5 pt-1 pb-1">
        <Field className="gap-2">
          <FieldLabel htmlFor="project-name">Название</FieldLabel>
          <InputGroup data-vaul-no-drag="" className="h-11 rounded-xl">
            <InputGroupAddon className="pl-1.5">
              <ProjectAppearance color={look.color} icon={look.icon} onChange={setLook}>
                <InputGroupButton size="icon-sm" aria-label={`Цвет и иконка проекта: ${iconLabel}`} className="rounded-lg">
                  <ProjectGlyph project={look} className="size-5" />
                </InputGroupButton>
              </ProjectAppearance>
            </InputGroupAddon>
            <InputGroupInput
              id="project-name"
              ref={inputRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Например, «Запуск лендинга»"
              autoComplete="off"
              maxLength={PROJECT_NAME_MAX}
              className="h-full text-base"
            />
            {/* The cap shows itself only near it, so typing doesn't just stop without a word. */}
            {name.length > PROJECT_NAME_MAX - 10 && (
              <InputGroupAddon align="inline-end">
                <InputGroupText className="text-xs tabular-nums">
                  {name.length}/{PROJECT_NAME_MAX}
                </InputGroupText>
              </InputGroupAddon>
            )}
          </InputGroup>
        </Field>
        <Field className="gap-2">
          <FieldLabel htmlFor="project-description">
            Описание <span className="font-normal text-muted-foreground">(необязательно)</span>
          </FieldLabel>
          <Textarea
            id="project-description"
            data-vaul-no-drag=""
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Кратко опишите, о чём этот проект"
            rows={3}
            className="field-sizing-fixed min-h-24 max-h-60 resize-y rounded-xl text-base"
          />
        </Field>
      </AppSheetBody>

      <AppSheetFooter>
        <AppSheetClose asChild>
          <Button type="button" variant="ghost" className="h-10 rounded-full px-4 text-sm">
            Отмена
          </Button>
        </AppSheetClose>
        <Button type="submit" disabled={!trimmed} className="h-10 rounded-full px-4 text-sm">
          {isEdit ? "Сохранить" : "Создать проект"}
        </Button>
      </AppSheetFooter>
    </form>
  )
}
