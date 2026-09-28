import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"

import { MenuSearch } from "@/components/chat-composer/menu-search"
import { SHEET_ROW } from "@/components/chat-composer/tools"
import { ModelLogo } from "@/components/model-logo"
import { AppMenu, AppMenuContent, AppMenuItem, AppMenuTrigger } from "@/components/ui/app-menu"
import { AppSheet, AppSheetBody, AppSheetContent, AppSheetTitle } from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import type { ChatType } from "@/data/chats"
import { MODEL_FAMILIES, RECOMMENDED, findModel, type ModelFamily, type ModelVersion } from "@/data/models"
import { useIsMobile } from "@/hooks/use-mobile"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

type PickerProps = {
  /* The composer's type: only its models are listed (Молли opens on «Текст»). */
  type: ChatType
  model: string
  onSelect: (type: ChatType, model: string) => void
}

type Entry = { version: ModelVersion; family: ModelFamily }

/* On each opening, reveal the current model in the list without scrolling the page or moving
   focus away from search. Both lists are positioned so row offsets are local to the scroller. */
function useSelectedModelScroll(open: boolean) {
  const list = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      const scroller = list.current
      const selected = scroller?.querySelector<HTMLElement>('[aria-checked="true"], [aria-pressed="true"]')
      if (scroller && selected) {
        scroller.scrollTop = selected.offsetTop - (scroller.clientHeight - selected.offsetHeight) / 2
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [open])
  return list
}

/* «Рекомендуем» and «Другие нейросети» of one type as flat lists of models. A model sits in one of
   them only — listed twice, the current one showed two ticks (the user's ask, 27.09). A search hides
   the first and narrows all the models into one list. */
function useSections(type: ChatType, query: string) {
  const q = query.trim().toLocaleLowerCase("ru")
  const recommended: Entry[] = q
    ? []
    : RECOMMENDED[type].flatMap((name) => {
        const match = findModel(name, type)
        return match ? [{ version: match.version, family: match.family }] : []
      })
  const picked = new Set(recommended.map((entry) => entry.version.name))
  const all: Entry[] = MODEL_FAMILIES[type].flatMap((family) =>
    family.versions
      .filter((version) => !picked.has(version.name))
      .filter((version) => !q || `${version.name} ${family.name} ${family.vendor} ${version.description}`.toLocaleLowerCase("ru").includes(q))
      .map((version) => ({ version, family }))
  )
  return { q, recommended, all }
}

/* Model picker (26.09): the same menu as «+» on the composer bar. On desktop the app menu opens
   down from the model button: a bare search on top (Higgsfield), then «Рекомендуем» and «Другие
   нейросети» as rows in the proportions of the «+» rows — the vendor's mark, the name over what
   the model is good at. The current one sits on the hover fill with a tick and its mark in colour;
   the others' marks are grey, one flat colour (Lobe Icons; the user's asks, 27.09 — no price in the
   rows since then). No type tabs: every mode has its own models. On the phone the same list in the
   bottom sheet, in the «+» sheet's rows. */
