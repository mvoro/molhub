import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { Slot } from "radix-ui"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { lastInput } from "@/lib/input-modality"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

/* The app's modal. Every modal except confirmations (ConfirmDialog) goes through it:
   - mobile (<768px): a bottom sheet on the library Drawer (vaul): handle, drag-to-dismiss,
     24px top corners, 85dvh cap, safe-area padding;
   - desktop: a centered library Dialog, 24px corners, the AppMenu shadow.
   Both share the quiet overlay without blur. One API for both:

   <AppSheet open={open} onOpenChange={setOpen}>
     <AppSheetContent className="md:max-w-[440px]">
       <AppSheetHeader>
         <AppSheetTitle>Новый проект</AppSheetTitle>
         <AppSheetDescription>…</AppSheetDescription>
       </AppSheetHeader>
       <AppSheetBody>…</AppSheetBody>
       <AppSheetFooter>…</AppSheetFooter>
     </AppSheetContent>
   </AppSheet>

   Sizing: the mobile/desktop switch is the `md` breakpoint, so `md:` classes on the content
   only ever reach the dialog and `max-md:` classes only the sheet.

   variant="fullscreen" covers the whole viewport on both (no handle, no drag, close button in
   the header). Use it ONLY when the user explicitly asks for «фс модалка». */

/* Keyboard-opened modals appear instantly (Emil: never animate keyboard-initiated actions); the
   last input modality comes from `lib/input-modality`. */

const SHADOW = "shadow-[0_12px_40px_-8px_rgb(0_0_0/0.14),0_2px_6px_rgb(0_0_0/0.04)] ring-1 ring-foreground/6"

type AppSheetState = {
  mobile: boolean
  instant: boolean
  dismissible: boolean
  onDismissAttempt?: () => void
}
const AppSheetContext = React.createContext<AppSheetState>({ mobile: false, instant: false, dismissible: true })
const useAppSheet = () => React.useContext(AppSheetContext)

/* `dismissible={false}` (unsaved edits): Esc, the overlay, the close button and AppSheetClose don't close
   the modal but call `onDismissAttempt` (ask «Не сохранять изменения?»); on the phone the sheet can't be
   swiped away — vaul springs it back. Closing through `open` still works. */
function AppSheet({
  open,
  defaultOpen,
  onOpenChange,
  instant = "keyboard",
  dismissible = true,
  onDismissAttempt,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /* "keyboard" (default): no animation when opened/closed from the keyboard (⌘K, Enter, Esc);
     true: never animate; false: always animate. */
  instant?: boolean | "keyboard"
  dismissible?: boolean
  onDismissAttempt?: () => void
  children?: React.ReactNode
}) {
  const mobile = useIsMobile()
  const resolve = () => instant === true || (instant === "keyboard" && lastInput() === "keyboard")
  const [prevOpen, setPrevOpen] = React.useState(open)
  const [isInstant, setIsInstant] = React.useState(() => instant === true || (Boolean(open) && resolve()))
  // Decided per transition (open and close separately): ⌘K opens instantly, a click on the
  // overlay still animates the close.
  if (open !== prevOpen) {
    setPrevOpen(open)
    setIsInstant(resolve())
  }

  // Any close the library asks for (Esc, the overlay, a close button) becomes an attempt while not dismissible.
  const change = (next: boolean) => {
    if (!next && !dismissible) {
      onDismissAttempt?.()
      return
    }
    onOpenChange?.(next)
  }

  const context = { mobile, instant: isInstant, dismissible, onDismissAttempt }
  return (
    <AppSheetContext.Provider value={context}>
      {mobile ? (
        <Drawer open={open} defaultOpen={defaultOpen} onOpenChange={change} dismissible={dismissible}>
          {children}
        </Drawer>
      ) : (
        <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={change}>
          {children}
        </Dialog>
      )}
    </AppSheetContext.Provider>
  )
}

type ContentProps = Omit<React.ComponentProps<typeof DialogContent>, "showCloseButton" | "overlayClassName"> & {
  variant?: "sheet" | "fullscreen"
}

