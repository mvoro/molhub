import type * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

/** Square by default for project rows; media surfaces override it with rounded-full. */
export function MoreActionButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Ещё"
      {...props}
      className={cn("size-9 shrink-0 rounded-[10px] active:scale-[0.96] [&_svg]:size-[18px]", className)}
    >
      <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={ICON_STROKE} />
    </Button>
  )
}
