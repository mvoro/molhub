# 06. Приёмка, QA и план реализации

База: commit `3631ebe`, 29.09.2026. Этот файл разделяет **выполненные проверки**, **критерии будущей приёмки** и **известные ограничения**. Таблица сценариев ниже — задания для QA; наличие строки не означает, что браузерный сценарий уже пройден.

## 1. Что проверено при подготовке handoff

В корне `ai-hub` выполнены:

| Команда | Результат | Ограничение результата |
| --- | --- | --- |
| `npm test` | 75/75 pass; 0 fail/skip | Node tests логики и изолированного message store; не E2E |
| `npm run build` | Pass: TypeScript build + Vite production build | Vite предупреждает о chunk >500 kB |
| `npm run lint` | Exit 0; 31 warning | 28 `only-export-components`; 3 `set-state-in-effect`; warning baseline не равен отсутствию замечаний |

Крупные результаты build: main JS 1340,74 kB / gzip 401,13 kB; reveal chunk 583,55 kB / gzip 148,76 kB; PDF worker 1265,41 kB; CSS 301,80 kB / gzip 45,12 kB. Это размеры артефактов конкретной сборки, не показатели скорости загрузки на телефоне. Основной риск для замера — начальная загрузка и первый запуск тяжёлого preview/reveal. Целевой бюджет согласовать по Q12.

Тесты и build не проверяют настоящие OAuth, платежи, провайдеров генерации, сеть, доступность PDF, реальные браузеры или экранную клавиатуру. В [Storybook config](../../.storybook/preview.tsx) a11y имеет `test: "todo"`; установленный addon не означает обязательный accessibility gate.

## 2. Условия воспроизводимой проверки

1. Использовать согласованный commit и записывать его в QA report. Команды запускать из корня `ai-hub`; основной preview `npm run dev -- --port 5192`, Storybook `npm run storybook` на 6007. Для проверки production assets дополнительно `npm run build` и `npm run preview`.
2. Начинать в отдельном браузерном профиле, чтобы не стирать рабочую историю пользователя. Проверить два fixture-набора: чистый гость и вошедший demo-пользователь с чатами/проектом/файлами. Demo email допускает синтаксически корректный адрес; код `1234` проходит, `0000` показывает ошибку; письмо не отправляется.
3. Базовые viewport: 375×812 и 1100×800. Проверить обе темы, затем 767/768/769px (граница sheet/dialog), 320px и широкий desktop как стресс-проверку. Высоты и ширины дополнительных viewport — предложение QA, не новый дизайн-токен.
4. Для desktop — pointer и keyboard отдельно. Для mobile — реальное iOS Safari и Android Chrome: виртуальная клавиатура, камера/галерея, safe area, touch scroll. Эмуляция размера не подтверждает поведение native picker и микрофона.
5. В каждом основном flow записать console errors, network failures, focus position, результат действия и сохранение после reload. Для ошибок сети использовать управляемый mock adapter; случайные таймеры demo не подходят для воспроизводимых сетевых тестов.
6. Для сравнения скриншотов отключить nondeterministic генерацию/время/автослайды и зафиксировать fixture-контент. Не сравнивать случайные demo-картинки пиксель в пиксель.

## 3. Приёмочные сценарии

`UI` — проверяется на существующем локальном прототипе. `PROD` — нужен реальный adapter или согласованный contract mock. `Решение` — ожидаемый результат надо закрепить по вопросу или дефекту до реализации.

### Вход, навигация и оболочка

