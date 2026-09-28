import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

const meta = {
  title: "UI/Collapsible",
  component: Collapsible,
  parameters: {
    docs: {
      description: {
        component:
          "Базовое сворачивание блока без готовой анимации высоты (в `Accordion` она уже встроена). Используем для «Показать детали генерации» под результатом или доп. настроек. Триггер и стрелку оформляет вызывающий код — обычно `Button variant=\"ghost\"`.",
      },
    },
  },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-96">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between px-2.5">
            Детали генерации
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={ICON_STROKE}
              className={cn("transition-transform", open && "rotate-180")}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 px-2.5 pt-2 text-sm text-muted-foreground">
          <p>Модель: Kling 2.5</p>
          <p>Разрешение: 1080×1920</p>
          <p>Длительность: 10 секунд</p>
          <p>Стоимость: 45 молекул</p>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}

export const DefaultOpen: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-96">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between px-2.5">
          Системный промпт
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2.5 pt-2 text-sm text-muted-foreground">
        Отвечай кратко, на «вы», без канцелярита и лишних извинений.
      </CollapsibleContent>
    </Collapsible>
  ),
}
