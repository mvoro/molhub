import type { Meta, StoryObj } from "@storybook/react-vite"

import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"

const meta = {
  title: "UI/Spinner",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          "Крутящаяся иконка загрузки (Hugeicons `Loading03Icon`, `role=\"status\"`, `aria-label=\"Загрузка\"`). Размер — классом `size-*`. Внутри кнопки заменяет иконку или текст на время запроса.",
      },
    },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="size-3" />
      <Spinner className="size-4" />
      <Spinner className="size-5" />
      <Spinner className="size-6" />
    </div>
  ),
}

export const InButton: Story = {
  name: "Внутри кнопки",
  render: () => (
    <div className="flex items-center gap-2">
      <Button disabled>
        <Spinner />
        Отправляем…
      </Button>
      <Button variant="secondary" size="icon" aria-label="Генерируем" disabled>
        <Spinner />
      </Button>
    </div>
  ),
}
