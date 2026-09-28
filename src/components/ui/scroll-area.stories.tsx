import type { Meta, StoryObj } from "@storybook/react-vite"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const meta = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  parameters: {
    docs: {
      description: {
        component:
          "Обёртка над нативным скроллом (Radix) со стилизованным скроллбаром вместо системного. Вертикальная — список чатов или сообщений, горизонтальная (`orientation=\"horizontal\"` на `ScrollBar`) — лента моделей или превью недавних генераций.",
      },
    },
  },
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const CHATS = [
  "Логотип для кофейни в стиле минимализм",
  "Промо-ролик для запуска приложения",
  "Озвучка обучающего видео на русском",
  "Обложка для подкаста про технологии",
  "План публикаций на неделю",
  "Сравнение GPT-5 и Claude для копирайтинга",
  "Идеи для короткого видео о продукте",
  "Синтез голоса для рекламного ролика",
]

export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-72 w-72 rounded-lg ring-1 ring-foreground/10">
      <div className="flex flex-col p-1">
        {CHATS.map((title, i) => (
          <div key={title}>
            <div className="rounded-md px-3 py-2 text-sm hover:bg-muted">{title}</div>
            {i < CHATS.length - 1 && <Separator className="my-0.5" />}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

const MODELS = [
  { name: "Молли", logo: "molly" },
  { name: "GPT-5", logo: "openai" },
  { name: "Claude", logo: "claude" },
  { name: "Gemini", logo: "gemini" },
  { name: "Grok", logo: "grok" },
  { name: "Perplexity", logo: "perplexity" },
  { name: "DeepSeek", logo: "deepseek" },
  { name: "Kimi", logo: "kimi" },
]

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 rounded-lg ring-1 ring-foreground/10">
      <div className="flex gap-3 p-4">
        {MODELS.map((model) => (
          <div key={model.name} className="flex w-20 shrink-0 flex-col items-center gap-2">
            <Avatar>
              <AvatarImage src={`/models/${model.logo}.svg`} alt="" className="m-auto size-5" />
              <AvatarFallback>{model.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{model.name}</span>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}
