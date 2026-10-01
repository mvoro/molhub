# 05. Данные, клиентские контракты и интеграция

База документа: локальный `ai-hub`, commit `3631ebe`, аудит 29.09.2026. **Это спецификация существующего интерфейса и план подключения production.** Контракты HTTP API, поставщики авторизации, биллинга и генерации в репозитории не определены. Предложения ниже помечены отдельно; их нельзя выдавать за согласованные решения команды.

## 1. Что работает сейчас, а что является демонстрацией

| Область | Фактическая реализация | Что заменить для production |
| --- | --- | --- |
| Вход | Локальная сессия; email и код проверяются в браузере; social-кнопки создают demo identity | Серверная сессия, реальный OTP/OAuth, срок действия, выход, отзыв доступа |
| Чаты и проекты | React Context, `localStorage`; демоданные при первом открытии | Авторизованный CRUD, пагинация, изоляция пользователей, обработка конфликтов |
| Сообщения | IndexedDB; случайный готовый ответ из `demo-replies`, воспроизводимый таймерами | Поток событий генерации, серверная история и восстановление |
| Фото и видео | Локальная лента, карточки из статических ассетов, таймер готовности | Реальные задания, загрузки референсов, статусы, результаты и ошибки |
| Аудио | Две карточки на запрос; `playingId` меняет визуальный эквалайзер | Аудиофайлы, настоящий плеер, длительность, прогресс, ошибки воспроизведения |
| Роли | Каталог из 40 ролей, локальные лайки, избранное, отзывы, счётчик сессий | Серверный каталог и пользовательские предпочтения, политика отзывов |
| Баланс и тарифы | Баланс `1250`; покупка показывает «Оплата скоро появится» | Счёт пользователя, quote/списание, checkout, статусы оплаты |
| «Поделиться» | Копирование локального адреса чата/проекта | Модель доступа к shared resource и отдельная серверная ссылка |
| Файлы | Blob в IndexedDB или статический файл; реальные локальные preview/download | Upload, хранение, доступ, срок действия ссылок, серверная валидация |
| Диктовка | Нативный `SpeechRecognition`/`webkitSpeechRecognition`, `ru-RU` | Решение о поддерживаемых браузерах и допустимом способе распознавания |

Поиск по исходникам не обнаружил API клиента для бизнес-операций, WebSocket или SSE. Имеющиеся `fetch` читают файлы для предпросмотра; PDF-библиотека также получает файл/worker. Отсутствие бизнес-API не означает, что приложение не делает сетевых запросов за ассетами.

Источники: [auth](../../src/lib/auth.ts), [сессия](../../src/hooks/use-auth.tsx), [hub](../../src/hooks/use-hub.tsx), [сообщения](../../src/hooks/use-chat-messages.ts), [медиалента](../../src/hooks/use-media-feed.ts), [аудио](../../src/hooks/use-music.tsx), [тарифы](../../src/data/tariffs.ts), [покупка](../../src/components/balance/tariffs-sheet.tsx), [ссылки](../../src/hooks/use-entity-actions.tsx).

## 2. Существующие типы и границы компонентов

Не копировать типы в экранные компоненты: использовать их текущие определения. DTO сервера следует преобразовывать в эти UI-модели в одном месте. Названия моделей и русские значения настроек пока выполняют роль идентификаторов — для production потребуется явное сопоставление со стабильными backend ID.

