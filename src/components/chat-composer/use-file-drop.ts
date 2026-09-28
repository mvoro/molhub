import * as React from "react"
import { WorkspaceVisibilityContext } from "@/hooks/workspace-visibility"

/* Files dragged anywhere over the window (the user's ask, 27.09: the drop zone is the whole screen, not
   just the composer), as in ChatGPT. Listens on the window: the enter/leave pairs of the elements under
   the pointer are counted, so the zone stays up while the files cross them and goes when they leave
   the window. Only drags that carry files count (text or links dragged inside the page don't). While
   `disabled` (a reply is being written) the zone doesn't show and the drop is refused. */
export function useFileDrop({ disabled = false, onDrop }: { disabled?: boolean; onDrop: (files: FileList) => void }) {
  const visible = React.useContext(WorkspaceVisibilityContext)
  const blocked = disabled || !visible
  const [active, setActive] = React.useState(false)
  const depth = React.useRef(0)
  const latest = React.useRef(onDrop)
  React.useEffect(() => {
    latest.current = onDrop
  })

  React.useEffect(() => {
    const carriesFiles = (event: DragEvent) => Boolean(event.dataTransfer?.types.includes("Files"))
    const reset = () => {
      depth.current = 0
      setActive(false)
    }
    const enter = (event: DragEvent) => {
      if (!carriesFiles(event)) return
      event.preventDefault()
      depth.current += 1
      setActive(true)
    }
    const over = (event: DragEvent) => {
      if (!carriesFiles(event)) return
      // Without this the browser opens a dropped file in the tab.
      event.preventDefault()
      if (event.dataTransfer) event.dataTransfer.dropEffect = blocked ? "none" : "copy"
    }
    const leave = (event: DragEvent) => {
      if (!carriesFiles(event)) return
      depth.current = Math.max(0, depth.current - 1)
      if (depth.current === 0) setActive(false)
    }
    const drop = (event: DragEvent) => {
      if (!carriesFiles(event)) return
      event.preventDefault()
      reset()
      if (!blocked && event.dataTransfer?.files.length) latest.current(event.dataTransfer.files)
    }
    window.addEventListener("dragenter", enter)
    window.addEventListener("dragover", over)
    window.addEventListener("dragleave", leave)
    window.addEventListener("drop", drop)
    // Esc or a drop outside the browser ends a drag without a drop here.
    window.addEventListener("dragend", reset)
    return () => {
      window.removeEventListener("dragenter", enter)
      window.removeEventListener("dragover", over)
      window.removeEventListener("dragleave", leave)
      window.removeEventListener("drop", drop)
      window.removeEventListener("dragend", reset)
    }
  }, [blocked])

  return active && !blocked
}
