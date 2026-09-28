import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { RoleAvatar, RoleFavoriteButton } from "@/components/roles/role-card"
import { RoleReview, RoleReviewEditor } from "@/components/roles/role-review"
import { AppSheet, AppSheetBody, AppSheetContent, AppSheetDescription, AppSheetFooter, AppSheetHeader, AppSheetTitle } from "@/components/ui/app-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ROLE_CATEGORIES, type Role } from "@/data/roles"
import { useRoles } from "@/hooks/use-roles"
import { ICON_STROKE } from "@/lib/icons"

export type RoleDetailsSheetProps = {
  role: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStart: (role: Role, prompt?: string) => void
  onCloseAutoFocus?: (event: Event) => void
  /** The composer applies a role to the current draft; the catalogue starts a new chat. */
  startLabel?: string
  promptLabel?: string
  allowPromptUse?: boolean
  active?: boolean
}

type RoleDetailsContentProps = Pick<RoleDetailsSheetProps, "onStart" | "startLabel" | "promptLabel" | "allowPromptUse" | "active"> & {
  role: Role
  onBack: () => void
  backLabel?: string
}

/** The composer opens its own sheet; the catalogue reuses the content in its existing sheet. */
export function RoleDetailsSheet({ role, open, onOpenChange, onStart, onCloseAutoFocus, ...props }: RoleDetailsSheetProps) {
  return (
    <AppSheet open={open && Boolean(role)} onOpenChange={onOpenChange}>
      <AppSheetContent className="md:max-w-[680px]" onCloseAutoFocus={onCloseAutoFocus}>
        {role && <RoleDetailsContent key={role.id} {...props} role={role} onBack={() => onOpenChange(false)} onStart={(selected, prompt) => { onStart(selected, prompt); onOpenChange(false) }} />}
      </AppSheetContent>
    </AppSheet>
  )
}

export function RoleDetailsContent({ role, onStart, onBack, backLabel = "Назад", startLabel = "Начать чат", promptLabel = "Открыть пример в новом чате", allowPromptUse = true, active = false }: RoleDetailsContentProps) {
  const { favorites, likes, usage, reviews, toggleFavorite } = useRoles()
  const [reviewOpen, setReviewOpen] = React.useState(false)
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const titleRef = React.useRef<HTMLHeadingElement>(null)
  const scrollTop = React.useRef(0)
  const category = ROLE_CATEGORIES.find((item) => item.id === role.group)

  React.useLayoutEffect(() => {
    if (reviewOpen) return
    if (bodyRef.current) bodyRef.current.scrollTop = scrollTop.current
    titleRef.current?.focus({ preventScroll: true })
  }, [reviewOpen])

  if (reviewOpen) return <RoleReviewEditor role={role} onBack={() => setReviewOpen(false)} />

  return (
    <>
      <AppSheetHeader>
        <Button type="button" variant="ghost" className="-ml-3 mb-2 h-10 self-start rounded-full px-3 text-muted-foreground" onClick={onBack}>
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={ICON_STROKE} />
          {backLabel}
        </Button>
        <div className="flex items-start gap-4">
          <div className="relative mb-3 flex w-20 shrink-0 justify-center">
            <RoleAvatar role={role} className="size-16 rounded-2xl" />
            {category && <Badge variant="secondary" className="absolute -bottom-2 left-1/2 max-w-20 -translate-x-1/2 px-1.5 text-[10px] font-normal ring-2 ring-background">{category.label}</Badge>}
          </div>
          <div className="min-w-0 space-y-2">
            <AppSheetTitle ref={titleRef} tabIndex={-1} className="pr-2 text-xl outline-none">{role.name}</AppSheetTitle>
            <AppSheetDescription>{role.description}</AppSheetDescription>
          </div>
        </div>
      </AppSheetHeader>
      <AppSheetBody ref={bodyRef} onScroll={(event) => { scrollTop.current = event.currentTarget.scrollTop }} data-vaul-no-drag="" className="space-y-6 pb-5">
        <div role="group" aria-label="Статистика роли" className="flex gap-2 sm:gap-5">
          {[
            { label: "Сессии", count: role.runs + (usage[role.id] ?? 0) },
            { label: "Лайки", count: role.likes + Number(likes.includes(role.id)) },
            { label: "Избранное", count: role.favorites + Number(favorites.includes(role.id)) },
            { label: "Отзывы", count: Number(Boolean(reviews[role.id])) },
          ].map(({ label, count }, index) => (
            <React.Fragment key={label}>
              {index > 0 && <Separator orientation="vertical" />}
              <dl className="flex min-w-0 flex-1 flex-col gap-1">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-sm font-medium tabular-nums">{count.toLocaleString("ru-RU")}</dd>
              </dl>
            </React.Fragment>
          ))}
        </div>
        <section className="space-y-3" aria-labelledby="role-examples-title">
          <div className="space-y-1">
            <h3 id="role-examples-title" className="text-sm font-medium">С чего начнём?</h3>
            {allowPromptUse && <p className="text-xs leading-relaxed text-muted-foreground">Выберите пример — его можно изменить перед отправкой.</p>}
          </div>
          <div className="grid gap-3 rounded-[24px] p-4 md:p-8" style={{ background: `linear-gradient(139.2deg, ${category?.colors})` }}>
            {role.prompts.map((prompt) => allowPromptUse ? (
              <Button key={prompt} type="button" variant="secondary" className="h-auto min-h-12 justify-between gap-3 rounded-full bg-white py-2 pr-2 pl-4 text-left text-sm leading-5 font-normal whitespace-normal text-neutral-950 hover:bg-white/80" onClick={() => onStart(role, prompt)} aria-label={`${promptLabel}: ${prompt}`}>
                <span>{prompt}</span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={ICON_STROKE} className="size-4!" />
                </span>
              </Button>
            ) : <p key={prompt} className="rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-neutral-950">{prompt}</p>)}
          </div>
        </section>

        <section className="space-y-3 border-t pt-5" aria-labelledby="role-about-title">
          <h3 id="role-about-title" className="text-sm font-medium">Что умеет</h3>
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            {role.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>
        <section className="space-y-3 border-t pt-5" aria-labelledby="role-steps-title">
          <h3 id="role-steps-title" className="text-sm font-medium">Как получить лучший результат</h3>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-foreground/60">
            {role.steps.map((step) => <li key={step} className="pl-1">{step}</li>)}
          </ol>
        </section>

        <RoleReview role={role} onWriteReview={() => setReviewOpen(true)} />
      </AppSheetBody>
      <AppSheetFooter className="items-center border-t pt-4 max-md:[&>button]:flex-none">
        <RoleFavoriteButton role={role} favorite={favorites.includes(role.id)} onToggle={() => toggleFavorite(role.id)} inSheet />
        <Button type="button" className="h-11 flex-1! rounded-full px-5 md:flex-none!" onClick={active ? onBack : () => onStart(role)}>
          {active ? "Вернуться к чату" : startLabel}
          {!active && <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={ICON_STROKE} data-icon="inline-end" />}
        </Button>
      </AppSheetFooter>
    </>
  )
}
