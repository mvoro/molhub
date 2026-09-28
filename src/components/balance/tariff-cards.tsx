import { withBasePath } from "../../lib/base-path.ts"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"

import { MoleculeIcon } from "@/components/chat-composer/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { type Billing, type Tariff, type TokenPack, formatNumber, formatRub, perToken, tokensWord } from "@/data/tariffs"
import { TOOLS } from "@/data/tools"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

/* Cards of the balance sheet, after the Figma «tariff-card» and «token-package» (dashboard, 1585:27925).
   Hairlines are the mock's #f4f4f4 on white: foreground at 5%, so they hold in the dark theme too. */

const LINE = "border-foreground/5"

/* The highlighted card (the recommended tariff, the popular pack): its 4px rim lights up in the Молли
   colours from the badge down the sides and fades to the grey by the middle. */
const RIM =
  "border-transparent bg-[radial-gradient(130%_100%_at_50%_0%,var(--glow-molly-1)_10.5%,var(--glow-molly-2)_15%,var(--primary)_25%,var(--glow-molly-4)_32%,var(--glow-molly-5)_40%,var(--muted)_67%)]"

/* Badges riding the card's top edge: the gradient one for the pick, a lavender one for the best price. */
const PICK = "h-6 rounded-lg border-[1.5px] border-white/35 bg-(image:--gradient-molly) px-3 text-xs font-bold text-white"

/* Rows of the plan's worth, with the sidebar's tool tiles (the user's ask). */
const WORTH: { key: keyof Tariff["counts"]; tool: string }[] = [
  { key: "text", tool: "new:text" },
  { key: "image", tool: "new:image" },
  { key: "video", tool: "new:video" },
  { key: "audio", tool: "new:audio" },
]
const tileOf = (id: string) => TOOLS.find((tool) => tool.id === id)?.icon

/* A price struck out with a slanted line, as in the mock (a straight line-through reads as a typo). */
function OldPrice({ children, className }: { children: string; className?: string }) {
  return (
    <s className={cn("relative text-base leading-[1.15] font-semibold whitespace-nowrap text-muted-foreground no-underline", className)}>
      <span className="sr-only">Без скидки: </span>
      {children}
      <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 -rotate-[4deg] rounded-full bg-muted-foreground" />
    </s>
  )
}

