# 03. Дизайн-система

Срез исходников: `3631ebecb5777f59fe1e6312ef635137ec1b7014`, 29 сентября 2026. Документ описывает реализованный прототип и обязательные правила из [CLAUDE.md](../../CLAUDE.md). Метка **Правило** означает требование к дальнейшей реализации; **Сейчас** — факт из кода. Различия перечислены отдельно: наличие варианта в библиотеке не делает его разрешённым в продукте.

## 1. Из чего собран интерфейс

| Основа | Где и как используется |
| --- | --- |
| React 19 + TypeScript, Vite | Компоненты и клиентское состояние; точные зависимости — [package.json](../../package.json) и lockfile |
| Tailwind CSS v4 | Семантические классы, responsive-условия, `data-*` состояния. Тема — [src/index.css](../../src/index.css); отдельной JS-конфигурации Tailwind нет |
| shadcn/ui, стиль `radix-nova` | Локальный код компонентов в [src/components/ui](../../src/components/ui), настройки — [components.json](../../components.json). Большинство интерактивных примитивов опирается на Radix, Drawer — на Vaul, Combobox — на Base UI |
| `cn` = clsx + tailwind-merge; CVA | [lib/utils.ts](../../src/lib/utils.ts) объединяет классы и разрешает конфликты; `cva` определяет варианты. Сохранять `data-slot`, `data-state` и библиотечные props |
| Geist Variable | Локально поставляется пакетом `@fontsource-variable/geist`, подключён через CSS; есть кириллица. `--font-heading` совпадает с `--font-sans` |
| Hugeicons | Все обычные интерфейсные иконки. `ICON_STROKE = 1.75` в [lib/icons.ts](../../src/lib/icons.ts); отдельные существующие внутренние глифы примитивов имеют 2–2.25 |
| Lobe Icons static SVG | Логотипы моделей через [ModelLogo](../../src/components/model-logo.tsx), без второго React UI kit. Цветной знак у выбранной модели, монохромный у остальных |
| Sonner | Тосты через [ui/sonner.tsx](../../src/components/ui/sonner.tsx), тема отслеживает `.dark`, портал в `body` |
| Специализированные библиотеки | `@shadcn/react/message-scroller` — чат, `react-markdown` + `remark-gfm` — Markdown, `pdfjs-dist`/`mammoth` — просмотр файлов, `img-fx`/`three` — эффекты генерации. Их наличие не означает, что все экспортируемые возможности используются на экранах |
| Storybook | 67 файлов компонентов `ui/*.tsx` и 67 соседних `*.stories.tsx`. Описание, варианты и состояния для разработки; конфиг [preview.tsx](../../.storybook/preview.tsx) |

**Правило:** экранные компоненты собирать из `ui/*`. Не создавать собственные кнопки, поля, меню и модальные окна с нуля. Новый составной примитив — композиция существующих компонентов, файл в `ui/` и story в том же изменении. HTML для структуры, текста, изображений и нативных медиаплееров сохраняет своё назначение.

В исходниках зафиксированы визуальные ориентиры: ChatGPT — пропорции меню, композер и мобильный сдвиг сайдбара; Krea — студии с лентой результатов, идеи и шаблоны; MashaGPT — организация студий; Suno — форма аудио; Lovable — мягкий декоративный свет. Это комментарии к происхождению решений в [new-chat.tsx](../../src/components/new-chat.tsx), [app-menu.tsx](../../src/components/ui/app-menu.tsx), [home-glow.tsx](../../src/components/home-glow.tsx), [music/song-form.tsx](../../src/components/music/song-form.tsx), а не внешние спецификации. Для реализации использовать локальный код и этот handoff; не восстанавливать UI по актуальным сторонним сайтам.

## 2. Цвет и темы

Единственный исходник токенов — [index.css](../../src/index.css). [design-tokens.json](design-tokens.json) извлечён из него автоматически: 77 деклараций `:root`, 53 переопределения `.dark`, 54 привязки `@theme inline`. `darkEffective` объединяет декларации; выражения `var()`/`calc()`/`color-mix()` сохранены без вычисления. Локальные переменные декоративных эффектов не входят в этот файл. JSON — снимок, не второй редактируемый источник.

### Основные семантические токены

Значения ниже взяты непосредственно из CSS. Если значение темы не переопределено, оно наследуется из `:root`. Не подменять OKLCH приблизительным RGB из скриншота.

