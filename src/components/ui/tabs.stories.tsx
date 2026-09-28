import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock01Icon, Image02Icon, MusicNote02Icon, PaintBoardIcon, TextIcon, Video01Icon } from "@hugeicons/core-free-icons"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Переключатель вкладок (Radix) — единственный вид табов в AI Hub (правило «Табы» в ai-hub/CLAUDE.md, размер M как в Архиве): серый круглый трек с отступом 4px, 36px везде (как кнопка меню и другие контролы), на мобилке во всю ширину, на десктопе по содержимому; активный сегмент — белая пилюля без тени. `compact` (студии «Фото» и «Видео» в мобильной шапке): и на мобилке по содержимому, у неактивного таба на мобилке только иконка, имя остаётся для скринридера — поэтому имя в своём `<span>` после иконки. Используется как есть, без оверрайдов размера и формы: Архив («Чаты | Проекты» со счётчиком), студии «Фото» и «Видео» («История | Стили/Шаблоны» с иконками). Вариант `line` правилами не разрешён и остался только ради старой разметки.",
      },
    },
  },
  args: { defaultValue: "text" },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const ModelPicker: Story = {
  name: "Типы чатов",
  render: (args) => (
    <Tabs {...args} className="w-80">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="text">
          <HugeiconsIcon icon={TextIcon} strokeWidth={ICON_STROKE} />
          Текст
        </TabsTrigger>
        <TabsTrigger value="image">
          <HugeiconsIcon icon={Image02Icon} strokeWidth={ICON_STROKE} />
          Фото
        </TabsTrigger>
        <TabsTrigger value="video">
          <HugeiconsIcon icon={Video01Icon} strokeWidth={ICON_STROKE} />
          Видео
        </TabsTrigger>
        <TabsTrigger value="audio">
          <HugeiconsIcon icon={MusicNote02Icon} strokeWidth={ICON_STROKE} />
          Аудио
        </TabsTrigger>
      </TabsList>
      <TabsContent value="text" className="rounded-lg bg-muted p-3 text-muted-foreground">
        Молли, GPT-5, Claude, Gemini
      </TabsContent>
      <TabsContent value="image" className="rounded-lg bg-muted p-3 text-muted-foreground">
        Молли, Midjourney, Nano Banana
      </TabsContent>
      <TabsContent value="video" className="rounded-lg bg-muted p-3 text-muted-foreground">
        Kling, Молли
      </TabsContent>
      <TabsContent value="audio" className="rounded-lg bg-muted p-3 text-muted-foreground">
        Молли
      </TabsContent>
    </Tabs>
  ),
}

export const WithIcons: Story = {
  name: "С иконками (студия «Фото»)",
  args: { defaultValue: "history" },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="history">
          <HugeiconsIcon icon={Clock01Icon} strokeWidth={ICON_STROKE} data-icon="inline-start" />
          История
        </TabsTrigger>
        <TabsTrigger value="styles">
          <HugeiconsIcon icon={PaintBoardIcon} strokeWidth={ICON_STROKE} data-icon="inline-start" />
          Стили
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
}

export const WithCount: Story = {
  name: "Со счётчиком (Архив)",
  args: { defaultValue: "chats" },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="chats">
          Чаты
          <span className="text-muted-foreground tabular-nums">12</span>
        </TabsTrigger>
        <TabsTrigger value="projects">
          Проекты
          <span className="text-muted-foreground tabular-nums">3</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
}

export const LineVariant: Story = {
  name: "Вариант line",
  args: { defaultValue: "all" },
  render: (args) => (
    <Tabs {...args} className="w-80">
      <TabsList variant="line">
        <TabsTrigger value="all">Все</TabsTrigger>
        <TabsTrigger value="text">Текст</TabsTrigger>
        <TabsTrigger value="image">Фото</TabsTrigger>
        <TabsTrigger value="video">Видео</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="p-3 text-sm text-muted-foreground">
        Все модели: текст, фото, видео и аудио вместе.
      </TabsContent>
      <TabsContent value="text" className="p-3 text-sm text-muted-foreground">
        Молли, GPT-5, Claude, Gemini.
      </TabsContent>
      <TabsContent value="image" className="p-3 text-sm text-muted-foreground">
        Молли, Midjourney, Nano Banana.
      </TabsContent>
      <TabsContent value="video" className="p-3 text-sm text-muted-foreground">
        Kling, Молли.
      </TabsContent>
    </Tabs>
  ),
}

export const Vertical: Story = {
  name: "Вертикальная ориентация",
  args: { defaultValue: "text", orientation: "vertical" },
  render: (args) => (
    <Tabs {...args} className="w-80">
      <TabsList>
        <TabsTrigger value="text">Текст</TabsTrigger>
        <TabsTrigger value="image">Фото</TabsTrigger>
        <TabsTrigger value="video">Видео</TabsTrigger>
      </TabsList>
      <TabsContent value="text" className="rounded-lg bg-muted p-3 text-muted-foreground">
        Молли, GPT-5, Claude, Gemini
      </TabsContent>
      <TabsContent value="image" className="rounded-lg bg-muted p-3 text-muted-foreground">
        Молли, Midjourney, Nano Banana
      </TabsContent>
      <TabsContent value="video" className="rounded-lg bg-muted p-3 text-muted-foreground">
        Kling, Молли
      </TabsContent>
    </Tabs>
  ),
}

export const Disabled: Story = {
  args: { defaultValue: "text" },
  render: (args) => (
    <Tabs {...args} className="w-80">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="text">Текст</TabsTrigger>
        <TabsTrigger value="image">Фото</TabsTrigger>
        <TabsTrigger value="video" disabled>
          Видео
        </TabsTrigger>
      </TabsList>
      <TabsContent value="text" className="rounded-lg bg-muted p-3 text-muted-foreground">
        Молли, GPT-5, Claude, Gemini
      </TabsContent>
      <TabsContent value="image" className="rounded-lg bg-muted p-3 text-muted-foreground">
        Молли, Midjourney, Nano Banana
      </TabsContent>
    </Tabs>
  ),
}

export const Compact: Story = {
  name: "Компактные (шапка студии на мобилке)",
  args: { defaultValue: "history" },
  globals: { viewport: { value: "mobile", isRotated: false } },
  parameters: {
    docs: {
      description: {
        story:
          "`TabsList compact`: на мобилке у неактивного таба только иконка, имя видно у активного. На десктопе — как обычные табы.",
      },
    },
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList compact>
        <TabsTrigger value="history">
          <HugeiconsIcon icon={Clock01Icon} strokeWidth={ICON_STROKE} data-icon="inline-start" />
          <span>История</span>
        </TabsTrigger>
        <TabsTrigger value="styles">
          <HugeiconsIcon icon={PaintBoardIcon} strokeWidth={ICON_STROKE} data-icon="inline-start" />
          <span>Стили</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
}
