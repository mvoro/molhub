import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon, StarIcon } from "@hugeicons/core-free-icons"

import { MenuSearch } from "@/components/chat-composer/menu-search"
import { RoleDetailsSheet } from "@/components/roles/role-details-sheet"
import { RoleAvatar } from "@/components/roles/role-card"
import { AppSheet, AppSheetBody, AppSheetContent, AppSheetTitle } from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { NO_ROLE } from "@/data/composer-settings"
import type { Role } from "@/data/roles"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRoles } from "@/hooks/use-roles"
import { ICON_STROKE } from "@/lib/icons"
import { resolveRole, searchRoles } from "@/lib/roles"
import { cn } from "@/lib/utils"

type RolePickerProps = {
  value: string
  onChange: (value: string) => void
  onPrompt?: (prompt: string) => void
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const NO_ROLE_ITEM = "role-picker:none"
const keepButtonKeys = (event: React.KeyboardEvent<HTMLButtonElement>) => {
  if (event.key === "Enter" || event.key === " ") event.stopPropagation()
}

/* Choosing a role only updates the current composer. Details replace the picker temporarily;
   returning preserves the search, and neither path starts a chat or sends the draft. */
export function RolePicker({ value, onChange, onPrompt, trigger, open, onOpenChange }: RolePickerProps) {
  const mobile = useIsMobile()
  const { favorites, toggleFavorite } = useRoles()
  const [ownOpen, setOwnOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [highlighted, setHighlighted] = React.useState(() => resolveRole(value)?.id ?? NO_ROLE_ITEM)
  const [details, setDetails] = React.useState<Role | null>(null)
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const applying = React.useRef(false)
  const switchingToDetails = React.useRef(false)
  const favoriteButtons = React.useRef(new Map<string, HTMLButtonElement>())
  const searchInput = React.useRef<HTMLInputElement>(null)
  const list = React.useRef<HTMLDivElement>(null)
  const isOpen = open ?? ownOpen
  const pickerVisible = isOpen && !detailsOpen
  const selected = resolveRole(value)
  const matches = searchRoles(query)
  const favoriteIds = new Set(favorites)
  const favoriteRoles = matches.filter((role) => favoriteIds.has(role.id))
  const otherRoles = matches.filter((role) => !favoriteIds.has(role.id))

  React.useEffect(() => {
    if (!pickerVisible) return
    const frame = requestAnimationFrame(() => {
      const scroller = list.current
      const active = scroller?.querySelector<HTMLElement>('[aria-checked="true"]')
      if (scroller && active) {
        const row = active.getBoundingClientRect()
        const box = scroller.getBoundingClientRect()
        scroller.scrollTop += row.top - box.top - (scroller.clientHeight - row.height) / 2
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [pickerVisible])

  const changeOpen = (next: boolean) => {
    if (next) {
      applying.current = false
      setHighlighted(selected?.id ?? NO_ROLE_ITEM)
    } else {
      setQuery("")
    }
    setOwnOpen(next)
    onOpenChange?.(next)
  }

  const apply = (role: Role | null, prompt?: string) => {
    applying.current = true
    onChange(role?.name ?? NO_ROLE)
    if (prompt && onPrompt) onPrompt(prompt)
    setDetailsOpen(false)
    changeOpen(false)
  }

  const inspect = (role: Role) => {
    switchingToDetails.current = true
    setDetails(role)
    setDetailsOpen(true)
  }

  const changePickerOpen = (next: boolean) => {
    // The detail dialog takes focus while the picker's exit animation is still mounted.
    if (!next && switchingToDetails.current) return
    changeOpen(next)
  }

  const row = (role: Role) => (
    <div key={role.id} className={cn("group/role-item relative rounded-xl hover:bg-muted focus-within:bg-muted has-data-selected:bg-muted", selected?.id === role.id && "bg-accent hover:bg-accent focus-within:bg-accent has-data-selected:bg-accent")}>
      <CommandItem
        value={role.id}
        onSelect={() => apply(role)}
        data-checked={selected?.id === role.id}
        aria-checked={selected?.id === role.id}
        className="min-h-14 min-w-0 gap-2.5 rounded-xl! py-2 pr-[76px] pl-2 data-selected:bg-transparent max-md:min-h-16 max-md:pr-24"
      >
        <RoleAvatar role={role} className="size-8 rounded-lg" />
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="truncate font-medium">{role.name}</span>
          <span className="truncate text-xs text-muted-foreground">{role.description}</span>
        </span>
      </CommandItem>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`${favoriteIds.has(role.id) ? "Убрать из избранного" : "В избранное"}: ${role.name}`}
        aria-pressed={favoriteIds.has(role.id)}
        ref={(button) => {
          if (button) favoriteButtons.current.set(role.id, button)
          else favoriteButtons.current.delete(role.id)
        }}
        onClick={() => {
          toggleFavorite(role.id)
          // Moving between groups must retain focus on the same action.
          requestAnimationFrame(() => favoriteButtons.current.get(role.id)?.focus({ preventScroll: true }))
        }}
        onKeyDown={keepButtonKeys}
        className="absolute top-1/2 right-10 size-8 -translate-y-1/2 rounded-lg max-md:right-12 max-md:size-10 max-md:rounded-full"
      >
        <HugeiconsIcon icon={StarIcon} strokeWidth={ICON_STROKE} className={cn(favoriteIds.has(role.id) && "fill-current text-primary")} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => inspect(role)}
        onKeyDown={keepButtonKeys}
        aria-label={`Подробнее о роли «${role.name}»`}
        className="absolute top-1/2 right-1 size-8 -translate-y-1/2 rounded-lg max-md:size-10 max-md:rounded-full"
      >
        <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={ICON_STROKE} />
      </Button>
    </div>
  )

  const contents = (
    <Command value={highlighted} onValueChange={setHighlighted} shouldFilter={false} label="Выбор роли" className="h-auto min-h-0 rounded-none! p-0 md:max-h-80">
      <div className="mx-2 mt-2 mb-1 shrink-0 border-b max-md:mx-1.5 max-md:mt-1">
        <MenuSearch ref={searchInput} bare command value={query} onChange={setQuery} placeholder="Найти роль" />
      </div>
      <CommandList ref={list} label="Роли" data-vaul-no-drag="" className="min-h-0 max-h-none flex-1 px-1">
        <CommandEmpty>
          <p>Роли не найдены</p>
          <p className="mt-1 px-4 text-xs text-muted-foreground">Попробуйте описать задачу другими словами.</p>
        </CommandEmpty>
        {!query.trim() && (
          <CommandGroup>
            <CommandItem value={NO_ROLE_ITEM} onSelect={() => apply(null)} data-checked={!selected} aria-checked={!selected} className="min-h-11 rounded-xl! px-3 aria-checked:bg-accent">
              <span className="flex-1">Без роли</span>
            </CommandItem>
          </CommandGroup>
        )}
        {favoriteRoles.length > 0 && <CommandGroup heading="Избранные">{favoriteRoles.map(row)}</CommandGroup>}
        {otherRoles.length > 0 && <CommandGroup heading={query.trim() ? "Найденные роли" : "Все роли"}>{otherRoles.map(row)}</CommandGroup>}
      </CommandList>
    </Command>
  )

  return (
    <>
      {mobile ? (
        <>
          {trigger && React.cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, { onClick: () => changeOpen(true) })}
          <AppSheet open={isOpen && !detailsOpen} onOpenChange={changePickerOpen}>
            <AppSheetContent aria-describedby={undefined} className="max-md:h-[85dvh]" onCloseAutoFocus={(event) => { if (switchingToDetails.current) event.preventDefault() }}>
              <AppSheetTitle className="sr-only">Роль для этого чата</AppSheetTitle>
              <AppSheetBody className="flex overflow-hidden px-0 md:px-0">{contents}</AppSheetBody>
            </AppSheetContent>
          </AppSheet>
        </>
      ) : (
        <Popover open={isOpen && !detailsOpen} onOpenChange={changePickerOpen}>
          {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}
          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={10}
            aria-label="Роль для этого чата"
            className="w-[380px] max-w-[calc(100vw-2rem)] gap-0 overflow-hidden rounded-2xl p-0 ring-border"
            onCloseAutoFocus={(event) => { if (switchingToDetails.current) event.preventDefault() }}
          >
            {contents}
          </PopoverContent>
        </Popover>
      )}
      <RoleDetailsSheet
        role={details}
        active={Boolean(details && details.id === selected?.id)}
        open={detailsOpen}
        onOpenChange={(next) => {
          setDetailsOpen(next)
          if (!next) {
            switchingToDetails.current = false
            if (applying.current) changeOpen(false)
          }
        }}
        onStart={apply}
        startLabel="Выбрать роль"
        promptLabel="Использовать этот запрос"
        allowPromptUse={Boolean(onPrompt)}
      />
    </>
  )
}