| CSS variable | Light | Dark |
| --- | --- | --- |
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| `--popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--primary` | `oklch(0.56 0.261 289.05)` | `oklch(0.56 0.261 289.05)` |
| `--primary-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` |
| `--ring` | `oklch(0.56 0.261 289.05)` | `oklch(0.56 0.261 289.05)` |
| `--tooltip` | `oklch(0.37 0 0)` | `oklch(0.37 0 0)` |
| `--tooltip-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` |
| `--sidebar` | `oklch(0.9761 0 0)` | `oklch(0.205 0 0)` |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-muted-foreground` | `oklch(0.145 0 0 / 62%)` | `oklch(0.985 0 0 / 50%)` |
| `--sidebar-primary` | `oklch(0.56 0.261 289.05)` | `oklch(0.56 0.261 289.05)` |
| `--sidebar-primary-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` |
| `--sidebar-accent` | `oklch(0.9401 0 0)` | `oklch(0.269 0 0)` |
| `--sidebar-accent-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-border` | `oklch(0.9219 0 0)` | `oklch(1 0 0 / 10%)` |
| `--sidebar-ring` | `oklch(0.56 0.261 289.05)` | `oklch(0.56 0.261 289.05)` |

| Область | Применение |
| --- | --- |
| `background` / `foreground` | Основное рабочее поле и текст; не подставлять вместо них literal white/black |
| `card` / `card-foreground` | Поднятая поверхность, особенно в dark; не считать `card` и `background` взаимозаменяемыми |
| `popover` / `popover-foreground` | Меню и модальные поверхности |
| `primary` / `primary-foreground` | Главное действие, брендовый фиолетовый; комментарий CSS задаёт бренд `#7A3FFF` |
| `secondary`, `muted`, `accent` | Второстепенные контролы, спокойные подложки, hover/выделение; совпадение значений не объединяет смысл |
| `destructive` | Удаление и ошибки; у Button заливка полупрозрачная, текст — destructive |
| `border`, `input`, `ring` | Разделители, границы поля, видимый focus; в dark прозрачность является частью токена |
| `sidebar-*` | Серый shell, строки навигации, их active/hover. Второстепенный текст — `sidebar-muted-foreground` |
| `tooltip` | Всегда серый `oklch(0.37 0 0)` с белым текстом, в обеих темах |

Hover рассчитывается в `oklab`: `primary-hover` смешивает primary с foreground на `2 × --hover-step`, `secondary-hover` — secondary с foreground на `--hover-step`, `ghost-hover` — прозрачный с foreground. `--hover-step`: 5% light, 8% dark. Для открытой кнопки меню используется тот же hover через `aria-expanded`.

### Специальные палитры

| Токены | Light / dark и назначение |
| --- | --- |
| `tool-text`, `tool-photo`, `tool-video`, `tool-audio` | `#fd6930`, `#d232fc`, `#fd6021`, `#3181fd`, одинаковы в двух темах. Цвета инструментов и декоративного фона; не заменяют primary у CTA |
| `file-pdf`, `file-sheet` | `oklch(0.58 0.22 26)`, `oklch(0.6 0.15 152)`, одинаковы; цветные плитки файлов |
| `paper` | `oklch(1 0 0)` в обеих темах: белая страница PDF |
| `project-red/orange/yellow/green/blue/purple/pink` | Индивидуальные иконки проектов; точные обе темы — JSON и [project-colors.ts](../../src/lib/project-colors.ts), не фон основного действия |
| `gradient-molly` | `linear-gradient(110deg, #ff723f, #dc3fff 28%, #7a3fff 55%, #3f8cff 80%, #00ffd1)`; декоративный брендовый материал, **не** градиентная кнопка отправки |
| `glow-tools-1…5`, `glow-molly-1…5` | Сохранённые палитры фонового света; `glow-strength` 0.7/0.6, `glow-grain` 0.3/0.22, `glow-dome-strength` 0.86/1 |
| `auth-media-foreground/shade/mid` | Белый текст и затемнение поверх медиакарточки авторизации; наследуются в dark |
| `chart-1…5` | Нейтральная палитра библиотечных графиков; наличие stories не означает, что графики являются частью текущих экранов |
| `stars` | 0.78/0.55 OKLCH без chroma; сохранён для прежнего эффекта звёзд. `StarsBackground` сейчас не подключён к экрану |

