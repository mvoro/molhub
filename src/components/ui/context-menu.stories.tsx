import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { fireEvent, within } from "storybook/test"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowReloadHorizontalIcon,
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  Image02Icon,
  ImageUpscaleIcon,
  MagicWand01Icon,
  Maximize01Icon,
  PencilEdit01Icon,
  Share08Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/ContextMenu",
  component: ContextMenuContent,
  parameters: {
    docs: {
      story: { inline: false, height: "440px" },
      description: {
        component:
          "Контекстное меню shadcn (Radix ContextMenu): открывается правой кнопкой мыши или долгим нажатием на тач-экране, появляется в точке клика. Пункты те же, что у выпадающего меню: иконки, хоткеи, чекбоксы, радио, подменю, `variant=\"destructive\"`.\n\n" +
          "Это дополнительный путь к действиям, а не единственный: всё, что есть в контекстном меню, должно быть доступно и через видимую кнопку с `AppMenu`. Меню нельзя открыть пропом, поэтому в историях его открывает `play`-функция — кликните правой кнопкой по области, чтобы открыть заново.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[520px] p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContextMenuContent>

export default meta
type Story = StoryObj<typeof meta>

/* Radix ContextMenu has no `open` prop: fire a right click near the top-left of the trigger. */
const openAt =
  (label: string): Story["play"] =>
  async ({ canvasElement }) => {
    const target = await within(canvasElement).findByText(label)
    const rect = target.getBoundingClientRect()
    fireEvent.contextMenu(target, { clientX: rect.left + 24, clientY: rect.top + 24 })
  }

function ImageArea({ label }: { label: string }) {
  return (
    <ContextMenuTrigger asChild>
      <AspectRatio
        ratio={16 / 9}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/50 text-sm text-muted-foreground"
      >
        <HugeiconsIcon icon={Image02Icon} strokeWidth={ICON_STROKE} className="size-6" />
        <span>{label}</span>
      </AspectRatio>
    </ContextMenuTrigger>
  )
}

export const ImageActions: Story = {
  name: "Действия с изображением",
  play: openAt("Логотип для кофейни · Midjourney"),
  render: (args) => (
    <ContextMenu>
      <ImageArea label="Логотип для кофейни · Midjourney" />
      <ContextMenuContent {...args} className="w-60">
        <ContextMenuItem>
          <HugeiconsIcon icon={Maximize01Icon} strokeWidth={ICON_STROKE} />
          Открыть в полном размере
        </ContextMenuItem>
        <ContextMenuItem>
          <HugeiconsIcon icon={Download01Icon} strokeWidth={ICON_STROKE} />
          Скачать
          <ContextMenuShortcut>⌘S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <HugeiconsIcon icon={Copy01Icon} strokeWidth={ICON_STROKE} />
          Скопировать промпт
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <HugeiconsIcon icon={ArrowReloadHorizontalIcon} strokeWidth={ICON_STROKE} />
          Повторить генерацию
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <HugeiconsIcon icon={Share08Icon} strokeWidth={ICON_STROKE} />
            Использовать в
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-52">
            <ContextMenuItem>
              <HugeiconsIcon icon={Video01Icon} strokeWidth={ICON_STROKE} />
              Kling: оживить кадр
            </ContextMenuItem>
            <ContextMenuItem>
              <HugeiconsIcon icon={MagicWand01Icon} strokeWidth={ICON_STROKE} />
              Flux: заменить фон
            </ContextMenuItem>
            <ContextMenuItem>
              <HugeiconsIcon icon={ImageUpscaleIcon} strokeWidth={ICON_STROKE} />
              Увеличить в 4 раза
            </ContextMenuItem>
            <ContextMenuItem disabled>
              <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={ICON_STROKE} />
              Редактор
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={ICON_STROKE} />
          Удалить изображение
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

function ViewOptionsDemo(args: Story["args"]) {
  const [showPrompt, setShowPrompt] = React.useState(true)
  const [showModel, setShowModel] = React.useState(false)
  const [columns, setColumns] = React.useState("3")
  return (
    <ContextMenu>
      <ImageArea label="Мои генерации" />
      <ContextMenuContent {...args} className="w-56">
        <ContextMenuLabel>Подписи</ContextMenuLabel>
        <ContextMenuCheckboxItem checked={showPrompt} onCheckedChange={setShowPrompt}>
          Показывать промпт
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={showModel} onCheckedChange={setShowModel}>
          Показывать модель
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>Сетка</ContextMenuLabel>
        <ContextMenuRadioGroup value={columns} onValueChange={setColumns}>
          <ContextMenuRadioItem value="2">2 колонки</ContextMenuRadioItem>
          <ContextMenuRadioItem value="3">3 колонки</ContextMenuRadioItem>
          <ContextMenuRadioItem value="4">4 колонки</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export const CheckboxAndRadio: Story = {
  name: "Чекбоксы и радио",
  play: openAt("Мои генерации"),
  render: (args) => <ViewOptionsDemo {...args} />,
}

export const RightClick: Story = {
  name: "Открытие правой кнопкой",
  render: (args) => (
    <ContextMenu>
      <ImageArea label="Кликните правой кнопкой" />
      <ContextMenuContent {...args} className="w-56">
        <ContextMenuItem>
          <HugeiconsIcon icon={Download01Icon} strokeWidth={ICON_STROKE} />
          Скачать
        </ContextMenuItem>
        <ContextMenuItem>
          <HugeiconsIcon icon={Copy01Icon} strokeWidth={ICON_STROKE} />
          Скопировать промпт
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={ICON_STROKE} />
          Удалить изображение
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}
