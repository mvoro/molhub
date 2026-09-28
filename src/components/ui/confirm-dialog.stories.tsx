import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"
import { fn } from "storybook/test"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "Проект/ConfirmDialog",
  component: ConfirmDialog,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "560px" },
      description: {
        component:
          "Единственный способ подтвердить удаление и другие необратимые действия: удалить чат или проект, очистить историю. Построен на `AlertDialog`, всегда по центру экрана — и на мобилке тоже, в отличие от `AppSheet`. Кнопки — «Отмена» (`ghost`) и действие (`destructive`), клик по фону не закрывает окно.\n\n" +
          "Текст по ToV: заголовок — вопрос с глаголом («Удалить чат?»), описание — последствия с названием объекта в кавычках-ёлочках («…будет удалён навсегда. Восстановить его не получится.»), кнопка — тот же глагол («Удалить», «Очистить»). Для обычных форм и выбора используйте `AppSheet`.\n\n" +
          "`cancelLabel` меняет «Отмена», когда отмена — это возврат к незаконченной работе («Вернуться» в «Не сохранять изменения?»). Открытие и закрытие с клавиатуры не анимируется (`instant=\"keyboard\"` по умолчанию), как у `AppSheet`.",
      },
    },
  },
  args: {
    open: true,
    title: "Удалить чат?",
    description: "Чат «Логотип для кофейни» будет удалён навсегда. Восстановить его не получится.",
    actionLabel: "Удалить",
    onOpenChange: fn(),
    onConfirm: fn(),
  },
  argTypes: {
    description: { control: "text" },
  },
  // Keeps the `open` control in sync when «Отмена», «Удалить» or Esc close the dialog.
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <ConfirmDialog
        {...args}
        onOpenChange={(open) => {
          args.onOpenChange(open)
          updateArgs({ open })
        }}
      />
    )
  },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const DeleteChat: Story = { name: "Удалить чат" }

export const DeleteProject: Story = {
  name: "Удалить проект",
  args: {
    title: "Удалить проект?",
    description: "Проект «Лендинг кофейни», его чаты, инструкции и файлы удалятся навсегда. Фото, видео и песни останутся в студиях.",
  },
}

export const ClearHistory: Story = {
  name: "Очистить историю",
  args: {
    title: "Очистить историю?",
    description: "Все чаты вне проектов будут удалены навсегда. Проекты и архив не пострадают.",
    actionLabel: "Очистить",
  },
}

export const DiscardChanges: Story = {
  name: "Своя кнопка отмены",
  args: {
    title: "Не сохранять изменения?",
    description: "Текст инструкций останется прежним.",
    actionLabel: "Не сохранять",
    cancelLabel: "Вернуться",
  },
}

export const LongName: Story = {
  name: "Длинное название",
  args: {
    description:
      "Чат «Сравни GPT-5 и Claude по качеству ответов на вопросы о договоре аренды квартиры в Москве» будет удалён навсегда. Восстановить его не получится.",
  },
}

export const Mobile: Story = {
  name: "Мобилка: тоже по центру",
  globals: { viewport: { value: "mobile", isRotated: false } },
  parameters: {
    docs: {
      description: {
        story:
          "Подтверждение не превращается в нижний лист: на мобилке оно тоже по центру. В Docs блок рендерится в ширину колонки — откройте историю отдельно, вьюпорт «Мобилка 375» включится сам.",
      },
    },
  },
}

function TriggerDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Button variant="destructive" onClick={() => setOpen(true)}>
        <HugeiconsIcon icon={Delete02Icon} strokeWidth={ICON_STROKE} />
        Удалить чат
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Удалить чат?"
        description="Чат «Видео 10 сек: закат над морем» будет удалён навсегда. Восстановить его не получится."
        actionLabel="Удалить"
        onConfirm={() => setOpen(false)}
      />
    </div>
  )
}

export const FromTrigger: Story = {
  name: "Открытие по кнопке",
  render: () => <TriggerDemo />,
}