| Тип / источник | Поля, важные для фронта | Правила |
| --- | --- | --- |
| `Chat` — [data/chats](../../src/data/chats.ts) | `id`, `title`, `type`, `projectId?`, `archived?`, `updatedAt?`, `preview?` | `type`: `text/image/video/audio`; после создания тип чата фиксирован. Чат в проекте уходит из общей истории. `preview` — первая строка, до 140 символов |
| `Project` — тот же файл | `id`, `name`, `description?`, `color?`, `icon?`, `instructions?`, `files?`, `archived?`, `createdAt`, `updatedAt` | Имя до 45 символов; инструкции до 8000. Цвет — ID токена. Время — milliseconds Unix epoch |
| `ProjectFile` — тот же файл | `id`, `name`, `size`, `type`, `addedAt`, `src?` | `size` в байтах; `type` — MIME. `src` у демо; собственные загрузки доступны по `id` из IndexedDB |
| `PinKey` — [use-hub](../../src/hooks/use-hub.tsx) | `` `${"chat" | "project"}:${string}` `` | Единый список закреплений; новые добавляются в начало. Архивация снимает закрепление |
| `ComposerFile` — [chat-composer](../../src/components/chat-composer/chat-composer.tsx) | `id`, `name`, `size`, `type`, `url`, `file: File` | `url` — временный Blob URL. Не сериализовать его как постоянный адрес файла |
| `ComposerDraft` — тот же файл | `text`, `files`, `frames`, `template?`, `photo?`, `models?`, `settings?` | `frames` — пара start/end. Черновики экран хранит в памяти; полного сохранения draft после reload нет |
| `ComposerMessage` — тот же файл | `text`, `files`, `frames`, `template`, `photo`, `mode`, `model`, `settings`, `cost` | Пакет события `onSend`; `cost` — клиентская оценка, не сумма для списания |
| `ChatConfig` — [chat-config](../../src/components/chat-composer/chat-config.ts) | `model`, `settings` | На чтении нормализует удалённые/переименованные модели и недоступные настройки |
| `UserMessage` — [use-chat-messages](../../src/hooks/use-chat-messages.ts) | `id`, `role: "user"`, `text`, `attachments?` | Файлы хранятся отдельно от метаданных сообщения |
| `AssistantMessage` — тот же файл | `id`, `role: "assistant"`, `model`, `request`, `status`, `steps`, `text`, `shown`, `image?`, `rating?`, `artifacts?` | `shown` считает элементы `tokenize()`: слова **и пробелы**, не токены LLM. `rating`: `up/down` |
| `ChatAttachment` / `ChatArtifact` — [chat-attachments](../../src/lib/chat-attachments.ts) | `id`, `name`, `type`, `size`, `src?`; у артефакта ещё `content?` | `content` используется для настоящего скачиваемого Markdown. Запрос «PDF» в demo не создаёт PDF |
| `Generation` — [use-media-feed](../../src/hooks/use-media-feed.ts) | `id`, `kind`, `batch`, `prompt`, `model`, `settings?`, `ratio`, `src`, `video?`, `duration?`, `status`, `createdAt`, `projectId?` | `kind=image/video`; `ratio=width/height`; `duration` сейчас строка; `status=generating/ready`; `batch` объединяет результаты запроса |
| `Song` — [data/music](../../src/data/music.ts) | `id`, `title`, `tags`, `cover`, `duration`, `status`, `createdAt`, `projectId?`, `model?`, `prompt?`, `settings?` | `duration` в секундах; во время генерации 0. Нет `audioUrl`, playback time и download URL |
| `RolePreferences` — [lib/roles](../../src/lib/roles.ts) | `favorites`, `likes`, `usage`, `sessions`, `reviews` | Используются стабильные role ID; учёт одного чата для одной роли идемпотентен |
| `RoleReview` — [data/roles](../../src/data/roles.ts) | `text`, `aspects`, `date` | До 500 символов; достаточно выбранного аспекта; полностью пустой отзыв не принимается |
| `AuthSession` — [lib/auth](../../src/lib/auth.ts) | `provider`, `email?`, `accountId?` | Это demo identity. Нет токена, срока действия или server verification |
| `ViewerFile` — [viewable](../../src/components/file-viewer/viewable.ts) | `name`, `type`, `size`, `url` | Единая граница image/video/PDF/DOCX viewer |

