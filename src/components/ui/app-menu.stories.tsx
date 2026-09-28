import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiBrain01Icon,
  Archive01Icon,
  ArrowReloadHorizontalIcon,
  ArrowRight01Icon,
  ComputerIcon,
  Copy01Icon,
  CreditCardIcon,
  Delete02Icon,
  Download01Icon,
  Folder01Icon,
  FolderAddIcon,
  FolderRemoveIcon,
  FolderTransferIcon,
  Logout03Icon,
  Moon02Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  PinIcon,
  Settings01Icon,
  Share08Icon,
  Sun03Icon,
  Tick02Icon,
  TransactionHistoryIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import {
  AppMenu,
  AppMenuContent,
  AppMenuItem,
  AppMenuRadioGroup,
  AppMenuRadioItem,
  AppMenuSeparator,
  AppMenuSub,
  AppMenuSubContent,
  AppMenuSubTrigger,
  AppMenuTrigger,
} from "@/components/ui/app-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AppSheet, AppSheetContent, AppSheetHeader, AppSheetTitle } from "@/components/ui/app-sheet"
import { PROJECTS } from "@/data/chats"
import { ICON_STROKE } from "@/lib/icons"
import { projectColor } from "@/lib/project-colors"

const meta = {
  title: "Проект/AppMenu",
  component: AppMenuContent,
  parameters: {
    docs: {
      story: { inline: false, height: "480px" },
      description: {
        component:
          "Меню действий приложения в пропорциях ChatGPT поверх библиотечного `DropdownMenu`: карточка 20px с мягкой широкой тенью, строки 36px с иконками 18px, разделители с отступом. Состав: `AppMenu`, `AppMenuTrigger`, `AppMenuContent`, `AppMenuItem` (проп `icon`), `AppMenuSeparator`, `AppMenuSub`, `AppMenuSubTrigger`, `AppMenuSubContent`, `AppMenuRadioGroup` и `AppMenuRadioItem` (выбор одного значения, галочка справа — например, тема).\n\n" +
          "Используется везде вместо голого `DropdownMenuContent`: действия с чатом и проектом в боковой панели, меню аккаунта, настройки композера на десктопе. Пункты — глагол + объект («Удалить проект», «Перенести в проект»), удаление — `variant=\"destructive\"` и всегда последним; само удаление подтверждается через `ConfirmDialog`.\n\n" +
          "Меню не модальное (`modal={false}` по умолчанию): открыто максимум одно, клик по кнопке другого меню закрывает текущее и сразу открывает новое. `modal` не передавать — модальное меню выключает остальную страницу, и до соседней кнопки доходит только второй клик.\n\n" +
          "На сенсорном экране меню открывается после завершения тапа, чтобы последующий фокус кнопки не закрыл его. Подменю на телефоне (<768px) открывается на месте меню, как в iOS: его пункты под строкой «‹ Название», которая возвращает назад. Название — проп `title` у `AppMenuSubContent` (без него «Назад»). На десктопе подменю сбоку, как в библиотеке. От краёв экрана меню держится в 8px (`collisionPadding`).",
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
      <div className="flex min-h-[440px] w-[600px] items-start justify-center pt-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppMenuContent>

export default meta
type Story = StoryObj<typeof meta>

/* Radix menus close when their window loses focus. In Docs every story is a separate iframe and
   each open menu pulls focus into its own frame, closing the menu before it — so the demo ignores
   closes while its frame is unfocused. A click outside the menu still closes it. */
function OpenAppMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true)
  return (
    <AppMenu
      open={open}
      onOpenChange={(next) => {
        if (next || document.hasFocus()) setOpen(next)
      }}
    >
      {children}
    </AppMenu>
  )
}

function MoreButton({ label }: { label: string }) {
  return (
    <AppMenuTrigger asChild>
      <Button variant="ghost" size="icon-sm" aria-label={label} className="rounded-md">
        <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={ICON_STROKE} />
      </Button>
    </AppMenuTrigger>
  )
}

export const ChatActions: Story = {
  name: "Действия с чатом",
  render: (args) => (
    <OpenAppMenu>
      <MoreButton label="Действия с чатом «Логотип для кофейни»" />
      <AppMenuContent {...args}>
        <AppMenuItem icon={Share08Icon}>Поделиться</AppMenuItem>
        <AppMenuItem icon={PencilEdit01Icon}>Переименовать</AppMenuItem>
        <AppMenuSub>
          <AppMenuSubTrigger icon={FolderTransferIcon}>Перенести в проект</AppMenuSubTrigger>
          <AppMenuSubContent title="Перенести в проект">
            <AppMenuItem icon={FolderAddIcon}>Новый проект</AppMenuItem>
            <AppMenuSeparator />
            {PROJECTS.map((project) => (
              <AppMenuItem key={project.id}>
                <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} color={projectColor(project.color)} />
                {project.name}
              </AppMenuItem>
            ))}
          </AppMenuSubContent>
        </AppMenuSub>
        <AppMenuSeparator />
        <AppMenuItem icon={PinIcon}>Закрепить чат</AppMenuItem>
        <AppMenuItem icon={Archive01Icon}>Архивировать</AppMenuItem>
        <AppMenuItem icon={Delete02Icon} variant="destructive">
          Удалить
        </AppMenuItem>
      </AppMenuContent>
    </OpenAppMenu>
  ),
}

/* The same menu on a phone: «Перенести в проект» opens in the menu's place, with the row back on top. */
export const ChatActionsPhone: Story = {
  ...ChatActions,
  name: "Действия с чатом · телефон",
  globals: { viewport: { value: "mobile", isRotated: false } },
}

export const ViewerActionsPhone: Story = {
  name: "Вьювер · меню по касанию",
  globals: { viewport: { value: "mobile", isRotated: false } },
  render: () => (
    <AppSheet defaultOpen>
      <AppSheetContent variant="fullscreen" aria-describedby={undefined}>
        <AppSheetHeader><AppSheetTitle>Просмотр фото</AppSheetTitle></AppSheetHeader>
        <AppMenu>
          <MoreButton label="Действия с файлом" />
          <AppMenuContent>
            <AppMenuItem icon={Download01Icon}>Скачать</AppMenuItem>
            <AppMenuSub>
              <AppMenuSubTrigger icon={FolderAddIcon}>Добавить в проект</AppMenuSubTrigger>
              <AppMenuSubContent title="Добавить в проект">
                <AppMenuItem>Лендинг кофейни</AppMenuItem>
              </AppMenuSubContent>
            </AppMenuSub>
          </AppMenuContent>
        </AppMenu>
      </AppSheetContent>
    </AppSheet>
  ),
}

export const ProjectActions: Story = {
  name: "Действия с проектом",
  render: (args) => (
    <OpenAppMenu>
      <MoreButton label="Действия с проектом «Молекула»" />
      <AppMenuContent {...args}>
        <AppMenuItem icon={Share08Icon}>Поделиться проектом</AppMenuItem>
        <AppMenuItem icon={PencilEdit01Icon}>Переименовать проект</AppMenuItem>
        <AppMenuItem icon={Settings01Icon}>Настройки проекта</AppMenuItem>
        <AppMenuItem icon={Folder01Icon}>Главная страница проекта</AppMenuItem>
        <AppMenuSeparator />
        <AppMenuItem icon={PinIcon}>Закрепить проект</AppMenuItem>
        <AppMenuItem icon={Archive01Icon}>Архивировать проект</AppMenuItem>
        <AppMenuItem icon={Delete02Icon} variant="destructive">
          Удалить проект
        </AppMenuItem>
      </AppMenuContent>
    </OpenAppMenu>
  ),
}

const MANY_PROJECTS = [
  ...PROJECTS,
  { id: "brand", name: "Айдентика для студии йоги «Тихое утро» на осенний сезон" },
  { id: "thesis", name: "Диплом" },
  { id: "travel", name: "Путешествие в Грузию" },
  { id: "podcast", name: "Подкаст про дизайн" },
]

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
    <OpenAppMenu>
      <MoreButton label="Действия с чатом «Сравни GPT-5 и Claude»" />
      <AppMenuContent {...args}>
        <AppMenuItem icon={Share08Icon}>Поделиться</AppMenuItem>
        <AppMenuItem icon={PencilEdit01Icon}>Переименовать</AppMenuItem>
        <AppMenuSub open={subOpen} onOpenChange={setSubOpen}>
          <AppMenuSubTrigger icon={FolderTransferIcon}>Перенести в проект</AppMenuSubTrigger>
          <AppMenuSubContent className="max-w-64">
            <AppMenuItem icon={FolderAddIcon}>Новый проект</AppMenuItem>
            <AppMenuSeparator />
            {MANY_PROJECTS.map((project) => (
              <AppMenuItem key={project.id}>
                <HugeiconsIcon
                  icon={Folder01Icon}
                  strokeWidth={ICON_STROKE}
                  color={projectColor("color" in project ? project.color : undefined)}
                />
                <span className="min-w-0 flex-1 truncate">{project.name}</span>
                {project.id === "molecula" && (
                  <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} className="ml-2 size-4!" />
                )}
              </AppMenuItem>
            ))}
            <AppMenuSeparator />
            <AppMenuItem icon={FolderRemoveIcon}>Убрать из проекта</AppMenuItem>
          </AppMenuSubContent>
        </AppMenuSub>
        <AppMenuSeparator />
        <AppMenuItem icon={Archive01Icon}>Архивировать</AppMenuItem>
        <AppMenuItem icon={Delete02Icon} variant="destructive">
          Удалить
        </AppMenuItem>
      </AppMenuContent>
    </OpenAppMenu>
  )
}

