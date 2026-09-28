import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Folder01Icon, Link01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import {
  AppSheet,
  AppSheetBody,
  AppSheetClose,
  AppSheetContent,
  AppSheetDescription,
  AppSheetFooter,
  AppSheetHeader,
  AppSheetTitle,
} from "@/components/ui/app-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Textarea } from "@/components/ui/textarea"
import type { ChatType } from "@/data/chats"
import { CHAT_TYPE_ICON, ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "Проект/AppSheet",
  component: AppSheet,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "560px" },
      description: {
        component:
          "Модалка приложения. Все модалки, кроме подтверждений, собираются на ней: на мобилке (<768px) это нижний лист (vaul `Drawer`) с ручкой и закрытием свайпом, на десктопе — центрированный `Dialog` со скруглением 24px. Один API для обоих: `AppSheet`, `AppSheetContent`, `AppSheetHeader`, `AppSheetTitle`, `AppSheetDescription`, `AppSheetBody` (прокручивается только он), `AppSheetFooter`, `AppSheetClose`, `AppSheetCloseButton`.\n\n" +
          "В экранах используйте `AppSheet`, а не голые `Dialog`/`Drawer`/`Sheet`. Размеры десктопа задаются классами `md:*`, листа — `max-md:*`. Удаление и другие необратимые действия подтверждаются через `ConfirmDialog`, а не через `AppSheet`.\n\n" +
          "`variant=\"fullscreen\"` — только когда пользователь явно попросил «фс модалка». Открытие и закрытие с клавиатуры не анимируется (`instant=\"keyboard\"` по умолчанию).\n\n" +
          "Несохранённые изменения: `dismissible={false}` — Esc, клик по фону, крестик и `AppSheetClose` не закрывают модалку, а вызывают `onDismissAttempt` (спросите «Не сохранять изменения?» через `ConfirmDialog`); на мобилке лист нельзя смахнуть. Закрытие через `open` работает всегда.",
      },
    },
  },
  args: { defaultOpen: true },
  argTypes: {
    instant: {
      control: "inline-radio",
      options: ["keyboard", "always", "never"],
      mapping: { keyboard: "keyboard", always: true, never: false },
      description: "Когда открывать без анимации: только с клавиатуры, всегда или никогда",
    },
    open: { control: false },
    onOpenChange: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof AppSheet>

export default meta
type Story = StoryObj<typeof meta>

/* The project form from project-dialog.tsx, without the colour picker. */
function NewProjectContent() {
  return (
    <AppSheetContent className="md:max-w-[440px]">
      <AppSheetHeader>
        <AppSheetTitle>Новый проект</AppSheetTitle>
        <AppSheetDescription>Соберите связанные чаты в одной папке.</AppSheetDescription>
      </AppSheetHeader>
      <AppSheetBody className="pt-1 pb-1">
        <Field className="gap-2">
          <FieldLabel htmlFor="story-project-name">Название</FieldLabel>
          <InputGroup data-vaul-no-drag="" className="h-11 rounded-xl">
            <InputGroupAddon className="pl-3">
              <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} className="size-5 text-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id="story-project-name"
              defaultValue="Лендинг кофейни"
              placeholder="Например, «Запуск лендинга»"
              autoComplete="off"
              className="h-full text-base"
            />
          </InputGroup>
        </Field>
      </AppSheetBody>
      <AppSheetFooter>
        <AppSheetClose asChild>
          <Button type="button" variant="ghost" className="h-10 rounded-full px-4">
            Отмена
          </Button>
        </AppSheetClose>
        <Button className="h-10 rounded-full px-4">Создать проект</Button>
      </AppSheetFooter>
    </AppSheetContent>
  )
}

export const Default: Story = {
  render: (args) => (
    <AppSheet {...args}>
      <NewProjectContent />
    </AppSheet>
  ),
}