Полный `Settings` и модель возможностей находятся в [composer-settings](../../src/data/composer-settings.ts) и [models](../../src/data/models.ts). `Settings` содержит строковые choices (`speed`, `role`, `ratio`, `resolution`, `quality`, `count`, `duration`, `voice`, `language`, `gender`, `styleWeight`, `creativity`, `audioWeight`), boolean toggles (`sound`, `backgroundMusic`, `lastImage`, `chatImages`, `web`, `custom`, `instrumental`) и свободные поля `styles/title/negative`.

### Вызовы, которые уже используют экраны

- `Hub`: создание/переименование/перенос/архив/удаление чата; создание/обновление/архив/удаление проекта; закрепления; операции с метаданными файлов. Полная сигнатура — [use-hub](../../src/hooks/use-hub.tsx).
- `sendChatMessage(chatId, text, model, files)`, `stopReply(chatId)`, `regenerateReply(chatId, messageId)`, `rateReply(...)`, `reloadChatMessages(chatId)` — [use-chat-messages](../../src/hooks/use-chat-messages.ts).
- `generate(kind, { prompt, idea?, model, settings?, ratio, count?, duration?, projectId?, projectName? })` — [use-media-feed](../../src/hooks/use-media-feed.ts).
- `createSongs({ model?, prompt?, settings?, projectId, title, tags })` и операции над отдельной песней — [use-music](../../src/hooks/use-music.tsx).
- `requireAuth(variant?) → boolean`: `false` открывает auth sheet и прерывает действие. Автоматического replay исходного действия после входа здесь нет; пользователь повторяет его. Значение `nano` используется для фото, `models` — для остальных сценариев.

## 3. Состояния и хранение

### Сообщения

Переходы текущего ответа: `thinking → streaming → done`; у картинки Молли: `thinking → drawing → streaming → done`. Из активного состояния возможен `stopped`. Статуса `failed` у генерации пока нет.

Генерация живёт вне React: уход в другой раздел не останавливает таймер. IndexedDB сохраняет промежуточный ответ примерно раз в 500 мс и при завершении. При reload активный ответ превращается в `stopped`: остаётся показанная часть текста и уже готовое изображение; незавершённая картинка и артефакты удаляются. Остановка делает то же самое. Регенерация **заменяет** выбранный ответ, без истории альтернативных веток.

Hydration имеет отдельные `loading/ready/error`. Экран истории показывает «Загружаем историю…», ошибку с «Повторить» или пустое состояние. Сохранённая история имеет приоритет перед демопримерами. Ошибка чтения не должна затирать ранее сохранённую историю. Удаление дожидается незавершённых сохранений, чтобы история не появилась снова. Эти сценарии частично покрывает [chat-storage-lifecycle.test](../../tests/chat-storage-lifecycle.test.ts).

### Фото, видео, музыка

Текущий UI поддерживает `generating/ready`, но не `queued/failed/cancelled`. Генерация фото/видео продолжает работать при смене раздела; завершённый пакет вне текущего экрана показывает тост с «Открыть». Две музыкальные карточки завершаются с интервалом. При reload демоленты и песни принудительно становятся `ready`, даже если таймер не завершился. **Этот fallback нельзя переносить в production:** после reload нужен статус реального задания.

Удаление проекта удаляет его чаты и файлы, но фото, видео и песни сохраняются в студиях без `projectId`. Архивация проекта сохраняет содержимое. Добавление медиа в проект связывает **одну карточку**, не весь batch. Удаление карточки фото/видео даёт тост «Отменить»; удаления песен через provider не имеют такого механизма.

### Карта persistence

