import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowReloadHorizontalIcon, Settings01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Drawer",
  component: Drawer,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "560px" },
      description: {
        component:
          "Библиотечная шторка shadcn на vaul: выезжает с края экрана, тянется и закрывается свайпом. Направление — проп `direction` у `Drawer` (`bottom` по умолчанию, `top`, `left`, `right`). Проект дописал проп `overlayClassName` у `DrawerContent`.\n\n" +
          "В экранах приложения напрямую не используется: мобильный нижний лист — это `AppSheet` (на ширине меньше 768px он рендерит этот `Drawer` со своей ручкой, скруглением 24px и safe-area). Подтверждения — `ConfirmDialog`.",
      },
    },
  },
  args: { direction: "bottom" },
  argTypes: {
    direction: { control: "inline-radio", options: ["bottom", "top", "left", "right"] },
  },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

function AspectRatioContent() {
  return (
    <DrawerContent>
      <div className="mx-auto w-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Формат изображения</DrawerTitle>
          <DrawerDescription>Midjourney нарисует картинку в выбранных пропорциях.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <ToggleGroup type="single" variant="outline" defaultValue="3:4" className="w-full" aria-label="Формат">
            {["1:1", "3:4", "4:3", "16:9", "9:16"].map((ratio) => (
              <ToggleGroupItem key={ratio} value={ratio} className="flex-1 tabular-nums">
                {ratio}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <DrawerFooter>
          <Button>Применить</Button>
          <DrawerClose asChild>
            <Button variant="ghost">Отмена</Button>
          </DrawerClose>
        </DrawerFooter>
      </div>
    </DrawerContent>
  )
}

export const Bottom: Story = {
  name: "Снизу",
  render: (args) => (
    <Drawer {...args} defaultOpen>
      <AspectRatioContent />
    </Drawer>
  ),
}

const DETAILS = [
  ["Модель", "Kling 2.1"],
  ["Длительность", "10 секунд"],
  ["Формат", "9:16"],
  ["Стоимость", "40 молекул"],
  ["Создано", "Сегодня, 14:32"],
]

export const Right: Story = {
  name: "Справа",
  args: { direction: "right" },
  render: (args) => (
    <Drawer {...args} defaultOpen>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Детали генерации</DrawerTitle>
          <DrawerDescription>Видео 10 сек: закат над морем</DrawerDescription>
        </DrawerHeader>
        <dl className="flex flex-col gap-3 px-4 text-sm">
          {DETAILS.map(([term, value]) => (
            <div key={term} className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">{term}</dt>
              <dd className="text-right tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <DrawerFooter>
          <Button>
            <HugeiconsIcon icon={ArrowReloadHorizontalIcon} strokeWidth={ICON_STROKE} />
            Повторить генерацию
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost">Закрыть</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

export const Mobile: Story = {
  name: "Мобилка",
  globals: { viewport: { value: "mobile", isRotated: false } },
  parameters: {
    docs: {
      description: {
        story:
          "Та же шторка на телефоне. В Docs блок рендерится в ширину колонки — откройте историю отдельно, вьюпорт «Мобилка 375» включится сам.",
      },
    },
  },
  render: (args) => (
    <Drawer {...args} defaultOpen>
      <AspectRatioContent />
    </Drawer>
  ),
}

export const FromTrigger: Story = {
  name: "Открытие по кнопке",
  render: (args) => (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Drawer {...args}>
        <DrawerTrigger asChild>
          <Button variant="outline">
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={ICON_STROKE} />
            Формат
          </Button>
        </DrawerTrigger>
        <AspectRatioContent />
      </Drawer>
    </div>
  ),
}
