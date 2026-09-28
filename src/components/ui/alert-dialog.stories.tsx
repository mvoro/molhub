import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, Logout03Icon } from "@hugeicons/core-free-icons"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/AlertDialog",
  component: AlertDialogContent,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "560px" },
      description: {
        component:
          "Библиотечное окно подтверждения shadcn (Radix AlertDialog): не закрывается кликом по фону, фокус сразу на кнопках. Размер — проп `size` у `AlertDialogContent` (`default` или `sm` с кнопками в две колонки), иконка — `AlertDialogMedia`. Проект дописал проп `overlayClassName`.\n\n" +
          "В экранах приложения напрямую не используется: удаление и другие необратимые действия подтверждаются через `ConfirmDialog` — он построен на этом примитиве в пропорциях приложения (скругление 24px, кнопки-пилюли, без полосы под футером). Текст: вопрос с глаголом, последствия, кнопка с тем же глаголом.",
      },
    },
  },
  args: { size: "default" },
  argTypes: {
    size: { control: "inline-radio", options: ["default", "sm"] },
  },
} satisfies Meta<typeof AlertDialogContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <AlertDialog defaultOpen>
      <AlertDialogContent {...args}>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить чат?</AlertDialogTitle>
          <AlertDialogDescription>
            Чат «Логотип для кофейни» будет удалён навсегда. Восстановить его не получится.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Удалить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

export const WithMedia: Story = {
  name: "С иконкой",
  render: (args) => (
    <AlertDialog defaultOpen>
      <AlertDialogContent {...args}>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={ICON_STROKE} />
          </AlertDialogMedia>
          <AlertDialogTitle>Удалить проект?</AlertDialogTitle>
          <AlertDialogDescription>
            Проект «Молекула» и все его чаты будут удалены навсегда. Восстановить их не получится.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Удалить проект</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

export const Small: Story = {
  name: "Маленький",
  args: { size: "sm" },
  render: (args) => (
    <AlertDialog defaultOpen>
      <AlertDialogContent {...args}>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <HugeiconsIcon icon={Logout03Icon} strokeWidth={ICON_STROKE} />
          </AlertDialogMedia>
          <AlertDialogTitle>Выйти из аккаунта?</AlertDialogTitle>
          <AlertDialogDescription>Чаты и проекты сохранятся, войти можно в любой момент.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction>Выйти</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

export const LongText: Story = {
  name: "Длинный текст",
  render: (args) => (
    <AlertDialog defaultOpen>
      <AlertDialogContent {...args}>
        <AlertDialogHeader>
          <AlertDialogTitle>Остановить генерацию видео?</AlertDialogTitle>
          <AlertDialogDescription>
            Kling уже отрисовал 6 секунд из 10. Если остановить сейчас, незаконченное видео не сохранится, а
            потраченные 40 молекул не вернутся на баланс.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Продолжить генерацию</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Остановить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

export const FromTrigger: Story = {
  name: "Открытие по кнопке",
  render: (args) => (
    <div className="flex min-h-svh items-center justify-center p-6">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={ICON_STROKE} />
            Очистить историю
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent {...args}>
          <AlertDialogHeader>
            <AlertDialogTitle>Очистить историю?</AlertDialogTitle>
            <AlertDialogDescription>
              Все чаты вне проектов будут удалены навсегда. Проекты и архив не пострадают.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction variant="destructive">Очистить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),
}
