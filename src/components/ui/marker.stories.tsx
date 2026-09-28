import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"

import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Marker",
  component: Marker,
  parameters: {
    docs: {
      description: {
        component:
          "Строчная метка в ленте сообщений: системная заметка, разделитель дат или заголовок группы. `default` — обычная строка, часто с `MarkerIcon`; `separator` — текст с линиями по бокам («Сегодня»); `border` — заголовок секции с нижней границей.",
      },
    },
  },
  args: { variant: "default" },
  argTypes: { variant: { control: "select", options: ["default", "separator", "border"] } },
  render: (args) => (
    <Marker {...args} className="w-96">
      <MarkerContent>Молли подобрала модель Nano Banana для этого запроса</MarkerContent>
    </Marker>
  ),
} satisfies Meta<typeof Marker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <Marker variant="default">
        <MarkerContent>Молли подобрала модель Nano Banana для этого запроса</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Сегодня</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerContent>Вчера</MarkerContent>
      </Marker>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Marker className="w-96">
      <MarkerIcon>
        <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={ICON_STROKE} />
      </MarkerIcon>
      <MarkerContent>
        Изображение создано моделью Nano Banana. <a href="#">Подробнее</a>
      </MarkerContent>
    </Marker>
  ),
}

export const DateSeparator: Story = {
  render: () => (
    <Marker variant="separator" className="w-96">
      <MarkerContent>Сегодня</MarkerContent>
    </Marker>
  ),
}

export const SectionHeader: Story = {
  render: () => (
    <Marker variant="border" className="w-96">
      <MarkerContent>Вчера</MarkerContent>
    </Marker>
  ),
}