Не определять цвет растровой плитки по имени CSS-токена: [data/tools.ts](../../src/data/tools.ts) для «Текст» сейчас выбирает фиолетовый `text-primary.png`, хотя сохранённый `--tool-text` остаётся оранжевым. «Видео» использует `video.png` и оранжевый `--tool-video`. При подготовке новых изображений ориентироваться на текущие используемые ассеты и отдельные правила арт-дирекшена, а не на старые комментарии или неиспользуемые варианты.

**Правила акцента:** одно главное primary-действие на экран; второстепенные — `ghost`, `secondary`, `outline`; опасные — `destructive`. По явному решению пользователя от 27.09 микрофон, отправка и стоп в композере используют `INK = bg-foreground text-background`: чёрные в light, белые в dark. Цена рядом — обычный текст, значок валюты — `MoleculeIcon colored`. Не распространять это исключение на создание проекта, покупку тарифа и основные действия листов.

Новый цвет сначала добавить в `:root` и `.dark`, затем использовать семантически. Palette-классы Tailwind и новые произвольные hex в экранном коде запрещены правилом проекта. В текущем коде остаются literal цвета в тенях, scrim и отдельных декоративных местах; их наличие не разрешает новую произвольную палитру.

### Переключение темы

[use-theme.ts](../../src/hooks/use-theme.ts) хранит `system | light | dark` в `ai-hub:theme`; `system` реагирует на ОС. `initTheme()` вызывается в [main.tsx](../../src/main.tsx). Класс `.dark` ставится на `<html>`, `color-scheme` обновляется; смена всех цветов выполняется без transition. `next-themes` есть в зависимостях, но приложение не использует его provider.

```tsx
import { useTheme } from "@/hooks/use-theme"
import { AppMenuRadioGroup, AppMenuRadioItem } from "@/components/ui/app-menu"

// Внутри AppMenuContent; значение от перечисленных radio-item.
const [theme, setTheme] = useTheme()
<AppMenuRadioGroup value={theme} onValueChange={(value) => {
  if (value === "system" || value === "light" || value === "dark") setTheme(value)
}}>
  <AppMenuRadioItem value="system">Как в системе</AppMenuRadioItem>
  <AppMenuRadioItem value="light">Светлая</AppMenuRadioItem>
  <AppMenuRadioItem value="dark">Тёмная</AppMenuRadioItem>
</AppMenuRadioGroup>
```

## 3. Типографика, размеры и плотность

Все px ниже соответствуют базовому `1rem = 16px`, без пользовательского масштабирования. Geist Variable применяется и к заголовкам, и к тексту; отдельного display-шрифта нет. Не ограничивать пользовательский zoom.

| Роль | Текущие параметры | Пример |
| --- | --- | --- |
| Приветствие / пустая студия | 26px mobile, 32px desktop, weight 450, `leading-tight`, tracking −0.02em | [new-chat.tsx](../../src/components/new-chat.tsx) |
| Заголовок листа | 18px / 500, `leading-tight` | `AppSheetTitle`, `ConfirmDialog` |
| Текст сообщения пользователя | 16px, line-height 24px | [chat-messages.tsx](../../src/components/chat/chat-messages.tsx) |
| Поле композера | 16px mobile / 15px desktop, line-height 24px | `ChatComposer`; размер mobile снижает риск автозума поля |
| Кнопки, меню, табы | Основной размер 14px / 500; кнопки меню могут явно брать normal | `Button`, `AppMenuItem`, `TabsTrigger` |
| Базовые Input/Textarea | 16px mobile / 14px desktop | UI-примитивы; экран вправе задать согласованный 15px |
| Подписи файлов / компактные настройки | 13px | Композер и форма аудио |
| Подсказки / метаданные | 12px, обычно muted; подпись слота шаблона 11px | Tooltip, файлы |
| Числа цены, счётчики, код | `tabular-nums` | Цена запроса, код входа, проценты |

Не превращать весь текст в bold. Для основной иерархии используются размер, отступ и спокойный weight 450/500; secondary-текст — семантический muted.

Базовая шкала отступов Tailwind: `--spacing: 0.25rem`. Наиболее употребимы 4, 8, 12, 16, 20, 24, 32px; половинные шаги 2/6/10/14px используются для оптической центровки. Примеры: трек таба `p-1` = 4px, расстояние после бургера `gap-2` = 8px, поля контента `px-4`/`md:px-6` = 16/24px. Существующий экранный размер приоритетнее изобретения новой шкалы.

