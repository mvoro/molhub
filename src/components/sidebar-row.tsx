import { Kbd, KbdGroup } from "@/components/ui/kbd"

/* Shared by the navigation (sidebar-nav) and the history lists (app-sidebar). */

/* Every row keeps its 18px icon at a fixed x (9px inside a 36px column),
   so collapsing to the rail only animates the panel width — icons never jump. */
export const ROW =
  "h-9 gap-2.5 rounded-[10px] px-[9px] text-sm font-normal focus-visible:ring-inset data-active:font-normal pointer-coarse:h-10 [&_svg]:size-[18px] [&>span:last-child]:text-clip"
/* Labels clip and fade at the edge (like ChatGPT) instead of flashing "…" while the panel resizes. */
export const LABEL_BASE = "sidebar-fade min-w-0 flex-1 overflow-hidden whitespace-nowrap"
export const LABEL = `${LABEL_BASE} mask-r-from-[calc(100%-20px)]`

export function Hotkey({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <KbdGroup className={className}>
      {keys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
    </KbdGroup>
  )
}
