import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { lastInput } from "@/lib/input-modality"
import { cn } from "@/lib/utils"

/* Destructive confirmation in the app's dialog proportions: 24px card, pill buttons, no footer band.
   Like AppSheet, it doesn't animate when opened or closed from the keyboard (`instant="keyboard"`). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  cancelLabel = "Отмена",
  instant = "keyboard",
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  actionLabel: string
  /* «Вернуться» when cancelling means going back to unsaved work. */
  cancelLabel?: string
  /* "keyboard" (default): no animation when opened/closed from the keyboard; true: never; false: always. */
  instant?: boolean | "keyboard"
  onConfirm: () => void
}) {
  const resolve = () => instant === true || (instant === "keyboard" && lastInput() === "keyboard")
  const [prevOpen, setPrevOpen] = React.useState(open)
  const [isInstant, setIsInstant] = React.useState(() => instant === true || (open && resolve()))
  // Decided per transition, as in AppSheet: Esc closes instantly, a click still animates.
  if (open !== prevOpen) {
    setPrevOpen(open)
    setIsInstant(resolve())
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        overlayClassName={cn("bg-black/15 backdrop-blur-none!", isInstant && "animate-none!")}
        className={cn(
          "gap-6 rounded-[24px] p-6 shadow-[0_12px_40px_-8px_rgb(0_0_0/0.14),0_2px_6px_rgb(0_0_0/0.04)] ring-foreground/6 max-md:p-5",
          isInstant && "animate-none!"
        )}
      >
        <AlertDialogHeader className="gap-2">
          <AlertDialogTitle className="text-lg leading-tight font-[500]">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-pretty">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mx-0 mb-0 gap-2 rounded-none border-0 bg-transparent p-0">
          <AlertDialogCancel variant="ghost" className="h-10 rounded-full px-4">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm} className="h-10 rounded-full px-4">
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