### Радиусы и поверхности

`--radius = 0.625rem` (10px), вычисляемая шкала: sm 6px, md 8px, lg 10px, xl 14px, 2xl 18px, 3xl 22px, 4xl 26px. Поэтому `rounded-xl` здесь — 14px, а не привычное значение другого проекта.

| Объект | Радиус / поверхность |
| --- | --- |
| Workspace desktop | 24px, `bg-background`, вокруг shell `bg-sidebar` |
| Открытый сдвинутый workspace mobile | 32px, собственная мягкая тень |
| AppSheet / ConfirmDialog | 24px; у bottom sheet только верхние углы |
| AppMenu | 20px; строки 10px |
| Композер | Внешний лоток 28px, внутреннее поле 24px; лоток `bg-muted/50` или `dark:bg-card/50`, backdrop blur |
| Кнопки модалок / табы | `rounded-full`; круглые иконочные кнопки |
| Toast | 16px |
| Bubble пользователя в чате | 20px; это экранное переопределение библиотечного Bubble |

AppMenu/AppSheet/ConfirmDialog используют `0 12px 40px -8px rgb(0 0 0 / 0.14), 0 2px 6px rgb(0 0 0 / 0.04)` + кольцо foreground/6. Scrim модалки — black/15 без blur. Поле композера и вложения — `0 1px 3px rgb(0 0 0 / 0.05)` + ring foreground/6. Эти значения пока записаны классами компонентов, а не общими shadow-токенами; при централизации сохранить результат.

## 4. Адаптивная система

Главная граница — **768px**: [use-mobile.ts](../../src/hooks/use-mobile.ts) и `md`/`max-md` должны совпадать. Дополнительные Tailwind breakpoints: sm 640, lg 1024, xl 1280, 2xl 1536px; это возможности шкалы, не пять отдельных макетов. Базовые контрольные viewport проекта: mobile 375×812 и desktop 1100×800. Дополнительно проверять границы 767/768, узкие 320px, планшет и доступный zoom.

| Область | Desktop ≥768px | Mobile <768px |
| --- | --- | --- |
| Сайдбар | 260px; свёрнутый rail 48px | `min(max(79svw, 270px), 320px)`; сдвигает workspace в общем ряду, swipe закрывает |
| Shell | `h-svh`; workspace отступ 8px сверху/справа/снизу, без левого отступа | Полный viewport, overflow-clip у shell; не делать весь документ горизонтально прокручиваемым |
| Шапка | Контролы внутри workspace, баланс сверху справа | Высота 64px; burger/new-chat 36×36, отступ 8px; у нового чата и студий фото/видео нет лишнего new-chat |
| Чат и композер | `max-w-3xl` = 768px, центр, padding 24px | Padding 16px; готовый чат с композером внизу; пустой текстовый — по центру под приветствием |
| Фото / видео | Табы и размер превью в верхней строке; композер снизу поверх ленты | Compact-табы в строке бургера; настройка размера ленты скрыта; композер снизу, контент под scrim |
| Идеи в веере | 4 карточки; `clamp(128px,21cqi,210px)`, h=1.25w | 3 карточки; `min(33cqi,150px)` |
| Аудио | Форма 400px, на lg 440px; библиотека рядом | Панели формы и библиотеки переключаются; текущее line-оформление табов — расхождение с правилом |
| AppSheet | Центрированный Dialog, по умолчанию max-width 480px, max-height `100dvh - 4rem` | Vaul bottom sheet, max-height 85dvh, safe-area снизу |
| Табы M | Ширина по содержимому | Обычно на всю ширину; `compact` разрешён только студиям фото/видео |

Источники: [sidebar.tsx](../../src/components/ui/sidebar.tsx), [App.tsx](../../src/App.tsx), [new-chat.tsx](../../src/components/new-chat.tsx), [chat-view.tsx](../../src/components/chat-view.tsx), [music-studio.tsx](../../src/components/music/music-studio.tsx). Размер конкретного большого листа определяется его `md:*` классами, а не стандартными 480px.