export const Mobile: Story = {
  name: "Мобилка: нижний лист",
  globals: { viewport: { value: "mobile", isRotated: false } },
  parameters: {
    docs: {
      description: {
        story:
          "На ширине меньше 768px та же разметка становится нижним листом: ручка сверху, закрытие свайпом вниз, кнопки футера растягиваются на всю ширину. В Docs блок рендерится в ширину колонки — откройте историю отдельно, вьюпорт «Мобилка 375» включится сам.",
      },
    },
  },
  render: (args) => (
    <AppSheet {...args}>
      <NewProjectContent />
    </AppSheet>
  ),
}

function ShareSheetDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Button variant="outline" onClick={() => setOpen(true)}>
        <HugeiconsIcon icon={Link01Icon} strokeWidth={ICON_STROKE} />
        Поделиться
      </Button>
      <AppSheet open={open} onOpenChange={setOpen}>
        <AppSheetContent className="md:max-w-[440px]">
          <AppSheetHeader>
            <AppSheetTitle>Поделиться чатом</AppSheetTitle>
            <AppSheetDescription>
              Ссылка откроет копию переписки «Логотип для кофейни». Новые сообщения в неё не попадут.
            </AppSheetDescription>
          </AppSheetHeader>
          <AppSheetBody className="pt-1 pb-1">
            <InputGroup data-vaul-no-drag="" className="h-11 rounded-xl">
              <InputGroupAddon className="pl-3">
                <HugeiconsIcon icon={Link01Icon} strokeWidth={ICON_STROKE} className="size-5" />
              </InputGroupAddon>
              <InputGroupInput
                readOnly
                aria-label="Ссылка на чат"
                defaultValue="molecula.app/c/logo-coffee"
                className="h-full text-base"
              />
            </InputGroup>
          </AppSheetBody>
          <AppSheetFooter>
            <AppSheetClose asChild>
              <Button type="button" variant="ghost" className="h-10 rounded-full px-4">
                Закрыть
              </Button>
            </AppSheetClose>
            <Button className="h-10 rounded-full px-4" onClick={() => setOpen(false)}>
              Скопировать ссылку
            </Button>
          </AppSheetFooter>
        </AppSheetContent>
      </AppSheet>
    </div>
  )
}

export const FromTrigger: Story = {
  name: "Открытие по кнопке",
  args: { defaultOpen: false },
  render: () => <ShareSheetDemo />,
}

const MODELS: { name: string; type: ChatType; note: string; price: string; current?: boolean }[] = [
  { name: "Молли", type: "text", note: "Наша модель: текст и картинки в одном чате", price: "Бесплатно", current: true },
  { name: "GPT-5", type: "text", note: "Рассуждения, код, длинные документы", price: "2 молекулы" },
  { name: "Claude", type: "text", note: "Аккуратные тексты и разбор файлов", price: "2 молекулы" },
  { name: "Gemini", type: "text", note: "Большой контекст, видео и таблицы", price: "2 молекулы" },
  { name: "DeepSeek", type: "text", note: "Быстрые ответы на простые вопросы", price: "1 молекула" },
  { name: "Midjourney", type: "image", note: "Художественные изображения", price: "8 молекул" },
  { name: "Flux", type: "image", note: "Фотореализм и текст на картинке", price: "6 молекул" },
  { name: "Kling", type: "video", note: "Видео до 10 секунд по описанию или кадру", price: "40 молекул" },
  { name: "Veo", type: "video", note: "Видео со звуком", price: "60 молекул" },
]

export const Scrollable: Story = {
  name: "Длинный список",
  render: (args) => (
    <AppSheet {...args}>
      <AppSheetContent className="max-md:h-[85dvh] md:h-[480px] md:max-w-[440px]">
        <AppSheetHeader>
          <AppSheetTitle>Выбор нейросети</AppSheetTitle>
          <AppSheetDescription>Цена указана за один запрос.</AppSheetDescription>
        </AppSheetHeader>
        <AppSheetBody className="px-3 pb-3 md:px-4">
          <ItemGroup className="gap-0.5">
            {MODELS.map((model) => (
              <Item key={model.name} size="sm" className="rounded-xl hover:bg-muted">
                <ItemMedia variant="icon">
                  <HugeiconsIcon icon={CHAT_TYPE_ICON[model.type]} strokeWidth={ICON_STROKE} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {model.name}
                    {model.current && <Badge variant="secondary">Сейчас</Badge>}
                  </ItemTitle>
                  <ItemDescription>{model.note}</ItemDescription>
                </ItemContent>
                <span className="text-xs text-muted-foreground tabular-nums">{model.price}</span>
                {model.current && (
                  <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} className="size-4 text-primary" />
                )}
              </Item>
            ))}
          </ItemGroup>
        </AppSheetBody>
      </AppSheetContent>
    </AppSheet>
  ),
}

