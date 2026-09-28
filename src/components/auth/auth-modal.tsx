import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon, PauseIcon, PlayIcon, Tick02Icon } from "@hugeicons/core-free-icons"
import { AppSheet, AppSheetCloseButton, AppSheetContent, AppSheetDescription, AppSheetTitle } from "@/components/ui/app-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useIsMobile } from "@/hooks/use-mobile"
import { validDemoCode, validEmail, type AuthSession, type AuthVariant } from "@/lib/auth"
import { withBasePath } from "@/lib/base-path"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

const PROVIDERS = [
  { name: "VK ID", icon: "vk" },
  { name: "Яндекс", icon: "yandex" },
  { name: "Google", icon: "google" },
] as const
const SLIDES = {
  nano: [
    { image: "auth-carousel-01.png", title: "Карточки товара", description: "Создавайте продающие фото товара без студии и съёмки", label: "Карточки" },
    { image: "auth-carousel-02.png", title: "Рекламные креативы", description: "Генерируйте рекламные креативы для высокой конверсии", label: "Креативы" },
    { image: "auth-carousel-04.png", title: "Пост для соцсетей", description: "Собирайте визуал для ленты, который останавливает скролл", label: "Посты" },
    { image: "auth-carousel-03.png", title: "Портреты и фотосессии", description: "Снимайте студийные портреты без фотографа и локации", label: "Портреты" },
  ],
  models: [
    { image: "gemini.jpg", video: "gemini.mp4", title: "Gemini 3.5 Flash", description: "Рисует и правит картинки, пишет сценарии", label: "Gemini" },
    { image: "chatgpt.jpg", video: "chatgpt.mp4", title: "ChatGPT 5.5", description: "Выручает с учёбой, письмами и карточками товаров", label: "ChatGPT" },
    { image: "claude.jpg", video: "claude.mp4", title: "Claude Sonnet 5", description: "Разбирает договоры, анализирует, пишет статьи", label: "Claude" },
  ],
}
const asset = (file: string) => withBasePath(`/auth/${file}`)

function Showcase({ variant, active }: { variant: AuthVariant; active: boolean }) {
  const slides = SLIDES[variant]
  const [index, setIndex] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const [interacting, setInteracting] = React.useState(false)
  const [reduced, setReduced] = React.useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  const video = React.useRef<HTMLVideoElement>(null)
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const change = () => setReduced(query.matches)
    query.addEventListener("change", change)
    return () => query.removeEventListener("change", change)
  }, [])
  const playing = active && !paused && !interacting && !reduced
  React.useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % slides.length), variant === "nano" ? 8000 : 5000)
    return () => window.clearTimeout(timer)
  }, [index, playing, slides.length, variant])
  React.useEffect(() => {
    const media = video.current
    if (!media) return
    if (playing) void media.play().catch(() => {})
    else media.pause()
  }, [index, playing])
  const slide = slides[index]
  return (
    <section aria-label="Возможности Молекулы" className="auth-showcase relative isolate flex min-h-48 flex-col overflow-hidden md:min-h-full"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false) }}>
      {"video" in slide ? (
        <video key={slide.video} ref={video} src={asset(slide.video)} poster={asset(slide.image)} muted playsInline loop preload="metadata" aria-hidden="true"
          className="absolute inset-0 size-full object-cover" />
      ) : <img key={slide.image} src={asset(slide.image)} alt="" className="absolute inset-0 size-full object-cover" />}
      <div className="absolute inset-0 bg-linear-to-t from-(--auth-media-shade) via-transparent to-transparent max-md:via-(--auth-media-mid)" />
      <div className="relative flex min-h-48 flex-1 flex-col justify-end gap-4 p-5 pt-16 md:gap-6 md:p-6 md:pt-16">
        <div>
          <h3 className="text-xl font-medium md:text-2xl">{slide.title}</h3>
          <p className="mt-1.5 max-w-xs text-xs leading-relaxed opacity-85 md:text-sm">{slide.description}</p>
        </div>
        <div className="flex items-end gap-2">
          <div className="grid flex-1 grid-flow-col auto-cols-fr gap-1.5" aria-label="Слайды">
            {slides.map((item, n) => (
              <Button key={item.label} variant="ghost" aria-label={`Показать: ${item.label}`} aria-current={index === n ? "true" : undefined}
                onClick={() => setIndex(n)} className="h-auto min-w-0 flex-col items-stretch gap-2 rounded-full p-0 py-1 text-left text-[10px] font-normal text-inherit hover:bg-transparent hover:text-inherit md:text-xs">
                <span className={cn("h-0.5 rounded-full bg-current", index === n ? "opacity-100" : "opacity-35")} />
                <span className={cn("truncate", index !== n && "opacity-60")}>{item.label}</span>
              </Button>
            ))}
          </div>
          {!reduced && <Button variant="ghost" size="icon-sm" aria-label={paused ? "Продолжить слайд-шоу" : "Приостановить слайд-шоу"}
            onClick={() => setPaused((value) => !value)} className="size-7 rounded-full text-inherit hover:bg-(--auth-media-hover) hover:text-inherit">
            <HugeiconsIcon icon={paused ? PlayIcon : PauseIcon} strokeWidth={ICON_STROKE} />
          </Button>}
        </div>
      </div>
    </section>
  )
}