| ID | Условия — GIVEN | Действие — WHEN | Проверяемый результат — THEN | Контур |
| --- | --- | --- | --- | --- |
| AC01 | Чистый гость, введён draft | Нажать отправку/модель/вложение | Открывается один auth sheet; draft остаётся; действие не выполняется. Список личных чатов скрыт | UI |
| AC02 | Email-шаг | Ввести некорректный email и отправить | Видна русская ошибка, введённое сохранено, можно исправить. После корректного адреса — код, countdown 30s | UI |
| AC03 | Шаг кода | `0000`, затем `1234`; проверить resend/Back/Close во время ожидания | Ошибка возвращает focus в code input на desktop; успешный вход показывает success; нет двух job одновременно; закрытие не завершает отложенный вход | UI |
| AC04 | Авторизация закончилась | Закрыть success, снова выполнить исходное действие | Действие доступно; сессия восстанавливается после reload. Не предполагать автоматическую отправку draft после входа | UI |
| AC05 | Реальная сессия истекла, есть draft/файлы | Отправить | Понятное восстановление входа без потери draft и двойного запроса/списания; чужие данные не отображаются | PROD/Q02 |
| AC06 | Открыт каждый рабочий раздел | Прямой URL, reload, Back/Forward, переход между проектами | `/`, `/photo`, `/video`, `/audio`, `/c/:id`, `/project/:id` восстанавливаются; `?tab=media/files` принадлежит правильному проекту; assets работают при base path | UI |
| AC07 | Ширина 375px, сайдбар закрыт | Открыть бургер, перейти в чат, открыть submenu | Один тап открывает; выбор закрывает sidebar там, где предусмотрено; submenu меняется внутри меню и даёт Back; нет горизонтального выхода за экран | UI |
| AC08 | Тема system/light/dark | Переключить тему, сменить OS в system, reload | Весь экран, portals, viewer, toast следуют теме; выбор сохранён; нет части экрана старого цвета | UI |
| AC09 | Chat search, доступна клавиатура | `⌘K`/`Ctrl+K`, ввести запрос, выбрать результат, Escape | Поиск без анимации desktop; клавиши выбора работают; focus возвращается к триггеру; пустой результат понятен | UI |

### Композер и сообщения

| ID | Условия — GIVEN | Действие — WHEN | Проверяемый результат — THEN | Контур |
| --- | --- | --- | --- | --- |
| AC10 | Desktop, не пустой draft | Enter, Shift+Enter; повторить с touch keyboard | Desktop Enter отправляет, Shift+Enter переносит; coarse pointer Enter добавляет строку, отправляет кнопка. Пустой запрос без файлов не уходит | UI |
| AC11 | Выбрана модель с расширенными настройками | Сменить модель и режим; вернуться/reload | Недоступные controls скрыты, stale surcharge не сохраняется; допустимые настройки нормализованы; роли и модель чата восстановлены по правилам | UI |
| AC12 | Модель поддерживает/не поддерживает attachments | Выбрать/drop/paste файл; превысить size/count | Одинаковая проверка для всех способов. Ровно 25 MiB проходит, +1 byte не проходит; модельный лимит не обходится. Нет утечки Blob URL после удаления/отправки | UI |
| AC13 | Активна диктовка с исходным draft | Надиктовать, отправить/сменить экран; запретить permission | Слова добавляются; late result не возвращает отправленный текст; listening останавливается; ошибки/нет API объяснены на русском | UI, real device |
| AC14 | Отправлен текстовый запрос | Дождаться ответа, уйти в другой чат и вернуться | `thinking → streaming → done`; кнопка stop только пока активно; отправка не дублируется; навигация не обрывает генерацию | UI |
| AC15 | Идёт thinking/drawing/streaming | Stop и reload | Сохраняется только показанная часть; готовое изображение остаётся; незавершённое не появляется. Для production reload сверяет server status | UI + PROD |
| AC16 | Ответ завершён | Copy, like, повторный like, dislike, regenerate | Копируется видимый текст; повторный rating снимает выбор; regenerate заменяет ответ в текущем demo. Production политика сохранения версий определена | UI/Q03 |
| AC17 | Длинная история, пользователь выше конца | Приходят новые токены; нажать вниз | Скролл не отнимается у читающего старые сообщения; кнопка к концу доступна; последний текст не скрыт композером/мобильной шапкой | UI |
| AC18 | История грузится/IndexedDB ошибается/нет сообщений | Открыть чат, нажать «Повторить» | Разные loading/error/empty; retry не затирает сохранённую историю; send до hydration не теряет старые сообщения | UI |
| AC19 | Введён важный draft | Выбрать quick action/идею | Замена восстанавливается через «Вернуть» либо явно согласованное поведение. Текущее quick action не даёт Undo — GAP02 | Решение |
| AC20 | Реальный stream оборвался/429/5xx/timeout | Повторить/отменить, восстановить сеть | Типизированная ошибка с действием, draft/partial output сохранены, retry не удваивает запрос или списание; rate-limit учитывает retry delay | PROD |

