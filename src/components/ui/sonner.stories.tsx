import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"

const meta = {
  title: "UI/Sonner",
  component: Toaster,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "360px" },
      description: {
        component:
          "Тосты shadcn на sonner. `<Toaster />` подключён один раз в `App.tsx` (`position=\"bottom-center\"`, по центру рабочей области), показывают их вызовом `toast()` из `sonner` в любом месте кода. Оформление проекта: карточка 16px с мягкой тенью, кнопка действия — пилюля, иконки Hugeicons для `success`, `error`, `info`, `warning`, `loading`.\n\n" +
          "Рендерится в портале в body: сдвиг мобильного сайдбара не влияет на положение тостов. Нажатие на карточку (или Enter/пробел на ней) закрывает тост; кнопка действия выполняет своё действие. Тост — короткий итог действия без точки в конце: «Чат перенесён в архив», «Ссылка скопирована». Обратимое действие — с кнопкой «Отменить», ошибка — что случилось и что делать. Не дублируйте тостом то, что и так видно на экране.",
      },
    },
  },
  args: { position: "bottom-center" },
  argTypes: {
    position: {
      control: "select",
      options: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"],
    },
    expand: { control: "boolean" },
    theme: { control: false, description: "Сам следует теме приложения (класс `.dark` на `<html>`), передавать не нужно" },
  },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

/* Shows toasts on mount so the story isn't empty; fixed ids keep re-renders from stacking copies,
   and leaving the story dismisses them (sonner's store is global to the preview). */
function ShowOnMount({ show }: { show: () => void }) {
  React.useEffect(() => {
    const timer = window.setTimeout(show, 0)
    return () => {
      window.clearTimeout(timer)
      toast.dismiss()
    }
  }, [show])
  return null
}

const archived = () =>
  toast("Чат перенесён в архив", {
    id: "archived",
    duration: Infinity,
    action: { label: "Отменить", onClick: () => toast("Чат восстановлен") },
  })

function Buttons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 p-6">
      <Button
        variant="outline"
        onClick={() =>
          toast("Чат перенесён в архив", { action: { label: "Отменить", onClick: () => toast("Чат восстановлен") } })
        }
      >
        Архивировать чат
      </Button>
      <Button variant="outline" onClick={() => toast.success("Ссылка скопирована")}>
        Скопировать ссылку
      </Button>
      <Button variant="outline" onClick={() => toast.error("Файл «brief.pdf» больше 25 МБ")}>
        Прикрепить файл
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast("Голосовой ввод недоступен в этом браузере", {
            description: "Откройте Молекулу в Chrome или Safari.",
          })
        }
      >
        Включить микрофон
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(new Promise((resolve) => window.setTimeout(resolve, 2000)), {
            loading: "Генерируем видео",
            success: "Видео готово",
            error: "Не удалось сгенерировать видео. Попробуйте ещё раз.",
          })
        }
      >
        Сгенерировать видео
      </Button>
    </div>
  )
}

export const Default: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <ShowOnMount show={archived} />
      <Buttons />
    </>
  ),
}

const allTypes = () => {
  toast.success("Ссылка скопирована", { id: "success", duration: Infinity })
  toast.error("Не удалось скопировать ссылку", { id: "error", duration: Infinity })
  toast.info("Молекулы обновятся 1 октября", { id: "info", duration: Infinity })
  toast.warning("Осталось 12 молекул", {
    id: "warning",
    duration: Infinity,
    description: "Этого хватит на одно изображение в Midjourney.",
  })
  toast.loading("Генерируем видео", { id: "loading", duration: Infinity })
}

export const Types: Story = {
  name: "Типы",
  args: { expand: true, visibleToasts: 5 },
  parameters: { docs: { story: { inline: false, height: "420px" } } },
  render: (args) => (
    <>
      <Toaster {...args} />
      <ShowOnMount show={allTypes} />
    </>
  ),
}

const withDescription = () =>
  toast("Голосовой ввод недоступен в этом браузере", {
    id: "voice",
    duration: Infinity,
    description: "Откройте Молекулу в Chrome или Safari.",
  })

export const WithDescription: Story = {
  name: "С описанием",
  render: (args) => (
    <>
      <Toaster {...args} />
      <ShowOnMount show={withDescription} />
    </>
  ),
}

export const FromButtons: Story = {
  name: "Вызов по кнопкам",
  render: (args) => (
    <>
      <Toaster {...args} />
      <Buttons />
    </>
  ),
}

export const TransformedContainer: Story = {
  name: "Мобильный экран · сдвинутый контейнер",
  globals: { viewport: { value: "mobile", isRotated: false } },
  render: (args) => (
    <div className="w-[calc(100vw+270px)] -translate-x-[270px]">
      <Toaster {...args} />
      <ShowOnMount show={withDescription} />
    </div>
  ),
}