type Step = "initial" | "code" | "success"
type Job = { kind: "email" | "resend" } | { kind: "code"; code: string } | { kind: "social"; provider: AuthSession["provider"] }

export function AuthModal({ variant, open, onOpenChange: setOpen, onComplete, onClose, onRestoreFocus }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: AuthVariant
  onComplete: (session: AuthSession) => void
  onClose: () => void
  onRestoreFocus: () => void
}) {
  const mobile = useIsMobile()
  const [step, setStep] = React.useState<Step>("initial")
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState("")
  const [job, setJob] = React.useState<Job | null>(null)
  const [resendAt, setResendAt] = React.useState(0)
  const [remaining, setRemaining] = React.useState(0)
  const codeInput = React.useRef<HTMLInputElement>(null)
  const titleRef = React.useRef<HTMLHeadingElement>(null)
  const id = React.useId()
  const nano = variant === "nano"

  React.useEffect(() => {
    if (open) return
    const timer = window.setTimeout(onClose, 250)
    return () => window.clearTimeout(timer)
  }, [open, onClose])
  React.useEffect(() => {
    if (!job || !open) return
    const timer = window.setTimeout(() => {
      setJob(null)
      if (job.kind === "email" || job.kind === "resend") {
        setCode("")
        setStep("code")
        setResendAt(Date.now() + 30000)
        setRemaining(30)
      } else if (job.kind === "code" && !validDemoCode(job.code)) {
        setError("Неверный код подтверждения. Попробуйте ещё раз.")
        codeInput.current?.focus()
      } else {
        onComplete(job.kind === "social" ? { provider: job.provider } : { provider: "email", email: email.trim() })
        setStep("success")
      }
    }, job.kind === "social" ? 1600 : 1200)
    return () => window.clearTimeout(timer)
  }, [job, open, email, onComplete])
  React.useEffect(() => {
    if (!resendAt || !open) return
    const timer = window.setInterval(() => setRemaining(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000))), 1000)
    return () => window.clearInterval(timer)
  }, [resendAt, open])
  React.useEffect(() => {
    if (step === "code" && !mobile) codeInput.current?.focus()
    if (step === "success") titleRef.current?.focus({ preventScroll: true })
  }, [step, mobile])
  React.useEffect(() => {
    if (step !== "success" || !open) return
    const timer = window.setTimeout(() => setOpen(false), 3200)
    return () => window.clearTimeout(timer)
  }, [step, open, setOpen])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (job) return
    setError("")
    if (step === "initial") {
      if (!validEmail(email)) return setError("Проверьте адрес — кажется, в нём опечатка.")
      setJob({ kind: "email" })
    } else if (code.length >= 4) setJob({ kind: "code", code })
  }
  const title = step === "code" ? "Введите код из письма" : step === "success" ? "Готово, вы вошли" : nano ? "Попробуйте нейросеть Nano Banana бесплатно" : "ChatGPT, Claude и Gemini — в одном окне"
  const description = step === "code" ? `Код для ${email.trim()}. В демоверсии письмо не отправляется — введите 1234.`
    : step === "success" ? (nano ? "Бесплатная генерация уже на счёте — попробуйте прямо сейчас" : "Бесплатный запрос уже на счёте — попробуйте прямо сейчас")
    : nano ? "Короткий запрос превращается в готовое изображение для рекламы, соцсетей или карточки товара"
    : "Войдите — диалоги сохранятся, а начатое на компьютере закончите с телефона"

  return (
    <AppSheet open={open} onOpenChange={setOpen}>
      <AppSheetContent className="md:max-w-[920px]" onCloseAutoFocus={(event) => { event.preventDefault(); onRestoreFocus() }}>
        <div className="absolute top-5 right-3 z-20 rounded-full bg-background/90 md:top-3"><AppSheetCloseButton label="Закрыть авторизацию" /></div>
        <div className="relative min-h-0 overflow-y-auto overscroll-contain md:grid md:min-h-[620px] md:grid-cols-[0.9fr_1fr]">
          <div className={cn("md:sticky md:top-0 md:self-stretch", step !== "initial" && "max-md:hidden")}><Showcase variant={variant} active={open && (step === "initial" || !mobile)} /></div>
          <div className={cn("relative flex min-w-0 flex-col justify-center px-5 py-7 md:px-10 md:py-10", step !== "initial" && "max-md:pt-12")}>
            {step === "code" && <Button variant="ghost" size="icon-sm" disabled={Boolean(job)} aria-label="Назад к способам входа" onClick={() => { setStep("initial"); setCode(""); setError("") }}
              className="absolute top-2 left-3 rounded-full md:top-3"><HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={ICON_STROKE} /></Button>}
            <div className="flex flex-col items-center text-center">
              {step === "initial" && <Badge variant="secondary" className="mb-4 rounded-full bg-primary/10 px-3 py-1 text-primary">{nano ? "1 бесплатная генерация" : "1 бесплатный запрос"}</Badge>}
              {step === "success" && <span className="mb-5 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-6" /></span>}
              <AppSheetTitle ref={titleRef} tabIndex={-1} className="max-w-sm text-2xl leading-tight font-medium outline-none">{title}</AppSheetTitle>
              <AppSheetDescription className="mt-3 text-sm leading-relaxed text-pretty">{description}</AppSheetDescription>
            </div>
            {step === "success" ? (
              <div className="mt-7 flex flex-col gap-4">
                <Button onClick={() => setOpen(false)} className="h-11 rounded-full">Начать работу <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={ICON_STROKE} /></Button>
                <p role="status" className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><Spinner className="size-3.5" />Возвращаемся к вашему запросу…</p>
              </div>
            ) : (
              <form noValidate onSubmit={submit} aria-busy={Boolean(job)} className="mt-6 flex flex-col gap-3">
                {step === "initial" && <>
                  <div className="flex flex-col gap-2">
                    {PROVIDERS.map((provider) => <Button key={provider.name} type="button" variant="secondary" disabled={Boolean(job)}
                      onClick={() => { setError(""); setJob({ kind: "social", provider: provider.name }) }} className="relative h-11 w-full rounded-full">
                      <img src={asset(`${provider.icon}.svg`)} alt="" className="absolute left-4 size-5" />
                      {job?.kind === "social" && job.provider === provider.name ? <><Spinner />Входим через {provider.name}…</> : `Войти через ${provider.name}`}
                    </Button>)}
                  </div>
                  <div className="my-1 flex items-center gap-3 text-xs text-muted-foreground"><Separator className="flex-1" />или<Separator className="flex-1" /></div>
                </>}
                <div className="flex flex-col gap-2">
                  <Label htmlFor={id} className="sr-only">{step === "initial" ? "Электронная почта" : "Код из письма"}</Label>
                  {step === "initial" ? <Input id={id} type="email" autoComplete="email" inputMode="email" placeholder="Электронная почта" value={email} disabled={Boolean(job)}
                    onChange={(event) => { setEmail(event.target.value); setError("") }} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="h-11 rounded-full px-4" />
                    : <Input ref={codeInput} id={id} inputMode="numeric" autoComplete="one-time-code" placeholder="Код из письма" value={code} disabled={Boolean(job)} maxLength={6}
                      onChange={(event) => { setCode(event.target.value.replace(/\D/g, "")); setError("") }} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="h-11 rounded-full px-4 tabular-nums" />}
                  {error && <p id={`${id}-error`} role="alert" className="px-2 text-xs text-destructive">{error}</p>}
                </div>
                <Button type="submit" disabled={Boolean(job) || (step === "initial" ? !email.trim() : code.length < 4)} className="h-11 w-full rounded-full">
                  {job?.kind === "email" || job?.kind === "code" ? <><Spinner />{job.kind === "email" ? "Отправляем код…" : "Проверяем код…"}</> : "Продолжить"}
                </Button>
                {step === "code" && <Button type="button" variant="ghost" disabled={Boolean(job) || remaining > 0} onClick={() => { setError(""); setJob({ kind: "resend" }) }} className="h-10 rounded-full text-muted-foreground">
                  {job?.kind === "resend" ? <><Spinner />Отправляем код…</> : remaining > 0 ? `Отправить повторно через ${remaining} с` : "Отправить код повторно"}
                </Button>}
              </form>
            )}
            {step === "initial" && <p className="mt-3 text-center text-xs text-muted-foreground">Демонстрационный вход без отправки писем.</p>}
            <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">Продолжая, вы принимаете пользовательское соглашение, политику конфиденциальности и даёте согласие на обработку персональных данных.</p>
          </div>
        </div>
      </AppSheetContent>
    </AppSheet>
  )
}
