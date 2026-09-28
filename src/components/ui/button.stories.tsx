import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp02Icon, Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Кнопка shadcn. `default` (primary #7A3FFF) — только акцентное действие, одно на экран: отправка запроса, покупка тарифа, «Создать проект». Второстепенное — `ghost`/`secondary`/`outline`, удаление — `destructive`. Кнопка-иконка = `size=\"icon*\"` + Hugeicons и обязательный `aria-label`.\n\n" +
          "Поведение одно для всех форм и как у строк сайдбара: при наведении и открытом меню фон сдвигается на ступень к цвету текста (токены `primary-hover`, `secondary-hover`, `ghost-hover`; в светлой теме темнее, в тёмной светлее), заливка меняется за 80 мс, нажатие — `scale(0.98)`.",
      },
    },
  },
  args: { children: "Создать проект" },
  argTypes: {
    variant: { control: "select", options: ["default", "secondary", "outline", "ghost", "destructive", "link"] },
    size: { control: "select", options: ["xs", "sm", "default", "lg", "icon-xs", "icon-sm", "icon", "icon-lg"] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Улучшить</Button>
      <Button variant="secondary">Галерея</Button>
      <Button variant="outline">Поделиться</Button>
      <Button variant="ghost">Отмена</Button>
      <Button variant="destructive">Удалить</Button>
      <Button variant="link">Подробнее</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">Очень маленькая</Button>
      <Button size="sm">Маленькая</Button>
      <Button>Обычная</Button>
      <Button size="lg">Большая</Button>
    </div>
  ),
}

export const Icon: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" aria-label="Новый чат">
        <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={ICON_STROKE} />
      </Button>
      <Button variant="destructive" size="icon" aria-label="Удалить чат">
        <HugeiconsIcon icon={Delete02Icon} strokeWidth={ICON_STROKE} />
      </Button>
      <Button size="icon-lg" className="rounded-full" aria-label="Отправить">
        <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={ICON_STROKE} />
      </Button>
    </div>
  ),
}

export const Disabled: Story = { args: { disabled: true } }