### Студии и медиа

| ID | Условия — GIVEN | Действие — WHEN | Проверяемый результат — THEN | Контур |
| --- | --- | --- | --- | --- |
| AC21 | Фото-модель поддерживает batch | Выбрать count 1/4, отправить, уйти из студии | Количество соответствует capability; placeholders имеют выбранную форму; результат/тост один раз по завершении batch; повторное открытие не проигрывает reveal заново | UI |
| AC22 | Требуется стартовый кадр или фото шаблона | Отправить без фото, затем с фото | Без фото — понятная ошибка и отсутствие job; с фото — выбранный ref действительно передан в production adapter | UI + PROD |
| AC23 | Готовая фото/видеокарточка | View, download, move to project, remove, Undo | Viewer/download соответствуют файлу; переносит одну карточку; Undo восстанавливает удалённую карточку; не дублирует её | UI |
| AC24 | Batch частично failed, сеть пропала, reload | Вернуть сеть/открыть ленту | Показывает точные статусы каждого результата; не превращает все в ready; retry/cancel и стоимость согласованы | PROD/Q03 |
| AC25 | Аудио «Авто»/«Детальный» | Сменить режим/версию/Без вокала; отправить | Два результата; detailed style ≤200 для Suno V4/V3.5, ≤1000 для остальных; недопустимое значение не уходит; поля/target сохранены по UX | UI |
| AC26 | Реальная готовая песня | Play/pause, переход в другой раздел, сбой загрузки | Один настоящий player; звук и состояние синхронны; duration/time корректны; ошибка не оставляет вечное playing. Demo сейчас имитирует только эквалайзер | PROD/Q09 |

### Проекты, файлы, роли и тарифы

| ID | Условия — GIVEN | Действие — WHEN | Проверяемый результат — THEN | Контур |
| --- | --- | --- | --- | --- |
| AC27 | Новый проект | Ввести пустое/длинное имя, создать, сменить иконку/цвет | Пустое не создаётся; cap 45; внешний вид использует catalog ID; проект попадает в sidebar; timestamps и выбранная вкладка согласованы | UI |
| AC28 | Проект с инструкциями и файлами | Отправить новый запрос из проекта | UI сохраняет инструкции ≤8000; production request реально содержит project/context reference и выбранную роль | UI + PROD/Q07 |
| AC29 | В проекте 18 файлов | Добавить 5 допустимых; параллельно ещё файлы | Ровно 2 добавлены, остальные объяснены; pending входит в cap 20; при storage failure нет ghost metadata; успех означает записанные bytes | UI |
| AC30 | Metadata есть, Blob удалён; broken PDF/DOCX; text >2 MiB | Открыть/скачать/загрузить снова | Недоступность объяснена; reload заменяет тот же ID; ошибка preview не блокирует доступный download; большой text не зависает | UI |
| AC31 | Desktop с PDF/Word/Markdown в чате; затем mobile | Открыть артефакт, resize/expand/Escape | Desktop panel 35–65%, expand/restore сохраняет выбранную ширину; на mobile sheet; scroll и focus корректны; Markdown/source безопасны | UI |
| AC32 | Чат закреплён, проект содержит чат/медиа | Archive/Undo, restore, move | Архив снимает pin; Undo возвращает прежний pin; перенесённый чат отсутствует в общей истории; просмотр архивного проекта не создаёт неожиданных изменений | UI |
| AC33 | Проект содержит чат, Blob, фото, видео, песню | Confirm delete | Чаты/файлы проекта удалены; медиа/песни остались без проекта; текущий экран получает корректный fallback; отмена confirm ничего не меняет | UI |
| AC34 | Общая история содержит pinned и unpinned text chats | «Очистить историю» | Число и формулировка confirm совпадают с фактически удалённым набором; projects/archive/media сохранены. Сейчас mismatch — GAP01 | Решение |
| AC35 | Каталог ролей с фильтром/scroll | Detail → review → Back → выбрать роль | Один AppSheet, без modal stack; category/tab/scroll не потеряны; выбранная роль видна и picker скроллит к ней | UI |
| AC36 | Роль с local state, открыты две вкладки | Like/favorite/review, новая сессия, повторный use | Состояния согласованы; ≤500 символов, пустой review запрещён; сессия chat/role считается один раз; чужой storage update не откатывает новое | UI |
| AC37 | Открыты тарифы | Month/year, tariff details, token pack, purchase | Нужные планы и source суммы; annual total не пересчитан из округления; Промо без video; demo purchase показывает только заглушку | UI |
| AC38 | Production quote/checkout | Недостаток баланса, новая цена, cancel/success/delayed payment | Не выдавать paid success заранее; draft сохранён; баланс сверяется с сервером; повторный return не удваивает начисление | PROD/Q04 |
| AC39 | Чат/проект, Clipboard API недоступен | Поделиться/Copy | Fallback копирует точный текст; один success toast и screen-reader feedback только после фактического копирования, без ложного success. Чужое устройство получает доступ только через согласованный share API | UI + PROD/Q08 |

