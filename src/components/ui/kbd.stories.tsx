import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Kbd",
  component: Kbd,
  parameters: {
    docs: {
      description: {
        component:
          "Клавиша или комбинация клавиш. Одна `Kbd` — один символ, несколько подряд оборачиваются в `KbdGroup`. Основное место — подсказки хоткеев внутри `TooltipContent` (⌘K поиск, ⇧⌘O новый чат, ⌘B свернуть панель): там фон и цвет автоматически меняются на полупрозрачный поверх серого тултипа.",
      },
    },
  },
  args: { children: "K" },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {}

export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⇧</Kbd>
      <Kbd>⌘</Kbd>
      <Kbd>O</Kbd>
    </KbdGroup>
  ),
}

export const AllHotkeys: Story = {
  name: "Набор хоткеев",
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="w-40 text-sm text-muted-foreground">Новый чат</span>
        <KbdGroup>
          <Kbd>⇧</Kbd>
          <Kbd>⌘</Kbd>
          <Kbd>O</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-40 text-sm text-muted-foreground">Свернуть панель</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>B</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-40 text-sm text-muted-foreground">Поиск чатов</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
    </div>
  ),
}

export const InTooltip: Story = {
  name: "Внутри тултипа",
  render: () => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Поиск чатов">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Поиск чатов
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </TooltipContent>
    </Tooltip>
  ),
}
