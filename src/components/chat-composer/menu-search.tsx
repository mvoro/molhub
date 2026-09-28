import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { CommandInput } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ICON_STROKE } from "@/lib/icons"

/* The search field at the top of a menu or sheet: a filled box or, `bare`, the glyph and
   the field sitting on the surface itself with nothing drawn around them (models and roles). */
export function MenuSearch({
  value,
  onChange,
  placeholder,
  menu = false,
  bare = false,
  command = false,
  ref,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  /* Inside an AppMenu: keep the keys the field needs away from the menu's typeahead. */
  menu?: boolean
  bare?: boolean
  /** Keep the role list's combobox semantics and keyboard navigation. */
  command?: boolean
  ref?: React.Ref<HTMLInputElement>
}) {
  // In a dropdown every key is a typeahead jump: keep the ones the field needs; Escape closes the
  // menu; the down arrow steps into the first row (the menu only moves focus between rows).
  const onKeyDown = menu
    ? (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") return
        event.stopPropagation()
        if (event.key !== "ArrowDown") return
        event.preventDefault()
        event.currentTarget.closest<HTMLElement>("[role=menu]")?.querySelector<HTMLElement>("[role^=menuitem]")?.focus()
      }
    : undefined
  const inputRef = React.useRef<HTMLInputElement>(null)
  React.useImperativeHandle(ref, () => inputRef.current!, [])
  const clear = value && (
    <Button variant="ghost" size="icon-xs" aria-label="Очистить поиск" onClick={() => { onChange(""); inputRef.current?.focus({ preventScroll: true }) }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") event.stopPropagation() }} className="rounded-full">
      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} />
    </Button>
  )

  if (bare) {
    return (
      <div className="flex h-11 items-center gap-2.5 pr-2 pl-3.5">
        <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} className="size-[18px]! shrink-0 text-muted-foreground" />
        {command ? (
          <CommandInput
            bare
            ref={inputRef}
            value={value}
            onValueChange={onChange}
            placeholder={placeholder}
            aria-label={placeholder}
            data-vaul-no-drag=""
            className="h-full flex-1 py-1 md:text-sm"
          />
        ) : <Input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          data-vaul-no-drag=""
          onKeyDown={onKeyDown}
          className="h-full flex-1 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
        />}
        {clear}
      </div>
    )
  }

  return (
    <InputGroup className="h-9 rounded-[10px] bg-muted/60 pointer-coarse:h-10">
      <InputGroupAddon className="pl-3">
        <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} className="size-4!" />
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        data-vaul-no-drag=""
        onKeyDown={onKeyDown}
        className="text-base md:text-sm"
      />
      {clear && (
        <InputGroupAddon align="inline-end" className="pr-1">
          {clear}
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

