import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "Контейнер-поверхность с тонким кольцом (`ring-1 ring-foreground/10`, не `border`) — карточки тарифов, проектов, идей. `size=\"sm\"` уменьшает внутренние отступы. `CardAction` ставит кнопку в правый верхний угол шапки, `CardFooter` — серая подложка снизу.",
      },
    },
  },
  args: { size: "default" },
  argTypes: {
    size: { control: "inline-radio", options: ["default", "sm"] },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>Тариф «Плюс»</CardTitle>
        <CardDescription>Больше молекул и приоритетная очередь генераций</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-[450]">
          990 ₽<span className="text-sm font-normal text-muted-foreground"> / месяц</span>
        </p>
      </CardContent>
    </Card>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Лендинг кофейни</CardTitle>
        <CardDescription>12 чатов · обновлено вчера</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Действия с проектом">
            <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={ICON_STROKE} />
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Тариф «Про»</CardTitle>
        <CardDescription>Безлимитный текст и приоритет в очереди на видео</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-[450]">
          2 490 ₽<span className="text-sm font-normal text-muted-foreground"> / месяц</span>
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Перейти на «Про»</Button>
      </CardFooter>
    </Card>
  ),
}

export const WithImage: Story = {
  render: () => (
    <Card className="w-64">
      <img src="/presets/aurora.jpg" alt="" className="aspect-square w-full object-cover" />
      <CardHeader>
        <CardTitle>Северное сияние</CardTitle>
        <CardDescription>Идея для генерации изображения</CardDescription>
      </CardHeader>
    </Card>
  ),
}

export const Small: Story = {
  render: () => (
    <Card size="sm" className="w-72">
      <CardHeader>
        <CardTitle>Молли</CardTitle>
        <CardDescription>Сама решает: текст или картинка</CardDescription>
      </CardHeader>
    </Card>
  ),
}
