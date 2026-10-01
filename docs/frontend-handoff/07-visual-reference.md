# 07. Визуальные референсы и журнал проверки

Снимки сделаны 29.09.2026 с локального `ai-hub` commit `3631ebe` в браузере Codex. Desktop 1100×800 и mobile 375×812 — CSS viewport, без реальной экранной клавиатуры. Приложение использует текущие демоданные; вход не обращается к OAuth-провайдеру.

Это 25 репрезентативных состояний, а не полная визуальная регрессия всех комбинаций. Экраны, не показанные здесь, описаны в [02](02-screens-and-flows.md); будущая полная матрица приёмки — в [06](06-acceptance-and-release.md). Снимки не отменяют исправления расхождений, перечисленных в [03](03-design-system.md).

## Что проверено визуально и через UI

- Гостевой экран, демонстрационная форма входа и возвращение к рабочему пространству после демо-входа.
- Переключение Фото/Видео/Аудио; переходы История → Стили/Шаблоны.
- Открытие выбора модели; каталог ролей и переход к деталям роли.
- Проект, вкладки Чаты/Файлы, открытие тарифов.
- Загрузка демочата с фото, открытие изображения на мобильной ширине.
- Мобильный sidebar, menu/submenu темы, light/dark, компактные табы.
- Отдельный render настоящего FileDropOverlay: desktop light и mobile dark, сохранение пропорций PNG.

В журнале основной проверочной вкладки и DnD fixture на момент завершения нет записей уровня error. Это наблюдение этих вкладок, не гарантия отсутствия ошибок во всех сценариях.

Не проверялись в рамках снимков: реальный backend, сетевые ошибки, настоящий OAuth/email, платежи, реальный аудиоплеер, screen reader, весь каталог Storybook, нативная клавиатура/камера/микрофон, системный drag файла с рабочего стола, все пограничные viewport. Прототипные операции удаления в пользовательских данных не выполнялись.

## Реестр снимков

| № | Состояние | Экран | Viewport / тема |
| --- | --- | --- | --- |
| 01 | [Гость · новый чат](screenshots/01-home-guest-desktop-light.png) | S01, S03 | 1100×800 / light |
| 02 | [Авторизация · выбор способа](screenshots/02-auth-desktop-light.png) | S02 | 1100×800 / light |
| 03 | [Новый чат · вошедший пользователь](screenshots/03-home-desktop-light.png) | S01, S03 | 1100×800 / light |
| 04 | [Выбор модели](screenshots/04-model-picker-desktop-light.png) | S04 | 1100×800 / light |
| 05 | [Фото · пустая история](screenshots/05-photo-empty-desktop-light.png) | S06 | 1100×800 / light |
| 06 | [Фото · стили](screenshots/06-photo-styles-desktop-light.png) | S06 | 1100×800 / light |
| 07 | [Видео · шаблоны](screenshots/07-video-templates-desktop-light.png) | S07 | 1100×800 / light |
| 08 | [Аудио · форма и библиотека](screenshots/08-audio-desktop-light.png) | S09 | 1100×800 / light |
| 09 | [Роли · каталог](screenshots/09-roles-desktop-light.png) | S14 | 1100×800 / light |
| 10 | [Роли · детали](screenshots/10-role-detail-desktop-light.png) | S15 | 1100×800 / light |
| 11 | [Проект · чаты](screenshots/11-project-chats-desktop-light.png) | S10 | 1100×800 / light |
| 12 | [Проект · файлы](screenshots/12-project-files-desktop-light.png) | S10, S13 | 1100×800 / light |
| 13 | [Тарифы](screenshots/13-tariffs-desktop-light.png) | S18 | 1100×800 / light |
| 14 | [Чат · вложенное фото](screenshots/14-chat-desktop-light.png) | S05 | 1100×800 / light |
| 15 | [Чат · мобильная версия](screenshots/15-chat-mobile-light.png) | S05 | 375×812 / light |
| 16 | [Просмотр фото · мобильная версия](screenshots/16-image-viewer-mobile-light.png) | S08 | 375×812 / light |
| 17 | [Sidebar открыт · мобильная версия](screenshots/17-sidebar-mobile-light.png) | S01 | 375×812 / light |
| 18 | [Чат · тёмная мобильная версия](screenshots/18-chat-mobile-dark.png) | S05 | 375×812 / dark |
| 19 | [Фото · мобильная история](screenshots/19-photo-mobile-dark.png) | S06 | 375×812 / dark |
| 20 | [Фото · мобильные стили](screenshots/20-photo-styles-mobile-dark.png) | S06 | 375×812 / dark |
| 21 | [Sidebar открыт · тёмная тема](screenshots/21-sidebar-mobile-dark.png) | S01 | 375×812 / dark |
| 22 | [Роли · мобильный нижний лист](screenshots/22-roles-mobile-light.png) | S14 | 375×812 / light |
| 23 | [Новый чат · desktop dark](screenshots/23-home-desktop-dark.png) | S01, S03 | 1100×800 / dark |
| 24 | [DnD · изолированное превью](screenshots/24-dnd-component-desktop-light.png) | S04 | 1100×800 / light |
| 25 | [DnD · изолированное превью dark](screenshots/25-dnd-component-mobile-dark.png) | S04 | 375×812 / dark |

