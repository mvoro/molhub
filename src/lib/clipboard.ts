import { toast } from "sonner"

async function writeClipboardText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // A browser or embedded page may deny the async API. Try the selection-based path below.
    }
  }

  // HTTP previews on phones have no Clipboard API. Keep this synchronous within the press event.
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const selection = window.getSelection()
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange()) : []
  const field = document.createElement("textarea")
  field.value = text
  field.readOnly = true
  field.tabIndex = -1
  // iOS needs a selectable, mounted field. Readonly + 16px avoids its keyboard and input zoom.
  field.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;font-size:16px;pointer-events:none"
  // A modal's focus trap must not steal focus before the copy command runs.
  const container = previous?.closest('[role="dialog"], [role="alertdialog"]') ?? document.body
  container.append(field)
  try {
    field.focus({ preventScroll: true })
    field.select()
    field.setSelectionRange(0, text.length)
    if (!document.execCommand("copy")) throw new Error("Copy failed")
  } finally {
    field.remove()
    if (previous?.isConnected) previous.focus({ preventScroll: true })
    if (selection) {
      selection.removeAllRanges()
      ranges.forEach((range) => selection.addRange(range))
    }
  }
}

export async function copyText(text: string, successMessage = "Скопировано"): Promise<void> {
  await writeClipboardText(text)
  toast.success(successMessage)
}
