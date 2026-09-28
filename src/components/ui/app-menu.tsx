import * as React from "react"
import { createPortal } from "react-dom"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"
import { lastInput } from "@/lib/input-modality"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

/* App-wide action menu in ChatGPT's proportions, on top of the library dropdown:
   20px card with a soft wide shadow, 36px rows with 18px icons, 22px from the edge
   to the icon, separators inset 16px. Rows match sidebar rows: 10px radius, and the
   hover fade + press scale come from the shared rule in index.css. Compose it like the library one:

   <AppMenu>
     <AppMenuTrigger asChild>…</AppMenuTrigger>
     <AppMenuContent>
       <AppMenuItem icon={PencilEdit01Icon}>Переименовать</AppMenuItem>
       <AppMenuSeparator />
       <AppMenuItem icon={Delete02Icon} variant="destructive">Удалить</AppMenuItem>
     </AppMenuContent>
   </AppMenu> */

/* Never modal (the user's ask, 27.09: one menu open at most, and opening another closes it). The
   library's modal menu turns the rest of the page off while it's open, so a click on another menu's
   button only closed this one, and a second click was needed to open the next. Non-modal, the same
   click dismisses this menu (it lands outside) and opens that one. Two menus are never open at once:
   any press outside a menu closes it. */
const MenuStateContext = React.createContext<{ open: boolean; change: (open: boolean) => void } | null>(null)

function AppMenu({ modal = false, open: controlledOpen, defaultOpen = false, onOpenChange, ...props }: React.ComponentProps<typeof DropdownMenu>) {
  const mobile = useIsMobile()
  const [ownOpen, setOwnOpen] = React.useState(defaultOpen)
  const open = controlledOpen ?? ownOpen
  const [page, setPage] = React.useState<string | null>(null)
  const drill = React.useMemo(() => (mobile ? { page, setPage } : null), [mobile, page])
  const change = (next: boolean) => {
    if (next) setPage(null)
    setOwnOpen(next)
    onOpenChange?.(next)
  }
  return (
    <MenuStateContext.Provider value={{ open, change }}>
    <DrillContext.Provider value={drill}>
      <DropdownMenu
        modal={modal}
        {...props}
        open={open}
        onOpenChange={change}
      />
    </DrillContext.Provider>
    </MenuStateContext.Provider>
  )
}

function AppMenuTrigger({ onPointerDown, onPointerCancel, onClick, ...props }: React.ComponentProps<typeof DropdownMenuTrigger>) {
  const menu = React.useContext(MenuStateContext)
  const touch = React.useRef(false)
  return (
    <DropdownMenuTrigger
      {...props}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        touch.current = event.pointerType === "touch" && !event.defaultPrevented
        // Open after the tap completes. Opening on touch-down races the following native focus/click
        // (and may dismiss the freshly mounted menu), or opens while the user starts scrolling.
        if (touch.current) event.preventDefault()
      }}
      onPointerCancel={(event) => { touch.current = false; onPointerCancel?.(event) }}
      onClick={(event) => {
        onClick?.(event)
        if (touch.current && !event.defaultPrevented) menu?.change(!menu.open)
        touch.current = false
      }}
    />
  )
}

/* Closed by a pick with the mouse or a tap, the menu gives focus back to its button without lighting
   its ring (the user's ask, 27.09: the model button wore a violet outline after every pick). The
   browser shows the ring on a focus set by script when focus was just in a text field — the model
   picker's search. From the keyboard the library's way stays: the button, ring on. Where the browser
   can't focus quietly, focus is let go (as after a click outside the menu). */
function quietFocusBack(event: Event) {
  if (lastInput() !== "pointer") return
  const content = event.target as HTMLElement | null
  const trigger = document.getElementById(content?.getAttribute("aria-labelledby") ?? "")
  if (!trigger) return
  event.preventDefault()
  trigger.focus({ preventScroll: true, focusVisible: false } as FocusOptions)
  if (trigger.matches(":focus-visible")) trigger.blur()
}

