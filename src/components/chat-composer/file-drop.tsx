import { createPortal } from "react-dom"

import { withBasePath } from "@/lib/base-path"
import { cn } from "@/lib/utils"

/* The zone over the whole window while files are dragged: the page fades behind a dashed frame with
   the file fan illustration and the limits. Purely visual (no pointer events of its own; the window takes the
   drop). It comes in with its opacity and settles from 0.98 (150ms, --ease-out) and leaves faster
   (100ms), as a transition, so the enter/leave flicker of a drag retargets it instead of restarting it;
   reduced motion keeps the fade only. Stays mounted, so the exit plays. */
export function FileDropOverlay({
  active,
  title = "Перетащите файлы сюда",
  limit,
}: {
  active: boolean
  title?: string
  limit: string
}) {
  if (typeof document === "undefined") return null
  return createPortal(
    <div
      aria-hidden={!active}
      data-state={active ? "open" : "closed"}
      className={cn(
        "group/drop pointer-events-none fixed inset-0 z-[70] flex p-3 md:p-4",
        "bg-background/92 opacity-0 transition-opacity duration-100 ease-(--ease-out) data-[state=open]:opacity-100 data-[state=open]:duration-150"
      )}
    >
      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-4 rounded-[28px] border-2 border-dashed border-primary/40 bg-primary/5 text-center",
          "scale-[0.98] transition-transform duration-100 ease-(--ease-out) group-data-[state=open]/drop:scale-100 group-data-[state=open]/drop:duration-150 motion-reduce:scale-100 motion-reduce:transition-none"
        )}
      >
        {/* Trim only the PNG's transparent vertical padding; keep the approved artwork undistorted. */}
        <div aria-hidden="true" className="relative aspect-[8/5] w-48 shrink-0 md:w-56">
          <img
            src={withBasePath("/illustrations/file-drop-fan.png")}
            alt=""
            width={1254}
            height={1254}
            draggable={false}
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-1.5 px-6">
          <p role={active ? "status" : undefined} className="text-lg leading-tight font-medium text-balance md:text-xl">
            {title}
          </p>
          <p className="text-sm text-muted-foreground">{limit}</p>
        </div>
      </div>
    </div>,
    document.body
  )
}