function AppSheetContent({ variant = "sheet", className, onOpenAutoFocus, onEscapeKeyDown, onPointerDownOutside, ...props }: ContentProps) {
  const { mobile, instant, dismissible, onDismissAttempt } = useAppSheet()
  const ref = React.useRef<HTMLDivElement>(null)
  const fullscreen = variant === "fullscreen"
  // vaul swallows Esc and overlay taps outright when not dismissible; they still count as attempts.
  const attempt = mobile && !dismissible
  const guards = {
    onEscapeKeyDown: (event: KeyboardEvent) => {
      onEscapeKeyDown?.(event)
      if (attempt && !event.defaultPrevented) onDismissAttempt?.()
    },
    onPointerDownOutside: (event: Parameters<NonNullable<ContentProps["onPointerDownOutside"]>>[0]) => {
      onPointerDownOutside?.(event)
      if (attempt && !event.defaultPrevented) onDismissAttempt?.()
    },
  }

  const shared = {
    ref,
    tabIndex: -1,
    "data-variant": variant,
    onOpenAutoFocus: (event: Event) => {
      onOpenAutoFocus?.(event)
      if (event.defaultPrevented) return
      // Land on the modal itself: Tab starts inside it, and the close button's tooltip
      // doesn't pop open on its own (vaul would skip autofocus altogether).
      event.preventDefault()
      ref.current?.focus({ preventScroll: true })
    },
  }
  const overlayClassName = cn(
    "bg-black/15 backdrop-blur-none! supports-backdrop-filter:backdrop-blur-none",
    instant && "animate-none!"
  )

  if (mobile) {
    return (
      <DrawerContent
        {...shared}
        {...(props as React.ComponentProps<typeof DrawerContent>)}
        {...guards}
        // A full-screen page has no handle and no drag: header button or Esc closes it.
        data-vaul-no-drag={fullscreen ? "" : undefined}
        overlayClassName={cn("data-[state=closed]:[animation-duration:240ms]!", overlayClassName)}
        className={cn(
          "gap-0 pb-[env(safe-area-inset-bottom)] outline-none",
          // Exit faster than enter; vaul's own 500ms drawer curve stays for the entrance.
          "data-[state=closed]:[animation-duration:240ms]! motion-reduce:animate-none!",
          instant && "animate-none!",
          // Handle: the library renders it as the first child.
          "[&>div:first-child]:mt-2 [&>div:first-child]:mb-1 [&>div:first-child]:h-1 [&>div:first-child]:w-9 [&>div:first-child]:bg-foreground/15",
          fullscreen
            ? "pt-[env(safe-area-inset-top)] data-[vaul-drawer-direction=bottom]:top-0 data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:h-dvh data-[vaul-drawer-direction=bottom]:max-h-none data-[vaul-drawer-direction=bottom]:rounded-t-none data-[vaul-drawer-direction=bottom]:border-t-0 [&>div:first-child]:hidden!"
            : cn(
                "data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-[85dvh] data-[vaul-drawer-direction=bottom]:rounded-t-[24px] data-[vaul-drawer-direction=bottom]:border-t-0",
                SHADOW
              ),
          className
        )}
      />
    )
  }

  return (
    <DialogContent
      {...shared}
      {...props}
      onEscapeKeyDown={onEscapeKeyDown}
      onPointerDownOutside={onPointerDownOutside}
      showCloseButton={false}
      overlayClassName={overlayClassName}
      className={cn(
        "flex flex-col gap-0 overflow-hidden p-0",
        instant && "animate-none!",
        fullscreen
          ? // Fade only: a zoom on something the size of the window reads as a page jump.
            "inset-0 h-dvh max-w-none translate-x-0 translate-y-0 rounded-none ring-0 sm:max-w-none data-open:zoom-in-100 data-closed:zoom-out-100"
          : cn("max-h-[calc(100dvh-4rem)] rounded-[24px] sm:max-w-none md:max-w-[480px]", SHADOW),
        className
      )}
    />
  )
}

/* Title block on the left, close button on the right (always there: fullscreen needs it,
   and on desktop it carries the Esc hint). */
function AppSheetHeader({
  className,
  children,
  closeLabel = "Закрыть",
  showClose = true,
  ...props
}: React.ComponentProps<"div"> & { closeLabel?: string; showClose?: boolean }) {
  const { mobile } = useAppSheet()
  const Header = mobile ? DrawerHeader : DialogHeader
  return (
    <Header
      className={cn(
        "shrink-0 flex-row items-start gap-2 px-5 pt-3 pb-4 text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left md:gap-2 md:px-6 md:pt-5",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-2">{children}</div>
      {showClose && <AppSheetCloseButton label={closeLabel} className="-mr-2" />}
    </Header>
  )
}

function AppSheetTitle({ className, ...props }: React.ComponentProps<typeof DialogTitle>) {
  const Title = useAppSheet().mobile ? DrawerTitle : DialogTitle
  return <Title className={cn("text-lg leading-tight font-[500]", className)} {...props} />
}

function AppSheetDescription({ className, ...props }: React.ComponentProps<typeof DialogDescription>) {
  const Description = useAppSheet().mobile ? DrawerDescription : DialogDescription
  return <Description className={cn("text-sm text-pretty", className)} {...props} />
}

/* The scrolling middle: the modal is height-capped and only this part scrolls. */
function AppSheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-sheet-body"
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 md:px-6", className)}
      {...props}
    />
  )
}

/* Actions on the right on desktop; equal-width buttons across the sheet on mobile. */
function AppSheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  const Footer = useAppSheet().mobile ? DrawerFooter : DialogFooter
  return (
    <Footer
      className={cn(
        "m-0 mt-0 shrink-0 flex-row justify-end gap-2 rounded-none border-0 bg-transparent px-5 pt-5 pb-5 max-md:*:flex-1 md:px-6 md:pb-6",
        className
      )}
      {...props}
    />
  )
}

function AppSheetClose({ asChild, onClick, ...props }: React.ComponentProps<typeof DialogClose>) {
  const { mobile, dismissible, onDismissAttempt } = useAppSheet()
  if (!dismissible) {
    // Not a library Close: vaul would refuse it silently; this asks instead.
    const Comp = asChild ? Slot.Root : "button"
    return (
      <Comp
        {...props}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event)
          if (!event.defaultPrevented) onDismissAttempt?.()
        }}
      />
    )
  }
  const Close = mobile ? DrawerClose : DialogClose
  return <Close asChild={asChild} onClick={onClick} {...props} />
}

/* Round ghost close button with an «Esc» hint on desktop. */
function AppSheetCloseButton({
  label = "Закрыть",
  className,
  ...props
}: React.ComponentProps<typeof Button> & { label?: string }) {
  const { mobile } = useAppSheet()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <AppSheetClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label={label}
            className={cn(
              "shrink-0 rounded-full text-muted-foreground active:translate-y-0 active:scale-[0.96] max-md:size-10 md:hover:bg-muted [&_svg]:size-5",
              className
            )}
            {...props}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} />
          </Button>
        </AppSheetClose>
      </TooltipTrigger>
      <TooltipContent side="top" hidden={mobile}>
        {label} <Kbd>Esc</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}

export {
  AppSheet,
  AppSheetContent,
  AppSheetHeader,
  AppSheetTitle,
  AppSheetDescription,
  AppSheetBody,
  AppSheetFooter,
  AppSheetClose,
  AppSheetCloseButton,
}
