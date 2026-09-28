import type { Meta, StoryObj } from "@storybook/react-vite"

import { Skeleton } from "@/components/ui/skeleton"
import { Message, MessageContent } from "@/components/ui/message"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          "Заглушка на время загрузки (`animate-pulse` + `bg-muted`), форма подбирается под контент. В `chat-view.tsx` три полоски убывающей ширины стоят на месте ответа модели, пока он готовится.",
      },
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
}

export const PendingReply: Story = {
  name: "Ответ готовится",
  render: () => (
    <Message>
      <MessageContent role="status" className="max-w-md gap-2.5 pt-1.5">
        <span className="sr-only">Ответ готовится</span>
        <Skeleton className="h-3.5 w-11/12 rounded-full" />
        <Skeleton className="h-3.5 w-4/5 rounded-full" />
        <Skeleton className="h-3.5 w-1/2 rounded-full" />
      </MessageContent>
    </Message>
  ),
}

export const GenerationCard: Story = {
  name: "Карточка генерации",
  render: () => (
    <Card className="w-64">
      <CardContent className="px-4">
        <Skeleton className="aspect-square w-full rounded-lg" />
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <Skeleton className="h-3.5 w-3/4 rounded-full" />
        <Skeleton className="h-3.5 w-1/3 rounded-full" />
      </CardFooter>
    </Card>
  ),
}

export const Avatar: Story = {
  name: "Аватар и текст",
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-32 rounded-full" />
        <Skeleton className="h-3 w-20 rounded-full" />
      </div>
    </div>
  ),
}
