# 04. Компоненты и правила сборки

Срез `3631ebe`, 29 сентября 2026. Текущий локальный код + [CLAUDE.md](../../CLAUDE.md) составляют основу handoff. Размеры/цвета — [03-design-system.md](03-design-system.md); ниже — выбор компонента, API, состояния и ограничения. Примеры — фрагменты для использования внутри React-компонента, а не готовые самостоятельные приложения.

## 1. Выбирать компонент по смыслу

| Задача | Использовать | Ограничение |
| --- | --- | --- |
| Действие | `Button` | Главный CTA — default, второстепенный — ghost/secondary/outline, удаление — destructive |
| Выбор из меню действий | `AppMenu*` | Не начинать экранное меню с голого `DropdownMenuContent`; `modal` не передавать |
| Настройки рядом с триггером | `Popover*` либо существующий экранный picker | Не включать modal; mobile-замена зависит от экранного сценария |
| Форма / подробности / каталог | `AppSheet*` | Desktop Dialog, mobile Drawer; не собирать две независимые версии содержимого |
| Подтвердить удаление или отказ от изменений | `ConfirmDialog` | Всегда по центру; текст конкретно объясняет последствия |
| Переключить панели | `Tabs*` | Единый вид M, без underline. Compact только Фото/Видео |
| Выбрать значение | `Segmented` + `SegmentedItem` | Один выбор, стрелки; это не вкладки с контентом. Исправления нормативных размеров см. ниже |
| Ввод | `Input`, `Textarea`, `Field`, `Label`, `InputGroup` | Подпись, aria-invalid, связанное сообщение ошибки; placeholder не заменяет label |
| Состояния | `Empty`, `Skeleton`, `Spinner`, `toast` | Не заменять отсутствие данных вечным spinner; ошибка содержит способ продолжить |
| Подсказка | `Tooltip*` | Только серый токен tooltip; не единственный способ понять важное действие на touch |
| Копирование | `CopyButton` / `lib/clipboard.ts` | Один success toast после успешного копирования; у CopyButton также галочка, локальный live-region только для ошибки |
| Вложение | `Attachment*`, экранный `FileViewer` | Не изобретать второй просмотрщик; удаление — отдельная кнопка с именем файла |
| Сообщение / поток | `Message*`, `Bubble*`, `MessageScroller*` | Использовать экранную композицию чата, не дефолтный фиолетовый Bubble |

## 2. Button

Источник: [button.tsx](../../src/components/ui/button.tsx), [stories](../../src/components/ui/button.stories.tsx). `variant`: default, outline, secondary, ghost, destructive, link. `size`: xs, sm, default, lg, icon-xs, icon-sm, icon, icon-lg. `asChild` использует Radix Slot; передаёт классы и props дочернему узлу.

| Размер | Высота / квадрат | Текст / иконка по умолчанию |
| --- | --- | --- |
| xs / icon-xs | 24px | 12px / 12px |
| sm / icon-sm | 28px | 12.8px / 14px у текстовой sm |
| default / icon | 32px | 14px / 16px |
| lg / icon-lg | 36px | 14px / 16px |
| Кнопка футера AppSheet | Явно `h-10 px-4` = 40px | `rounded-full` |
| Основная кнопка листа во всю ширину | Явно `h-11 w-full` = 44px | `rounded-full` |

Размеры Button — библиотечная шкала, а не автоматически достаточный touch-target. В мобильных экранных местах существуют увеличенные hit area/`pointer-coarse` размеры. После переноса проверить размер области нажатия и расстояние между кнопками.

```tsx
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { ICON_STROKE } from "@/lib/icons"

<Button type="submit" className="h-10 rounded-full px-4" disabled={saving}>
  <HugeiconsIcon icon={Add01Icon} strokeWidth={ICON_STROKE} data-icon="inline-start" />
  {saving ? "Создаём…" : "Создать проект"}
</Button>
<Button type="button" variant="ghost" onClick={cancel} className="h-10 rounded-full px-4">
  Отмена
</Button>
```

Для icon-only обязательно русское `aria-label`. Декоративная иконка не должна создавать второе имя. У кнопки внутри формы задать `type="button"`, если она не отправляет форму. У состояния загрузки явно определить `disabled`, текст/Spinner и `aria-busy` в вызывающем компоненте: у Button нет универсального `loading` prop.

