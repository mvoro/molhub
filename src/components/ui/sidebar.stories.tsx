import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Archive01Icon,
  Folder01Icon,
  MoreHorizontalIcon,
  Search01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { CHATS } from "@/data/chats"
import { CHAT_TYPE_ICON, ICON_STROKE, NEW_CHAT_ICON } from "@/lib/icons"

const meta = {
  title: "UI/Sidebar",
  component: SidebarProvider,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "600px" },
      description: {
        component:
          "Боковая панель shadcn, пропатченная под AI Hub: на десктопе сворачивается в рейку с иконками (`collapsible=\"icon\"`, ⌘B), на мобилке меню не всплывает поверх, а сдвигает рабочую область вбок, как в приложении ChatGPT, и закрывается свайпом влево. Состав: `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup*`, `SidebarMenu*`, `SidebarFooter`, `SidebarInset`, `SidebarTrigger`, `SidebarRail`.\n\n" +
          "`sidebar.tsx` пропатчен — не перезаписывайте его через `shadcn add --overwrite`. Настоящая панель приложения — `src/components/app-sidebar.tsx`; здесь компактный пример из тех же деталей. Действия со строкой открываются через `AppMenu`, удаление подтверждается через `ConfirmDialog`.",
      },
    },
  },
  args: { defaultOpen: true },
  argTypes: {
    defaultOpen: { control: "boolean", description: "Развёрнута ли панель при первом показе" },
  },
} satisfies Meta<typeof SidebarProvider>

export default meta
type Story = StoryObj<typeof meta>

/* The patched menu button has no right padding for a row action (upstream shadcn adds it),
   so rows with «…» reserve it themselves, like app-sidebar.tsx does. */
const WITH_ACTION = "pr-8 group-data-[collapsible=icon]:pr-2"

const PROJECT_CHATS = ["Лендинг кофейни: первый экран", "Тексты для карточек меню"]

function DemoSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{
                children: (
                  <>
                    Новый чат
                    <KbdGroup>
                      <Kbd>⇧</Kbd>
                      <Kbd>⌘</Kbd>
                      <Kbd>O</Kbd>
                    </KbdGroup>
                  </>
                ),
              }}
            >
              <HugeiconsIcon icon={NEW_CHAT_ICON} strokeWidth={ICON_STROKE} />
              <span>Новый чат</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Поиск чатов">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} />
              <span>Поиск чатов</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Проекты</SidebarGroupLabel>
          <SidebarGroupAction aria-label="Создать проект">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={ICON_STROKE} />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Молекула" className={WITH_ACTION}>
                  <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} color="var(--primary)" />
                  <span>Молекула</span>
                </SidebarMenuButton>
                <SidebarMenuAction showOnHover aria-label="Действия с проектом «Молекула»">
                  <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={ICON_STROKE} />
                </SidebarMenuAction>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Лендинг кофейни" className={WITH_ACTION}>
                  <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} />
                  <span>Лендинг кофейни</span>
                </SidebarMenuButton>
                <SidebarMenuAction showOnHover aria-label="Действия с проектом «Лендинг кофейни»">
                  <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={ICON_STROKE} />
                </SidebarMenuAction>
                <SidebarMenuSub>
                  {PROJECT_CHATS.map((title) => (
                    <SidebarMenuSubItem key={title}>
                      <SidebarMenuSubButton href="#">
                        <span>{title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Чаты</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CHATS.slice(0, 6).map((chat, index) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton isActive={index === 0} tooltip={chat.title} className={WITH_ACTION}>
                    <HugeiconsIcon icon={CHAT_TYPE_ICON[chat.type]} strokeWidth={ICON_STROKE} />
                    <span>{chat.title}</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction showOnHover aria-label={`Действия с чатом «${chat.title}»`}>
                    <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={ICON_STROKE} />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Архив">
                  <HugeiconsIcon icon={Archive01Icon} strokeWidth={ICON_STROKE} />
                  <span>Архив</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>3</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Анна · Бесплатный" className={WITH_ACTION}>
              <Avatar className="size-8">
                <AvatarImage src="/avatars/serval.webp" alt="" />
                <AvatarFallback>АМ</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate">Анна</span>
                <span className="truncate text-xs text-sidebar-muted-foreground">Бесплатный</span>
              </span>
            </SidebarMenuButton>
            <SidebarMenuAction aria-label="Настройки аккаунта">
              <HugeiconsIcon icon={Settings01Icon} strokeWidth={ICON_STROKE} />
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function Workspace() {
  return (
    <SidebarInset className="min-h-0">
      <header className="flex h-14 items-center gap-2 px-3">
        <SidebarTrigger aria-label="Свернуть или развернуть боковую панель" />
        <span className="text-sm text-muted-foreground">Логотип для кофейни в стиле баухаус</span>
      </header>
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyTitle>Что создадим сегодня?</EmptyTitle>
          <EmptyDescription>Опишите задачу, а мы подберём нейросеть.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </SidebarInset>
  )
}

export const Default: Story = {
  render: (args) => (
    <SidebarProvider {...args} className="h-svh">
      <DemoSidebar />
      <Workspace />
    </SidebarProvider>
  ),
}

export const Collapsed: Story = {
  name: "Свёрнутая в рейку",
  args: { defaultOpen: false },
  render: (args) => (
    <SidebarProvider {...args} className="h-svh">
      <DemoSidebar />
      <Workspace />
    </SidebarProvider>
  ),
}

export const Loading: Story = {
  name: "Загрузка",
  render: (args) => (
    <SidebarProvider {...args} className="h-svh">
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <HugeiconsIcon icon={NEW_CHAT_ICON} strokeWidth={ICON_STROKE} />
                <span>Новый чат</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Чаты</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 6 }, (_, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <Workspace />
    </SidebarProvider>
  ),
}

export const Mobile: Story = {
  name: "Мобилка",
  globals: { viewport: { value: "mobile", isRotated: false } },
  parameters: {
    docs: {
      description: {
        story:
          "На телефоне меню спрятано слева и выезжает по кнопке в шапке, сдвигая рабочую область. В Docs блок рендерится в ширину колонки — откройте историю отдельно, вьюпорт «Мобилка 375» включится сам.",
      },
    },
  },
  render: (args) => (
    <div className="h-svh overflow-clip">
      <SidebarProvider {...args} className="h-svh overflow-clip">
        <DemoSidebar />
        <Workspace />
      </SidebarProvider>
    </div>
  ),
}