export function ModelPicker({
  trigger,
  open,
  onOpenChange,
  ...props
}: PickerProps & {
  trigger: React.ReactElement<{ onClick?: React.MouseEventHandler }>
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mobile = useIsMobile()

  if (mobile) {
    return (
      <>
        {React.cloneElement(trigger, { onClick: () => onOpenChange(true) })}
        <ModelSheet open={open} onOpenChange={onOpenChange} {...props} />
      </>
    )
  }

  return <ModelMenu trigger={trigger} open={open} onOpenChange={onOpenChange} {...props} />
}

/* ─── Desktop: the app menu, as «+» ───────────────────────────────────────────────────── */

function ModelMenu({
  trigger,
  open,
  onOpenChange,
  type,
  model,
  onSelect,
}: PickerProps & { trigger: React.ReactElement; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = React.useState("")
  const { q, recommended, all } = useSections(type, query)
  const search = React.useRef<HTMLInputElement>(null)
  const list = useSelectedModelScroll(open)

  // The search takes the focus as the menu opens: the library focuses its own card, and the
  // dropdown exposes no hook for it, so this runs right after (the next frame).
  React.useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => search.current?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(frame)
  }, [open])

  const rows = (entries: Entry[]) =>
    entries.map(({ version, family }) => {
      const selected = version.name === model
      return (
        <AppMenuItem
          key={version.name}
          role="menuitemradio"
          aria-checked={selected}
          onSelect={() => onSelect(type, version.name)}
          className="h-auto min-h-11 py-2 aria-checked:bg-accent"
        >
          <ModelLogo logo={family.logo} mode={type} color={selected} className={cn("size-[18px]", !selected && "text-muted-foreground")} />
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span className="truncate">{version.name}</span>
            <span className="truncate text-xs text-muted-foreground!">{version.description}</span>
          </span>
          {selected && <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} className="text-foreground" />}
        </AppMenuItem>
      )
    })

  return (
    <AppMenu
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setQuery("")
      }}
    >
      <AppMenuTrigger asChild>{trigger}</AppMenuTrigger>
      {/* Down from the bar like «+». The card is capped at 320px so it fits under the composer of
          the home screen (the library flips a taller one over the trigger); the search stays put,
          only the list scrolls. Its edge is the `border` hairline, not the menu's faint ring (the
          user's ask, 27.09). */}
      <AppMenuContent side="bottom" align="start" sideOffset={10} aria-label="Выбор нейросети" className="flex max-h-80 w-[360px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden ring-border">
        <div className="mb-1 shrink-0 border-b">
          <MenuSearch ref={search} bare menu value={query} onChange={setQuery} placeholder="Найти нейросеть" />
        </div>
        <div ref={list} className="relative min-h-0 flex-1 overflow-y-auto">
          {recommended.length > 0 && (
            <>
              <DropdownMenuLabel className={MENU_LABEL}>Рекомендуем</DropdownMenuLabel>
              {rows(recommended)}
            </>
          )}
          {!q && all.length > 0 && <DropdownMenuLabel className={MENU_LABEL}>Другие нейросети</DropdownMenuLabel>}
          {rows(all)}
          {q && all.length === 0 && <p className="px-3.5 py-6 text-center text-sm text-muted-foreground">Нейросети не найдены</p>}
        </div>
      </AppMenuContent>
    </AppMenu>
  )
}

/* Section labels in the «+» menu's proportions. */
const MENU_LABEL = "px-3.5 pt-2 pb-1 text-xs font-normal text-muted-foreground"

/* ─── Phone: the bottom sheet, as «+» ─────────────────────────────────────────────────── */

function ModelSheet({ open, onOpenChange, type, model, onSelect }: PickerProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = React.useState("")
  const { q, recommended, all } = useSections(type, query)
  const list = useSelectedModelScroll(open)

  const rows = (entries: Entry[]) =>
    entries.map(({ version, family }) => {
      const selected = version.name === model
      return (
        <Button
          key={version.name}
          variant="ghost"
          aria-pressed={selected}
          onClick={() => {
            onSelect(type, version.name)
            onOpenChange(false)
          }}
          className={cn(SHEET_ROW, "aria-pressed:bg-muted")}
        >
          <ModelLogo logo={family.logo} mode={type} color={selected} className={cn("size-6", !selected && "text-muted-foreground")} />
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span className="truncate">{version.name}</span>
            <span className="truncate text-sm text-muted-foreground">{version.description}</span>
          </span>
          {selected && <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} className="size-5!" />}
        </Button>
      )
    })

  return (
    <AppSheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setQuery("")
      }}
    >
      <AppSheetContent aria-describedby={undefined} className="max-md:h-[85dvh]">
        <AppSheetTitle className="sr-only">Выбор нейросети</AppSheetTitle>
        <div className="mt-1 shrink-0 border-b px-1.5">
          <MenuSearch bare value={query} onChange={setQuery} placeholder="Найти нейросеть" />
        </div>
        {/* The gesture over the list is a scroll, never the drawer's drag (vaul's escape hatch): the
            sheet still closes by the handle, the search row, the overlay or Escape. */}
        <AppSheetBody ref={list} data-vaul-no-drag="" className="relative flex flex-col gap-0.5 px-3 pt-2 pb-4">
          {recommended.length > 0 && (
            <>
              <p className={SHEET_LABEL}>Рекомендуем</p>
              {rows(recommended)}
            </>
          )}
          {!q && all.length > 0 && <p className={SHEET_LABEL}>Другие нейросети</p>}
          {rows(all)}
          {q && all.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">Нейросети не найдены</p>}
        </AppSheetBody>
      </AppSheetContent>
    </AppSheet>
  )
}

/* Section labels in the settings sheet's proportions. */
const SHEET_LABEL = "px-3 pt-3 pb-1 text-sm text-muted-foreground"
