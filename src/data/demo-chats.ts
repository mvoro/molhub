import type { AssistantMessage, ChatMessage } from "../hooks/use-chat-messages"
import type { ChatArtifact, ChatAttachment } from "../lib/chat-attachments"
import { MOLLY_NAME } from "./models.ts"

const attachment = (id: string, name: string, type: string, size: number, src: string): ChatAttachment => ({ id, name, type, size, src })
const photo = attachment("demo-chat-photo", "Десерт.jpg", "image/jpeg", 14833, "/uploads/cream.jpg")
const brief = attachment("demo-chat-brief", "Бриф.pdf", "application/pdf", 608, "/demo/brief.pdf")
const menu = attachment("demo-chat-menu", "Меню.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 1008, "/demo/menu.docx")
const launch = [
  "# План запуска кофейни", "", "## До открытия",
  "- Утвердить меню и фотографии.", "- Опубликовать адрес и расписание.", "- Проверить форму предзаказа на телефоне.",
  "", "## Первая неделя", "| День | Действие |", "| --- | --- |",
  "| Понедельник | Рассказать о команде |", "| Среда | Показать сезонное меню |", "| Пятница | Пригласить на дегустацию |",
  "", "## Что измеряем", "Посещения страницы, предзаказы и повторные визиты.",
].join("\n")
const sql = "SELECT date_trunc('month', created_at) AS cohort, count(*) AS customers\nFROM customers\nGROUP BY 1\nORDER BY 1;"
const document = (id: string, name: string, content: string, type = "text/markdown"): ChatArtifact => ({
  id, name, type, content, size: new TextEncoder().encode(content).length,
})

type Example = { request: string; reply: string; files?: ChatAttachment[]; artifacts?: ChatArtifact[] }
const examples: Record<string, Example> = {
  c1: { request: "Предложите направление логотипа кофейни в стиле баухаус.", reply: "Основа — круг, прямоугольник и крупная типографика. Для знака можно соединить чашку и восходящее солнце. На вывеске оставьте один цвет, а в меню добавьте акцентный оранжевый." },
  c2: { request: "Как сравнить две модели для работы с кодом?", reply: "Возьмите одинаковые задачи из вашего проекта: исправление ошибки, рефакторинг и написание небольшого модуля.\n\n| Критерий | Как проверить |\n| --- | --- |\n| Корректность | Запустить тесты |\n| Понятность | Прочитать изменение без истории чата |\n| Скорость | Измерить время до решения |\n\nСохраните запросы и результаты, чтобы повторить сравнение после обновления моделей." },
  c3: { request: "Напишите план десятисекундного ролика о закате над морем.", reply: "0–3 с — общий план берега. 3–7 с — камера медленно приближается к воде. 7–10 с — солнце касается горизонта, остаётся только шум волн. Свет тёплый, движение плавное, без резких склеек." },
  c4: { request: "Подготовьте короткий текст озвучки для рилса про путешествия.", reply: "Иногда лучший маршрут — тот, который ещё не построен. Сверните на тихую улицу, зайдите за кофе и оставьте немного времени на неожиданное." },
  c5: { request: "Предложите первый экран лендинга кофейни у моря.", reply: "## Кофе, с которым можно не спешить\n\nСвежая выпечка, сезонное меню и столик у окна. Загляните по пути к морю.\n\n**Кнопка:** Посмотреть меню" },
  c6: { request: "Добавьте цены в рублях и отметьте новинки осеннего меню.", reply: "| Напиток | Цена |\n| --- | --- |\n| Капучино | 240 ₽ |\n| Тыквенный латте · новинка | 320 ₽ |\n| Облепиховый чай · новинка | 280 ₽ |\n\nЭто пример цен для макета." },
  c7: { request: "Напишите SQL-запрос: количество клиентов по месяцу регистрации.", reply: "Запрос группирует клиентов по месяцу создания записи. Файл можно открыть рядом с чатом.", artifacts: [document("demo-cohorts", "Когорты.sql", sql, "text/plain")] },
  c8: { request: "Предложите обработку портрета в стиле аниме.", reply: "Сохраните позу, причёску и выражение лица. Используйте чистый контур, мягкие тени и упрощённый фон.", files: [attachment("demo-portrait", "Портрет.jpg", "image/jpeg", 8385, "/uploads/portrait.jpg")] },
  c9: { request: "Подготовьте английскую версию первого слайда о кофейне.", reply: "## Coffee by the sea\n\nFreshly baked pastries, seasonal drinks, and a quiet table by the window.\n\n**Call to action:** Explore the menu" },
  c10: { request: "Напишите сценарий YouTube Shorts: как приготовить фильтр-кофе.", reply: "**0–3 с:** крупный план чашки.\n\n**3–12 с:** промойте фильтр, добавьте кофе, покажите первый пролив.\n\n**12–22 с:** медленно доливайте воду.\n\n**22–30 с:** готовая чашка — «Попробуйте и подберите помол под свой вкус»." },
  c11: { request: "Как проверить настройку Vite и shadcn?", reply: "1. Запустите dev-сервер.\n2. Проверьте импорт компонента через алиас.\n3. Откройте меню мышью и клавиатурой.\n4. Проверьте мобильную ширину и тёмную тему.\n5. Выполните production-сборку." },
  c12: { request: "Опишите заставку для подкаста о дизайне.", reply: "Инструментальное вступление на 8 секунд: тёплый синтезатор, мягкий бас и лёгкие ударные. Без вокала. В конце уберите ударные, чтобы голос ведущего вошёл без резкой смены громкости." },
  "demo-photo": { request: "Посмотрите на фото десерта. Что улучшить для меню кофейни?", files: [photo], reply: "Десерт хорошо отделён от фона. Для карточки меню я бы оставила больше воздуха сверху, выровняла свет и убрала отвлекающие детали по краям.\n\nОткройте фото, чтобы проверить детали в полном размере." },
  "demo-files": { request: "Проверьте бриф и меню. Подготовьте план запуска отдельным документом.", files: [brief, menu], reply: "Приложенные PDF и Word доступны для просмотра. Собрала пример плана запуска — его можно открыть, скопировать или скачать.", artifacts: [document("demo-launch", "План запуска.md", launch)] },
  "demo-video": { request: "Разберите этот фрагмент для короткого ролика.", files: [attachment("demo-chat-video", "Прогулка.mp4", "video/mp4", 88534, "/uploads/walk.mp4")], reply: "Начните с движения в кадре, сократите паузу перед поворотом камеры и завершите общим планом. Для вертикальной версии держите главный объект ближе к центру. Видео можно развернуть через кнопку под плеером." },
}

/** A known demo receives seed content only when it has no saved messages. */
export function demoChatMessages(chatId: string): ChatMessage[] {
  const example = examples[chatId]
  if (!example) return []
  const reply: AssistantMessage = {
    id: chatId + "-demo-reply", role: "assistant", model: MOLLY_NAME,
    request: example.request, status: "done", steps: [], text: example.reply,
    shown: example.reply.split(/(\s+)/).filter(Boolean).length,
    artifacts: example.artifacts,
  }
  return [{ id: chatId + "-demo-request", role: "user", text: example.request, attachments: example.files }, reply]
}