/* Submenus on the phone (the user's ask, 27.09): the library only ever puts a submenu beside its
   menu, right or left, and never slides it sideways, so next to a 250px menu on a 375px screen it
   ran off the edge either way. There a submenu opens in its menu's place, as on iOS: its rows under a
   «‹ Title» row that goes back, in the same card. On desktop submenus stay beside the menu. The menu
   holds which submenu is open (`page`); its content hides its own rows and lends the submenu a slot. */
type Drill = { page: string | null; setPage: (page: string | null) => void }
const DrillContext = React.createContext<Drill | null>(null)
const DrillSlotContext = React.createContext<HTMLDivElement | null>(null)
const SubIdContext = React.createContext<string | null>(null)

/* `collisionPadding`: a menu pushed against the screen's edge keeps 8px off it (the library's 0 left
   the phone's chat menu flush with the edge). A menu grows with its longest row up to 288px and never
   past the screen: a long project name ran the phone's project menu off the edge (the user's ask,
   27.09), now it's cut with «…» (rows put a long label in `min-w-0 flex-1 truncate`). */
function AppMenuContent({
  className,
  sideOffset = 6,
  collisionPadding = 8,
  onCloseAutoFocus,
  onInteractOutside,
  onFocusOutside,
  ref,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  const drill = React.useContext(DrillContext)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [slot, setSlot] = React.useState<HTMLDivElement | null>(null)
  // Closed by a press or focus outside, the menu leaves focus where that went, as the library's own
  // non-modal menu does (the user's bug, 27.09): pulled back to this trigger when the fade ended, it
  // shut the model picker just opened from a setting's menu — focus left the picker for the setting.
  const closedOutside = React.useRef(false)
  return (
    <DropdownMenuContent
      ref={(node) => {
        contentRef.current = node
        if (typeof ref === "function") return ref(node)
        if (ref) ref.current = node
      }}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      onFocusOutside={(event) => {
        onFocusOutside?.(event)
        // Touch browsers may focus the opener after the menu has taken focus. This is still the
        // same interaction; another trigger or a genuinely outside target must dismiss normally.
        if ((event.target as HTMLElement)?.id === contentRef.current?.getAttribute("aria-labelledby")) event.preventDefault()
      }}
      onInteractOutside={(event) => {
        onInteractOutside?.(event)
        if (!event.defaultPrevented) closedOutside.current = true
      }}
      onCloseAutoFocus={(event) => {
        const outside = closedOutside.current
        closedOutside.current = false
        onCloseAutoFocus?.(event)
        if (event.defaultPrevented || outside) return
        quietFocusBack(event)
      }}
      className={cn(
        "w-auto max-w-[min(18rem,calc(100vw-1rem))] min-w-56 rounded-[20px] p-2 shadow-[0_12px_40px_-8px_rgb(0_0_0/0.14),0_2px_6px_rgb(0_0_0/0.04)] ring-foreground/6",
        className
      )}
      {...props}
    >
      {drill ? (
        <DrillSlotContext.Provider value={slot}>
          {/* `contents`: the rows lay out as the content's own children would. */}
          <div className={drill.page ? "hidden" : "contents"}>{children}</div>
          <div ref={setSlot} className="contents" />
        </DrillSlotContext.Provider>
      ) : (
        children
      )}
    </DropdownMenuContent>
  )
}

function AppMenuItem({
  icon,
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & { icon?: IconSvgElement }) {
  return (
    <DropdownMenuItem
      className={cn("h-9 gap-2.5 rounded-[10px] px-3.5 text-sm [&_svg]:size-[18px]", className)}
      {...props}
    >
      {icon && <HugeiconsIcon strokeWidth={ICON_STROKE} icon={icon} />}
      {children}
    </DropdownMenuItem>
  )
}

const AppMenuRadioGroup = DropdownMenuRadioGroup

/* One choice out of several (theme, sort order): an AppMenuItem row with the library's tick on the
   right for the chosen value; screen readers hear it as a checked menuitemradio. */
function AppMenuRadioItem({
  icon,
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioItem> & { icon?: IconSvgElement }) {
  return (
    <DropdownMenuRadioItem
      className={cn(
        "h-9 gap-2.5 rounded-[10px] pr-9 pl-3.5 text-sm [&_svg]:size-[18px] [&>[data-slot=dropdown-menu-radio-item-indicator]]:right-3 [&>[data-slot=dropdown-menu-radio-item-indicator]_svg]:size-4",
        className
      )}
      {...props}
    >
      {icon && <HugeiconsIcon strokeWidth={ICON_STROKE} icon={icon} />}
      {children}
    </DropdownMenuRadioItem>
  )
}

function AppMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return <DropdownMenuSeparator className={cn("mx-2 my-1.5", className)} {...props} />
}

function AppMenuSub({ children, ...props }: React.ComponentProps<typeof DropdownMenuSub>) {
  const drill = React.useContext(DrillContext)
  const id = React.useId()
  if (!drill) return <DropdownMenuSub {...props}>{children}</DropdownMenuSub>
  return <SubIdContext.Provider value={id}>{children}</SubIdContext.Provider>
}

/* The rows of a menu that is showing a submenu are hidden, so focus would drop out of the menu: it
   goes to the menu itself, as when the menu opens (the arrows then step into the rows). */
const focusMenu = (inside: HTMLElement | null) =>
  requestAnimationFrame(() => inside?.closest<HTMLElement>("[role=menu]")?.focus({ preventScroll: true }))

const SUB_TRIGGER = "h-9 gap-2.5 rounded-[10px] px-3.5 pr-2.5 text-sm [&_svg]:size-[18px] [&>svg:last-child]:size-4!"

/* Submenu row in the same proportions as AppMenuItem; the library adds the trailing chevron. On the
   phone it is a plain row with the same chevron that turns the menu to its submenu. */
function AppMenuSubTrigger({
  icon,
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger> & { icon?: IconSvgElement }) {
  const drill = React.useContext(DrillContext)
  const id = React.useContext(SubIdContext)
  if (drill && id) {
    return (
      <AppMenuItem
        icon={icon}
        disabled={props.disabled}
        textValue={props.textValue}
        onSelect={(event) => {
          event.preventDefault()
          drill.setPage(id)
          focusMenu(event.currentTarget as HTMLElement)
        }}
        className={cn(SUB_TRIGGER, className)}
      >
        {children}
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.25} className="ml-auto" />
      </AppMenuItem>
    )
  }
  return (
    <DropdownMenuSubTrigger className={cn(SUB_TRIGGER, className)} {...props}>
      {icon && <HugeiconsIcon strokeWidth={ICON_STROKE} icon={icon} />}
      {children}
    </DropdownMenuSubTrigger>
  )
}

/* `title` names the submenu on the phone, in the row that goes back (else «Назад»). */
function AppMenuSubContent({
  className,
  title = "Назад",
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent> & { title?: string }) {
  const drill = React.useContext(DrillContext)
  const slot = React.useContext(DrillSlotContext)
  const id = React.useContext(SubIdContext)
  if (drill && id) {
    if (drill.page !== id || !slot) return null
    return createPortal(
      <div className="flex flex-col animate-in fade-in-0 slide-in-from-right-2 duration-150 ease-(--ease-out) motion-reduce:animate-none">
        <AppMenuItem
          onSelect={(event) => {
            event.preventDefault()
            drill.setPage(null)
            focusMenu(slot)
          }}
          className="pl-2.5 font-medium"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2.25} className="size-4!" />
          {title}
        </AppMenuItem>
        <AppMenuSeparator />
        {children}
      </div>,
      slot
    )
  }
  return (
    <DropdownMenuSubContent
      sideOffset={8}
      alignOffset={-8}
      className={cn(
        "max-h-80 max-w-72 min-w-52 overflow-y-auto rounded-[20px] p-2 shadow-[0_12px_40px_-8px_rgb(0_0_0/0.14),0_2px_6px_rgb(0_0_0/0.04)] ring-foreground/6",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuSubContent>
  )
}

export {
  AppMenu,
  AppMenuTrigger,
  AppMenuContent,
  AppMenuItem,
  AppMenuRadioGroup,
  AppMenuRadioItem,
  AppMenuSeparator,
  AppMenuSub,
  AppMenuSubTrigger,
  AppMenuSubContent,
}
