import type { Meta, StoryObj } from "@storybook/react-vite"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const meta = {
  title: "UI/Chart",
  component: ChartContainer,
  parameters: {
    docs: {
      description: {
        component:
          "Обёртка над Recharts: подключает цвета `--color-*` из `ChartConfig` и стилизованные тултип/легенду под тему приложения (`ChartTooltipContent`, `ChartLegendContent`). Пример — генерации по типу за неделю и траты молекул по дням.",
      },
    },
  },
  args: { config: {}, children: <div /> },
} satisfies Meta<typeof ChartContainer>

export default meta
type Story = StoryObj<typeof meta>

const typeConfig = {
  text: { label: "Текст", color: "var(--chart-1)" },
  image: { label: "Фото", color: "var(--chart-2)" },
  video: { label: "Видео", color: "var(--chart-3)" },
  audio: { label: "Аудио", color: "var(--chart-4)" },
} satisfies ChartConfig

const typeData = [
  { day: "Пн", text: 12, image: 6, video: 1, audio: 2 },
  { day: "Вт", text: 9, image: 8, video: 2, audio: 1 },
  { day: "Ср", text: 14, image: 5, video: 0, audio: 3 },
  { day: "Чт", text: 11, image: 9, video: 3, audio: 2 },
  { day: "Пт", text: 16, image: 12, video: 4, audio: 4 },
  { day: "Сб", text: 6, image: 10, video: 5, audio: 1 },
  { day: "Вс", text: 5, image: 7, video: 2, audio: 0 },
]

export const GenerationsByType: Story = {
  render: () => (
    <ChartContainer config={typeConfig} className="h-[280px] w-[480px]">
      <BarChart data={typeData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="text" stackId="a" fill="var(--color-text)" radius={[0, 0, 4, 4]} />
        <Bar dataKey="image" stackId="a" fill="var(--color-image)" />
        <Bar dataKey="video" stackId="a" fill="var(--color-video)" />
        <Bar dataKey="audio" stackId="a" fill="var(--color-audio)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  ),
}

const spendingConfig = {
  molecules: { label: "Молекулы", color: "var(--chart-2)" },
} satisfies ChartConfig

const spendingData = [
  { day: "1 сен", molecules: 24 },
  { day: "8 сен", molecules: 40 },
  { day: "15 сен", molecules: 18 },
  { day: "22 сен", molecules: 52 },
  { day: "29 сен", molecules: 31 },
]

export const SpendingByDay: Story = {
  render: () => (
    <ChartContainer config={spendingConfig} className="h-[280px] w-[480px]">
      <BarChart data={spendingData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="molecules" fill="var(--color-molecules)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
}
