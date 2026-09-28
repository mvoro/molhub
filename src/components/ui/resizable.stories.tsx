import type { Meta, StoryObj } from "@storybook/react-vite"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

const meta = {
  title: "UI/Resizable",
  component: ResizablePanelGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Панели с изменяемым размером (`react-resizable-panels`). Пригодится для «список чатов | чат» или «чат | предпросмотр генерации» на широком десктопе. Разделитель — `ResizableHandle`, `withHandle` рисует видимую ручку посередине.",
      },
    },
  },
} satisfies Meta<typeof ResizablePanelGroup>

export default meta
type Story = StoryObj<typeof meta>

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center bg-muted p-4 text-sm text-muted-foreground">{children}</div>
}

export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className="h-72 w-[28rem] rounded-lg ring-1 ring-foreground/10">
      <ResizablePanel defaultSize={35} minSize={20}>
        <Panel>Список чатов</Panel>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={65}>
        <Panel>Логотип для кофейни в стиле минимализм</Panel>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup orientation="vertical" className="h-72 w-[28rem] rounded-lg ring-1 ring-foreground/10">
      <ResizablePanel defaultSize={60}>
        <Panel>Чат с Молли</Panel>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={40} minSize={20}>
        <Panel>Предпросмотр генерации</Panel>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const NestedPanels: Story = {
  name: "Вложенные панели",
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className="h-72 w-[32rem] rounded-lg ring-1 ring-foreground/10">
      <ResizablePanel defaultSize={30} minSize={20}>
        <Panel>Проекты</Panel>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize={70}>
            <Panel>Чат с GPT-5</Panel>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} minSize={15}>
            <Panel>Поле запроса</Panel>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}