export const Submenu: Story = {
  name: "Подменю: перенос в проект",
  decorators: [
    (Story) => (
      <div className="flex w-full justify-start pl-4">
        <Story />
      </div>
    ),
  ],
  render: (args) => <SubmenuDemo {...args} />,
}

export const AccountMenu: Story = {
  name: "Меню аккаунта",
  args: { side: "top" },
  decorators: [
    (Story) => (
      <div className="flex min-h-[420px] w-full items-end justify-center">
        <Story />
      </div>
    ),
  ],
  render: (args) => <AccountMenuDemo {...args} />,
}

const THEMES = [
  { value: "system", label: "Системная", icon: ComputerIcon },
  { value: "dark", label: "Тёмная", icon: Moon02Icon },
  { value: "light", label: "Светлая", icon: Sun03Icon },
]

/* The theme submenu opens on mount to show the radio rows; the choice here is local and doesn't
   touch the Storybook theme toggle. */
function AccountMenuDemo(args: Story["args"]) {
  const [subOpen, setSubOpen] = useOpenAfterMount()
  const [theme, setTheme] = React.useState("system")
  const current = THEMES.find((item) => item.value === theme) ?? THEMES[0]
  return (
    <OpenAppMenu>
      <AppMenuTrigger asChild>
        <Button variant="ghost" className="h-12 gap-2.5 rounded-xl px-2">
          <Avatar className="size-8">
            <AvatarImage src="/avatars/serval.webp" alt="" />
            <AvatarFallback>АМ</AvatarFallback>
          </Avatar>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm">Анна</span>
            <span className="text-xs text-muted-foreground">Бесплатный</span>
          </span>
        </Button>
      </AppMenuTrigger>
      <AppMenuContent {...args} className="w-64">
        <AppMenuItem className="h-auto py-2 pl-2.5">
          <Avatar className="size-8">
            <AvatarImage src="/avatars/serval.webp" alt="" />
            <AvatarFallback>АМ</AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span>Анна</span>
            <span className="text-xs text-muted-foreground">Бесплатный тариф</span>
          </span>
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={ICON_STROKE} className="text-muted-foreground!" />
        </AppMenuItem>
        <AppMenuSeparator />
        <AppMenuItem icon={CreditCardIcon}>Подписка</AppMenuItem>
        <AppMenuItem icon={UserGroupIcon}>Партнёрская программа</AppMenuItem>
        <AppMenuItem icon={TransactionHistoryIcon}>История списаний</AppMenuItem>
        <AppMenuItem icon={AiBrain01Icon}>Память</AppMenuItem>
        <AppMenuSub open={subOpen} onOpenChange={setSubOpen}>
          <AppMenuSubTrigger icon={current.icon}>
            <span className="flex-1">Тема</span>
            <span className="text-muted-foreground!">{current.label}</span>
          </AppMenuSubTrigger>
          <AppMenuSubContent className="min-w-44">
            <AppMenuRadioGroup value={theme} onValueChange={setTheme}>
              {THEMES.map(({ value, label, icon }) => (
                <AppMenuRadioItem key={value} value={value} icon={icon}>
                  {label}
                </AppMenuRadioItem>
              ))}
            </AppMenuRadioGroup>
          </AppMenuSubContent>
        </AppMenuSub>
        <AppMenuSeparator />
        <AppMenuItem icon={Logout03Icon}>Выйти</AppMenuItem>
      </AppMenuContent>
    </OpenAppMenu>
  )
}