## Галерея с условиями воспроизведения

### 01. Гость · новый чат

S01, S03 · 1100×800 / light. Открыть / в чистой сессии, включить светлую тему.

![Гость · новый чат](screenshots/01-home-guest-desktop-light.png)

### 02. Авторизация · выбор способа

S02 · 1100×800 / light. В гостевом режиме нажать «Войти». Медиа-карусель может показывать другой слайд.

![Авторизация · выбор способа](screenshots/02-auth-desktop-light.png)

### 03. Новый чат · вошедший пользователь

S01, S03 · 1100×800 / light. Демонстрационный вход через Google, экран /. Виден sidebar с демо-историей и проектами.

![Новый чат · вошедший пользователь](screenshots/03-home-desktop-light.png)

### 04. Выбор модели

S04 · 1100×800 / light. Новый чат → кнопка модели. Поле поиска и radio-items в AppMenu.

![Выбор модели](screenshots/04-model-picker-desktop-light.png)

### 05. Фото · пустая история

S06 · 1100×800 / light. Фото → История до генерации. Набор идей случайный, точный состав карточек не фиксируется.

![Фото · пустая история](screenshots/05-photo-empty-desktop-light.png)

### 06. Фото · стили

S06 · 1100×800 / light. Фото → Стили. Сетка медиа, название на градиенте, композер поверх нижней части ленты.

![Фото · стили](screenshots/06-photo-styles-desktop-light.png)

### 07. Видео · шаблоны

S07 · 1100×800 / light. Видео → Шаблоны. Видео может менять poster/кадр при воспроизведении.

![Видео · шаблоны](screenshots/07-video-templates-desktop-light.png)

### 08. Аудио · форма и библиотека

S09 · 1100×800 / light. Аудио → Авто. Слева форма, справа группировка песен по проектам.

![Аудио · форма и библиотека](screenshots/08-audio-desktop-light.png)

### 09. Роли · каталог

S14 · 1100×800 / light. Открыть Роли из sidebar. Один AppSheet, фильтр категорий и pill-табы.

![Роли · каталог](screenshots/09-roles-desktop-light.png)

### 10. Роли · детали

S15 · 1100×800 / light. В каталоге открыть «Сценарист Reels». Сохраняется возможность вернуться к каталогу.

![Роли · детали](screenshots/10-role-detail-desktop-light.png)

### 11. Проект · чаты

S10 · 1100×800 / light. Sidebar → «Новый чат в проекте “Лендинг кофейни”». Это вход в страницу проекта; простой клик по его строке раскрывает список.

![Проект · чаты](screenshots/11-project-chats-desktop-light.png)

### 12. Проект · файлы

