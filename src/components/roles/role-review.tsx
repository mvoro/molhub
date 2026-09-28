import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Comment01Icon, FavouriteIcon } from "@hugeicons/core-free-icons"

import { RoleAvatar } from "@/components/roles/role-card"
import { AppSheetBody, AppSheetDescription, AppSheetHeader, AppSheetTitle } from "@/components/ui/app-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { REVIEW_ASPECTS, REVIEW_MAX_LENGTH, type Role } from "@/data/roles"
import { useRoles } from "@/hooks/use-roles"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

/** The composer-chat feedback flow: a like offers a review; dismissing keeps the like. */
export function RoleReview({ role, onWriteReview }: { role: Role; onWriteReview: () => void }) {
  const { likes, reviews, toggleLike } = useRoles()
  const saved = reviews[role.id]
  const liked = likes.includes(role.id)

  return (
    <section className="space-y-4 border-t pt-5" aria-label="Отзывы о роли">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-medium"><HugeiconsIcon icon={Comment01Icon} strokeWidth={ICON_STROKE} className="size-4" aria-hidden="true" />Отзывы</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" className={cn("h-9 rounded-full px-3", liked && "text-destructive hover:text-destructive")} aria-pressed={liked} onClick={() => {
            toggleLike(role.id)
            if (!liked) onWriteReview()
          }}>
            <HugeiconsIcon icon={FavouriteIcon} strokeWidth={ICON_STROKE} className={cn(liked && "fill-current")} />
            Нравится
          </Button>
          <Button type="button" variant="outline" className="h-9 rounded-full px-3" onClick={onWriteReview}>
            <HugeiconsIcon icon={Comment01Icon} strokeWidth={ICON_STROKE} />
            {saved ? "Изменить отзыв" : "Оставить отзыв"}
          </Button>
        </div>
      </div>
      {saved ? (
        <article className="space-y-2 rounded-2xl bg-muted/50 p-4" aria-label="Ваш отзыв">
          <header className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Ваш отзыв</span>
            <time dateTime={saved.date}>{new Date(saved.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</time>
          </header>
          {saved.text && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{saved.text}</p>}
          {saved.aspects.length > 0 && <div className="flex flex-wrap gap-1.5">{saved.aspects.map((aspect) => <Badge key={aspect} variant="secondary" className="font-normal">{aspect}</Badge>)}</div>}
        </article>
      ) : <p className="text-sm leading-relaxed text-muted-foreground">Пока нет отзывов. Поделитесь, чем вам помогла эта роль.</p>}
    </section>
  )
}

export function RoleReviewEditor({ role, onBack }: { role: Role; onBack: () => void }) {
  const { reviews, saveReview } = useRoles()
  const saved = reviews[role.id]
  const [text, setText] = React.useState(saved?.text ?? "")
  const [aspects, setAspects] = React.useState<string[]>(saved?.aspects ?? [])
  const [submitted, setSubmitted] = React.useState(false)
  const fieldId = React.useId()
  const titleRef = React.useRef<HTMLHeadingElement>(null)

  React.useLayoutEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
  }, [submitted])

  return (
    <>
      <AppSheetHeader>
        <Button type="button" variant="ghost" className="-ml-3 mb-2 h-10 self-start rounded-full px-3 text-muted-foreground" onClick={onBack}>
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={ICON_STROKE} />
          Назад к роли
        </Button>
        <div className="flex items-center gap-4">
          <RoleAvatar role={role} className="size-16 shrink-0 rounded-2xl" />
          <div className="min-w-0 space-y-1.5">
            <AppSheetTitle ref={titleRef} tabIndex={-1} className="outline-none">{submitted ? "Отзыв сохранён" : "Ваш отзыв о роли"}</AppSheetTitle>
            <AppSheetDescription>{submitted ? "Спасибо, что поделились впечатлением!" : `Расскажите, чем помогла роль «${role.name}».`}</AppSheetDescription>
          </div>
        </div>
      </AppSheetHeader>
      <AppSheetBody data-vaul-no-drag="" className="pb-5 md:pb-6">
        {submitted ? (
          <div className="space-y-5" role="status">
            <p className="text-sm text-muted-foreground">Отзыв сохранён в этом браузере. Вы можете изменить его в любой момент.</p>
            <Button className="h-11 w-full rounded-full" onClick={onBack}>Готово</Button>
          </div>
        ) : (
          <form onSubmit={(event) => {
            event.preventDefault()
            if (saveReview(role.id, { text, aspects })) setSubmitted(true)
          }} className="space-y-5">
            <fieldset>
              <legend className="mb-3 text-sm font-medium">Что понравилось?</legend>
              <div className="flex flex-wrap gap-2">
                {REVIEW_ASPECTS.map((aspect) => (
                  <Button key={aspect} type="button" variant="secondary" aria-pressed={aspects.includes(aspect)} className={cn("h-9 rounded-full px-3 font-normal", aspects.includes(aspect) && "bg-foreground text-background hover:bg-foreground/85")} onClick={() => setAspects((current) => current.includes(aspect) ? current.filter((item) => item !== aspect) : [...current, aspect])}>
                    {aspect}
                  </Button>
                ))}
              </div>
            </fieldset>
            <div className="space-y-2">
              <Label htmlFor={fieldId}>Отзыв</Label>
              <Textarea id={fieldId} value={text} onChange={(event) => setText(event.target.value)} maxLength={REVIEW_MAX_LENGTH} rows={3} placeholder="Расскажите, чем помогла роль" aria-describedby={`${fieldId}-hint`} className="min-h-24 resize-y rounded-2xl" />
              <div id={`${fieldId}-hint`} className="flex items-start justify-between gap-3 text-xs text-muted-foreground">
                <span>Отзыв сохранится в этом браузере</span>
                <span className="shrink-0 tabular-nums">{text.length} / {REVIEW_MAX_LENGTH}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Button type="submit" className="h-11 w-full rounded-full" disabled={!text.trim() && !aspects.length}>{saved ? "Сохранить изменения" : "Отправить отзыв"}</Button>
              <Button type="button" variant="ghost" className="h-10 w-full rounded-full text-muted-foreground" onClick={onBack}>Пропустить</Button>
            </div>
          </form>
        )}
      </AppSheetBody>
    </>
  )
}
