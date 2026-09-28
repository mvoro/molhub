import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"

import { Progress } from "@/components/ui/progress"

const meta = {
  title: "UI/Progress",
  component: Progress,
  parameters: {
    docs: {
      description: {
        component:
          "Линейная полоса прогресса. Основной сценарий — генерация: «Генерируем видео… 45%» под сообщением модели, пока идёт запрос.",
      },
    },
  },
  args: { value: 45 },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <Progress {...args} className="w-64" />,
}

export const GenerationStatus: Story = {
  name: "Статус генерации",
  render: () => (
    <div className="flex w-64 flex-col gap-2">
      <p className="text-sm text-muted-foreground">Генерируем видео… 45%</p>
      <Progress value={45} />
    </div>
  ),
}

/* Shows progress actually moving, the way a real generation status would. */
export const Animated: Story = {
  name: "В движении",
  render: () => {
    const [value, setValue] = React.useState(8)
    React.useEffect(() => {
      const id = setInterval(() => {
        setValue((v) => (v >= 100 ? 8 : v + 7))
      }, 500)
      return () => clearInterval(id)
    }, [])
    return (
      <div className="flex w-64 flex-col gap-2">
        <p className="text-sm text-muted-foreground">Генерируем изображение… {Math.min(value, 100)}%</p>
        <Progress value={value} />
      </div>
    )
  },
}