S10, S13 · 1100×800 / light. В проекте выбрать вкладку «Файлы».

![Проект · файлы](screenshots/12-project-files-desktop-light.png)

### 13. Тарифы

S18 · 1100×800 / light. Нажать баланс. Снимок фиксирует демо-контент, не подтверждает актуальные коммерческие условия.

![Тарифы](screenshots/13-tariffs-desktop-light.png)

### 14. Чат · вложенное фото

S05 · 1100×800 / light. Открыть демочат «Фото: ревью съёмки десерта», дождаться загрузки IndexedDB и вложения.

![Чат · вложенное фото](screenshots/14-chat-desktop-light.png)

### 15. Чат · мобильная версия

S05 · 375×812 / light. Тот же демочат, sidebar закрыт. Зафиксирован установившийся layout после смены viewport.

![Чат · мобильная версия](screenshots/15-chat-mobile-light.png)

### 16. Просмотр фото · мобильная версия

S08 · 375×812 / light. В демочате нажать превью Десерт.jpg.

![Просмотр фото · мобильная версия](screenshots/16-image-viewer-mobile-light.png)

### 17. Sidebar открыт · мобильная версия

S01 · 375×812 / light. Нажать бургер и дождаться завершения сдвига workspace.

![Sidebar открыт · мобильная версия](screenshots/17-sidebar-mobile-light.png)

### 18. Чат · тёмная мобильная версия

S05 · 375×812 / dark. Аккаунт → Тема → Тёмная; sidebar закрыт.

![Чат · тёмная мобильная версия](screenshots/18-chat-mobile-dark.png)

### 19. Фото · мобильная история

S06 · 375×812 / dark. Фото → История. Compact-табы в строке бургера; неактивный таб визуально сокращён.

![Фото · мобильная история](screenshots/19-photo-mobile-dark.png)

### 20. Фото · мобильные стили

S06 · 375×812 / dark. Фото → Стили. Проверены сетка и расположение композера.

![Фото · мобильные стили](screenshots/20-photo-styles-mobile-dark.png)

### 21. Sidebar открыт · тёмная тема

S01 · 375×812 / dark. Открыть мобильный sidebar из фотостудии.

![Sidebar открыт · тёмная тема](screenshots/21-sidebar-mobile-dark.png)

### 22. Роли · мобильный нижний лист

S14 · 375×812 / light. Sidebar → Роли. Каталог перестраивается в мобильную композицию.

![Роли · мобильный нижний лист](screenshots/22-roles-mobile-light.png)

### 23. Новый чат · desktop dark

S01, S03 · 1100×800 / dark. Новый чат → Аккаунт → Тема → Тёмная.

![Новый чат · desktop dark](screenshots/23-home-desktop-dark.png)

### 24. DnD · изолированное превью

S04 · 1100×800 / light. Открыть previews/file-drop.html через Vite. Реальный FileDropOverlay принудительно active=true, без имитации системного drag.

![DnD · изолированное превью](screenshots/24-dnd-component-desktop-light.png)

### 25. DnD · изолированное превью dark

S04 · 375×812 / dark. Открыть previews/file-drop.html?theme=dark. Это проверка композиции, alpha и размеров, а не тест нативного DnD на телефоне.

![DnD · изолированное превью dark](screenshots/25-dnd-component-mobile-dark.png)

## Как обновлять эталоны

Снять новый кадр после загрузки шрифтов, изображений и завершения transition. Сохранять viewport, тему, route и fixture. Динамические идеи, даты, слайды авторизации и кадры видео могут отличаться; сравнивать прежде всего геометрию, визуальную иерархию и правила состояний. Не принимать промежуточный кадр анимации за финальный layout.

DnD fixture находится в [previews/file-drop.html](previews/file-drop.html) и [previews/file-drop.tsx](previews/file-drop.tsx); открывается через запущенный Vite, поскольку импортирует действующий React-компонент. В офлайн HTML-справочнике используются уже сохранённые PNG. Превью не добавлено в routing приложения и не изменяет его компоненты.