| Хранилище | Ключ / таблица | Данные и особенности |
| --- | --- | --- |
| `localStorage` | `ai-hub:demo-auth-v1` | Только demo identity; выход удаляет этот ключ |
| `localStorage` | `ai-hub:chats`, `ai-hub:projects`, `ai-hub:pins` | Общие данные браузера; не разделены по account ID |
| `localStorage` | `ai-hub:review-examples-v1` | Маркер добавления демонстрационных чатов |
| `localStorage` | `ai-hub:chat-config:<chatId>` | Модель и настройки чата; отдельного cleanup при удалении чата сейчас нет |
| `localStorage` | `ai-hub:media-feed` | Фото и видео; читает старый `ai-hub:image-feed`, удаляет старый ключ при следующей записи |
| `localStorage` | `ai-hub:music-songs` | Песни; старый `ai-hub:music-projects` мигрирует в общий hub |
| `localStorage` | `ai-hub-role-preferences-v1` | Роли; отдельная нормализация, синхронизация через `storage` event между вкладками |
| `localStorage` | `ai-hub:theme` | `system/light/dark`; system отслеживает OS |
| `localStorage` | `ai-hub:feed-size`, `ai-hub:sidebar-more`, `ai-hub:sidebar-sections` | Предпочтения отображения |
| IndexedDB | `ai-hub-chat`, version 1: `threads`, `files` | Массивы сообщений по chat ID и Blob вложений по file ID |
| IndexedDB | `ai-hub`, version 1: `project-files` | Blob файлов проектов по file ID |
| Память | Текущие draft, выбранные вкладки проектов, scroll/ширина документа, `playingId` | Не являются долговременным хранением; вкладка проекта также отражается в URL |

`useStoredState` делает `JSON.parse` с TypeScript cast, но не runtime validation. Не все сущности защищены от корректного JSON неправильной формы. Ошибка записи localStorage в большинстве мест подавляется: состояние работает до закрытия страницы. Роли имеют более строгую нормализацию и отдельную логику слияния; её нельзя автоматически приписывать чатам/проектам. Выход скрывает workspace, но **не удаляет его содержимое**; новая demo identity в том же браузере увидит тот же локальный набор данных.

Источники: [use-stored-state](../../src/hooks/use-stored-state.ts), [chat-storage](../../src/lib/chat-storage.ts), [project-files](../../src/lib/project-files.ts), [roles](../../src/lib/roles.ts), [project-tabs](../../src/lib/project-tabs.ts), [use-theme](../../src/hooks/use-theme.ts).

## 4. Файлы, browser API и ограничения

| Сценарий | Реальное ограничение / поведение |
| --- | --- |
| Общий композер | До 10 файлов, каждый до `25 × 1024 × 1024` байт. UI пишет «25 МБ», фактическая граница — 25 MiB |
| Модель | `attachments=false` запрещает вложения; `maxFiles` перекрывает 10; `frames` задаёт 1/2 слота; `requiresImage` требует начальный кадр или выбранный контекст картинки |
| Фото/видео | В общий композер принимаются изображения. Файлы с неизвестным MIME получают его по расширению для известных фото/видеоформатов. Клиентская проверка MIME не является серверной проверкой содержимого |
| Шаблон видео | Обязательное пользовательское фото; без него подсветка слота, тост и запрет отправки |
| Проект | До 20 файлов, по 25 MiB. Pending-записи входят в счётчик. При частичном превышении принимаются допустимые файлы, сообщение объясняет остаток |
| Повторная загрузка проекта | Сохраняется прежний file ID, заменяются bytes и metadata |
| Текстовый preview | Markdown/text из Blob больше 2 MiB не читается для preview, download остаётся доступен. Для inline `content` этот Blob-check не применяется |
| PDF | Lazy `pdfjs-dist` + worker; страницы рендерятся при приближении к viewport, плотность ограничена 2×. Canvas не даёт полноценного screen-reader текста документа |
| DOCX | Lazy `mammoth`; HTML дополнительно чистится от обработчиков, неподдерживаемых ссылок и внешних изображений. Без отдельного security review нельзя считать это гарантией безопасности произвольного файла |
| Прочие форматы | Тип определяется по MIME/расширению; поддержка выбора файла не означает поддержку визуального preview или разбора моделью |
| Download | `<a download>`/созданная ссылка на локальный Blob или ассет. Production cross-origin URL потребует корректного `Content-Disposition`/CORS либо download endpoint |
| Clipboard | `lib/clipboard.ts`: Clipboard API с резервным копированием. После фактического копирования helper показывает один success toast; CopyButton также показывает галочку. Успех озвучивает Sonner, локальное screen-reader сообщение используется только при ошибке |
| Диктовка | Разрешение микрофона; текст добавляется к исходному draft. Остановка/отправка/уход с экрана отсоединяет `onresult`, чтобы поздний result не вернул отправленный текст |

