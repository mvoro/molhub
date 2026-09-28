import * as React from "react"
import { toast } from "sonner"

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
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Textarea } from "@/components/ui/textarea"
import type { Project } from "@/data/chats"
import { useHub } from "@/hooks/use-hub"
import { cn } from "@/lib/utils"

/* The project's instructions for Молли (spec §7): a sheet to edit them, opened from the project's «⋯»
   («Инструкции»; the card on the page went on 27.09, the user's ask). Which project's sheet is open sits in
   a tiny shared store, so any «⋯» can open it. */

export const INSTRUCTIONS_LIMIT = 8000
/* The counter shows up near the end, not all the time. */
const COUNTER_FROM = 7000

let openFor: string | null = null
const listeners = new Set<() => void>()
const setOpenFor = (projectId: string | null) => {
  openFor = projectId
  listeners.forEach((listener) => listener())
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

export const openInstructions = (projectId: string) => setOpenFor(projectId)

function useInstructionsOpen(projectId: string) {
  const open = React.useSyncExternalStore(subscribe, () => openFor === projectId)
  const setOpen = React.useCallback((next: boolean) => setOpenFor(next ? projectId : null), [projectId])
  // Leaving the page with the sheet up (Back works over a modal) mustn't bring it back on the next visit.
  React.useEffect(
    () => () => {
      if (openFor === projectId) setOpenFor(null)
    },
    [projectId]
  )
  return [open, setOpen] as const
}

/* «7 950 / 8 000». */
const count = (value: number) => value.toLocaleString("ru-RU")

export function InstructionsSheet({ project }: { project: Project }) {
  const { updateProject } = useHub()
  const [open, setOpen] = useInstructionsOpen(project.id)
  const saved = project.instructions ?? ""
  const [text, setText] = React.useState(saved)
  const [confirm, setConfirm] = React.useState(false)
  // Each opening starts from what's saved.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setText(saved)
  }

  const dirty = text !== saved
  const over = text.length > INSTRUCTIONS_LIMIT
  const save = () => {
    if (over) return
    const next = text.trim()
    updateProject(project.id, { instructions: next || undefined })
    setOpen(false)
    toast("Инструкции сохранены")
  }

  return (
    <>
      <AppSheet open={open} onOpenChange={setOpen} dismissible={!dirty} onDismissAttempt={() => setConfirm(true)}>
        <AppSheetContent className="md:max-w-[560px]">
          <form
            className="flex min-h-0 flex-col"
            onSubmit={(event) => {
              event.preventDefault()
              save()
            }}
          >
            <AppSheetHeader>
              <AppSheetTitle>Инструкции</AppSheetTitle>
              <AppSheetDescription>Молли учитывает их во всех чатах проекта.</AppSheetDescription>
            </AppSheetHeader>
            <AppSheetBody className="flex flex-col gap-1.5 pt-1 pb-1">
              {/* Desktop: a fixed box that scrolls inside (a centred modal mustn't grow both ways); the phone:
                  it grows with the sheet up to a third of the screen, the keyboard takes the rest. */}
              <Textarea
                data-vaul-no-drag=""
                value={text}
                onChange={(event) => setText(event.target.value)}
                aria-label="Инструкции"
                aria-invalid={over || undefined}
                aria-describedby={over ? `${project.id}-instructions-over` : undefined}
                placeholder="Например: пишите тепло и на «вы», это лендинг кофейни у моря. Цены — в рублях."
                className="min-h-28 resize-none text-base max-md:max-h-[30svh] md:h-64 md:overflow-y-auto md:text-[15px]"
              />
              {/* A reserved row: the hint and the counter appear without moving the buttons. */}
              <div className="flex h-5 items-center justify-between gap-3 text-[13px]">
                <span id={`${project.id}-instructions-over`} className="text-destructive">
                  {over && `Сократите текст до ${count(INSTRUCTIONS_LIMIT)} знаков`}
                </span>
                <span
                  className={cn(
                    "shrink-0 tabular-nums transition-opacity duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
                    text.length < COUNTER_FROM && "opacity-0",
                    over ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {count(text.length)} / {count(INSTRUCTIONS_LIMIT)}
                </span>
              </div>
            </AppSheetBody>
            <AppSheetFooter>
              <AppSheetClose asChild>
                <Button type="button" variant="ghost" className="h-10 rounded-full px-4">
                  Отмена
                </Button>
              </AppSheetClose>
              <Button type="submit" disabled={over} className="h-10 rounded-full px-4">
                Сохранить
              </Button>
            </AppSheetFooter>
          </form>
        </AppSheetContent>
      </AppSheet>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Не сохранять изменения?"
        description="Текст инструкций останется прежним."
        actionLabel="Не сохранять"
        cancelLabel="Вернуться"
        onConfirm={() => setOpen(false)}
      />
    </>
  )
}