### Общие состояния и accessibility

| ID | Условия — GIVEN | Действие — WHEN | Проверяемый результат — THEN | Контур |
| --- | --- | --- | --- | --- |
| AC40 | Открыты menu/popover/sheet/confirm | Tab/Shift+Tab, arrows, Enter/Space, Escape | Focus виден; modal trap и возврат focus; доступные русские имена; один nonmodal popover; соседний trigger работает с первого клика | UI |
| AC41 | `prefers-reduced-motion: reduce`; отдельно keyboard modality | Открыть overlays, сменить тему, получить результат | Необязательное движение отключено/сокращено; frequent/keyboard actions без анимации; нет бесконечной декоративной анимации | UI |
| AC42 | Все основные страницы при 375/1100, light/dark | Zoom 200%, длинные русские названия/ошибки | Нет потери CTA/горизонтальной прокрутки страницы; иконки/disabled/focus различимы; контраст измерен, информация не только цветом | UI |
| AC43 | VoiceOver/NVDA в чате/overlay/file view | Пройти labels/status/copy/errors | Нет английских служебных labels; ошибки связаны с полем; stream не спамит live announcements; document доступен альтернативным способом | UI + Q12 |
| AC44 | Нет localStorage/IndexedDB/quota, два аккаунта, две вкладки | Mutate/reload/logout/login | Нет crash; состояние сохранения объяснено; чужой аккаунт не видит историю; критичные изменения не теряются молча. Текущий demo не даёт account isolation | UI + PROD |
| AC45 | Медленная сеть/CPU, длинная лента/PDF | Первый экран, scroll, первый heavy preview | Зафиксированы загрузка, input responsiveness, layout shifts, память; lazy chunks не вызывают blank/crash; бюджет согласован по Q12 | PROD |

## 4. Что покрывают имеющиеся тесты

| Набор | Уже защищено | Что добавить при реализации |
| --- | --- | --- |
| [auth](../../tests/auth.test.ts) | Parse session, demo validation, identity | Реальный session expiry, authorization, login flow, logout/cache isolation |
| [composer-models](../../tests/composer-models.test.ts), [chat-config](../../tests/chat-config.test.ts) | Catalog, capability defaults, normalization, migration, estimate | UI матрица моделей, сериализация wire payload, actual upload/quote |
| [chat-storage-lifecycle](../../tests/chat-storage-lifecycle.test.ts) | Hydration/send race, error retry, checkpoints, delete/write race, Blob lifetime | Настоящий IndexedDB браузера, reconnect/server conflicts, end-to-end stream |
| [chat-attachments](../../tests/chat-attachments.test.ts), [clipboard](../../tests/clipboard.test.ts), [client-id](../../tests/client-id.test.ts) | MIME fallback, artifact metadata, clipboard fallback, nonsecure IDs | Camera/paste real device, downloads/CORS, preview failure and accessibility |
| [roles](../../tests/roles.test.ts) | Catalog ID, search utilities, review validation, preferences merge, unique sessions | UI navigation/scroll/focus, server reviews/statistics; наличие search utility не означает поиск в каталоге |
| [project-file-limits](../../tests/project-file-limits.test.ts) | Size/count boundaries, partial batch и тексты | Upload progress/cancel, quota, pending race, server limits |
| [project-tabs](../../tests/project-tabs.test.ts), [pages-routing](../../tests/pages-routing.test.ts) | URL/base path/tab mapping | Direct browser loads, session/auth redirect, missing/forbidden resource |
| [project-normalize](../../tests/project-normalize.test.ts), [project-colors](../../tests/project-colors.test.ts), [project-dates](../../tests/project-dates.test.ts), [music-migration](../../tests/music-migration.test.ts) | Нормализация/migration/formatters | Миграция реальных данных и серверных DTO, large collection |