Неиспользуемый [TextComposer](../../src/components/chat-composer/text-composer.tsx) + [useComposerFiles](../../src/components/chat-composer/use-composer-files.tsx) проверяют общие 10×25 MiB, но `submit` не проверяет `version.attachments`. В текущих экранах используется [ChatComposer](../../src/components/chat-composer/chat-composer.tsx), который эти проверки выполняет. Это ограничение legacy-модуля, а не дефект живого flow. Не подключать его как готовую замену без унификации validator.

Основные ошибки уже имеют UI: история не загружена → «Повторить»; IndexedDB не записан → тост с просьбой освободить место; отсутствующий проектный Blob → недоступный файл/повторная загрузка; preview не прочитан → состояние ошибки; нет Speech API → подсказка браузера; микрофон запрещён → просьба разрешить доступ. Сетевых ошибок отправки, rate limit, expired session и failed payment пока нет.

Источники: [лимиты проекта](../../src/lib/project-file-limits.ts), [загрузка проекта](../../src/components/project/project-files.tsx), [artifact-panel](../../src/components/chat/artifact-panel.tsx), [use-chat-file](../../src/hooks/use-chat-file.ts), [PDF](../../src/components/file-viewer/pdf-pages.tsx), [DOCX](../../src/components/file-viewer/docx-page.tsx), [voice](../../src/components/chat-composer/use-voice-input.ts), [clipboard](../../src/lib/clipboard.ts).

## 5. Модели, стоимость и тарифы

Каталог и capability matrix уже централизованы. `defaultSettings`, `modelSettings`, `settingOptions` и `normalizeSettings` должны оставаться единой точкой правил. Не строить собственные списки моделей для тарифов или отдельных экранов. Названия и цены в коде — снимок интерфейса, а не подтверждение текущей доступности у провайдеров.

`estimateCost` нормализует настройки, суммирует base price и `boost` активных choices, обрезает минимум до 0 и умножает на количество. Скрытые настройки старой модели не должны увеличивать оценку. Надбавки toggles сейчас не используются. В интерфейсе встречаются «молекулы» для цены запроса и «токены» для баланса/тарифов; единицы и конверсия не согласованы в API.

Тарифы берутся из [data/tariffs](../../src/data/tariffs.ts): месячные Промо/Про/Плюс/Эксперт/Максимум; годовые Про/Эксперт/Максимум. Промо — разовый. Годовой `total` нельзя пересчитывать как округлённый `month × 12`. Пакеты, годовые цены, скидки и allowance также статичны. `tariffModels` использует общий каталог и исключает video для Промо; это **не реализация серверного entitlement**.

Production должен возвращать authoritative quote, валюту/единицу, срок действия оценки и доступность выбранных возможностей. Недостаточный баланс, изменение цены, занятый провайдер и частично успешный batch требуют отдельных согласованных состояний. Нельзя списывать клиентский `cost` без серверного расчёта.

## 6. Предлагаемый слой адаптеров — требует согласования

Это направление реализации для frontend/backend leads, **не существующий API и не требование к URL endpoint**. Сохранить UI-модели и изолировать преобразования в adapters, чтобы интерфейс мог работать как с demo fixtures, так и с сервером.

