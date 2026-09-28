import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Project } from "@/data/chats"
import { ICON_STROKE, PROJECT_ICONS, projectIcon } from "@/lib/icons"
import { PROJECT_COLOR_IDS, PROJECT_COLOR_NAMES, projectColor, type ProjectColor } from "@/lib/project-colors"
import { cn } from "@/lib/utils"

/* A project's icon in its colour (sidebar-free places: the project page, the phone header, crumbs, badges). */
export function ProjectGlyph({ project, className }: { project: Pick<Project, "color" | "icon">; className?: string }) {
  return <HugeiconsIcon icon={projectIcon(project.icon)} strokeWidth={ICON_STROKE} color={projectColor(project.color)} className={className} />
}

/* ToggleGroup needs a value for «no tint»; the project stores none. */
const NO_COLOR = "none"
const SWATCHES = [NO_COLOR, ...PROJECT_COLOR_IDS] as const

/* Press feedback on a cell (it's a toggle, not a Button, so it doesn't get the app's press by itself);
   no `transition-all` — a pick lands in the same frame (spec §11). */
const CELL =
  "shrink-0 p-0 transition-transform duration-(--duration-press) ease-(--ease-out) active:scale-[0.96] motion-reduce:transition-none"

/* «Цвет + иконка» (ChatGPT's project picker, spec D6): eight colours — none (the text colour) and seven
   tints — six to a row, a rule, then the 6×5 grid of icons. A pick applies at once and the popover stays
   open, so both can be changed in one go; a click outside or Esc closes it. No «Свой цвет». */
export function ProjectAppearance({
  color,
  icon,
  onChange,
  children,
  align = "start",
  side = "bottom",
}: {
  color?: ProjectColor
  icon?: string
  onChange: (next: { color?: ProjectColor; icon?: string }) => void
  /* The trigger (asChild). */
  children: React.ReactElement
  align?: "start" | "center" | "end"
  side?: "top" | "bottom"
}) {
  const current = icon ?? PROJECT_ICONS[0].id
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} side={side} data-vaul-no-drag="" className="w-auto rounded-[20px] p-3">
        <ToggleGroup
          type="single"
          spacing={1}
          value={color ?? NO_COLOR}
          // Radix sends "" when the chosen one is pressed again: keep it.
          onValueChange={(next) => next && onChange({ color: next === NO_COLOR ? undefined : (next as ProjectColor), icon })}
          aria-label="Цвет проекта"
          className="grid grid-cols-6"
        >
          {SWATCHES.map((id) => {
            const fill = id === NO_COLOR ? "var(--foreground)" : projectColor(id)
            return (
              <ToggleGroupItem
                key={id}
                value={id}
                aria-label={id === NO_COLOR ? "Без цвета" : PROJECT_COLOR_NAMES[id]}
                className={cn(
                  CELL,
                  "group/swatch size-9 min-w-9 rounded-full hover:bg-transparent data-[state=on]:bg-transparent pointer-coarse:size-10",
                  "pointer-fine:data-[state=off]:hover:[&>span]:ring-2 pointer-fine:data-[state=off]:hover:[&>span]:ring-current/35"
                )}
              >
                {/* The chosen one gets a ring of its own colour, off the dot by the popover's background; under
                    the mouse the others get a pale one (the item's classes: the chosen ring stays whole). */}
                <span
                  style={{ backgroundColor: fill, color: fill }}
                  className="size-7 rounded-full ring-offset-2 ring-offset-popover group-data-[state=on]/swatch:ring-2 group-data-[state=on]/swatch:ring-current"
                />
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>

        <Separator className="my-2.5" />

        <ToggleGroup
          type="single"
          spacing={1}
          value={current}
          onValueChange={(next) => next && onChange({ color, icon: next })}
          aria-label="Иконка проекта"
          className="grid grid-cols-6"
        >
          {PROJECT_ICONS.map((item) => (
            <ToggleGroupItem
              key={item.id}
              value={item.id}
              aria-label={item.label}
              className={cn(
                CELL,
                "size-9 min-w-9 rounded-xl border border-transparent text-foreground hover:text-foreground data-[state=on]:border-border pointer-coarse:size-10"
              )}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={ICON_STROKE} className="size-5" />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </PopoverContent>
    </Popover>
  )
}