В package scripts нет настроенного browser E2E runner. Не считать stories визуальными regression tests: для них нужно отдельно настроить runner, fixtures и screenshots. Предлагаемый минимум автоматизации: critical flows AC01–05, AC10–18, AC22, AC29, AC33–34; contract tests для adapter; визуальные snapshots только ключевых экранов/состояний. Ручные проверки real device, screen reader и motion остаются необходимыми.

## 5. Известные расхождения и ограничения до production

Это выводы чтения исходников; браузерное воспроизведение отмечается отдельно в QA report. Они не исправлялись при подготовке документации.

| ID | Наблюдение и источник | Приоритет / следующий шаг |
| --- | --- | --- |
| GAP01 | `app-sidebar` считает только видимые unpinned recent chats для подтверждения, `Hub.clearHistory` удаляет все неархивные text chats вне проектов, включая pinned | **Блокер приёмки destructive action.** Согласовать scope и использовать одну selection-функцию для count/delete. [sidebar](../../src/components/app-sidebar.tsx), [hub](../../src/hooks/use-hub.tsx) |
| GAP02 | Quick action вызывает `fill`, который перезаписывает draft; комментарий обещает «Вернуть», реальная цепочка этого не делает | Исправить сохранность draft до сдачи этого flow или согласовать UX. [quick-actions](../../src/components/quick-actions.tsx), [chat-composer](../../src/components/chat-composer/chat-composer.tsx) |
| GAP03 | В UI сохранены контекст проекта и референсы, но demo generation их не использует | **Блокер реальной генерации**, Q06–Q07. Не путать проверку отображения upload с чтением файла моделью |
| GAP04 | OTP/OAuth, history sync, баланс, payment, job generation и audio playback — demo | **Блокер соответствующих production функций**, Q01–Q04/Q09; см. [05](05-data-and-integration.md) |
| GAP05 | Общие localStorage/IndexedDB не разделены по user; выход не очищает историю | **Блокер реальных аккаунтов**, Q02/Q11; тест двух пользователей обязателен |
| GAP06 | `/projects` распознаётся роутингом, но отдельный каталог проектов не реализован; ряд account/secondary sections — placeholders | Зафиксировать scope Q11; нельзя принимать наличие URL за готовый экран. [App](../../src/App.tsx), [routes](../../src/lib/routes.ts) |
| GAP07 | Mobile auth использует `fullscreen`; CLAUDE разрешает этот variant по явному запросу. Есть и другие визуальные/motion исключения из правил | Дизайнер фиксирует явные исключения или исправления; не распространять их как новый default. [auth-modal](../../src/components/auth/auth-modal.tsx), [CLAUDE](../../CLAUDE.md) |
| GAP08 | Нет failed/cancelled states для медиа, media/music reload без проверки превращает pending в ready | **Блокер lifecycle production**, Q03; добавить реалистичный mock ошибок до backend |
| GAP09 | PDF preview — canvas без текстового слоя; Storybook a11y только todo | Проверить screen reader и альтернативу download/text; согласовать целевой accessibility уровень Q12 |
| GAP10 | Build проходит с крупными chunk и lint warning baseline | Performance review Q12; не блокирует передачу дизайна, требует измерения/решения до релиза |

## 6. Пакеты реализации, зависимости и Definition of Done

Порядок ниже позволяет начать фронтенду сразу. Оценки в днях не даны: нужны состав команды, готовность API и объём production scope.