`disabled` визуально opacity 50%, pointer-events-none. `aria-invalid` красит border/ring; сам по себе не объясняет ошибку. `focus-visible` использует ring 3px. Hover/open берётся из общих токенов. Передавать переопределения на сам Button, а не на дочерний `<span>`; `cn` разрешает конфликт классов. В модалках всегда `rounded-full`; библиотечный `rounded-lg` там не является готовым вариантом.

## 3. AppSheet и ConfirmDialog

Источники: [app-sheet.tsx](../../src/components/ui/app-sheet.tsx), [app-sheet.stories.tsx](../../src/components/ui/app-sheet.stories.tsx), [confirm-dialog.tsx](../../src/components/ui/confirm-dialog.tsx). Составной API:

```tsx
import {
  AppSheet, AppSheetContent, AppSheetHeader, AppSheetTitle,
  AppSheetDescription, AppSheetBody, AppSheetFooter, AppSheetClose,
} from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"

<AppSheet open={open} onOpenChange={setOpen}>
  <AppSheetContent className="md:max-w-[480px]">
    <AppSheetHeader>
      <AppSheetTitle>Новый проект</AppSheetTitle>
      <AppSheetDescription>Соберите чаты и файлы в одном месте.</AppSheetDescription>
    </AppSheetHeader>
    <AppSheetBody>{/* Содержимое формы */}</AppSheetBody>
    <AppSheetFooter>
      <AppSheetClose asChild>
        <Button variant="ghost" className="h-10 rounded-full px-4">Отмена</Button>
      </AppSheetClose>
      <Button onClick={save} disabled={saving} className="h-10 rounded-full px-4">
        {saving ? "Создаём…" : "Создать проект"}
      </Button>
    </AppSheetFooter>
  </AppSheetContent>
</AppSheet>
```

`AppSheetHeader` содержит кнопку закрытия по умолчанию; у `AppSheetBody` прокрутка, header/footer не сжимаются. Padding 20px mobile / 24px desktop. Footer: gap 8px, на desktop действия справа; mobile кнопки делят ширину. Заголовок 18px/500, описание 14px. Mobile close 40px, desktop 36px. На desktop close tooltip включает Esc.

`instant="keyboard"` по умолчанию; `true` — без анимации всегда, `false` — не пропускать из-за клавиатуры. ⌘K-поиск desktop использует instant всегда. Начальный фокус — контейнер листа; Tab идёт по его контролам. Не удалять title/description из доступного дерева; визуально скрытый заголовок оставлять доступным.

`dismissible={false}` с `onDismissAttempt` используется при несохранённых изменениях: Escape/overlay/крестик вызывают попытку выхода; mobile swipe не закрывает лист. Внешнее controlled `open` остаётся способом завершить подтверждённое закрытие. Сохранение с сервером требует отдельно обработать pending/error и закрывать только по успеху.

`AppSheetContent variant="fullscreen"` существует только для уже согласованных полноэкранных сценариев; он не становится дефолтом для любого сложного листа. В текущем прототипе есть такие использования (например, mobile авторизация). Для новых сценариев следовать требованию CLAUDE о явном запросе на fullscreen; это ограничение расширения дизайна, а не препятствие реализации существующих экранов.

```tsx
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

<ConfirmDialog
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
  title="Удалить чат?"
  description="Чат и его сообщения будут удалены. Отменить это действие не получится."
  actionLabel="Удалить чат"
  onConfirm={deleteChat}
/>
```

`cancelLabel` по умолчанию «Отмена», для возврата к правке — «Вернуться». ConfirmDialog сейчас принимает синхронный `onConfirm: () => void`; встроенного async pending/error API нет. Production-адаптер должен предотвращать повторный запрос и показывать ошибку, а не считать срабатывание обработчика подтверждением удаления. Несохранённые изменения допустимо подтверждать поверх текущей формы; каталог → детали → отзыв роли, напротив, остаются последовательными экранами **одного** AppSheet.

## 4. Меню, подменю, picker, Tooltip

[AppMenu](../../src/components/ui/app-menu.tsx): ширина от контента, min-width 224px, max `min(288px,100vw−16px)`; radius 20px; padding 8px. Row 36px, radius 10px, padding-x 14px, иконка 18px, gap 10px. `sideOffset=6`, `collisionPadding=8`; separator inset 8px относительно внутреннего контента (16px от края карточки).

