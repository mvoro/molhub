# Molhub · AI Hub

Русскоязычный интерфейс AI Hub: чаты, фото, видео, музыка, роли и проекты.
React 19, TypeScript, Vite, Tailwind CSS и shadcn/ui.

**Сайт:** https://mvoro.github.io/molhub/

## Локальный запуск

Нужен Node.js 24.

```sh
npm ci
npm run dev
```

## Проверки

```sh
npm test
npm run build
npm run lint
```

Storybook: `npm run storybook` (порт 6007).

## GitHub Pages

Каждый push в `main` запускает `.github/workflows/deploy-pages.yml`:
установка зависимостей, тесты, сборка и публикация на GitHub Pages.
В Settings → Pages источником выбран GitHub Actions.

В CI `VITE_BASE_PATH=/molhub/` задаёт префикс ресурсов, навигации и ссылок.
Локальная разработка остаётся на `/`.
`404.html` содержит приложение, чтобы прямые ссылки на чаты, проекты и студии
открывались на статическом хостинге. При таком входе Pages возвращает HTTP 404,
а интерфейс восстанавливает нужный раздел.

Проверить сборку с тем же адресом локально:

```sh
VITE_BASE_PATH=/molhub/ npm run build
VITE_BASE_PATH=/molhub/ npm run preview
```

Это клиентский прототип с демоданными и локальным состоянием браузера.
GitHub Pages публикует интерфейс; сервер генерации и синхронизация между
пользователями в этот репозиторий не входят.

Для отката отмените проблемный коммит в `main` и отправьте изменение:
workflow автоматически опубликует предыдущую версию приложения.
