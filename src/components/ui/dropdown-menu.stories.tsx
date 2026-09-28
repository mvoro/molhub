import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Archive01Icon,
  ArrowDown01Icon,
  Delete02Icon,
  Folder01Icon,
  FolderAddIcon,
  FolderTransferIcon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  PencilEdit02Icon,
  Search01Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PROJECTS } from "@/data/chats"
import { ICON_STROKE } from "@/lib/icons"
import { projectColor } from "@/lib/project-colors"

const meta = {
  title: "UI/DropdownMenu",
  component: DropdownMenuContent,
  parameters: {
    docs: {
      story: { inline: false, height: "420px" },
      description: {
        component:
          "Библиотечное выпадающее меню shadcn (Radix DropdownMenu): пункты с иконками и хоткеями, группы с подписью, чекбоксы, радио, подменю, `variant=\"destructive\"` для удаления.\n\n" +
          "В экранах приложения голый `DropdownMenuContent` не используется: меню действий собираются на `AppMenu` (`ui/app-menu.tsx`) — та же библиотека в пропорциях ChatGPT (карточка 20px, строки 36px, иконки 18px). Здесь — справочник по примитиву. Удаление из меню подтверждается через `ConfirmDialog`.",
      },
    },
  },
  args: { side: "bottom", align: "start" },
  argTypes: {
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[380px] w-[560px] items-start justify-center pt-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DropdownMenuContent>

export default meta
type Story = StoryObj<typeof meta>

/* Radix menus close when their window loses focus. In Docs every story is a separate iframe and
   each open menu pulls focus into its own frame, closing the menu before it — so the demo ignores
   closes while its frame is unfocused. A click outside the menu still closes it. */
function OpenDropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true)
  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        if (next || document.hasFocus()) setOpen(next)
      }}
    >
      {children}
    </DropdownMenu>
  )
}

export const Default: Story = {
  render: (args) => (
    <OpenDropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Действия с чатом «Логотип для кофейни»">
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={ICON_STROKE} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...args} className="w-56">
        <DropdownMenuLabel>Логотип для кофейни</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <HugeiconsIcon icon={Share08Icon} strokeWidth={ICON_STROKE} />
            Поделиться
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={ICON_STROKE} />
            Переименовать
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HugeiconsIcon icon={Archive01Icon} strokeWidth={ICON_STROKE} />
            Архивировать
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={ICON_STROKE} />
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </OpenDropdownMenu>
  ),
}

export const WithShortcuts: Story = {
  name: "С хоткеями",
  render: (args) => (
    <OpenDropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Молекула
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...args} className="w-60">
        <DropdownMenuItem>
          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={ICON_STROKE} />
          Новый чат
          <DropdownMenuShortcut>⇧⌘O</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} />
          Поиск чатов
          <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HugeiconsIcon icon={FolderAddIcon} strokeWidth={ICON_STROKE} />
          Новый проект
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <HugeiconsIcon icon={Share08Icon} strokeWidth={ICON_STROKE} />
          Поделиться чатом
          <DropdownMenuShortcut>⌘⇧S</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </OpenDropdownMenu>
  ),
}

function CheckboxDemo(args: Story["args"]) {
  const [shown, setShown] = React.useState({ image: true, video: true, audio: false })
  return (
    <OpenDropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Показывать</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...args} className="w-56">
        <DropdownMenuLabel>В галерее</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={shown.image}
          onCheckedChange={(image) => setShown((prev) => ({ ...prev, image }))}
        >
          Изображения
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={shown.video}
          onCheckedChange={(video) => setShown((prev) => ({ ...prev, video }))}
        >
          Видео
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={shown.audio}
          onCheckedChange={(audio) => setShown((prev) => ({ ...prev, audio }))}
        >
          Аудио
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked disabled>
          Мои генерации
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </OpenDropdownMenu>
  )
}

export const Checkboxes: Story = {
  name: "Чекбоксы",
  render: (args) => <CheckboxDemo {...args} />,
}

const MODELS = ["Молли", "GPT-5", "Claude", "Gemini"]

function RadioDemo(args: Story["args"]) {
  const [model, setModel] = React.useState("GPT-5")
  return (
    <OpenDropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          {model}
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...args} className="w-48">
        <DropdownMenuLabel>Нейросеть</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
          {MODELS.map((name) => (
            <DropdownMenuRadioItem key={name} value={name}>
              {name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </OpenDropdownMenu>
  )
}

export const RadioGroup: Story = {
  name: "Радио",
  render: (args) => <RadioDemo {...args} />,
}

/* A submenu's `defaultOpen` doesn't survive the root menu focusing itself on open (Radix closes
   a submenu on focus outside), so the demo opens it right after mount instead. */
function useOpenAfterMount() {
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), 100)
    return () => window.clearTimeout(timer)
  }, [])
  return [open, setOpen] as const
}

function SubmenuDemo(args: Story["args"]) {
  const [subOpen, setSubOpen] = useOpenAfterMount()
  return (
    <OpenDropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Действия с чатом «Сравни GPT-5 и Claude»">
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={ICON_STROKE} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...args} className="w-56">
        <DropdownMenuItem>
          <HugeiconsIcon icon={Share08Icon} strokeWidth={ICON_STROKE} />
          Поделиться
        </DropdownMenuItem>
        <DropdownMenuSub open={subOpen} onOpenChange={setSubOpen}>
          <DropdownMenuSubTrigger>
            <HugeiconsIcon icon={FolderTransferIcon} strokeWidth={ICON_STROKE} />
            Перенести в проект
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            {PROJECTS.map((project) => (
              <DropdownMenuItem key={project.id}>
                <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} color={projectColor(project.color)} />
                {project.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={ICON_STROKE} />
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </OpenDropdownMenu>
  )
}

export const Submenu: Story = {
  name: "Подменю",
  decorators: [
    (Story) => (
      <div className="flex w-full justify-start pl-4">
        <Story />
      </div>
    ),
  ],
  render: (args) => <SubmenuDemo {...args} />,
}

export const FromTrigger: Story = {
  name: "Открытие по кнопке",
  render: (args) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Действия с чатом «Идеи постов на неделю»">
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={ICON_STROKE} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...args} className="w-56">
        <DropdownMenuItem>
          <HugeiconsIcon icon={Share08Icon} strokeWidth={ICON_STROKE} />
          Поделиться
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={ICON_STROKE} />
          Переименовать
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={ICON_STROKE} />
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