```tsx
import {
  AppMenu, AppMenuTrigger, AppMenuContent, AppMenuItem,
  AppMenuSeparator, AppMenuSub, AppMenuSubTrigger, AppMenuSubContent,
} from "@/components/ui/app-menu"
import { Button } from "@/components/ui/button"
import { PencilEdit01Icon, Delete02Icon } from "@hugeicons/core-free-icons"

<AppMenu>
  <AppMenuTrigger asChild><Button variant="ghost">Действия</Button></AppMenuTrigger>
  <AppMenuContent align="end">
    <AppMenuItem icon={PencilEdit01Icon} onSelect={startRename}>Переименовать</AppMenuItem>
    <AppMenuSub>
      <AppMenuSubTrigger>Переместить в проект</AppMenuSubTrigger>
      <AppMenuSubContent title="Выберите проект">
        {projects.map((project) => (
          <AppMenuItem key={project.id} onSelect={() => moveTo(project.id)}>
            <span className="min-w-0 flex-1 truncate">{project.name}</span>
          </AppMenuItem>
        ))}
      </AppMenuSubContent>
    </AppMenuSub>
    <AppMenuSeparator />
    <AppMenuItem icon={Delete02Icon} variant="destructive" onSelect={() => setDeleteOpen(true)}>
      Удалить чат
    </AppMenuItem>
  </AppMenuContent>
</AppMenu>
```

Не передавать `modal`: non-modal позволяет одним нажатием открыть соседнее меню и закрыть текущее. Не оставлять два popover одновременно. На touch меню открывается после завершения тапа, чтобы начало скролла не открывало его. Подменю mobile заменяет содержимое той же карточки и показывает «‹ Название»; `title` обязателен по смыслу. Desktop подменю открывается сбоку. Длинные имена ограничивать `min-w-0 flex-1 truncate`, не увеличивать карточку за viewport.

Выбранное значение (тема, сортировка) — `AppMenuRadioGroup`/`AppMenuRadioItem`, а не галочка без состояния. Подменю возвращает focus в menu после смены страницы. Библиотечное закрытие pointer-выбором мягко возвращает focus без фиолетового кольца; keyboard сохраняет видимый focus. Сложные переходы меню → inline rename используют существующий [useRename](../../src/components/rename-field.tsx); не копировать таймеры без причины.

`Popover` подходит содержимому с поиском/выбором; базовая ширина 288px, padding 10px, gap 10px, origin — Radix anchor. Текущий model picker адаптивен отдельно в [model-picker.tsx](../../src/components/chat-composer/model-picker.tsx), настройки — [settings.tsx](../../src/components/chat-composer/settings.tsx). Использовать их, не новый общий Select с потерей групп, цены и доступных настроек.

```tsx
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

<Tooltip>
  <TooltipTrigger asChild><Button variant="ghost">Параметры</Button></TooltipTrigger>
  <TooltipContent side="top">Настройки генерации</TooltipContent>
</Tooltip>
```

Приложение задаёт TooltipProvider delay 300ms, skip-delay 400ms; сам UI primitive по умолчанию delay 0, Storybook использует этот дефолт. Контент tooltip: 12px, padding 12×6px, max-width 320px, серый фон одинаков в обеих темах. Нельзя перекрасить в primary. На mobile многие подсказки скрыты; имя icon-button остаётся в `aria-label`.

## 5. Tabs и Segmented

**Нормативный вид:** серый трек, 4px padding, rounded-full, активная фоновая пилюля, 14px/500, без тени. M: трек 36px, сегмент 28px, px-4; L: трек 44px, сегмент 36px, px-3. На карточке трек может быть `bg-foreground/6`. Не делать активный таб primary/чёрным, не добавлять underline или новые размеры.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="chats">
  <TabsList aria-label="Содержимое архива">
    <TabsTrigger value="chats">Чаты</TabsTrigger>
    <TabsTrigger value="projects">Проекты</TabsTrigger>
  </TabsList>
  <TabsContent value="chats">{/* Список чатов */}</TabsContent>
  <TabsContent value="projects">{/* Список проектов */}</TabsContent>
</Tabs>
```

У Tabs M уже зашит: не писать новые h/px/radius/shadow на каждый экран. Если есть иконка, пометить её `data-icon="inline-start"` — отступ с этой стороны станет на 2px меньше. `compact` допустим у студий Фото/Видео: подпись положить в `<span>` после иконки; неактивное имя mobile скрывается визуально, но остаётся у screen reader. Tabs — библиотечные tablist/tab/tabpanel, со стрелками и focus-visible.

```tsx
import { Segmented, SegmentedItem } from "@/components/ui/segmented"

