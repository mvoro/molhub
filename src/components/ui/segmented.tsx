import * as React from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

/* Segmented control: one of a few options in a grey track, the chosen one lifted on a white pill
   (like the tabs in the model picker). Built on the library ToggleGroup (single): radio semantics,
   arrow keys move between options. Clicking the chosen option again keeps it — unless `allowEmpty`,
   for settings where «nothing chosen» means «let the model decide». */

type SegmentedProps = Omit<
  React.ComponentProps<typeof ToggleGroup>,
  "type" | "value" | "defaultValue" | "onValueChange" | "spacing" | "variant" | "size"
> & {
  value: string
  onValueChange: (value: string) => void
  allowEmpty?: boolean
  size?: "default" | "sm"
}

const SegmentedContext = React.createContext<{ size: "default" | "sm" }>({ size: "default" })

function Segmented({ value, onValueChange, allowEmpty = false, size = "default", className, children, ...props }: SegmentedProps) {
  return (
    <SegmentedContext.Provider value={{ size }}>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => (next || allowEmpty) && onValueChange(next)}
        spacing={0.5}
        data-slot="segmented"
        className={cn("w-full rounded-full bg-muted p-1", size === "sm" && "w-auto p-0.5", className)}
        {...props}
      >
        {children}
      </ToggleGroup>
    </SegmentedContext.Provider>
  )
}

function SegmentedItem({ className, ...props }: Omit<React.ComponentProps<typeof ToggleGroupItem>, "variant" | "size">) {
  const { size } = React.useContext(SegmentedContext)
  return (
    <ToggleGroupItem
      data-slot="segmented-item"
      className={cn(
        "h-8 min-w-0 flex-1 rounded-full px-3 text-sm font-medium text-muted-foreground",
        "transition-[background-color,color,box-shadow] duration-150 ease-(--ease-out)",
        "hover:bg-transparent hover:text-foreground",
        "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm dark:data-[state=on]:bg-input/40",
        size === "sm" && "h-7 px-3 text-[13px]",
        className
      )}
      {...props}
    />
  )
}

export { Segmented, SegmentedItem }
