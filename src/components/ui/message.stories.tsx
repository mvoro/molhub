import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, RefreshIcon, ThumbsDownIcon, ThumbsUpIcon } from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import { Skeleton } from "@/components/ui/skeleton"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Message",
  component: Message,
  parameters: {
    docs: {
      description: {
        component:
          "Строка сообщения в чате: аватар, шапка (модель, время), содержимое и футер с действиями. `align=\"end\"` разворачивает всё вправо (реплика пользователя) — её текст оборачивается в `Bubble`. Ответ модели в AI Hub обычно идёт без пузыря, прямо в `MessageContent`, как в ChatGPT. `MessageGroup` держит несколько сообщений подряд одной колонкой без повтора аватара.",
      },
    },
  },
  args: { align: "start" },
  argTypes: { align: { control: "inline-radio", options: ["start", "end"] } },
} satisfies Meta<typeof Message>

export default meta
type Story = StoryObj<typeof meta>

export const Assistant: Story = {
  render: (args) => (
    <Message {...args} className="w-full max-w-md">
      <MessageAvatar>
        <Avatar className="size-8">
          <AvatarImage src="/models/claude.svg" alt="" />
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>Claude</MessageHeader>
        <span className="px-3 leading-relaxed text-foreground">
          Вот три варианта названия для кофейни у моря: «Прибой», «Бухта» и «Маяк». Можем сделать логотип к
          любому из них.
        </span>
      </MessageContent>
    </Message>
  ),
}

export const User: Story = {
  args: { align: "end" },
  render: (args) => (
    <Message {...args} className="w-full max-w-md">
      <MessageContent>
        <Bubble variant="muted" align="end">
          <BubbleContent>Придумай название для кофейни у моря</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  ),
}

export const WithHeaderAndFooter: Story = {
  render: () => (
    <Message className="w-full max-w-md">
      <MessageAvatar>
        <Avatar className="size-8">
          <AvatarImage src="/models/claude.svg" alt="" />
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>Claude · 14:02</MessageHeader>
        <span className="px-3 leading-relaxed text-foreground">
          Готово: логотип «Прибой» с волной вместо буквы «б», в оттенках синего и песочного.
        </span>
        <MessageFooter>
          <Button variant="ghost" size="icon-xs" aria-label="Скопировать ответ">
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={ICON_STROKE} />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Сгенерировать заново">
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={ICON_STROKE} />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Хороший ответ">
            <HugeiconsIcon icon={ThumbsUpIcon} strokeWidth={ICON_STROKE} />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Плохой ответ">
            <HugeiconsIcon icon={ThumbsDownIcon} strokeWidth={ICON_STROKE} />
          </Button>
        </MessageFooter>
      </MessageContent>
    </Message>
  ),
}

export const Pending: Story = {
  render: () => (
    <Message className="w-full max-w-md">
      <MessageContent role="status" className="gap-2.5 pt-1.5">
        <span className="sr-only">Ответ готовится</span>
        <Skeleton className="h-3.5 w-11/12 rounded-full" />
        <Skeleton className="h-3.5 w-4/5 rounded-full" />
        <Skeleton className="h-3.5 w-1/2 rounded-full" />
      </MessageContent>
    </Message>
  ),
}

export const Group: Story = {
  render: () => (
    <MessageGroup className="w-full max-w-md">
      <Message>
        <MessageAvatar>
          <Avatar className="size-8">
            <AvatarImage src="/models/claude.svg" alt="" />
            <AvatarFallback>C</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Claude</MessageHeader>
          <span className="px-3 leading-relaxed text-foreground">
            Уточните, пожалуйста, в каком стиле рисовать логотип.
          </span>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent>
          <span className="px-3 leading-relaxed text-foreground">
            Пока прикидываю три направления: минимализм, ретро и иллюстративный.
          </span>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
}
