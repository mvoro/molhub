import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Coins01Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Popover",
  component: PopoverContent,
  parameters: {
    docs: {
      story: { inline: false, height: "360px" },
      description: {
        component:
          "Всплывающая карточка shadcn (Radix Popover), привязанная к кнопке: короткая справка, мини-форма, выбор значения. Растёт из точки триггера. Состав: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription`.\n\n" +
          "Список действий — не поповер, а `AppMenu`. Всё, что тянет на форму с несколькими полями или длинный список, — `AppSheet` (на мобилке это нижний лист). Главная кнопка внутри — одна.",
      },
    },
  },
  args: { side: "bottom", align: "center" },
  argTypes: {
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[320px] w-[420px] items-start justify-center pt-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PopoverContent>

export default meta
type Story = StoryObj<typeof meta>

export const Balance: Story = {
  name: "Баланс",
  render: (args) => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <HugeiconsIcon icon={Coins01Icon} strokeWidth={ICON_STROKE} />
          <span className="tabular-nums">1 250</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent {...args}>
        <PopoverHeader>
          <PopoverTitle>1 250 молекул</PopoverTitle>
          <PopoverDescription>
            Хватит примерно на 150 изображений в Midjourney или 600 ответов GPT-5.
          </PopoverDescription>
        </PopoverHeader>
        <div className="flex flex-col gap-1.5">
          <Progress value={62} aria-label="Потрачено за месяц" />
          <span className="text-xs text-muted-foreground">Потрачено 62% месячного лимита</span>
        </div>
        <Button size="sm" className="self-start">
          Пополнить баланс
        </Button>
      </PopoverContent>
    </Popover>
  ),
}

export const WithForm: Story = {
  name: "С формой",
  render: (args) => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Переименовать чат">
          <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={ICON_STROKE} />
        </Button>
      </PopoverTrigger>
      <PopoverContent {...args}>
        <form className="flex flex-col gap-2.5" onSubmit={(event) => event.preventDefault()}>
          <Field className="gap-2">
            <FieldLabel htmlFor="popover-chat-name">Название чата</FieldLabel>
            <Input id="popover-chat-name" defaultValue="Разбор договора аренды" maxLength={120} />
          </Field>
          <Button type="submit" size="sm" className="self-end">
            Сохранить
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  ),
}

export const LongText: Story = {
  name: "Длинный текст",
  args: { side: "right", align: "start" },
  decorators: [
    (Story) => (
      <div className="flex min-h-[320px] w-[520px] items-start justify-start pt-4">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="secondary">Как считаются молекулы</Button>
      </PopoverTrigger>
      <PopoverContent {...args}>
        <PopoverHeader>
          <PopoverTitle>Как считаются молекулы</PopoverTitle>
          <PopoverDescription>
            Каждый запрос стоит молекулы: цена зависит от модели и объёма. Текстовый ответ GPT-5 — 2 молекулы,
            изображение Midjourney — 8, видео Kling на 10 секунд — 40. Если генерация не удалась, молекулы
            вернутся на баланс.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
}

export const FromTrigger: Story = {
  name: "Открытие по кнопке",
  render: (args) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <HugeiconsIcon icon={Coins01Icon} strokeWidth={ICON_STROKE} />
          Баланс
        </Button>
      </PopoverTrigger>
      <PopoverContent {...args}>
        <PopoverHeader>
          <PopoverTitle>1 250 молекул</PopoverTitle>
          <PopoverDescription>Молекулы обновятся 1 октября.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
}
