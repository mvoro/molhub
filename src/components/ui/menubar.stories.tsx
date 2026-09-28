import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Archive01Icon,
  Copy01Icon,
  Delete02Icon,
  FileExportIcon,
  FolderAddIcon,
  PencilEdit02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Menubar",
  component: Menubar,
  parameters: {
    docs: {
      story: { inline: false, height: "400px" },
      description: {
        component:
          "Строка меню shadcn (Radix Menubar) в духе десктопных приложений: «Файл», «Правка», «Вид». Внутри — те же пункты, что у выпадающего меню: иконки, хоткеи, чекбоксы, радио, подменю. Открытое меню задаётся `value`/`defaultValue` у `Menubar` и `value` у `MenubarMenu`.\n\n" +
          "В экранах AI Hub пока не используется: на мобилке строки меню нет, а действия с чатами и проектами живут в `AppMenu`. Подойдёт для будущих десктопных инструментов вроде редактора изображений.",
      },
    },
  },
  args: { defaultValue: "file" },
  render: (args) => <AppMenubar key={String(args.defaultValue)} {...args} />,
  argTypes: {
    defaultValue: { control: "inline-radio", options: ["file", "edit", "view", "model"] },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[360px] w-[520px] items-start justify-center pt-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Menubar>

export default meta
type Story = StoryObj<typeof meta>

function AppMenubar({ defaultValue, ...args }: NonNullable<Story["args"]>) {
  const [value, setValue] = React.useState(defaultValue ?? "")
  const [sidebar, setSidebar] = React.useState(true)
  const [compact, setCompact] = React.useState(false)
  const [theme, setTheme] = React.useState("system")
  const [model, setModel] = React.useState("gpt-5")

  return (
    <Menubar
      {...args}
      value={value}
      // Radix menus close when their window loses focus; in Docs each story iframe pulls focus from
      // the previous one, so closes are ignored while this frame is unfocused.
      onValueChange={(next) => {
        if (next || document.hasFocus()) setValue(next)
      }}
    >
      <MenubarMenu value="file">
        <MenubarTrigger>Файл</MenubarTrigger>
        <MenubarContent className="w-60">
          <MenubarItem>
            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={ICON_STROKE} />
            Новый чат
            <MenubarShortcut>⇧⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <HugeiconsIcon icon={FolderAddIcon} strokeWidth={ICON_STROKE} />
            Новый проект
          </MenubarItem>
          <MenubarItem>
            <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} />
            Поиск чатов
            <MenubarShortcut>⌘K</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>
              <HugeiconsIcon icon={FileExportIcon} strokeWidth={ICON_STROKE} />
              Экспортировать чат
            </MenubarSubTrigger>
            <MenubarSubContent className="w-44">
              <MenubarItem>Markdown</MenubarItem>
              <MenubarItem>PDF</MenubarItem>
              <MenubarItem>Текстовый файл</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem>
            <HugeiconsIcon icon={Archive01Icon} strokeWidth={ICON_STROKE} />
            Архивировать чат
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="destructive">
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={ICON_STROKE} />
            Удалить чат
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu value="edit">
        <MenubarTrigger>Правка</MenubarTrigger>
        <MenubarContent className="w-56">
          <MenubarItem>
            Отменить
            <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Повторить
            <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={ICON_STROKE} />
            Скопировать ответ
            <MenubarShortcut>⇧⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem inset>Выделить всё</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu value="view">
        <MenubarTrigger>Вид</MenubarTrigger>
        <MenubarContent className="w-64">
          <MenubarCheckboxItem checked={sidebar} onCheckedChange={setSidebar}>
            Боковая панель
            <MenubarShortcut>⌘B</MenubarShortcut>
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked={compact} onCheckedChange={setCompact}>
            Компактные сообщения
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel inset>Тема</MenubarLabel>
          <MenubarRadioGroup value={theme} onValueChange={setTheme}>
            <MenubarRadioItem value="light">Светлая</MenubarRadioItem>
            <MenubarRadioItem value="dark">Тёмная</MenubarRadioItem>
            <MenubarRadioItem value="system">Как в системе</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu value="model">
        <MenubarTrigger>Нейросеть</MenubarTrigger>
        <MenubarContent className="w-52">
          <MenubarRadioGroup value={model} onValueChange={setModel}>
            <MenubarGroup>
              <MenubarLabel inset>Текст</MenubarLabel>
              <MenubarRadioItem value="molly">Молли</MenubarRadioItem>
              <MenubarRadioItem value="gpt-5">GPT-5</MenubarRadioItem>
              <MenubarRadioItem value="claude">Claude</MenubarRadioItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarLabel inset>Изображения</MenubarLabel>
              <MenubarRadioItem value="midjourney">Midjourney</MenubarRadioItem>
              <MenubarRadioItem value="flux">Flux</MenubarRadioItem>
            </MenubarGroup>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export const FileMenu: Story = {
  name: "Меню «Файл»",
}

export const EditMenu: Story = {
  name: "Меню «Правка»",
  args: { defaultValue: "edit" },
}

export const ViewMenu: Story = {
  name: "Чекбоксы и радио",
  args: { defaultValue: "view" },
}

export const ModelMenu: Story = {
  name: "Группы",
  args: { defaultValue: "model" },
}

export const Closed: Story = {
  name: "Закрытая",
  args: { defaultValue: undefined },
}