```ts
// Предложение: расширить текущие состояния для реальных запросов.
type RequestFailure = {
  code: string
  message: string       // локализованный текст: что случилось + действие
  retryable: boolean
  retryAfterMs?: number
}

type JobState =
  | "queued" | "running" | "succeeded"
  | "failed" | "cancelled"

type UploadedReference = {
  fileId: string        // серверный ID; не blob URL
  purpose: "attachment" | "start-frame" | "end-frame" | "template-photo"
}

type GenerationRequest = {
  requestId: string     // стабильный idempotency key повтора отправки
  chatId?: string
  projectId?: string
  mode: "text" | "image" | "video" | "audio"
  modelId: string       // серверный ID; UI label сопоставляет adapter
  prompt: string
  references: UploadedReference[]
  settings: Record<string, unknown> // wire schema согласовать для каждого mode
  roleId?: string
  templateId?: string
  quoteId?: string
}
```

| Адаптер | Необходимые операции и ответы | UI связывание |
| --- | --- | --- |
| Session | Получить session; запросить/повторить/проверить OTP; начать OAuth; выйти; обработать expiry | `AuthProvider`, `AuthModal`; сохранить draft на expiry, не отправлять повторно без политики |
| Workspace | List/get/create/update/archive/restore/delete; cursor/total для истории; версионирование изменения | `HubProvider`, поиск, проекты, архив, pins; pending + rollback/ошибка |
| Files | Upload/progress/cancel, metadata, authorized preview/download, delete; статус обработки | Композер и project files; отправка только после готовности обязательных refs |
| Chat | История с cursor; submit; stream/reconnect; stop; regenerate; rating | Сопоставить server message/job IDs и локальные pending IDs; защита от дубликатов |
| Generation | Submit/status/list/cancel/retry; partial results по batch | Общая работа студий, toasts по готовности вне экрана, повторное чтение после reload |
| Account/Billing | Balance/plan; quote; checkout; payment status; receipt/history при включении в scope | Согласовать loading/error для balance; не показывать paid success до подтверждения |
| Roles | Каталог/version, preferences, review, usage | Сохранить ID и selected role; серверная идемпотентность учёта сессий |
| Sharing | Create/get/revoke shared link; permission scope | Отдельное состояние ссылок и отозванного/недоступного доступа |

Для всех мутаций: stable ID, server timestamp, типизированная ошибка, отмена/повтор, отсутствие дубликатов после retry, отсутствие «успеха» до результата. Для stream: ordered event ID, resume/reconciliation, завершение и разрыв соединения. Конкретные транспорт и endpoint выбирает backend; не закреплять SSE/WebSocket только потому, что UI выглядит потоковым.

## 7. Обязательная замена demo поведения

1. Убрать произвольный demo-код, social timers и общий browser-account; обеспечить изоляцию истории/файлов по user ID. OTP `1234` остаётся только в явно тестовом окружении.
2. Убрать случайные ответы/готовые картинки/таймеры как источник истины. После reload сверять status server job; не переводить задания в ready автоматически.
3. Передавать весь payload: `files`, `frames`, template photo, `role`, settings, project ID. Сейчас студийный `generate` не получает bytes референсов; `sendChatMessage` не получает instructions/settings/role как контекст для модели.
4. Подключить реальный контекст проекта: инструкции и файлы сейчас сохранены и показаны UI, но демоответ их не читает. Определить границы доступа и актуальную версию контекста.
5. Убрать hardcoded balance; подключить server quote, entitlement и checkout. После ошибки billing сохранять draft и объяснять следующее действие.
6. Подключить реальный аудиоплеер или явно исключить его из запуска. Текущий эквалайзер не доказывает, что музыка воспроизводится.
7. Разделить deep link и share link; не обещать доступ с другого устройства, пока данные остаются только локальными.
8. Добавить runtime validation и миграции persisted state. Не импортировать demo контент в production аккаунт без выбранной политики.
9. Добавить failed/cancelled/queued/expired/forbidden/empty states, loading CRUD и ошибки сети; согласовать retry/cancel/refund для каждого mode.
10. Удалить демообещания из auth/copy или подтвердить реальными возможностями: бесплатный запрос, продолжение на телефоне, сохранение диалогов.

