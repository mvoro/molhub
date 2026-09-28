import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { ThumbsUpIcon } from "@hugeicons/core-free-icons"

import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Bubble",
  component: Bubble,
  parameters: {
    docs: {
      description: {
        component:
          "Пузырь сообщения в чате. `align` определяет, к какой стороне он прижат (`end` — реплика пользователя), `variant` красит только вложенный `BubbleContent`. В AI Hub у пользователя — `muted`, ответ модели обычно идёт без пузыря, `variant=\"ghost\"` во всю ширину, как в ChatGPT. `BubbleGroup` держит несколько пузырей одной колонкой, `BubbleReactions` — бейдж реакции поверх угла пузыря.",
      },
    },
  },
  args: { variant: "default", align: "end" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "muted", "tinted", "outline", "ghost", "destructive"],
    },
    align: { control: "inline-radio", options: ["start", "end"] },
  },
  render: (args) => (
    <Bubble {...args}>
      <BubbleContent>Придумай название для кофейни у моря</BubbleContent>
    </Bubble>
  ),
} satisfies Meta<typeof Bubble>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col items-end gap-2">
      <Bubble variant="default" align="end">
        <BubbleContent>Сделай ярче и добавь немного жёлтого</BubbleContent>
      </Bubble>
      <Bubble variant="muted" align="end">
        <BubbleContent>Придумай название для кофейни у моря</BubbleContent>
      </Bubble>
      <Bubble variant="tinted" align="end">
        <BubbleContent>А теперь сделай логотип для «Прибой»</BubbleContent>
      </Bubble>
      <Bubble variant="secondary" align="end">
        <BubbleContent>Покажи ещё варианты</BubbleContent>
      </Bubble>
      <Bubble variant="outline" align="end">
        <BubbleContent>Черновик — ещё не отправлено</BubbleContent>
      </Bubble>
      <Bubble variant="destructive" align="end">
        <BubbleContent>Не удалось отправить сообщение</BubbleContent>
      </Bubble>
      <Bubble variant="ghost" align="start">
        <BubbleContent>Вот три варианта названия: «Прибой», «Бухта», «Маяк»</BubbleContent>
      </Bubble>
    </div>
  ),
}

export const Conversation: Story = {
  render: () => (
    <BubbleGroup className="w-96">
      <Bubble variant="muted" align="end">
        <BubbleContent>Придумай название для кофейни у моря</BubbleContent>
      </Bubble>
      <Bubble variant="ghost" align="start">
        <BubbleContent>
          Вот три варианта: «Прибой», «Бухта» и «Маяк». Скажите, какой нравится больше — сделаем к нему логотип.
        </BubbleContent>
      </Bubble>
      <Bubble variant="muted" align="end">
        <BubbleContent>Нравится «Прибой», сделай логотип</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
}

export const LongText: Story = {
  render: () => (
    <Bubble variant="muted" align="end" className="max-w-sm">
      <BubbleContent>
        Нужен логотип для кофейни «Прибой» у моря: минимализм, оттенки синего и песочного, круглый формат для
        аватарки в соцсетях и отдельно — вариант для вывески на фасаде
      </BubbleContent>
    </Bubble>
  ),
}

export const Reactions: Story = {
  render: () => (
    <Bubble variant="tinted" align="start">
      <BubbleContent>Готово: «Прибой» с волной вместо буквы «б»</BubbleContent>
      <BubbleReactions>
        <HugeiconsIcon icon={ThumbsUpIcon} strokeWidth={ICON_STROKE} className="size-3.5" />
        2
      </BubbleReactions>
    </Bubble>
  ),
}

export const Clickable: Story = {
  render: () => (
    <Bubble variant="outline" align="start">
      <BubbleContent asChild>
        <button type="button">Показать ещё варианты названия</button>
      </BubbleContent>
    </Bubble>
  ),
}
