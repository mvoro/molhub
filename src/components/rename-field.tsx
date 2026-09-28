import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

/* Inline rename, like ChatGPT: the row turns into a field of the same size.
   Enter or leaving the field saves, Esc cancels; an empty name keeps the old one.
   Used by the sidebar rows, the project page's chat rows and the chat's breadcrumbs. */
export function RenameField({
  value,
  label,
  icon,
  color,
  className,
  inputClassName,
  maxLength = 120,
  onDone,
}: {
  value: string
  label: string
  icon?: IconSvgElement
  color?: string
  className?: string
  inputClassName?: string
  maxLength?: number
  onDone: (next: string | null) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const finished = React.useRef(false)

  React.useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const finish = (next: string | null) => {
    if (finished.current) return
    finished.current = true
    const name = next?.trim()
    onDone(name && name !== value ? name : null)
  }

  return (
    <InputGroup className={cn("h-9 rounded-[10px] bg-sidebar pointer-coarse:h-10 has-[[data-slot=input-group-control]:focus-visible]:ring-0", className)}>
      {icon && (
        <InputGroupAddon className="pr-0 pl-[8px] text-sidebar-foreground">
          <HugeiconsIcon strokeWidth={ICON_STROKE} icon={icon} color={color ?? "currentColor"} className="size-[18px]!" />
        </InputGroupAddon>
      )}
      <InputGroupInput
        ref={inputRef}
        defaultValue={value}
        aria-label={label}
        maxLength={maxLength}
        onKeyDown={(event) => {
          if (event.key === "Enter") finish(event.currentTarget.value)
          if (event.key === "Escape") {
            // Keeps Esc from also closing the mobile menu.
            event.stopPropagation()
            finish(null)
          }
        }}
        onBlur={(event) => finish(event.currentTarget.value)}
        className={cn("h-full px-[8px] text-sm md:text-sm", icon && "pl-2.5!", inputClassName)}
      />
    </InputGroup>
  )
}

/* Rename starts from a menu item: the closing menu must not pull focus back to its trigger,
   or the fresh field would blur and save immediately. */
export function useRename() {
  const [renaming, setRenaming] = React.useState(false)
  const keepFocus = React.useRef(false)

  return {
    renaming,
    start: () => {
      keepFocus.current = true
      setRenaming(true)
    },
    stop: () => setRenaming(false),
    onCloseAutoFocus: (event: Event) => {
      if (!keepFocus.current) return
      keepFocus.current = false
      event.preventDefault()
    },
  }
}