## 8. Реестр вопросов для запуска реализации

Статус всех вопросов: **открыт**. Роли владельцев предложены, конкретные люди не назначены. «Блокирует» относится к соответствующему production этапу, а не к старту сборки UI. До ответа действуют безопасные defaults ниже; они не являются бизнес-решениями.

| ID | Решение, которое нужно принять | Владелец | Default для фронта до ответа | Блокирует |
| --- | --- | --- | --- | --- |
| Q01 | Какой API/schema и кто владеет workspace, пагинацией, CRUD/конфликтами? | Backend lead + frontend lead | Adapter + fixtures; сохранить текущую UI-модель | Подключение реальных данных |
| Q02 | Какие OTP/OAuth провайдеры, session lifecycle, logout policy, права и поведение после входа? | Backend/auth owner + product | Сохранить draft; действия после входа требуют повторного подтверждения пользователя; demo только локально | Реальный вход и данные пользователей |
| Q03 | Job/stream protocol, reconnect, stop/regenerate, partial batch, retry и возврат списания? | Generation/backend owner | Явная ошибка/повтор; reload запрашивает статус; не обещать completed до server event | Реальная генерация |
| Q04 | «Токены» и «молекулы» — одна единица? Актуальные цены, entitlements, free request, quote/checkout/refund? | Product + billing owner | Значения из кода только fixtures; `cost` приблизителен | Платная генерация и checkout |
| Q05 | Какие стабильные model IDs, capability schema и кто обновляет каталог? | Model platform owner + frontend lead | Текущий каталог для демонстрации; adapter map label → ID | Вызовы провайдеров |
| Q06 | MIME/size/count/quotas, upload endpoint, обработка файлов, TTL URL, supported previews и retention? | File/backend owner + frontend lead | UI лимиты 10/20 × 25 MiB; server проверяет заново; ref в request только после upload | Файлы и контекст |
| Q07 | Как объединяются роль, инструкции проекта, его файлы и история? Что при изменении/архиве/удалении проекта? | Product + AI/backend owner | Передавать IDs/context version; не заявлять чтение файлов до backend | Проектные чаты |
| Q08 | Публичные или приватные shared links, доступ, отзыв, срок действия, гостевой просмотр? | Product + backend owner | Считать нынешнее действие только копированием deep link | Публикация функции sharing |
| Q09 | Есть ли реальный audio API/плеер, формат файлов и требуется ли browser speech fallback? | Audio/backend owner + frontend lead | Не считать визуальный playing состоянием реального playback | Аудиостудия и voice обещания |
| Q10 | Откуда статистика ролей, можно ли редактировать отзыв, нужна ли модерация, что считается сессией? | Product + backend owner | Локальная статистика обозначена fixtures; один chat/role counted once | Реальные отзывы/статистика |
| Q11 | Какие разделы-заглушки входят в релиз; нужна ли миграция локальных данных; rollout и разрешение публикации? | Product owner + frontend lead | Реализовывать только описанные рабочие экраны; без миграции demo в аккаунт и без публикации | Scope и выпуск |
| Q12 | Browser support, accessibility target, доступный PDF reader, performance budgets, допуск существующих UI исключений? | Frontend lead + QA + designer | Проверять 375/1100, обе темы, клавиатуру/reduced motion; добавить real-device iOS/Android; замерить baseline | Приёмка релиза |

План этапов и проверяемые критерии находятся в [06 — Приёмка и выпуск](06-acceptance-and-release.md).
