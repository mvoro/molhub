"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Tabs as TabsPrimitive } from "radix-ui"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

/* The project's one tab look (ai-hub/CLAUDE.md, «Табы», size M — the Archive's): a grey pill track
   with a 4px inset, 36px everywhere — the height of the app's controls, the phone's menu button
   included (the user's ask, 27.09: it was 40px on the phone) — full width on the phone and fitted to
   its content on desktop. Screens use the list as is, without size overrides.
   `compact` (the photo and video studios, the user's ask, 27.09): on the phone too the list fits its
   content, and a tab shows its name only while active — the others keep their icon, the name staying
   for screen readers. The name must then sit in its own <span> after the icon. */
const tabsListVariants = cva(
  "group/tabs-list inline-flex items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default:
          "w-full rounded-full bg-muted p-1 group-data-horizontal/tabs:h-9 group-data-vertical/tabs:rounded-2xl md:w-fit data-compact:w-fit",
        line: "w-fit gap-1 rounded-none bg-transparent p-[3px] group-data-horizontal/tabs:h-8",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  compact = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants> & { compact?: boolean }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-compact={compact || undefined}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

/* A segment fills the track's height as a pill, 16px on the sides; the active one is a white pill without
   a shadow. With an icon, its side is 2px tighter (the library button's rule), so an icon tab stays even.
   In a compact list on the phone an inactive segment is the icon alone, 10px either side. */
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-full border border-transparent px-4 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-[color,background-color,border-color,box-shadow] group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "group-data-compact/tabs-list:flex-none max-md:group-data-compact/tabs-list:data-[state=inactive]:pr-2.5 max-md:group-data-compact/tabs-list:data-[state=inactive]:pl-2.5 max-md:group-data-compact/tabs-list:data-[state=inactive]:[&>span]:sr-only",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
