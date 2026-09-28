import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, StarIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { MoleculeIcon } from "@/components/chat-composer/icons"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          "Маленький статус-лейбл или пилюля с ценой. `default` (primary) — акцент, `secondary` — нейтральный (цена запроса рядом с моделью), `outline`/`ghost` — на подложке карточки, `destructive` — ошибка или лимит, `link` — кликабельная пилюля (`asChild`). Иконка внутри получает `data-icon=\"inline-start\"`/`\"inline-end\"` для правильных отступов.",
      },
    },
  },
  args: { children: "Плюс", variant: "default" },
  argTypes: {
    variant: { control: "select", options: ["default", "secondary", "destructive", "outline", "ghost", "link"] },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Плюс</Badge>
      <Badge variant="secondary">Бесплатно</Badge>
      <Badge variant="destructive">Лимит исчерпан</Badge>
      <Badge variant="outline">Черновик</Badge>
      <Badge variant="ghost">Архив</Badge>
      <Badge variant="link" asChild>
        <a href="#">Подробнее о тарифе</a>
      </Badge>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">
        <HugeiconsIcon icon={StarIcon} strokeWidth={ICON_STROKE} data-icon="inline-start" />
        Рекомендуем
      </Badge>
      <Badge>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={ICON_STROKE} data-icon="inline-start" />
        Оплачено
      </Badge>
    </div>
  ),
}

export const Price: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary" className="h-7 gap-1 rounded-full px-2.5 text-[13px] font-normal tabular-nums">
        12
        <MoleculeIcon className="size-3" />
      </Badge>
      <Badge variant="secondary" className="h-7 rounded-full px-2.5 text-[13px] font-normal">
        Бесплатно
      </Badge>
    </div>
  ),
}
