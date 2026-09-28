import type { Meta, StoryObj } from "@storybook/react-vite"

import { DirectionProvider } from "@/components/ui/direction"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const meta = {
  title: "UI/Direction",
  component: DirectionProvider,
  parameters: {
    docs: {
      description: {
        component:
          "Провайдер направления письма для Radix-примитивов (`DirectionProvider` из `radix-ui`, здесь — тонкая обёртка с алиасом `direction`). AI Hub сейчас целиком на русском (LTR) и нигде этот провайдер не подключает, но компонент есть на случай RTL-локали: он задаёт `dir` компонентам вроде `Tabs`/`NavigationMenu`, и это меняет порядок фокуса стрелками и, как видно ниже, зеркалит раскладку.",
      },
    },
  },
  args: { dir: "ltr" },
} satisfies Meta<typeof DirectionProvider>

export default meta
type Story = StoryObj<typeof meta>

function SampleTabs() {
  return (
    <Tabs defaultValue="image" className="w-72">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="text">Текст</TabsTrigger>
        <TabsTrigger value="image">Фото</TabsTrigger>
        <TabsTrigger value="video">Видео</TabsTrigger>
        <TabsTrigger value="audio">Аудио</TabsTrigger>
      </TabsList>
      <TabsContent value="text" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        Молли, GPT-5, Claude
      </TabsContent>
      <TabsContent value="image" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        Молли, Midjourney
      </TabsContent>
      <TabsContent value="video" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        Kling, Молли
      </TabsContent>
      <TabsContent value="audio" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        Молли
      </TabsContent>
    </Tabs>
  )
}

export const LTR: Story = {
  render: () => (
    <DirectionProvider dir="ltr">
      <SampleTabs />
    </DirectionProvider>
  ),
}

export const RTL: Story = {
  render: () => (
    <DirectionProvider dir="rtl">
      <SampleTabs />
    </DirectionProvider>
  ),
}

export const Comparison: Story = {
  name: "LTR и RTL рядом",
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">ltr</span>
        <DirectionProvider dir="ltr">
          <SampleTabs />
        </DirectionProvider>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">rtl</span>
        <DirectionProvider dir="rtl">
          <SampleTabs />
        </DirectionProvider>
      </div>
    </div>
  ),
}
