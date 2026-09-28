import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowReloadHorizontalIcon,
  CarouselHorizontalIcon,
  Fire03Icon,
  InformationCircleIcon,
  MaskTheater01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Sheet",
  component: SheetContent,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "560px" },
      description: {
        component:
          "Библиотечная боковая панель shadcn (Radix Dialog): выезжает с края, край — проп `side` у `SheetContent` (`right` по умолчанию, `left`, `top`, `bottom`). В отличие от `Drawer`, не тянется свайпом.\n\n" +
          "В экранах приложения напрямую не используется: модалки — `AppSheet` (нижний лист на мобилке, диалог на десктопе), мобильное меню — пропатченный `Sidebar`, подтверждения — `ConfirmDialog`. Если понадобится панель деталей сбоку, собирайте её на `Sheet` с токенами и Hugeicons, как в примерах ниже.",
      },
    },
  },
  args: { side: "right", showCloseButton: true },
  argTypes: {
    side: { control: "inline-radio", options: ["right", "left", "top", "bottom"] },
    showCloseButton: { control: "boolean", description: "Крестик в правом верхнем углу" },
  },
} satisfies Meta<typeof SheetContent>

export default meta
type Story = StoryObj<typeof meta>

const DETAILS = [
  ["Модель", "Midjourney"],
  ["Формат", "3:4"],
  ["Стоимость", "8 молекул"],
  ["Создано", "Сегодня, 11:05"],
]

export const Right: Story = {
  name: "Справа",
  render: (args) => (
    <Sheet defaultOpen>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>Детали генерации</SheetTitle>
          <SheetDescription>Логотип для кофейни в стиле баухаус</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <p className="rounded-xl bg-muted p-3 text-sm text-pretty">
            Минималистичный логотип кофейни «Зерно» в стиле баухаус: круг, чашка из геометрических фигур, тёплая
            палитра, плоская заливка.
          </p>
          <dl className="flex flex-col gap-3 text-sm">
            {DETAILS.map(([term, value]) => (
              <div key={term} className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">{term}</dt>
                <dd className="tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <SheetFooter>
          <Button>
            <HugeiconsIcon icon={ArrowReloadHorizontalIcon} strokeWidth={ICON_STROKE} />
            Повторить генерацию
          </Button>
          <SheetClose asChild>
            <Button variant="ghost">Закрыть</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

const SECTIONS = [
  { label: "Карусель", icon: CarouselHorizontalIcon },
  { label: "Тренды", icon: Fire03Icon },
  { label: "Роли", icon: MaskTheater01Icon },
]

export const Left: Story = {
  name: "Слева",
  args: { side: "left" },
  render: (args) => (
    <Sheet defaultOpen>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>Разделы</SheetTitle>
          <SheetDescription>Идеи и готовые сценарии для генераций.</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-0.5 px-2">
          {SECTIONS.map(({ label, icon }) => (
            <Button key={label} variant="ghost" className="h-10 justify-start gap-2.5 rounded-[10px] px-3 font-normal">
              <HugeiconsIcon icon={icon} strokeWidth={ICON_STROKE} className="size-[18px]" />
              {label}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  ),
}

export const Bottom: Story = {
  name: "Снизу",
  args: { side: "bottom" },
  render: (args) => (
    <Sheet defaultOpen>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>Показывать в галерее</SheetTitle>
          <SheetDescription>Фильтр применится сразу.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <ToggleGroup type="multiple" variant="outline" defaultValue={["image", "video"]} aria-label="Типы генераций">
            <ToggleGroupItem value="image">Изображения</ToggleGroupItem>
            <ToggleGroupItem value="video">Видео</ToggleGroupItem>
            <ToggleGroupItem value="audio">Аудио</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </SheetContent>
    </Sheet>
  ),
}

export const WithoutCloseButton: Story = {
  name: "Без крестика",
  args: { showCloseButton: false },
  render: (args) => (
    <Sheet defaultOpen>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>Что умеет Молли</SheetTitle>
          <SheetDescription>Наша модель отвечает текстом и рисует картинки в одном чате.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Закрыть</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const FromTrigger: Story = {
  name: "Открытие по кнопке",
  render: (args) => (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={ICON_STROKE} />
            Детали генерации
          </Button>
        </SheetTrigger>
        <SheetContent {...args}>
          <SheetHeader>
            <SheetTitle>Детали генерации</SheetTitle>
            <SheetDescription>Портрет в стиле аниме</SheetDescription>
          </SheetHeader>
          <dl className="flex flex-col gap-3 px-4 text-sm">
            {DETAILS.map(([term, value]) => (
              <div key={term} className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">{term}</dt>
                <dd className="tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </SheetContent>
      </Sheet>
    </div>
  ),
}