export function TariffCard({ tariff, billing, onChoose, onModels }: { tariff: Tariff; billing: Billing; onChoose: () => void; onModels: () => void }) {
  const annual = billing === "year" ? tariff.annual : undefined
  const discount = annual?.discount ?? tariff.monthDiscount
  const oldPrice = annual?.originalMonth ?? tariff.originalMonth

  return (
    <div className={cn("relative flex flex-col rounded-[22px] border bg-muted p-1", LINE, tariff.recommended && RIM)}>
      {tariff.recommended && (
        <Badge className={cn(PICK, "absolute -top-[11px] left-1/2 z-10 -translate-x-1/2")}>Рекомендуем</Badge>
      )}
      <div className="flex flex-1 flex-col gap-4 rounded-[20px] bg-muted">
        <div className="isolate flex flex-col">
          <div className={cn("relative z-[2] flex flex-col gap-3 rounded-[20px] border bg-card p-4 md:gap-4", LINE)}>
            <div className="flex items-center gap-2.5">
              <h3 className="flex-1 text-lg leading-[1.15] font-medium">{tariff.name}</h3>
              {discount && (
                <Badge variant="secondary" className="h-auto rounded-lg px-2 py-[3px] text-xs font-bold text-muted-foreground">
                  −{discount}%
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                {oldPrice ? (
                  // Phone: the old price on the price's line; desktop: over it.
                  <div className="flex flex-wrap items-end gap-x-1.5 md:flex-col md:items-start md:gap-0">
                    <OldPrice className="max-md:mb-0.5">{formatRub(oldPrice)}</OldPrice>
                    <p className="flex items-end gap-1 text-primary">
                      <span className="text-2xl leading-[1.15] font-bold whitespace-nowrap md:text-[28px]">{formatRub(annual?.month ?? tariff.month)}</span>
                      <span className="pb-[3px] text-sm font-semibold">/ мес.</span>
                    </p>
                  </div>
                ) : (
                  <p className="flex items-end gap-1">
                    <span className="text-[28px] leading-[1.15] font-bold whitespace-nowrap">{formatRub(tariff.month)}</span>
                    {!tariff.once && <span className="pb-[3px] text-sm font-semibold text-muted-foreground">/ мес.</span>}
                  </p>
                )}
                <p className="text-[10px] font-medium text-muted-foreground">
                  {annual ? (
                    <>
                      {formatRub(annual.total)} в год • <b className="font-bold text-primary">экономия {formatRub(annual.saving)}</b>
                    </>
                  ) : tariff.once ? "Покупается один раз, не продлевается" : tariff.originalMonth ? `Экономия ${formatRub(tariff.originalMonth - tariff.month)}` : tariff.annual ? `Выгодно платить за год (−${formatRub(tariff.annual.saving)})` : "Оплата каждый месяц"}
                </p>
              </div>
              {/* Buttons are primary for the pick only (the project's rule: no black buttons, one primary). */}
              <Button
                variant={tariff.recommended ? "default" : "outline"}
                onClick={onChoose}
                className="h-10 w-full rounded-full text-sm font-semibold"
              >
                Выбрать {tariff.name}
              </Button>
            </div>
          </div>
          {/* The monthly tokens hang under the price card, a tab with the big mark peeking in. */}
          <div className="relative z-[1] px-4">
            <div
              className={cn(
                "relative overflow-clip rounded-b-[14px] border border-t-0 px-3 py-2",
                "bg-[radial-gradient(170px_170px_at_91%_89%,color-mix(in_oklab,var(--primary)_30%,var(--card))_0%,color-mix(in_oklab,var(--glow-molly-4)_12%,var(--card))_33%,var(--card)_62%)]",
                LINE
              )}
            >
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <MoleculeIcon colored className="size-3" />
                {formatNumber(tariff.tokens)} {tokensWord(tariff.tokens)}
              </p>
              <p className="pl-[18px] text-[10px] font-semibold text-foreground/35">{tariff.once ? "один раз" : "каждый месяц"}</p>
              <img
                src={withBasePath("/tariffs/mark-card.svg")}
                alt=""
                aria-hidden="true"
                draggable={false}
                width={66}
                height={66}
                className="pointer-events-none absolute top-[calc(50%+15.5px)] -right-[7px] size-[66.5px] max-w-none -translate-y-1/2 select-none"
              />
            </div>
          </div>
        </div>
        <div className={cn("flex flex-1 flex-col gap-5 rounded-[20px] border bg-card p-4", LINE)}>
          <ul className="flex flex-col gap-2">
            {WORTH.map(({ key, tool }) => (
              <li key={key} className={cn("flex items-center gap-2.5 text-xs font-semibold", tariff.once && key === "video" && "text-muted-foreground")}>
                <img src={tileOf(tool)} alt="" width={16} height={16} draggable={false} className={cn("size-4 shrink-0 select-none", tariff.once && key === "video" && "grayscale opacity-40")} />
                {tariff.counts[key]}
              </li>
            ))}
          </ul>
          <Button variant="link" onClick={onModels} aria-label={`Все модели тарифа «${tariff.name}»`} className="-mt-3 h-auto self-start p-0 text-xs text-muted-foreground underline decoration-dotted underline-offset-4">Все модели тарифа</Button>
          {tariff.perks.length > 0 && <Separator className="bg-foreground/8" />}
          {tariff.perks.length > 0 && <div className="flex flex-col gap-1.5">
            {tariff.extends && <p className="text-xs font-semibold text-muted-foreground">Всё из {tariff.extends}, а также:</p>}
            <ul className="flex flex-col gap-1.5">
              {tariff.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5 text-xs font-semibold">
                  <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} className="size-4 shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>}
        </div>
      </div>
    </div>
  )
}

export function PackCard({ pack, onChoose }: { pack: TokenPack; onChoose: () => void }) {
  const popular = pack.badge === "popular"

  return (
    <div className={cn("relative rounded-[22px] border bg-muted p-1", LINE, popular && RIM)}>
      {pack.badge && (
        <Badge
          className={cn(
            "absolute left-3.5 z-10",
            popular ? cn(PICK, "-top-3.5") : "-top-[13px] h-auto rounded-lg bg-primary/12 px-2 py-[3px] text-xs font-bold text-primary"
          )}
        >
          {popular ? "Популярный" : "Самый выгодный"}
        </Badge>
      )}
      <div
        className={cn(
          "relative flex flex-col items-start gap-4 overflow-clip rounded-[20px] border-2 p-4",
          "bg-[radial-gradient(260px_260px_at_88%_71%,color-mix(in_oklab,var(--primary)_10%,var(--card))_0%,color-mix(in_oklab,var(--glow-molly-4)_5%,var(--card))_33%,var(--card)_62%)]",
          LINE
        )}
      >
        <div className="relative z-[1] flex flex-col gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium">
            <MoleculeIcon colored className="size-3" />
            {formatNumber(pack.tokens)} {tokensWord(pack.tokens)}
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-[28px] leading-[1.15] font-bold whitespace-nowrap">{formatRub(pack.price)}</p>
            <p className="text-xs font-medium text-muted-foreground">{perToken(pack)}</p>
          </div>
        </div>
        <Button
          variant={popular ? "default" : "outline"}
          onClick={onChoose}
          className={cn("relative z-[1] h-10 rounded-full px-5 text-sm font-semibold", popular && "shadow-lg shadow-primary/25")}
        >
          Выбрать
        </Button>
        {/* The big mark in the corner, cut by the card; two thirds of it on the phone's narrow cards, where
            the full one would reach the price per token. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-0.5 -bottom-0.5 h-[62px] w-16 overflow-clip rounded-br-[20px] md:h-[94px] md:w-24"
        >
          <img
            src={withBasePath("/tariffs/mark-pack.svg")}
            alt=""
            draggable={false}
            width={118}
            height={118}
            className="absolute top-[calc(50%+15px)] left-[calc(50%+9px)] size-[78px] max-w-none -translate-x-1/2 -translate-y-1/2 select-none md:top-[calc(50%+22px)] md:left-[calc(50%+14px)] md:size-[118px]"
          />
        </span>
      </div>
    </div>
  )
}