export const DisabledItems: Story = {
  name: "Недоступные пункты",
  render: (args) => (
    <OpenAppMenu>
      <MoreButton label="Действия с изображением" />
      <AppMenuContent {...args}>
        <AppMenuItem icon={Download01Icon}>Скачать изображение</AppMenuItem>
        <AppMenuItem icon={Copy01Icon}>Скопировать промпт</AppMenuItem>
        <AppMenuItem icon={ArrowReloadHorizontalIcon} disabled>
          Повторить генерацию
        </AppMenuItem>
        <AppMenuItem icon={Share08Icon} disabled>
          Поделиться
        </AppMenuItem>
        <AppMenuSeparator />
        <AppMenuItem icon={Delete02Icon} variant="destructive">
          Удалить изображение
        </AppMenuItem>
      </AppMenuContent>
    </OpenAppMenu>
  ),
}

/* Two menus side by side: with one open, a click on the other's button swaps them in one go. */
export const OneAtATime: Story = {
  name: "Одно меню за раз",
  render: (args) => (
    <div className="flex gap-2">
      {["Разбор договора аренды", "План запуска курса"].map((title) => (
        <AppMenu key={title}>
          <MoreButton label={`Действия с чатом «${title}»`} />
          <AppMenuContent {...args}>
            <AppMenuItem icon={Share08Icon}>Поделиться</AppMenuItem>
            <AppMenuItem icon={PencilEdit01Icon}>Переименовать</AppMenuItem>
            <AppMenuSeparator />
            <AppMenuItem icon={Delete02Icon} variant="destructive">
              Удалить
            </AppMenuItem>
          </AppMenuContent>
        </AppMenu>
      ))}
    </div>
  ),
}

export const FromTrigger: Story = {
  name: "Открытие по кнопке",
  render: (args) => (
    <AppMenu>
      <MoreButton label="Действия с чатом «Разбор договора аренды»" />
      <AppMenuContent {...args}>
        <AppMenuItem icon={Share08Icon}>Поделиться</AppMenuItem>
        <AppMenuItem icon={PencilEdit01Icon}>Переименовать</AppMenuItem>
        <AppMenuSeparator />
        <AppMenuItem icon={Archive01Icon}>Архивировать</AppMenuItem>
        <AppMenuItem icon={Delete02Icon} variant="destructive">
          Удалить
        </AppMenuItem>
      </AppMenuContent>
    </AppMenu>
  ),
}
