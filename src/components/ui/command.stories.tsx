import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { FolderAddIcon, PencilEdit02Icon, Search01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { CHATS, type ChatType } from "@/data/chats"
import { CHAT_TYPE_ICON, ICON_STROKE } from "@/lib/icons"

const MODAL = {
  layout: "fullscreen",
  docs: { story: { inline: false, height: "560px" } },
} as const

const meta = {
  title: "UI/Command",
  component: Command,
  parameters: {
    docs: {
      description: {
        component:
          "Список с поиском shadcn на cmdk: поле ввода фильтрует пункты, стрелки и Enter выбирают, группы с заголовками, хоткеи справа, пустое состояние. Отмеченный пункт получает галочку через `data-checked=\"true\"` у `CommandItem`. Проект добавил `bare` у `CommandInput` — поле без рамки и лупы для полноразмерного поиска.\n\n" +
          "В приложении на нём собраны поиск чатов (⌘K) и выбор нейросети — внутри `AppSheet`, а не в `CommandDialog`: так на мобилке это нижний лист. `CommandDialog` — библиотечная обёртка на голом `Dialog`, в экранах её не используем; если всё же берёте — передавайте русские `title` и `description`.",
      },
    },
  },
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

const MODELS: { name: string; type: ChatType; price: string }[] = [
  { name: "Молли", type: "text", price: "бесплатно" },
  { name: "GPT-5", type: "text", price: "2 молекулы" },
  { name: "Claude", type: "text", price: "2 молекулы" },
  { name: "Midjourney", type: "image", price: "8 молекул" },
  { name: "Flux", type: "image", price: "6 молекул" },
  { name: "Kling", type: "video", price: "40 молекул" },
]

function ModelItems({ current }: { current?: string }) {
  return (
    <>
      {(["text", "image", "video"] as const).map((type) => (
        <CommandGroup key={type} heading={{ text: "Текст", image: "Изображения", video: "Видео" }[type]}>
          {MODELS.filter((model) => model.type === type).map((model) => (
            <CommandItem key={model.name} value={model.name} data-checked={model.name === current ? "true" : undefined}>
              <HugeiconsIcon icon={CHAT_TYPE_ICON[model.type]} strokeWidth={ICON_STROKE} />
              <span className="flex-1 truncate">{model.name}</span>
              <span className="text-xs text-muted-foreground">{model.price}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  )
}

export const Default: Story = {
  render: (args) => (
    <Command {...args} className="w-[380px] rounded-xl! ring-1 ring-foreground/10">
      <CommandInput placeholder="Найдите модель или команду" />
      <CommandList>
        <CommandEmpty>Ничего не нашлось</CommandEmpty>
        <CommandGroup heading="Действия">
          <CommandItem>
            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={ICON_STROKE} />
            Новый чат
            <CommandShortcut>⇧⌘O</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <HugeiconsIcon icon={FolderAddIcon} strokeWidth={ICON_STROKE} />
            Создать проект
          </CommandItem>
          <CommandItem>
            <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} />
            Поиск чатов
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <ModelItems />
      </CommandList>
    </Command>
  ),
}

export const Checked: Story = {
  name: "Выбранный пункт",
  render: (args) => (
    <Command {...args} defaultValue="GPT-5" className="w-[380px] rounded-xl! ring-1 ring-foreground/10">
      <CommandInput placeholder="Найдите нейросеть" />
      <CommandList>
        <CommandEmpty>Такой нейросети пока нет</CommandEmpty>
        <ModelItems current="GPT-5" />
      </CommandList>
    </Command>
  ),
}

export const Empty: Story = {
  name: "Пустой результат",
  render: (args) => (
    <Command {...args} className="w-[380px] rounded-xl! ring-1 ring-foreground/10">
      <CommandInput placeholder="Найдите нейросеть" value="Stable Diffusion 1.5" />
      <CommandList>
        <CommandEmpty>Такой нейросети пока нет. Попробуйте Flux или Midjourney.</CommandEmpty>
        <ModelItems />
      </CommandList>
    </Command>
  ),
}

export const Disabled: Story = {
  name: "Недоступные пункты",
  render: (args) => (
    <Command {...args} className="w-[380px] rounded-xl! ring-1 ring-foreground/10">
      <CommandInput placeholder="Найдите нейросеть" />
      <CommandList>
        <CommandGroup heading="Видео">
          <CommandItem>
            <HugeiconsIcon icon={CHAT_TYPE_ICON.video} strokeWidth={ICON_STROKE} />
            <span className="flex-1">Kling</span>
            <span className="text-xs text-muted-foreground">40 молекул</span>
          </CommandItem>
          <CommandItem disabled>
            <HugeiconsIcon icon={CHAT_TYPE_ICON.video} strokeWidth={ICON_STROKE} />
            <span className="flex-1">Veo</span>
            <span className="text-xs text-muted-foreground">на тарифе Про</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

/* The ⌘K layout from chat-search.tsx: borderless input, results grouped by chat. */
export const BareInput: Story = {
  name: "Поле без рамки",
  render: (args) => (
    <Command {...args} className="w-[420px] rounded-2xl! p-0 ring-1 ring-foreground/10">
      <div className="flex items-center gap-2.5 border-b px-4 py-3">
        <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} className="size-5 text-muted-foreground" />
        <CommandInput bare placeholder="Поиск чатов" />
      </div>
      <CommandList className="p-2">
        <CommandEmpty>Ничего не нашлось</CommandEmpty>
        <CommandGroup heading="Недавние">
          {CHATS.slice(0, 6).map((chat) => (
            <CommandItem key={chat.id} value={chat.title}>
              <HugeiconsIcon icon={CHAT_TYPE_ICON[chat.type]} strokeWidth={ICON_STROKE} />
              <span className="truncate">{chat.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

export const Dialog: Story = {
  name: "CommandDialog",
  parameters: MODAL,
  render: () => (
    <CommandDialog defaultOpen title="Поиск чатов" description="Найдите чат по названию">
      <Command>
        <CommandInput placeholder="Поиск чатов" />
        <CommandList>
          <CommandEmpty>Ничего не нашлось</CommandEmpty>
          <CommandGroup heading="Чаты">
            {CHATS.slice(0, 8).map((chat) => (
              <CommandItem key={chat.id} value={chat.title}>
                <HugeiconsIcon icon={CHAT_TYPE_ICON[chat.type]} strokeWidth={ICON_STROKE} />
                <span className="truncate">{chat.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  ),
}

function DialogTriggerDemo() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Button variant="outline" onClick={() => setOpen(true)}>
        <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} />
        Поиск чатов
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Поиск чатов" description="Найдите чат по названию">
        <Command>
          <CommandInput placeholder="Поиск чатов" />
          <CommandList>
            <CommandEmpty>Ничего не нашлось</CommandEmpty>
            <CommandGroup heading="Чаты">
              {CHATS.map((chat) => (
                <CommandItem key={chat.id} value={chat.title} onSelect={() => setOpen(false)}>
                  <HugeiconsIcon icon={CHAT_TYPE_ICON[chat.type]} strokeWidth={ICON_STROKE} />
                  <span className="truncate">{chat.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  )
}

export const DialogFromTrigger: Story = {
  name: "CommandDialog по кнопке и ⌘K",
  parameters: MODAL,
  render: () => <DialogTriggerDemo />,
}