| Пакет | Вход / зависит от | Состав работы | Готово, когда |
| --- | --- | --- | --- |
| W0. Зафиксировать scope и контракты | Handoff; Q01–Q12 | Product/frontend/backend/QA назначают владельцев; отличают live screens от placeholders; фиксируют capabilities, error schema, rollout | У каждой блокирующей строки есть решение/владелец; API mock reproduces loading/error/success; GAP01/GAP02 имеют решение |
| W1. UI foundation и оболочка | W0 scope; правила CLAUDE | Токены, Geist, Hugeicons, ui primitives, AppSheet/AppMenu, tabs, тема, mobile shell, routes | 375/1100 + обе темы; keyboard/reduced motion; stories для изменённых ui; AC06–09/40–42 |
| W2. Workspace и авторизация | W1; Q01/Q02 | Session adapter; chat/project CRUD, pins/archive/search; account cache isolation; missing/forbidden screens | AC01–05/27/32–34/44; count/delete consistency; пользователь не видит чужих данных |
| W3. Файлы и чат | W2; Q03/Q06/Q07 | Upload adapter, pending refs, проектный контекст, chat stream/reconnect/stop/regenerate, artifacts | AC10–20/28–31; запрос не теряет refs/settings; partial reply и retry безопасны |
| W4. Фото/видео/аудио | W1–W3 adapters; Q03/Q05/Q09 | Server jobs, batch, templates/frame input, library/project relation, actual player, media errors | AC21–26/33; reload показывает server truth; реальный download/playback |
| W5. Роли и оплата | W2 + нужные generation contracts; Q04/Q10 | Roles API/preferences/reviews, entitlements, quote, checkout, payment reconciliation | AC35–39; источник статистики согласован; ни одно client значение не управляет списанием |
| W6. Полная приёмка и выпуск | W1–W5 in scope | E2E, visual checks, real devices, a11y, performance, regression и документация adapter | Все in-scope AC имеют evidence; нет блокеров; оставшиеся ограничения явно приняты владельцами |

W4 и W5 можно вести параллельно после базовых adapter contracts; UI W1 можно начать до готовности backend на fixtures. Реальная генерация не должна зависеть от внедрения всех вторичных разделов.

Общий DoD для каждого пакета: TypeScript/build pass; релевантные тесты; нет новых console errors; новые/изменённые `ui/*` имеют story со states; русские видимые и невидимые тексты; локальные токены/компоненты соблюдены; обе темы и breakpoint проверены; empty/loading/error/disabled предусмотрены; документация и контракт соответствуют реализованному поведению. Успешная сборка — один из пунктов, не вся приёмка.

## 7. Передача и выпуск

1. Frontend lead получает overview, спецификации экранов/компонентов, правила графики и эти два файла; подтверждает scope W0 и создаёт задачи W1–W6 с AC IDs.
2. Backend/product владельцы закрывают Q-решения в [05](05-data-and-integration.md). Изменение утверждённого UI, обещаний и destructive scope согласуют с дизайнером/product; обычные технические adapter decisions ведёт frontend/backend lead.
3. QA report хранит: commit, build/environment, browser/device/viewport/theme, AC ID, pass/fail/block, screenshot/video/log, defect ID, owner. У screenshot-сравнений фиксируются fixtures и дата.
4. Перед релизом smoke in-scope flows на production-like API: вход → запрос с вложением → готовый результат → reload → проект/архив; затем failure/retry, mobile keyboard и payment при включённом billing. Отдельно очистка истории/удаление проекта.
5. Проверить base path и прямые ссылки в целевом hosting, доступ PDF worker/assets, OAuth callbacks, CORS/download, runtime config. Secrets не помещать во frontend bundle. Rollback/version policy согласовать с владельцем релиза.
6. **Публикация только по отдельному явному запросу пользователя для текущих изменений.** Не делать `git push` в `main`, не запускать Pages/deploy и не публиковать другим способом в рамках подготовки handoff. Это действующее правило [AGENTS.md](../../AGENTS.md) и [CLAUDE.md](../../CLAUDE.md).

Шаблон строки отчёта:

```text
Commit: <hash>; окружение: <local/staging>; browser/device: <...>
Viewport/theme/input: <375×812 / dark / touch>
AC: AC22; результат: pass/fail/blocked
Evidence: <ссылка на screenshot/video/network log>
Defect / Q: <ID или нет>; владелец: <роль/имя>
Проверил: <имя>; дата: <ISO date>
```
