import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, InformationCircleIcon } from "@hugeicons/core-free-icons"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Alert",
  component: Alert,
  parameters: {
    docs: {
      description: {
        component:
          "Плашка с сообщением внутри экрана, в отличие от тоста никуда не исчезает сама. `default` — нейтральная подсказка, `destructive` — ошибка. Иконка слева необязательна; `AlertAction` ставит кнопку в правый верхний угол.",
      },
    },
  },
  args: { variant: "default" },
  argTypes: {
    variant: { control: "select", options: ["default", "destructive"] },
  },
  render: (args) => (
    <Alert {...args} className="w-96">
      <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={ICON_STROKE} />
      <AlertTitle>Черновик сохранён автоматически</AlertTitle>
      <AlertDescription>Можно закрыть чат — изменения сохраняются на лету.</AlertDescription>
    </Alert>
  ),
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Destructive: Story = {
  args: { variant: "destructive" },
  render: (args) => (
    <Alert {...args} className="w-96">
      <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={ICON_STROKE} />
      <AlertTitle>Не удалось сгенерировать изображение</AlertTitle>
      <AlertDescription>Проверьте подключение к интернету и попробуйте ещё раз.</AlertDescription>
    </Alert>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Alert className="w-96">
      <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={ICON_STROKE} />
      <AlertTitle>Молекулы заканчиваются</AlertTitle>
      <AlertDescription>Осталось 40 молекул. Пополните баланс, чтобы не прерывать работу.</AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">
          Пополнить
        </Button>
      </AlertAction>
    </Alert>
  ),
}

export const TitleOnly: Story = {
  render: () => (
    <Alert className="w-96">
      <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={ICON_STROKE} />
      <AlertTitle>Проект «Молекула» переименован</AlertTitle>
    </Alert>
  ),
}