// Текущий экранный приём L в song-form.tsx. Общий primitive ещё требует сверки, см. ниже.
<Segmented value={mode} onValueChange={setMode} aria-label="Режим"
  className="flex-1 [&>*]:h-9">
  <SegmentedItem value="auto">Авто</SegmentedItem>
  <SegmentedItem value="detailed">Детальный</SegmentedItem>
</Segmented>
```

Segmented построен на `ToggleGroup type="single"`. Повторное нажатие не сбрасывает выбранное, кроме явно переданного `allowEmpty`. Установленная Radix-версия выдаёт radiogroup/radio и aria-checked для single; не дублировать эти роли вручную.

**Сейчас есть расхождения:** Segmented default даёт 32px сегмент + 8px padding = 40px трек; sm — 28+4=32px; selected имеет `shadow-sm`. Пример L исправляет высоту, но не удаляет библиотечную тень. В dark Tabs selected переопределён на input/30. Mobile audio использует `variant="line"`. При production-реализации привести эти места к существующей норме M/L без тени и обновить stories; не объявлять обнаруженные расхождения новыми стандартами.

## 6. Формы, ошибки и общий UX текста

Использовать `Label htmlFor`/`FieldLabel` и уникальный id. Ошибка: `aria-invalid`, `aria-describedby` к тексту, при появлении — подходящий live-region (`role="alert"` для ошибки отправки). Пример эталона состояния — [auth-modal.tsx](../../src/components/auth/auth-modal.tsx); DOM-подпись поля сохранять даже когда визуально она скрыта.

Базовый Input — 32px, radius 10px; Textarea — min-height 64px и `field-sizing-content`. Это основы; кнопки футера листа используют согласованную высоту 40/44px и pill. Поля сохраняют экранные радиусы: например, InputGroup/textarea проекта — rounded-xl, textarea отзыва — rounded-2xl; pill-поля авторизации не задают общее правило. Поле композера имеет свои размеры и растёт до 200px desktop / 30svh mobile. Не менять глобальный Input для отдельного экранного вида.

| Состояние | Что должен видеть/слышать пользователь |
| --- | --- |
| Idle | Ясное имя поля, текущая настройка и понятное основное действие |
| Focus | Видимый контур по keyboard; не обрезан overflow контейнера |
| Invalid | Ошибка рядом с полем, что исправить; цвет не единственный носитель смысла |
| Pending | Прогресс/«Сохраняем…», запрет повторной отправки, поля не теряют введённое |
| Success | Выполненное действие/обновлённые данные; локальная обратная связь или toast по сценарию |
| Error | «Не удалось … Попробуйте ещё раз.»; retry, черновик сохранён |
| Empty | Что будет в разделе и как начать; для фильтра — возможность сбросить фильтр |
| Disabled | Причина, когда она неочевидна; не использовать muted-цвет как единственный признак |

Это требование production, а не обещание, что в demo уже есть все реальные сетевые состояния. `Empty`, `Skeleton`, `Spinner`, `Alert` предоставляют вид, но не fetch/retry-логику.

Тон: только русский, «вы» со строчной; приглашение от «мы» («Что создадим сегодня?»); placeholder — «Опишите картинку»; CTA — действие + объект («Создать проект»). Использовать «ё», без эмодзи, восклицаний и маркетингового давления. Подтверждение включает объект и последствия. Правило распространяется на aria-label, sr-only, title и библиотечные defaults. Текст промпта от лица пользователя — отдельный голос.

## 7. Составные продуктовые паттерны

### Композер

Актуальный компонент — [chat-composer.tsx](../../src/components/chat-composer/chat-composer.tsx); [text-composer.tsx](../../src/components/chat-composer/text-composer.tsx) сохранён после отката и не служит эталоном NewChat.

Анатомия: активная роль над лотком → вложения/слоты шаблона → текстовое поле → строка «+», модель, настройки/роль, микрофон, отправка/стоп. Лоток обязателен: полупрозрачный серый rim radius 28px и 4px padding; поле radius 24px. Контролы слева прокручиваются по горизонтали при нехватке места; отправка остаётся доступной. `-m-1/p-1` сохраняют focus ring.

Desktop Enter отправляет, Shift+Enter добавляет строку; IME composition не отправляет; coarse pointer Enter оставляет перевод строки. Escape останавливает voice capture. Микрофон/отправка/стоп — согласованное INK-исключение; цена в pill — текст foreground и цветная молекула. Для busy берётся стоп, а не вторая одновременная отправка. Правила способностей модели и состав настроек брать из `data/models.ts` и `data/composer-settings.ts`, а не из собственной копии списка.

Mobile «+» открывает `ToolsSheet`, отдельная настройка — `SettingsSheet`; desktop использует меню. Мобильный режим рассуждения Молли — через лист, иконка молнии остаётся. При изменении режима и возврате из аудио текущий draft должен сохраниться, пока пользователь явно не начал новый чат; маршрутизация не должна случайно remount-ить его.

### Вложения и drag-and-drop

Композиция — [attachment.tsx](../../src/components/ui/attachment.tsx). Состояния: `idle | uploading | processing | error | done`, размеры default/sm/xs, orientation horizontal/vertical. `AttachmentTrigger` покрывает карточку; `AttachmentActions` находятся выше, чтобы remove не открывал файл. В композере фото — квадрат 48×48, файл — карточка 48px с цветной плиткой 36px и двумя строками; кнопка удаления 20px с расширенной областью 32px. В сообщении фото — 80×80 без подписи, открывает FileViewer.

Файлы добавляются native Input, paste или drop; camera/gallery используют нативный выбор. Нет собственного диалога ОС. DnD реализован [use-file-drop.ts](../../src/components/chat-composer/use-file-drop.ts), [file-drop.tsx](../../src/components/chat-composer/file-drop.tsx), [chat-composer.tsx](../../src/components/chat-composer/chat-composer.tsx). Legacy use-composer-files.tsx относится к неиспользуемому TextComposer. Внешний вид dropzone и ограничения формы переносить вместе; видимая принимающая зона не означает поддержку произвольного типа/числа файлов. Недоступное сохранённое вложение не нужно оформлять как успешно загруженное.

### Чат и артефакты

[chat-messages.tsx](../../src/components/chat/chat-messages.tsx): пользователь справа, muted Bubble max-width 85% mobile / 70% desktop, radius 20px, 16px/24px. Ответ модели — самостоятельный контент с логотипом и состояниями, не primary-пузырь по умолчанию. Длинные слова/код/таблицы не растягивают shell; медиа и документ имеют собственные boundaries.

[chat-view.tsx](../../src/components/chat-view.tsx) связывает MessageScroller, измеряемую высоту композера и ArtifactPanel. Новое user-message — scroll anchor; streaming не должен отнимать управление у читателя, прокрутившего вверх. Возврат вниз доступен отдельной круглой кнопкой 40px mobile / 36px desktop. Сохранить ReplyStatus: thinking, drawing, streaming, done, stopped. Ошибка загрузки истории относится к отдельному ChatLoadState; состояние ошибки самой генерации отсутствует в demo и должно быть добавлено для production. Английскую sr-only подпись этой кнопки в primitive перевести при реализации.

### Тосты и копирование

Вызывать `toast` из `sonner`, рендерить один UI `Toaster` приложения. Сейчас нижний центр компенсирует desktop sidebar (130px при раскрытии / 24px rail). В мобильном сдвиге toast остаётся на месте через portal в body. Нажатие по карточке закрывает уведомление, на action-button — выполняет действие; Enter/Space также закрывают фокусированную карточку.

Копирование через [CopyButton](../../src/components/ui/copy-button.tsx) принимает `value: string | (() => string)`: функция нужна, чтобы получить актуальный streaming-текст в момент клика. Успех — галочка на 2 секунды и один success toast с текстом `copiedLabel`; его озвучивает Sonner. Локальный `role="status"` сообщает только об ошибке, чтобы не дублировать сообщение об успехе. [clipboard.ts](../../src/lib/clipboard.ts) содержит fallback при недоступном Clipboard API и показывает `toast.success` только после фактического копирования. API `copyText(text, successMessage = "Скопировано")` позволяет передать текст подтверждения: «Промпт скопирован» или «Ссылка скопирована».

### Общие действия над сущностями

Меню чата/проекта должно вести себя одинаково в сайдбаре, заголовке, архиве и странице проекта. Использовать [EntityActionsProvider](../../src/hooks/use-entity-actions.tsx), [entity-menus.tsx](../../src/components/entity-menus.tsx), [RenameField](../../src/components/rename-field.tsx). Не реализовывать отдельные разные подтверждения и правила archive/delete в каждой точке входа. На touch действия строк видимы; desktop показывает их при hover, keyboard-focus или открытом меню текущей строки.

## 8. Каталог UI и Storybook

67/67 означает **наличие исходного файла story**, а не полноту состояний или успешно пройденный accessibility/визуальный тест. Конфиг задаёт `a11y.test: "todo"`. Список ниже автоматически сопоставлен по именам файлов. Колонка «прямо в feature-коде» показывает наличие статического импорта из `src/components`/`src/App.tsx` вне `ui` и stories; «нет» может означать вложенное использование другим UI-компонентом или запас библиотеки. Прямой импорт в сохранённом неиспользуемом feature-файле также не доказывает видимость на текущем экране.

| Компонент / исходник | Story | Прямо в feature-коде |
| --- | --- | --- |
| [accordion](../../src/components/ui/accordion.tsx) | [UI/Accordion](../../src/components/ui/accordion.stories.tsx) | да |
| [alert-dialog](../../src/components/ui/alert-dialog.tsx) | [UI/AlertDialog](../../src/components/ui/alert-dialog.stories.tsx) | нет |
| [alert](../../src/components/ui/alert.tsx) | [UI/Alert](../../src/components/ui/alert.stories.tsx) | нет |
| [app-menu](../../src/components/ui/app-menu.tsx) | [Проект/AppMenu](../../src/components/ui/app-menu.stories.tsx) | да |
| [app-sheet](../../src/components/ui/app-sheet.tsx) | [Проект/AppSheet](../../src/components/ui/app-sheet.stories.tsx) | да |
| [aspect-ratio](../../src/components/ui/aspect-ratio.tsx) | [UI/AspectRatio](../../src/components/ui/aspect-ratio.stories.tsx) | нет |
| [attachment](../../src/components/ui/attachment.tsx) | [UI/Attachment](../../src/components/ui/attachment.stories.tsx) | да |
| [avatar](../../src/components/ui/avatar.tsx) | [UI/Avatar](../../src/components/ui/avatar.stories.tsx) | да |
| [badge](../../src/components/ui/badge.tsx) | [UI/Badge](../../src/components/ui/badge.stories.tsx) | да |
| [breadcrumb](../../src/components/ui/breadcrumb.tsx) | [UI/Breadcrumb](../../src/components/ui/breadcrumb.stories.tsx) | нет |
| [bubble](../../src/components/ui/bubble.tsx) | [UI/Bubble](../../src/components/ui/bubble.stories.tsx) | да |
| [button-group](../../src/components/ui/button-group.tsx) | [UI/ButtonGroup](../../src/components/ui/button-group.stories.tsx) | да |
| [button](../../src/components/ui/button.tsx) | [UI/Button](../../src/components/ui/button.stories.tsx) | да |
| [calendar](../../src/components/ui/calendar.tsx) | [UI/Calendar](../../src/components/ui/calendar.stories.tsx) | нет |
| [card](../../src/components/ui/card.tsx) | [UI/Card](../../src/components/ui/card.stories.tsx) | да |
| [carousel](../../src/components/ui/carousel.tsx) | [UI/Carousel](../../src/components/ui/carousel.stories.tsx) | нет |
| [chart](../../src/components/ui/chart.tsx) | [UI/Chart](../../src/components/ui/chart.stories.tsx) | нет |
| [checkbox](../../src/components/ui/checkbox.tsx) | [UI/Checkbox](../../src/components/ui/checkbox.stories.tsx) | да |
| [collapsible](../../src/components/ui/collapsible.tsx) | [UI/Collapsible](../../src/components/ui/collapsible.stories.tsx) | да |
| [combobox](../../src/components/ui/combobox.tsx) | [UI/Combobox](../../src/components/ui/combobox.stories.tsx) | нет |
| [command](../../src/components/ui/command.tsx) | [UI/Command](../../src/components/ui/command.stories.tsx) | да |
| [confirm-dialog](../../src/components/ui/confirm-dialog.tsx) | [Проект/ConfirmDialog](../../src/components/ui/confirm-dialog.stories.tsx) | да |
| [context-menu](../../src/components/ui/context-menu.tsx) | [UI/ContextMenu](../../src/components/ui/context-menu.stories.tsx) | нет |
| [copy-button](../../src/components/ui/copy-button.tsx) | [Проект/CopyButton](../../src/components/ui/copy-button.stories.tsx) | да |
| [dialog](../../src/components/ui/dialog.tsx) | [UI/Dialog](../../src/components/ui/dialog.stories.tsx) | нет |
| [direction](../../src/components/ui/direction.tsx) | [UI/Direction](../../src/components/ui/direction.stories.tsx) | нет |
| [drawer](../../src/components/ui/drawer.tsx) | [UI/Drawer](../../src/components/ui/drawer.stories.tsx) | нет |
| [dropdown-menu](../../src/components/ui/dropdown-menu.tsx) | [UI/DropdownMenu](../../src/components/ui/dropdown-menu.stories.tsx) | да |
| [empty](../../src/components/ui/empty.tsx) | [UI/Empty](../../src/components/ui/empty.stories.tsx) | да |
| [field](../../src/components/ui/field.tsx) | [UI/Field](../../src/components/ui/field.stories.tsx) | да |
| [hover-card](../../src/components/ui/hover-card.tsx) | [UI/HoverCard](../../src/components/ui/hover-card.stories.tsx) | нет |
| [input-group](../../src/components/ui/input-group.tsx) | [UI/InputGroup](../../src/components/ui/input-group.stories.tsx) | да |
| [input-otp](../../src/components/ui/input-otp.tsx) | [UI/InputOTP](../../src/components/ui/input-otp.stories.tsx) | нет |
| [input](../../src/components/ui/input.tsx) | [UI/Input](../../src/components/ui/input.stories.tsx) | да |
| [item](../../src/components/ui/item.tsx) | [UI/Item](../../src/components/ui/item.stories.tsx) | да |
| [kbd](../../src/components/ui/kbd.tsx) | [UI/Kbd](../../src/components/ui/kbd.stories.tsx) | да |
| [label](../../src/components/ui/label.tsx) | [UI/Label](../../src/components/ui/label.stories.tsx) | да |
| [marker](../../src/components/ui/marker.tsx) | [UI/Marker](../../src/components/ui/marker.stories.tsx) | нет |
| [menubar](../../src/components/ui/menubar.tsx) | [UI/Menubar](../../src/components/ui/menubar.stories.tsx) | нет |
| [message-scroller](../../src/components/ui/message-scroller.tsx) | [UI/MessageScroller](../../src/components/ui/message-scroller.stories.tsx) | да |
| [message](../../src/components/ui/message.tsx) | [UI/Message](../../src/components/ui/message.stories.tsx) | да |
| [native-select](../../src/components/ui/native-select.tsx) | [UI/NativeSelect](../../src/components/ui/native-select.stories.tsx) | нет |
| [navigation-menu](../../src/components/ui/navigation-menu.tsx) | [UI/NavigationMenu](../../src/components/ui/navigation-menu.stories.tsx) | нет |
| [pagination](../../src/components/ui/pagination.tsx) | [UI/Pagination](../../src/components/ui/pagination.stories.tsx) | нет |
| [popover](../../src/components/ui/popover.tsx) | [UI/Popover](../../src/components/ui/popover.stories.tsx) | да |
| [progress](../../src/components/ui/progress.tsx) | [UI/Progress](../../src/components/ui/progress.stories.tsx) | нет |
| [questionnaire](../../src/components/ui/questionnaire.tsx) | [UI/Questionnaire](../../src/components/ui/questionnaire.stories.tsx) | нет |
| [radio-group](../../src/components/ui/radio-group.tsx) | [UI/RadioGroup](../../src/components/ui/radio-group.stories.tsx) | нет |
| [resizable](../../src/components/ui/resizable.tsx) | [UI/Resizable](../../src/components/ui/resizable.stories.tsx) | да |
| [scroll-area](../../src/components/ui/scroll-area.tsx) | [UI/ScrollArea](../../src/components/ui/scroll-area.stories.tsx) | да |
| [segmented](../../src/components/ui/segmented.tsx) | [Проект/Segmented](../../src/components/ui/segmented.stories.tsx) | да |
| [select](../../src/components/ui/select.tsx) | [UI/Select](../../src/components/ui/select.stories.tsx) | нет |
| [separator](../../src/components/ui/separator.tsx) | [UI/Separator](../../src/components/ui/separator.stories.tsx) | да |
| [sheet](../../src/components/ui/sheet.tsx) | [UI/Sheet](../../src/components/ui/sheet.stories.tsx) | нет |
| [sidebar](../../src/components/ui/sidebar.tsx) | [UI/Sidebar](../../src/components/ui/sidebar.stories.tsx) | да |
| [skeleton](../../src/components/ui/skeleton.tsx) | [UI/Skeleton](../../src/components/ui/skeleton.stories.tsx) | да |
| [slider](../../src/components/ui/slider.tsx) | [UI/Slider](../../src/components/ui/slider.stories.tsx) | да |
| [sonner](../../src/components/ui/sonner.tsx) | [UI/Sonner](../../src/components/ui/sonner.stories.tsx) | да |
| [spinner](../../src/components/ui/spinner.tsx) | [UI/Spinner](../../src/components/ui/spinner.stories.tsx) | да |
| [step-picker](../../src/components/ui/step-picker.tsx) | [Проект/StepPicker](../../src/components/ui/step-picker.stories.tsx) | нет |
| [switch](../../src/components/ui/switch.tsx) | [UI/Switch](../../src/components/ui/switch.stories.tsx) | да |
| [table](../../src/components/ui/table.tsx) | [UI/Table](../../src/components/ui/table.stories.tsx) | да |
| [tabs](../../src/components/ui/tabs.tsx) | [UI/Tabs](../../src/components/ui/tabs.stories.tsx) | да |
| [textarea](../../src/components/ui/textarea.tsx) | [UI/Textarea](../../src/components/ui/textarea.stories.tsx) | да |
| [toggle-group](../../src/components/ui/toggle-group.tsx) | [UI/ToggleGroup](../../src/components/ui/toggle-group.stories.tsx) | да |
| [toggle](../../src/components/ui/toggle.tsx) | [UI/Toggle](../../src/components/ui/toggle.stories.tsx) | да |
| [tooltip](../../src/components/ui/tooltip.tsx) | [UI/Tooltip](../../src/components/ui/tooltip.stories.tsx) | да |

Запуск: `npm run storybook` → порт 6007. Theme toolbar ставит `.dark` как приложение; viewport «Мобилка 375» и «Десктоп 1100». Разделы `UI/<Name>` для библиотечных и `Проект/<Name>` для составных project-компонентов. У каждого story docs-description на русском, контент AI Hub, Hugeicons; проверять варианты, размеры, disabled, invalid, pending/loading и empty там, где применимо. Оверлеи открывать сразу, модальные stories — в iframe (`docs.story.inline: false`).

Эталоны описания — [Button stories](../../src/components/ui/button.stories.tsx), [Tooltip stories](../../src/components/ui/tooltip.stories.tsx). Для точного контракта API читать TypeScript конкретного файла; генератор shadcn в другой версии может дать иной API (Radix `asChild`, Base UI `render`).

## 9. Безопасное развитие библиотеки

1. Сначала найти существующий примитив и экранный паттерн. При добавлении из shadcn использовать MCP `search_items_in_registries` с `registries: ["@shadcn"]`, затем описание/примеры и команду установки.
2. Не перезаписывать патчи `sidebar`, `dialog`, `drawer`, `sheet`, `tooltip`, `kbd`, `sonner`, `command`, `menubar`, `progress`, `pagination`, `carousel`, `questionnaire` через `--overwrite`. Сначала сохранить diff, затем перенести изменения библиотеки вместе с локальным поведением.
3. Проверить, что `cn` импортирован из `@/lib/utils`, а не пакета `cn`; все новые библиотечные тексты перевести, иконки — Hugeicons free.
4. Обновить компонент и story в одном изменении. Проверить 375/1100, light/dark, pointer/keyboard/reduced-motion, long labels и переполнение. Не менять продуктовый размер или вид табов из-за удобства нового primitive.
5. Запустить проектные проверки `npx tsc -b`, `npx oxlint <изменённые-файлы>`, нужные stories без ошибок консоли. Реальные результаты проверки заносить в acceptance, а не выводить из факта существования story.

Эти документы не меняют правила публикации: изменения остаются локальными до отдельного явного запроса пользователя; `git push main` запускает Pages и не является обычным шагом оформления handoff.
