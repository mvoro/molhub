import * as React from "react"
import { toast } from "sonner"

import { PackCard, TariffCard } from "@/components/balance/tariff-cards"
import { ModelLogo } from "@/components/model-logo"
import { AppSheet, AppSheetBody, AppSheetCloseButton, AppSheetContent, AppSheetDescription, AppSheetHeader, AppSheetTitle } from "@/components/ui/app-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Billing, type Tariff, YEAR_DISCOUNT, MAX_SAVING, PACKS, tariffsForBilling, tariffModels, formatNumber, formatRub, tokensWord } from "@/data/tariffs"
import { cn } from "@/lib/utils"

type Section = "tariffs" | "packs"

const COPY: Record<Section, { title: string; description: string }> = {
  tariffs: {
    title: "Выберите тариф",
    description: "Все нейросети без VPN — ChatGPT 5.5, Claude, Gemini, Midjourney. Выгодный старт и отмена в любое время.",
  },
  packs: {
    title: "Пакеты токенов",
    description: "Выберите пакет, который подходит под ваши задачи. Пакеты пополняют баланс сверх тарифа и тратятся на любую модель.",
  },
}

/* Four users and the rating, from the mock. The avatars carry their own white ring. */
function Reviews() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex" aria-hidden="true">
        {[1, 2, 3, 4].map((index) => (
          <span key={index} className="relative -mr-[13.5px] size-9 shrink-0 last:mr-0">
            <img
              src={`/tariffs/avatar-${index}.png`}
              alt=""
              width={39}
              height={39}
              draggable={false}
              className="absolute -inset-[1.5px] size-[39px] max-w-none select-none"
            />
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-sm leading-none font-semibold">
          <img src="/tariffs/stars.svg" alt="" width={77} height={13} draggable={false} className="h-[13px] w-[77px] select-none" />
          <span className="sr-only">Оценка</span>4,8
        </p>
        <p className="text-xs font-semibold text-muted-foreground">Оценка 15 000+ пользователей</p>
      </div>
    </div>
  )
}

/* «Ежемесячно ⏻ Ежегодно −25%» with the saving promo over it and a hand-drawn arrow down to the
   discount. The words pick a side on their own (a click on either sets it rather than toggling). */
function BillingSwitch({ billing, onChange }: { billing: Billing; onChange: (billing: Billing) => void }) {
  const yearly = billing === "year"
  const side = (value: Billing) => (event: React.MouseEvent) => {
    event.preventDefault()
    onChange(value)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative translate-x-[21px]">
        <Badge className="h-auto rounded-lg px-2 py-[3px] text-xs font-medium">экономия до {formatRub(MAX_SAVING)} в год</Badge>
        <img
          src="/tariffs/arrow.svg"
          alt=""
          aria-hidden="true"
          width={32}
          height={34}
          draggable={false}
          className="pointer-events-none absolute top-2 left-full ml-1 h-[34px] w-8 max-w-none select-none"
        />
      </div>
      <div className="-mt-[3px] flex h-10 items-center gap-2">
        <Label
          htmlFor="billing-year"
          onClick={side("month")}
          className={cn("cursor-pointer text-xs font-semibold transition-colors", yearly && "text-muted-foreground")}
        >
          Ежемесячно
        </Label>
        <Switch id="billing-year" checked={yearly} onCheckedChange={(checked) => onChange(checked ? "year" : "month")} aria-label="Оплата за год" />
        <Label
          htmlFor="billing-year"
          onClick={side("year")}
          className={cn("cursor-pointer text-xs font-semibold transition-colors", !yearly && "text-muted-foreground")}
        >
          Ежегодно
        </Label>
        <Badge
          variant="outline"
          className={cn(
            "h-auto rounded-lg border-primary/20 px-2 py-[3px] text-xs font-bold text-primary transition-colors",
            yearly && "border-transparent bg-primary/12"
          )}
        >
          −{YEAR_DISCOUNT}%
        </Badge>
      </div>
    </div>
  )
}

/* The tariffs and token packs, full screen on both (the user's ask, 27.09: «фулскрин модалка»), after
   the Figma «tariff-modal» (dashboard, 1587:33598): desktop 1587:33594/33595 and packs 1637:227937,
   phone 1587:33596/33597 and packs 1637:227985. The title is the home greeting's type (the user's
   ask); tabs, badges and buttons are the project's own (M tabs as in the Archive, primary for the
   pick only). Opened by the balance button (balance-button.tsx). Payment isn't there yet: a choice
   says so in a toast. */
export function TariffsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [section, setSection] = React.useState<Section>("tariffs")
  const [billing, setBilling] = React.useState<Billing>("month")
  const [modelsTariff, setModelsTariff] = React.useState<Tariff | null>(null)
  const copy = COPY[section]

  const choose = (what: string, price: string) => toast("Оплата скоро появится", { description: `${what}, ${price}` })

  return (
    <AppSheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent variant="fullscreen">
        {/* The file viewer's cross, where its header puts it: 40px, 12px in on the phone (under the
            status bar), 36px at 20px down and 16px in on desktop. On the phone the tabs share its row:
            both centred 32px down (the body's 14px top padding plus half the 36px tabs). */}
        <AppSheetCloseButton className="absolute top-[calc(env(safe-area-inset-top)+0.75rem)] right-3 z-10 md:top-5 md:right-4" />
        <AppSheetBody className="px-4 pt-3.5 pb-8 md:px-12 md:pt-12 md:pb-12">
          <Tabs value={section} onValueChange={(value) => setSection(value as Section)} className="mx-auto flex w-full flex-col items-center gap-0">
            {/* The phone's full-width M tabs stop short of the close button on their row (centred, as in the mock). */}
            <div className="flex w-full justify-center max-md:px-11">
              <TabsList>
                <TabsTrigger value="tariffs">Тарифы</TabsTrigger>
                <TabsTrigger value="packs">Пакеты токенов</TabsTrigger>
              </TabsList>
            </div>
            <AppSheetTitle className="mt-3 text-center text-[26px] leading-tight font-[450] tracking-[-0.02em] text-balance md:mt-4 md:text-[32px]">
              {copy.title}
            </AppSheetTitle>
            <AppSheetDescription className="mt-3 max-w-[516px] text-center text-base text-balance text-muted-foreground md:mt-4">
              {copy.description}
            </AppSheetDescription>
            <div className="mt-6 md:mt-8">
              <Reviews />
            </div>

            <TabsContent value="tariffs" className="mt-6 flex w-full flex-col items-center gap-4 md:mt-8">
              <BillingSwitch billing={billing} onChange={setBilling} />
              <div className={cn("grid w-full max-w-[358px] gap-3 md:max-w-[508px] md:grid-cols-2", billing === "year" ? "xl:max-w-[1028px] xl:grid-cols-3" : "xl:max-w-[1284px] xl:grid-cols-5")}>
                {tariffsForBilling(billing).map((tariff) => (
                  <TariffCard
                    key={tariff.id}
                    tariff={tariff}
                    billing={billing}
                    onModels={() => setModelsTariff(tariff)}
                    onChoose={() =>
                      choose(
                        `Тариф «${tariff.name}»`,
                        billing === "year" && tariff.annual ? `${formatRub(tariff.annual.total)} в год` : `${formatRub(tariff.month)}${tariff.once ? ", один раз" : " в месяц"}`
                      )
                    }
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="packs" className="mt-8 w-full">
              <div className="mx-auto grid w-full max-w-[358px] grid-cols-2 gap-x-3 gap-y-4 sm:max-w-[800px] sm:grid-cols-3 lg:max-w-[1284px] lg:grid-cols-4">
                {PACKS.map((pack) => (
                  <PackCard
                    key={pack.tokens}
                    pack={pack}
                    onChoose={() => choose(`${formatNumber(pack.tokens)} ${tokensWord(pack.tokens)}`, formatRub(pack.price))}
                  />
                ))}
              </div>
            </TabsContent>

            <p className="mt-8 max-w-md text-center text-xs font-medium text-balance text-muted-foreground">
              Продолжая, вы соглашаетесь с{" "}
              <Button variant="link" className="h-auto p-0 text-xs font-medium underline decoration-wavy underline-offset-2">
                политикой конфиденциальности
              </Button>{" "}
              и{" "}
              <Button variant="link" className="h-auto p-0 text-xs font-medium underline decoration-wavy underline-offset-2">
                пользовательским соглашением
              </Button>
              .
            </p>
          </Tabs>
        </AppSheetBody>
        <AppSheet open={Boolean(modelsTariff)} onOpenChange={(next) => { if (!next) setModelsTariff(null) }}>
          <AppSheetContent className="md:max-w-[720px]">
            <AppSheetHeader>
              <AppSheetTitle>Модели тарифа «{modelsTariff?.name}»</AppSheetTitle>
              <AppSheetDescription className="sr-only">Все доступные модели тарифа</AppSheetDescription>
            </AppSheetHeader>
            <AppSheetBody className="pb-6">
              <ul className="grid gap-x-6 gap-y-4 md:grid-cols-2">
                {modelsTariff && tariffModels(modelsTariff).map((model) => (
                  <li key={model.name} className="flex min-w-0 items-center gap-3 text-sm">
                    <ModelLogo logo={model.logo} mode={model.mode} color className="size-6 shrink-0" />
                    <span className="min-w-0 truncate" title={model.name}>{model.name}</span>
                  </li>
                ))}
              </ul>
            </AppSheetBody>
          </AppSheetContent>
        </AppSheet>
      </AppSheetContent>
    </AppSheet>
  )
}
