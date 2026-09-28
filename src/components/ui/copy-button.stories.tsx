import type { Meta, StoryObj } from "@storybook/react-vite"

import { CopyButton } from "@/components/ui/copy-button"
import { Textarea } from "@/components/ui/textarea"

const meta = {
  title: "Проект/CopyButton",
  component: CopyButton,
  parameters: {
    docs: {
      description: {
        component:
          "Копирует текст в буфер: стоковая ghost-кнопка `Button size=\"icon\"` с тултипом «Копировать». После нажатия иконка сменяется галочкой на 2 с; тостов нет. Исходная анимация `.icon-swap` сохранена. Скринридер получает результат через локальный live region. На HTTP и при отказе Clipboard API используется резервное копирование с восстановлением фокуса и выделения. Используется в экшенах сообщений и документах. `value` может быть функцией — текст берётся в момент нажатия.",
      },
    },
  },
  args: { value: "Хороший вопрос. Коротко: всё зависит от того, какой результат вам нужен." },
} satisfies Meta<typeof CopyButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const InActionRow: Story = {
  name: "В ряду экшенов",
  render: (args) => (
    <div className="flex items-center gap-0.5">
      <CopyButton {...args} />
      <CopyButton {...args} label="Копировать ссылку" copiedLabel="Ссылка скопирована" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Mobile: Story = {
  name: "Мобильное копирование",
  globals: { viewport: { value: "mobile", isRotated: false } },
  render: (args) => (
    <div className="grid w-full max-w-80 gap-3">
      <p className="text-sm">{args.value as string}</p>
      <CopyButton {...args} />
      <Textarea aria-label="Проверка вставки" placeholder="Вставьте скопированный текст" />
    </div>
  ),
}
