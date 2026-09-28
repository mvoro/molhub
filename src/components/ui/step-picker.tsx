import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

/* A level picked from a few steps (Suno's «Креативность»): a row of blocks — the chosen one in
   primary, the ones before it filled, the rest faint — and the value on the right. Built on the
   library ToggleGroup (single): a radio group, arrow keys step through the levels. */

type StepPickerProps = {
  /* Number of levels (blocks). */
  steps: number
  /* Chosen level, 0 … steps − 1. */
  value: number
  onValueChange: (value: number) => void
  /* How a level reads, on the right and to screen readers. */
  format?: (step: number) => string
  "aria-label": string
  className?: string
}

const percent = (steps: number) => (step: number) => `${Math.round((step / (steps - 1)) * 100)}%`

function StepPicker({ steps, value, onValueChange, format, className, ...props }: StepPickerProps) {
  const label = format ?? percent(steps)
  return (
    <div data-slot="step-picker" className={cn("flex w-full min-w-0 items-center gap-3", className)}>
      <ToggleGroup
        type="single"
        value={String(value)}
        onValueChange={(next) => next && onValueChange(Number(next))}
        spacing={1}
        aria-label={props["aria-label"]}
        className="min-w-0 flex-1"
      >
        {Array.from({ length: steps }, (_, step) => (
          <ToggleGroupItem
            key={step}
            value={String(step)}
            aria-label={label(step)}
            data-filled={step < value || undefined}
            className={cn(
              "h-7 min-w-0 flex-1 rounded-md px-0",
              "bg-foreground/8 transition-[background-color,scale] duration-150 ease-(--ease-out) hover:bg-foreground/15",
              "data-filled:bg-foreground/20 data-[state=on]:bg-primary data-[state=on]:hover:bg-primary",
              "active:scale-[0.94] motion-reduce:active:scale-100"
            )}
          />
        ))}
      </ToggleGroup>
      <span aria-hidden="true" className="min-w-10 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
        {label(value)}
      </span>
    </div>
  )
}

export { StepPicker }
