import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { CheckListIcon, Idea01Icon, MagicWand01Icon, QuillWrite01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

/* What a text chat is most often for here (posts, ideas, editing, plans): each starts the request
   and leaves the rest to the user — the cursor waits where their part goes. The prompts are the
   user's voice to the model, so they speak to it as «ты». */
const QUICK_ACTIONS: { label: string; icon: IconSvgElement; prompt: string }[] = [
  { label: "Написать пост", icon: QuillWrite01Icon, prompt: "Напиши пост для соцсетей на тему: " },
  { label: "Придумать идеи", icon: Idea01Icon, prompt: "Придумай 10 идей для " },
  { label: "Улучшить текст", icon: MagicWand01Icon, prompt: "Улучши этот текст: сделай его понятнее и живее, смысл сохрани.\n\n" },
  { label: "Составить план", icon: CheckListIcon, prompt: "Составь пошаговый план, как " },
]

/* Quick actions over the text composer (the user's ask, 27.09; Kimi's row, first under the field):
   white pills with an icon that put the start of a request into the field. They stay while the user
   types (the user's ask, 27.09: at first they stepped aside); picked over a typed request, the
   composer offers the request back (its «Запрос заменён идеей · Вернуть» toast). */
export function QuickActions({ onPick, className }: { onPick: (prompt: string) => void; className?: string }) {
  return (
    <div role="group" aria-label="Быстрые действия" className={cn("flex flex-wrap justify-center gap-2", className)}>
      {QUICK_ACTIONS.map((action) => (
        <Button key={action.label} variant="outline" size="lg" onClick={() => onPick(action.prompt)} className="rounded-full font-normal">
          <HugeiconsIcon icon={action.icon} strokeWidth={ICON_STROKE} data-icon="inline-start" className="text-muted-foreground" />
          {action.label}
        </Button>
      ))}
    </div>
  )
}