Сохранять `min-w-0`, `min-h-0`, `overscroll-contain`, внутренние области прокрутки и `env(safe-area-inset-bottom)`. Высота композера измеряется [use-composer-height.ts](../../src/hooks/use-composer-height.ts): сообщения получают нижний запас через `--composer-h`. Фиксированный padding вместо измерения ломает длинный ввод и вложения. Проверка реальной экранной клавиатуры обязательна; responsive-viewport сам по себе её не воспроизводит.

Базовые слои: содержимое → scrim → композер/toolbar (`z-20`) → кнопки шапки/баланс (`z-30`) → portal overlays (`z-50`). Мобильный tap-catcher сайдбара (`z-10`) закрывает меню по нажатию в workspace; burger остаётся доступен. Не переносить тосты внутрь контейнера с transform.

## 5. Иконки, изображения и бренд

```tsx
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { ICON_STROKE } from "@/lib/icons"
import { Button } from "@/components/ui/button"

<Button variant="ghost" size="icon-lg" aria-label="Новый чат">
  <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={ICON_STROKE} className="size-5" />
</Button>
```

Для новых иконок правило проекта требует поиска через Hugeicons MCP и проверки наличия во free-наборе. Не угадывать имя и не добавлять lucide. Иконка роли — `SignpostIcon`; нового чата — `NEW_CHAT_ICON`; типы чатов и иконки проектов централизованы в [lib/icons.ts](../../src/lib/icons.ts). Обычно иконка кнопки 16px, меню 18px, шапки 20px. Цветные vendor marks — через `ModelLogo`, валюта — через `MoleculeIcon`, не вручную нарисованным знаком.

Все пути из `public` должны учитывать Vite base через [withBasePath](../../src/lib/base-path.ts). Локально base `/`, Pages `/molhub/`. У монохромного `MoleculeIcon` сейчас сохранилась абсолютная CSS mask `/brand/molecula-mark.svg`: проверить собранный build в deployment prefix и унифицировать путь до production.

### Инвентарь ассетов

Полный перечень, размеры файлов и SHA-256: [assets-manifest.csv](assets-manifest.csv). Ниже — группы, а не список ассетов, гарантированно используемых каждым экраном.

| Каталог | Количество файлов без `.DS_Store` | Назначение / связь |
| --- | ---: | --- |
| `public/brand` | 3 | Знак Молекулы, светлый/тёмный wordmark |
| `public/models` | 14 | Локальные логотипы, в том числе Молли; большинство vendor marks берётся из Lobe Icons пакета |
| `public/icons` | 22 | Цветные плитки инструментов и `sm`-версии, также сохранённый исходный PNG; каталог не целиком равно production bundle |
| `public/assets/roles` | 40 | Авторы/образы ролей, связи — [data/roles.ts](../../src/data/roles.ts) |
| `public/presets` | 112 | Идеи/стили/шаблоны: изображения и видео, связи — [data/prompt-presets.ts](../../src/data/prompt-presets.ts) |
| `public/auth` | 13 | Showcase-видео, постеры, изображения и знаки входа, [auth-modal.tsx](../../src/components/auth/auth-modal.tsx) |
| `public/avatars` | 12 | Аватары demo-пользователей/отзывов |
| `public/uploads` | 12 | Демонстрационные фото/видео; не загруженные текущим пользователем файлы |
| `public/tariffs` | 8 | Иллюстрации тарифов и аватары |
| `public/demo` | 2 | PDF и DOCX для демонстрации просмотрщика |
| `public/illustrations` | 1 | Веер файлов для dropzone |
| Корень `public` | 2 | `favicon.svg`, `icons.svg` |

Итого 241 содержательный файл плюс 4 служебных `.DS_Store` в разных каталогах (не распространять в production). Данный репозиторий не содержит единого реестра авторства/лицензий этих медиа. Наличие файла не подтверждает права на его публикацию: перед production владелец контента должен подтвердить источник/право использования либо заменить demo-материалы. Это не утверждение, что права нарушены. Лицензии библиотек и правила использования товарных знаков проверяются отдельно от сходства UI с референсом.

`AutoClip` воспроизводит без звука только видимые шаблоны (`IntersectionObserver`, threshold 0.2), останавливается за пределами viewport, при reduced motion оставляет постер. Не заставлять все видео загружаться и проигрываться одновременно. Для интерактивной картинки доступное имя задаётся кнопке открытия; декоративные картинки имеют `alt=""`/`aria-hidden`. Результаты и пользовательские файлы требуют соответствующего имени, error и retry.

