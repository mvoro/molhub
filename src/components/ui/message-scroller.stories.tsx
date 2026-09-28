import type { Meta, StoryObj } from "@storybook/react-vite"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Skeleton } from "@/components/ui/skeleton"

const meta = {
  title: "UI/MessageScroller",
  component: MessageScroller,
  parameters: {
    docs: {
      description: {
        component:
          "Прокручиваемая лента сообщений чата (используется в `ChatView`). `Provider` держит состояние скролла для всей ленты, `Viewport`/`Content` — сама прокрутка, `Item` — обёртка сообщения (`scrollAnchor` отмечает якорь для автоскролла), `Button` — круглая кнопка «к концу» / «к началу», которая появляется, только когда лента не там. `autoScroll` на провайдере держит новые сообщения внизу, пока пользователь сам не отскроллил вверх — попробуйте прокрутить ленту ниже.",
      },
    },
  },
} satisfies Meta<typeof MessageScroller>

export default meta
type Story = StoryObj<typeof meta>

const conversation = [
  { align: "end" as const, text: "Придумай название для кофейни у моря" },
  { align: "start" as const, text: "Вот три варианта: «Прибой», «Бухта» и «Маяк». Какой нравится больше?" },
  { align: "end" as const, text: "Нравится «Прибой», сделай логотип" },
  {
    align: "start" as const,
    text: "Уточните, пожалуйста: в каком стиле, какие цвета и для какого формата — квадрат, сторис или для печати?",
  },
  { align: "end" as const, text: "Минимализм, оттенки синего и песочного, квадрат для аватарки" },
  { align: "start" as const, text: "Готово: логотип «Прибой» с волной вместо буквы «б»" },
  { align: "end" as const, text: "Сделай ещё вариант, но с чайкой" },
  { align: "start" as const, text: "Держите — вариант с чайкой над волной" },
  { align: "end" as const, text: "Отлично, оставим этот" },
  {
    align: "start" as const,
    text: "Сохранил в проект «Кофейня у моря». Если понадобится ещё вариант — просто напишите",
  },
]

function ConversationItems() {
  return (
    <>
      {conversation.map((message, index) => (
        <MessageScrollerItem key={index} messageId={String(index)} scrollAnchor>
          <Message align={message.align}>
            <MessageContent>
              {message.align === "end" ? (
                <Bubble variant="muted" align="end">
                  <BubbleContent>{message.text}</BubbleContent>
                </Bubble>
              ) : (
                <span className="px-3 leading-relaxed text-foreground">{message.text}</span>
              )}
            </MessageContent>
          </Message>
        </MessageScrollerItem>
      ))}
    </>
  )
}

export const ManyMessages: Story = {
  render: () => (
    <div className="h-[26rem] w-96 overflow-hidden rounded-2xl border border-border">
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="size-full">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4 p-4">
              <ConversationItems />
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton className="bottom-4 size-9 rounded-full" />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  ),
}

export const Streaming: Story = {
  render: () => (
    <div className="h-[26rem] w-96 overflow-hidden rounded-2xl border border-border">
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="size-full">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4 p-4">
              <ConversationItems />
              <MessageScrollerItem>
                <Message>
                  <MessageContent role="status" className="gap-2.5 pt-1.5">
                    <span className="sr-only">Ответ готовится</span>
                    <Skeleton className="h-3.5 w-11/12 rounded-full" />
                    <Skeleton className="h-3.5 w-4/5 rounded-full" />
                    <Skeleton className="h-3.5 w-1/2 rounded-full" />
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton className="bottom-4 size-9 rounded-full" />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  ),
}

export const BothDirections: Story = {
  render: () => (
    <div className="h-[26rem] w-96 overflow-hidden rounded-2xl border border-border">
      <MessageScrollerProvider defaultScrollPosition="start">
        <MessageScroller className="size-full">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4 p-4">
              <ConversationItems />
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton direction="start" className="top-4 size-9 rounded-full" />
          <MessageScrollerButton direction="end" className="bottom-4 size-9 rounded-full" />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  ),
}
