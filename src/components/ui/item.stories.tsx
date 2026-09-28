import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, Folder01Icon, MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoleculeIcon } from "@/components/chat-composer/icons"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item"
import { CHAT_TYPE_ICON, ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Item",
  component: Item,
  parameters: {
    docs: {
      description: {
        component:
          "Строка списка: чат, проект, файл. `variant` — default (без фона), outline (с обводкой), muted (серая подложка); `size` — default/sm/xs. `ItemMedia variant=\"icon\"|\"image\"` — иконка или превью слева, `ItemActions` — кнопки справа, `ItemGroup` — список строк с отступами по размеру, `ItemSeparator` — тонкая линия между ними.",
      },
    },
  },
  args: { variant: "default", size: "default" },
  argTypes: {
    variant: { control: "select", options: ["default", "outline", "muted"] },
    size: { control: "select", options: ["default", "sm", "xs"] },
  },
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemMedia variant="icon">
        <HugeiconsIcon icon={CHAT_TYPE_ICON.image} strokeWidth={ICON_STROKE} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Логотип для кофейни в стиле минимализм</ItemTitle>
        <ItemDescription>Проект «Лендинг кофейни»</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon-sm" aria-label="Действия с чатом">
          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={ICON_STROKE} />
        </Button>
      </ItemActions>
    </Item>
  ),
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <Item variant="default">
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Молекула</ItemTitle>
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Лендинг кофейни</ItemTitle>
        </ItemContent>
      </Item>
      <Item variant="muted">
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Презентация Q4</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  ),
}

export const WithImage: Story = {
  render: () => (
    <Item className="w-96">
      <ItemMedia variant="image">
        <img src="/uploads/portrait.jpg" alt="" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>portrait.jpg</ItemTitle>
        <ItemDescription>Загружено вчера</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon-sm" aria-label="Удалить файл">
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={ICON_STROKE} />
        </Button>
      </ItemActions>
    </Item>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <Item size="default">
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={CHAT_TYPE_ICON.text} strokeWidth={ICON_STROKE} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Обычный размер</ItemTitle>
        </ItemContent>
      </Item>
      <Item size="sm">
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={CHAT_TYPE_ICON.text} strokeWidth={ICON_STROKE} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Маленький</ItemTitle>
        </ItemContent>
      </Item>
      <Item size="xs">
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={CHAT_TYPE_ICON.text} strokeWidth={ICON_STROKE} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Очень маленький</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  ),
}

export const Group: Story = {
  render: () => (
    <ItemGroup className="w-96">
      <Item>
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={CHAT_TYPE_ICON.image} strokeWidth={ICON_STROKE} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Логотип для кофейни в стиле минимализм</ItemTitle>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={CHAT_TYPE_ICON.text} strokeWidth={ICON_STROKE} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Сравни GPT-5 и Claude для кода</ItemTitle>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={CHAT_TYPE_ICON.video} strokeWidth={ICON_STROKE} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Видео 10 сек: закат над морем</ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
}

export const WithHeaderAndFooter: Story = {
  render: () => (
    <Item variant="outline" className="w-96 flex-col items-stretch">
      <ItemHeader>
        <ItemTitle>Видео 10 сек: закат над морем</ItemTitle>
        <Badge variant="secondary" className="h-6 gap-1 rounded-full px-2 text-xs font-normal tabular-nums">
          45
          <MoleculeIcon className="size-2.5" />
        </Badge>
      </ItemHeader>
      <ItemContent>
        <ItemDescription>Kling 2.5 · 1080×1920</ItemDescription>
      </ItemContent>
      <ItemFooter>
        <span className="text-xs text-muted-foreground">Готово 2 минуты назад</span>
        <Button size="sm" variant="ghost">
          Скачать
        </Button>
      </ItemFooter>
    </Item>
  ),
}