## 6. Моушен и доступность

**Правило:** перед созданием анимаций в проекте применять `emil-design-eng`, как требует CLAUDE. Частые/клавиатурные действия не анимировать; вход — ease-out, выход быстрее, popover растёт из transform-origin триггера. Предпочитать transform/opacity, не scale(0). `prefers-reduced-motion` обязателен. Декоративные эффектные входы уже содержат отдельные исключения — не распространять их на частый UI.

| Токен / сценарий | Сейчас |
| --- | --- |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` |
| `--ease-glow` | `cubic-bezier(0.37, 0, 0.63, 1)` |
| `--duration-press`, `--duration-fast` | 160ms, 150ms |
| `--sidebar-duration`, `--drawer-duration` | 240ms desktop sidebar, 300ms mobile push |
| Hover и press Button / строк | Заливка 80ms; Button и строки scale(.98). Общая текстовая норма CLAUDE говорит .97, некоторые экранные контролы — .96/.97 |
| Dialog / Popover | Базовые 100ms; AppSheet/ConfirmDialog `instant="keyboard"` отключает анимацию при keyboard open/close |
| AppSheet mobile | Текущий вход Vaul 500ms, выход 240ms; это фактическое исключение из общей нормы UI <300ms |
| IdeaFan | Вход 800ms spring + проявление/blur 450ms с задержкой 50ms между карточками; reduced motion — fade 200ms |
| HomeGlow | Ignite 735ms + settle 945ms, stagger 47ms; reduced motion — fade 400ms |
| Отказ загрузки | [shake](../../src/lib/motion.ts): 320ms затухающего движения, reduced motion пропускает его |
| CopyButton | Локальная галочка 2 секунды, отдельное live-сообщение, без toast |

`HomeGlow` текущего текстового экрана вызывается как `look="horizon" palette="molly"`. Варианты через `?look=`/`?glow=` — прототипные средства сравнения, не пользовательские настройки. Звёздный фон и `text-composer.tsx` сохранены, но не используются в актуальном NewChat. При переносе не выбрать их случайно как новый дизайн.

Реализовано в исходниках: focus-visible ring, библиотечная клавиатура Radix, auto-focus контейнера AppSheet, tracking input modality, `inert` для скрытых областей, часть live-регионов, reduced-motion стили для custom-effects. Это не сертификат доступности. В Storybook `a11y.test = "todo"`; наличие addon и story не подтверждает прохождение всех проверок.

До production проверить Tab/Shift+Tab, Escape, стрелки, возврат фокуса, screen reader, реальные touch-targets, контраст поверх media и все loading/error. Известные пробелы: английский `sr-only` у `MessageScrollerButton`, неприведённые к общей норме табы, spinner/другие анимации без явного reduced-motion варианта. Общий CSS reduced motion убирает enter/exit translate/scale, но сам по себе не отключает любой `animate-spin`.

## 7. Различия между правилами и текущим кодом

| Что | Факт / требуемое решение |
| --- | --- |
| Аудио mobile | [music-studio.tsx](../../src/components/music/music-studio.tsx) использует `TabsList variant="line"`; CLAUDE запрещает line. Для production привести к M-пилюлям и обновить story; текущее расхождение не является разрешением нового варианта |
| Segmented | Primitive default 40px, sm 32px; selected с `shadow-sm`. Правило задаёт только M 36 / L 44, без тени. Форма аудио делает L через высоту дочерних элементов, но остальные различия остаются |
| Табы dark | `TabsTrigger` задаёт selected `dark:bg-input/30` и border, а правило — `bg-background` без тени. Нельзя обещать полное совпадение темы с текстовой нормой |
| Движение | .98 vs .97, 500ms Vaul и отдельные длительности >300ms. Зафиксировать поддерживаемые исключения, не менять весь прототип без визуальной приёмки |
| Переводы | `MessageScrollerButton` содержит английский текст для screen reader; правило требует русский для всех невидимых подписей |
| Цвет и маршруты ассетов | Внутренние literal scrim/shadow и моно-mask с абсолютным `/brand/` требуют аккуратного переноса и проверки prefix |

Эти пункты не исправлялись при подготовке handoff. Они являются конкретными задачами реализации/сверки. Основные API и правила композиции — в [04-components-and-patterns.md](04-components-and-patterns.md).
