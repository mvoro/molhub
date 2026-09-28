import * as React from "react"
import { useAuth } from "@/hooks/use-auth"

import { TariffsSheet } from "@/components/balance/tariffs-sheet"
import { MoleculeIcon } from "@/components/chat-composer/icons"
import { Button } from "@/components/ui/button"
import { BALANCE, formatNumber, tokensWord } from "@/data/tariffs"
import { cn } from "@/lib/utils"

/* The balance, pinned top right on every screen (the user's ask, 27.09): the token mark of the send
   pill's price (MoleculeIcon colored) and the count, in the send pill's grey. 36px, the app's control
   height, on the row of the phone's burger and of the studios' toolbar. Opens the tariffs sheet. App.tsx
   places it: over the workspace card on desktop, in the phone header next to «Новый чат». */
export function BalanceButton({ className, tabIndex }: { className?: string; tabIndex?: number }) {
  const { requireAuth } = useAuth()
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => { if (requireAuth()) setOpen(true) }}
        tabIndex={tabIndex}
        aria-label={`Баланс: ${formatNumber(BALANCE)} ${tokensWord(BALANCE)}. Тарифы и пакеты`}
        className={cn(
          "h-9 gap-1.5 rounded-full px-3 text-sm font-medium tabular-nums active:translate-y-0 active:scale-[0.97] dark:bg-foreground/10",
          className
        )}
      >
        <MoleculeIcon colored className="size-3.5" />
        {formatNumber(BALANCE)}
      </Button>
      <TariffsSheet open={open} onOpenChange={setOpen} />
    </>
  )
}