export const Fullscreen: Story = {
  name: "Полноэкранная (только по запросу «фс модалка»)",
  render: (args) => (
    <AppSheet {...args}>
      <AppSheetContent variant="fullscreen">
        <AppSheetHeader className="md:px-8">
          <AppSheetTitle>Галерея промптов</AppSheetTitle>
          <AppSheetDescription>Выберите идею, и мы подставим промпт в новый чат.</AppSheetDescription>
        </AppSheetHeader>
        <AppSheetBody className="md:px-8">
          <ItemGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Логотип для кофейни", "Midjourney · изображение"],
              ["Видео 10 сек: закат над морем", "Kling · видео"],
              ["Озвучка для рилса", "ElevenLabs · аудио"],
              ["Сравни GPT-5 и Claude", "Молли · текст"],
              ["Портрет в стиле аниме", "Flux · изображение"],
              ["Идеи постов на неделю", "Claude · текст"],
            ].map(([title, caption]) => (
              <Item key={title} variant="outline" className="rounded-2xl">
                <ItemContent>
                  <ItemTitle>{title}</ItemTitle>
                  <ItemDescription>{caption}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </AppSheetBody>
      </AppSheetContent>
    </AppSheet>
  ),
}

/* Project instructions with unsaved edits: the sheet asks before it goes (spec §7). */
function UnsavedChanges(args: React.ComponentProps<typeof AppSheet>) {
  const saved = "Пишите тепло и на «вы»: это лендинг кофейни у моря."
  const [open, setOpen] = React.useState(true)
  const [text, setText] = React.useState(saved + " Цены — в рублях.")
  const [confirm, setConfirm] = React.useState(false)
  const dirty = text !== saved
  return (
    <>
      <Button variant="outline" className="m-6 h-10 rounded-full px-4" onClick={() => setOpen(true)}>
        Инструкции
      </Button>
      <AppSheet {...args} open={open} onOpenChange={setOpen} dismissible={!dirty} onDismissAttempt={() => setConfirm(true)}>
        <AppSheetContent className="md:max-w-[560px]">
          <AppSheetHeader>
            <AppSheetTitle>Инструкции</AppSheetTitle>
            <AppSheetDescription>Молли учитывает их во всех чатах проекта.</AppSheetDescription>
          </AppSheetHeader>
          <AppSheetBody className="pt-1 pb-1">
            <Textarea
              data-vaul-no-drag=""
              value={text}
              onChange={(event) => setText(event.target.value)}
              aria-label="Инструкции"
              className="min-h-32 text-base md:h-48 md:resize-none"
            />
          </AppSheetBody>
          <AppSheetFooter>
            <AppSheetClose asChild>
              <Button type="button" variant="ghost" className="h-10 rounded-full px-4">
                Отмена
              </Button>
            </AppSheetClose>
            <Button className="h-10 rounded-full px-4" onClick={() => setOpen(false)}>
              Сохранить
            </Button>
          </AppSheetFooter>
        </AppSheetContent>
      </AppSheet>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Не сохранять изменения?"
        description="Текст инструкций останется прежним."
        actionLabel="Не сохранять"
        cancelLabel="Вернуться"
        onConfirm={() => {
          setText(saved)
          setOpen(false)
        }}
      />
    </>
  )
}

export const Unsaved: Story = {
  name: "Нельзя закрыть случайно",
  render: (args) => <UnsavedChanges {...args} />,
}
