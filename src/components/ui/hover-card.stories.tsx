import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Coins01Icon, Folder01Icon } from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/HoverCard",
  component: HoverCardContent,
  parameters: {
    docs: {
      story: { inline: false, height: "320px" },
      description: {
        component:
          "Карточка-превью shadcn (Radix HoverCard): появляется при наведении мыши на ссылку или имя и показывает подробности, не уводя со страницы. Задержки — `openDelay` и `closeDelay` у `HoverCard`.\n\n" +
          "Только для дополнительной информации: на тач-экранах наведения нет, поэтому ничего важного и никаких действий в карточку не кладём. Короткая подсказка к иконке — `Tooltip`, действия — `AppMenu`, справка по клику — `Popover`.",
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
      <div className="flex min-h-[280px] w-[380px] items-start justify-center pt-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HoverCardContent>

export default meta
type Story = StoryObj<typeof meta>

export const Model: Story = {
  name: "Модель",
  render: (args) => (
    <HoverCard defaultOpen>
      <HoverCardTrigger asChild>
        <Button variant="link">GPT-5</Button>
      </HoverCardTrigger>
      <HoverCardContent {...args} className="flex w-72 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">GPT-5</span>
          <Badge variant="secondary">Текст</Badge>
        </div>
        <p className="text-muted-foreground text-pretty">
          Флагманская модель OpenAI: рассуждения, код и работа с длинными документами.
        </p>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <HugeiconsIcon icon={Coins01Icon} strokeWidth={ICON_STROKE} className="size-3.5" />2 молекулы за запрос
        </span>
      </HoverCardContent>
    </HoverCard>
  ),
}

export const Author: Story = {
  name: "Автор",
  render: (args) => (
    <HoverCard defaultOpen>
      <HoverCardTrigger asChild>
        <Button variant="link">Анна</Button>
      </HoverCardTrigger>
      <HoverCardContent {...args} className="flex gap-3">
        <Avatar className="size-10">
          <AvatarImage src="/avatars/serval.webp" alt="" />
          <AvatarFallback>АМ</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-medium">Анна М.</span>
          <span className="text-muted-foreground">Поделилась чатом «Логотип для кофейни»</span>
          <span className="text-xs text-muted-foreground">С Молекулой с марта 2026</span>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}

export const Project: Story = {
  name: "Проект",
  args: { side: "right", align: "start" },
  render: (args) => (
    <HoverCard defaultOpen>
      <HoverCardTrigger asChild>
        <Button variant="ghost" className="gap-2 font-normal">
          <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} color="var(--primary)" />
          Молекула
        </Button>
      </HoverCardTrigger>
      <HoverCardContent {...args} className="flex w-56 flex-col gap-1">
        <span className="font-medium">Молекула</span>
        <span className="text-muted-foreground">12 чатов · обновлён сегодня</span>
      </HoverCardContent>
    </HoverCard>
  ),
}

export const OnHover: Story = {
  name: "Открытие при наведении",
  render: (args) => (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        <Button variant="link">Kling</Button>
      </HoverCardTrigger>
      <HoverCardContent {...args} className="flex w-72 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Kling</span>
          <Badge variant="secondary">Видео</Badge>
        </div>
        <p className="text-muted-foreground text-pretty">Видео до 10 секунд по описанию или по первому кадру.</p>
        <span className="text-xs text-muted-foreground">40 молекул за видео</span>
      </HoverCardContent>
    </HoverCard>
  ),
}
