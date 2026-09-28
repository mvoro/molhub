import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Share08Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Dialog",
  component: DialogContent,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "560px" },
      description: {
        component:
          "Библиотечный диалог shadcn (Radix): центрированное окно с затемнением, фокус заперт внутри, закрывается по Esc и клику по фону. Проект дописал проп `overlayClassName` у `DialogContent`.\n\n" +
          "В экранах приложения напрямую не используется: все модалки собираются на `AppSheet` (на десктопе это этот же `Dialog`, на мобилке — нижний лист), а подтверждения удаления — на `ConfirmDialog`. Здесь — справочник по примитиву для тех, кто правит обёртки.",
      },
    },
  },
  args: { showCloseButton: true },
  argTypes: {
    showCloseButton: { control: "boolean", description: "Крестик в правом верхнем углу" },
  },
} satisfies Meta<typeof DialogContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent {...args}>
        <DialogHeader>
          <DialogTitle>Поделиться чатом</DialogTitle>
          <DialogDescription>
            Ссылка откроет копию переписки «Логотип для кофейни». Новые сообщения в неё не попадут.
          </DialogDescription>
        </DialogHeader>
        <Input readOnly aria-label="Ссылка на чат" defaultValue="molecula.app/c/logo-coffee" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Отмена</Button>
          </DialogClose>
          <Button>
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={ICON_STROKE} />
            Скопировать ссылку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Form: Story = {
  name: "С формой",
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent {...args}>
        <form className="contents" onSubmit={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Переименовать чат</DialogTitle>
            <DialogDescription>Название видно только вам — в боковой панели и в поиске.</DialogDescription>
          </DialogHeader>
          <Field className="gap-2">
            <FieldLabel htmlFor="dialog-chat-name">Название</FieldLabel>
            <Input id="dialog-chat-name" defaultValue="Сравни GPT-5 и Claude для кода" maxLength={120} />
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Отмена
              </Button>
            </DialogClose>
            <Button type="submit">Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  ),
}

export const WithoutCloseButton: Story = {
  name: "Без крестика",
  args: { showCloseButton: false },
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent {...args}>
        <DialogHeader>
          <DialogTitle>Молекулы закончились</DialogTitle>
          <DialogDescription>
            На генерацию видео в Kling нужно 40 молекул, на балансе осталось 12. Пополните баланс или выберите модель
            попроще.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Выбрать модель</Button>
          </DialogClose>
          <Button>Пополнить баланс</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const FromTrigger: Story = {
  name: "Открытие по кнопке",
  render: (args) => (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <HugeiconsIcon icon={Share08Icon} strokeWidth={ICON_STROKE} />
            Поделиться
          </Button>
        </DialogTrigger>
        <DialogContent {...args}>
          <DialogHeader>
            <DialogTitle>Поделиться чатом</DialogTitle>
            <DialogDescription>Любой, у кого есть ссылка, сможет посмотреть переписку.</DialogDescription>
          </DialogHeader>
          <Input readOnly aria-label="Ссылка на чат" defaultValue="molecula.app/c/compare-models" />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Отмена</Button>
            </DialogClose>
            <Button>Скопировать ссылку</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
}
