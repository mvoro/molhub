import { withBasePath } from "../lib/base-path.ts"
/** Curated catalog and illustrations from composer-chat. A role's name remains the
 * composer value; stable IDs identify saved preferences. Reference counters are
 * prototype metadata, not verified live usage or customer feedback. */
export type RoleCategoryId = 'social' | 'texts' | 'sales' | 'analytics' | 'work' | 'self'

export type RoleCategory = {
  id: RoleCategoryId
  label: string
  description: string
  /** Original example-panel gradient stops from composer-chat/RolesShowcase.jsx. */
  colors: string
}

export type Role = {
  id: string
  name: string
  description: string
  group: RoleCategoryId
  image: string
  prompts: string[]
  about: string[]
  steps: string[]
  /** Reference-only demonstration counters. */
  likes: number
  runs: number
  favorites: number
}

export type RoleReview = { text: string; aspects: string[]; date: string }
export type RoleReviewInput = Pick<RoleReview, 'text' | 'aspects'>

export const REVIEW_MAX_LENGTH = 500
export const REVIEW_ASPECTS = ['Точные ответы', 'Экономит время', 'Хорошие тексты', 'Понимает задачу', 'Легко работать', 'Много идей']

export const ROLE_CATEGORIES: RoleCategory[] = [
  {
    "id": "social",
    "colors": "#ffd3c2, #ffb49b, #ffc9e6",
    "label": "Соцсети",
    "description": "Контент, который хочется смотреть, читать и обсуждать."
  },
  {
    "id": "texts",
    "colors": "#f5c6ff, #eba6ff, #d9cbff",
    "label": "Тексты",
    "description": "От первой идеи до готового текста под вашу задачу и тон."
  },
  {
    "id": "sales",
    "colors": "#dcccff, #c2a9ff, #c9daff",
    "label": "Продажи",
    "description": "Позиционирование, воронки и общение с клиентами."
  },
  {
    "id": "analytics",
    "colors": "#c6dbff, #a3c6ff, #b7f0f2",
    "label": "Аналитика",
    "description": "Исследования, данные и понятные выводы для решений."
  },
  {
    "id": "work",
    "colors": "#ffe9c2, #ffd48f, #ffe0c9",
    "label": "Работа",
    "description": "Помощники для ежедневных задач, команды и развития."
  },
  {
    "id": "self",
    "colors": "#c2f7ea, #9df1dd, #d2f3ff",
    "label": "Про себя",
    "description": "Время для своих вопросов, привычек и новых взглядов."
  }
]

const CATALOG: Omit<Role, "about" | "steps">[] = [
  {
    "id": "reels-scenarist",
    "name": "Сценарист Reels",
    "description": "Режиссёр сценариев для Reels, мега-промпт под алгоритмы 2026 года",
    "group": "social",
    "image": withBasePath("/assets/roles/reels-scenarist.webp"),
    "likes": 720,
    "runs": 2300,
    "favorites": 190,
    "prompts": [
      "Сценарий рилса на 30 секунд про наш новый продукт",
      "Придумай 5 хуков для видео про ремонт квартир",
      "Перепиши сценарий, чтобы удержание не падало на середине"
    ]
  },
  {
    "id": "threads-maker",
    "name": "Threads Мейкер",
    "description": "Превращаю мысли в короткие тексты, которые алгоритмы Threads подхватывают и выводят в топ",
    "group": "social",
    "image": withBasePath("/assets/roles/threads-maker.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Преврати мою историю о смене работы в пост для Threads",
      "Придумай 7 коротких постов для дизайнера",
      "Сократи этот текст до цепляющей мысли"
    ]
  },
  {
    "id": "stories",
    "name": "Прогрев в Stories",
    "description": "Мастер прогревов, сценарии продаж в сторис на 7 дней",
    "group": "social",
    "image": withBasePath("/assets/roles/stories.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Собери прогрев на 7 дней к запуску курса фотографии",
      "Придумай связку из 5 сторис для вебинара",
      "Добавь интерактивы в мой сценарий сторис"
    ]
  },
  {
    "id": "carousels",
    "name": "Инста Карусели",
    "description": "Режиссёр визуального сторителлинга, карусели, которые долистывают",
    "group": "social",
    "image": withBasePath("/assets/roles/carousels.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Карусель на 7 слайдов: как выбрать подрядчика",
      "Сожми эту статью в карусель с выводом в конце",
      "Первый слайд не цепляет — дай 5 вариантов"
    ]
  },
  {
    "id": "storytelling",
    "name": "Сценарист сторителлинга",
    "description": "Драматургия короткого формата, сценарии для сторис",
    "group": "social",
    "image": withBasePath("/assets/roles/storytelling.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Преврати историю первого клиента в серию сторис",
      "Помоги найти конфликт и развязку в моей истории",
      "Расскажи о запуске продукта через личную историю"
    ]
  },
  {
    "id": "telegram-copywriter",
    "name": "Телеграм Копирайтер",
    "description": "Автор постов для Telegram-каналов",
    "group": "social",
    "image": withBasePath("/assets/roles/telegram-copywriter.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Напиши пост о запуске новой функции без канцелярита",
      "Придумай опрос для канала о дизайне",
      "Перепиши этот пост в моём тоне, сохрани смысл"
    ]
  },
  {
    "id": "smm-manager",
    "name": "SMM-менеджер",
    "description": "Контент-стратегии для соцсетей, привлечение и удержание аудитории",
    "group": "social",
    "image": withBasePath("/assets/roles/smm-manager.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Составь контент-план для кофейни: 3 поста в неделю",
      "Подбери форматы для B2B-аудитории во ВКонтакте",
      "Разбери мою контент-сетку: что убрать, что усилить"
    ]
  },
  {
    "id": "video-scenarist",
    "name": "Сценарист видео",
    "description": "Сценарии для YouTube, Reels, TikTok, реклама",
    "group": "social",
    "image": withBasePath("/assets/roles/video-scenarist.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Сценарий YouTube-видео на 8 минут про первый бизнес",
      "Придумай вступление, которое удержит зрителя",
      "Разбей этот сценарий на сцены и планы"
    ]
  },
  {
    "id": "farshatova",
    "name": "Молекула Фаршатова",
    "description": "Медиатренер в стиле Руслана Фаршатова, контент из жизни",
    "group": "social",
    "image": withBasePath("/assets/roles/farshatova.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Разбери мой ролик: почему его пролистывают?",
      "Помоги найти темы для контента в моём опыте",
      "Что убрать из этого поста, чтобы дочитывали до конца?"
    ]
  },
  {
    "id": "seo-copywriter",
    "name": "SEO-копирайтер",
    "description": "SEO-тексты, семантическое ядро, структура контента",
    "group": "texts",
    "image": withBasePath("/assets/roles/seo-copywriter.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Напиши структуру статьи о выборе матраса",
      "Впиши эти поисковые запросы в текст без переспама",
      "Подготовь SEO-текст для категории офисных кресел"
    ]
  },
  {
    "id": "content-manager",
    "name": "Контент-менеджер",
    "description": "Контент-стратегии для сайтов, блогов и соцсетей",
    "group": "texts",
    "image": withBasePath("/assets/roles/content-manager.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Собери редакционный план блога на месяц",
      "Преврати интервью с клиентом в статью и 3 поста",
      "Разбери структуру контента на нашем сайте"
    ]
  },
  {
    "id": "marketplace-content",
    "name": "Контент-менеджер маркетплейсов",
    "description": "Карточки товаров (Ozon, Wildberries, Yandex Market), SEO и мерчандайзинг",
    "group": "texts",
    "image": withBasePath("/assets/roles/marketplace-content.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Оптимизируй карточку товара для Wildberries",
      "Собери SEO-ядро для категории чехлов для телефона",
      "Предложи структуру инфографики для карточки термоса"
    ]
  },
  {
    "id": "copywriter",
    "name": "Копирайтер",
    "description": "Рекламные, коммерческие и имиджевые тексты (AIDA, 4U)",
    "group": "texts",
    "image": withBasePath("/assets/roles/copywriter.webp"),
    "likes": 940,
    "runs": 2900,
    "favorites": 260,
    "prompts": [
      "Напиши первый экран лендинга онлайн-школы вокала",
      "Сформулируй оффер для доставки обедов в офис",
      "Перепиши блок о компании живым языком"
    ]
  },
  {
    "id": "rewriter",
    "name": "Рерайтер",
    "description": "Переформулирование текстов без потери смысла, разные стили",
    "group": "texts",
    "image": withBasePath("/assets/roles/rewriter.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Сократи этот текст вдвое, сохранив все важные мысли",
      "Перепиши письмо в более дружелюбном тоне",
      "Убери канцелярит и повторы из моей статьи"
    ]
  },
  {
    "id": "positioning",
    "name": "Смысловая упаковка",
    "description": "Бренд-архитектор: упаковка, позиционирование, офферы (4U, JTBD)",
    "group": "sales",
    "image": withBasePath("/assets/roles/positioning.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Сформулируй позиционирование моей студии дизайна",
      "Переведи наши функции на язык выгод клиента",
      "Помоги собрать оффер для нового продукта"
    ]
  },
  {
    "id": "lead-magnets",
    "name": "Генератор Лид-магнитов",
    "description": "Эксперт по лидогенерации и виральным бесплатным продуктам",
    "group": "sales",
    "image": withBasePath("/assets/roles/lead-magnets.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Придумай 10 лид-магнитов для школы английского",
      "Собери структуру бесплатного гайда для предпринимателя",
      "Улучши мой чек-лист, чтобы им хотелось поделиться"
    ]
  },
  {
    "id": "funnels",
    "name": "Конструктор воронок",
    "description": "Архитектор Sales Funnels, автоматизация маркетинга",
    "group": "sales",
    "image": withBasePath("/assets/roles/funnels.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Спроектируй воронку продажи онлайн-курса",
      "Разложи путь от подписки на канал до покупки",
      "Найди слабые места в моей воронке продаж"
    ]
  },
  {
    "id": "marketer",
    "name": "Маркетолог",
    "description": "Аудитория, стратегии, контент-планы, digital/performance",
    "group": "sales",
    "image": withBasePath("/assets/roles/marketer.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Составь план продвижения локальной кофейни",
      "Разбери нашу аудиторию и предложи 3 сегмента",
      "Помоги выбрать каналы продвижения для нового сервиса"
    ]
  },
  {
    "id": "correspondence-sales",
    "name": "Продажи в переписке А.Воробьева",
    "description": "AI-ассистент по продажам через переписку (мега-промпт)",
    "group": "sales",
    "image": withBasePath("/assets/roles/correspondence-sales.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Клиент пишет «дорого» — помоги ответить",
      "Разбери переписку и найди, где потеряли интерес",
      "Составь первое сообщение потенциальному клиенту"
    ]
  },
  {
    "id": "producer-farshatov",
    "name": "Продюсер Фаршатов",
    "description": "Помогает превратить ваш опыт в готовый продукт и составить план запуска",
    "group": "sales",
    "image": withBasePath("/assets/roles/producer-farshatov.webp"),
    "likes": 860,
    "runs": 2600,
    "favorites": 210,
    "prompts": [
      "Помоги превратить мой опыт в первый продукт",
      "Собери план запуска консультаций на 2 недели",
      "Проверь идею моего курса и предложи оффер"
    ]
  },
  {
    "id": "sales-farshatov",
    "name": "Продавец Фаршатов",
    "description": "Помогает довести клиента до оплаты через короткую и уважительную переписку",
    "group": "sales",
    "image": withBasePath("/assets/roles/sales-farshatov.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Помоги вернуть клиента после паузы в переписке",
      "Как довести этот диалог до оплаты без давления?",
      "Сократи моё коммерческое предложение до сообщения"
    ]
  },
  {
    "id": "audience",
    "name": "Анализ ЦА",
    "description": "Профайлер, методология JTBD/CustDev, аватары клиентов",
    "group": "analytics",
    "image": withBasePath("/assets/roles/audience.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Опиши сегменты аудитории сервиса доставки обедов",
      "Выдели боли и мотивы из отзывов клиентов",
      "Помоги составить портрет покупателя по JTBD"
    ]
  },
  {
    "id": "custdev",
    "name": "CustDev Аналитик",
    "description": "Инсайт-майнер, разбор интервью и CustDev-исследований",
    "group": "analytics",
    "image": withBasePath("/assets/roles/custdev.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Вытащи главные инсайты из этих интервью",
      "Составь вопросы для исследования причин оттока",
      "Сгруппируй ответы клиентов по потребностям"
    ]
  },
  {
    "id": "seo",
    "name": "SEO-специалист",
    "description": "Техническая SEO-оптимизация, контент-стратегия, аналитика",
    "group": "analytics",
    "image": withBasePath("/assets/roles/seo.webp"),
    "likes": 612,
    "runs": 2100,
    "favorites": 200,
    "prompts": [
      "Собери семантику для сайта клининга в Казани",
      "Кластеризуй эти 200 запросов по интентам",
      "Составь чек-лист технического SEO-аудита"
    ]
  },
  {
    "id": "pcm",
    "name": "Речевой аналитик PCM",
    "description": "Анализ коммуникаций по модели PCM Тайби Калера",
    "group": "analytics",
    "image": withBasePath("/assets/roles/pcm.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Разбери стиль коммуникации в этом диалоге",
      "Как адаптировать сообщение под собеседника?",
      "Помоги переформулировать конфликтное сообщение"
    ]
  },
  {
    "id": "ux-designer",
    "name": "Product / UX дизайнер",
    "description": "UX-исследования, прототипирование, дизайн-системы",
    "group": "analytics",
    "image": withBasePath("/assets/roles/ux-designer.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Разбери сценарий регистрации и найди лишние шаги",
      "Составь план исследования нового продукта",
      "Предложи 3 варианта структуры экрана профиля"
    ]
  },
  {
    "id": "prompt-engineer",
    "name": "Промпт Инженер",
    "description": "Создаёт точные, структурные и человечные промпты для ИИ под любые задачи: от Reels и каруселей до гайдов, таблиц, анализа",
    "group": "work",
    "image": withBasePath("/assets/roles/prompt-engineer.webp"),
    "likes": 1085,
    "runs": 3400,
    "favorites": 340,
    "prompts": [
      "Собери промпт для описаний товаров: 300 знаков, без воды",
      "Мой промпт даёт разные ответы — сделай стабильным",
      "Разбей задачу «анализ отзывов» на цепочку промптов"
    ]
  },
  {
    "id": "pr-manager",
    "name": "PR-менеджер",
    "description": "Пресс-релизы, имидж бренда, антикризисные коммуникации",
    "group": "work",
    "image": withBasePath("/assets/roles/pr-manager.webp"),
    "likes": 47,
    "runs": 1100,
    "favorites": 80,
    "prompts": [
      "Напиши пресс-релиз о запуске нашего сервиса",
      "Собери план коммуникации для запуска продукта",
      "Помоги подготовить ответ на негативный отзыв"
    ]
  },
  {
    "id": "hr-consultant",
    "name": "HR-консультант",
    "description": "Подбор кадров, HR-аналитика, адаптация сотрудников",
    "group": "work",
    "image": withBasePath("/assets/roles/hr-consultant.webp"),
    "likes": 124,
    "runs": 1000,
    "favorites": 65,
    "prompts": [
      "Напиши вакансию маркетолога без общих фраз",
      "Составь вопросы для собеседования продакт-менеджера",
      "Подготовь план адаптации нового сотрудника"
    ]
  },
  {
    "id": "ai-integrator",
    "name": "Специалист интеграции ИИ",
    "description": "Интеграция LLM в продукты, API моделей, RAG",
    "group": "work",
    "image": withBasePath("/assets/roles/ai-integrator.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Какие процессы агентства можно передать ИИ?",
      "Составь план внедрения ИИ в отдел поддержки",
      "Сравни подходы к поиску по внутренним документам"
    ]
  },
  {
    "id": "financial-consultant",
    "name": "Финансовый консультант",
    "description": "Финансовое планирование, инвестиции, капитал",
    "group": "work",
    "image": withBasePath("/assets/roles/financial-consultant.webp"),
    "likes": 233,
    "runs": 700,
    "favorites": 45,
    "prompts": [
      "Помоги структурировать мой ежемесячный бюджет",
      "Разложи бюджет запуска проекта по статьям",
      "Объясни, как устроены сложные проценты"
    ]
  },
  {
    "id": "teacher",
    "name": "Преподаватель",
    "description": "Методика обучения, объяснение сложных тем",
    "group": "work",
    "image": withBasePath("/assets/roles/teacher.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Объясни дроби на простых примерах",
      "Составь план изучения Python на 4 недели",
      "Проверь, как я понял тему, с помощью 5 вопросов"
    ]
  },
  {
    "id": "coach",
    "name": "Коуч",
    "description": "Личная эффективность, карьера, достижение целей",
    "group": "work",
    "image": withBasePath("/assets/roles/coach.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Помоги сформулировать карьерную цель на год",
      "Разложи большую задачу на первые понятные шаги",
      "Помоги расставить приоритеты на эту неделю"
    ]
  },
  {
    "id": "translator",
    "name": "Переводчик",
    "description": "Изучение иностранных языков, грамматика, диалоги",
    "group": "work",
    "image": withBasePath("/assets/roles/translator.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Переведи это письмо на деловой английский",
      "Объясни разницу между этими английскими выражениями",
      "Потренируй со мной диалог в аэропорту"
    ]
  },
  {
    "id": "numerologist",
    "name": "Нумеролог",
    "description": "Эксперт по нумерологии (Квадрат Пифагора, Ведическая нумерология), Дизайну Человека",
    "group": "self",
    "image": withBasePath("/assets/roles/numerologist.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Расскажи, как устроен квадрат Пифагора",
      "Объясни значения чисел в нумерологии",
      "Сравни западный и ведический подходы к нумерологии"
    ]
  },
  {
    "id": "astrologer",
    "name": "Астролог",
    "description": "Западная астрология, натальная карта, транзиты, синастрия",
    "group": "self",
    "image": withBasePath("/assets/roles/astrologer.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Объясни, из чего состоит натальная карта",
      "Расскажи о значении домов в астрологии",
      "Помоги разобраться с обозначениями на карте"
    ]
  },
  {
    "id": "psychologist",
    "name": "Психолог",
    "description": "Консультирование, эмоциональные процессы, стресс-менеджмент",
    "group": "self",
    "image": withBasePath("/assets/roles/psychologist.webp"),
    "likes": 545,
    "runs": 1800,
    "favorites": 170,
    "prompts": [
      "Помоги разобраться, что вызывает у меня стресс",
      "Проведи со мной спокойную вечернюю рефлексию",
      "Как подготовиться к сложному разговору с близким?"
    ]
  },
  {
    "id": "human-design",
    "name": "Дизайн Человека",
    "description": "Human Design-аналитик: типы, стратегии, авторитеты, профили",
    "group": "self",
    "image": withBasePath("/assets/roles/human-design.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Расскажи об основных типах в Human Design",
      "Объясни разницу между стратегией и авторитетом",
      "Помоги разобраться с терминами на бодиграфе"
    ]
  },
  {
    "id": "calories",
    "name": "Подсчет калорий",
    "description": "Персональный AI-нутрициолог и трекер калорий",
    "group": "self",
    "image": withBasePath("/assets/roles/calories.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Помоги посчитать калории в моём завтраке",
      "Сравни питательность двух вариантов обеда",
      "Собери дневник питания в удобную таблицу"
    ]
  },
  {
    "id": "motivator",
    "name": "Мотиватор",
    "description": "Помогает перейти от планов к действиям и поддерживать мотивацию",
    "group": "self",
    "image": withBasePath("/assets/roles/motivator.webp"),
    "likes": 0,
    "runs": 0,
    "favorites": 0,
    "prompts": [
      "Помоги начать задачу, которую откладываю неделю",
      "Разбей мою цель на действия на ближайшие 3 дня",
      "Помоги вернуться к привычке после перерыва"
    ]
  }
]

const DEFAULT_STEPS = [
  'Опишите задачу: что нужно получить и для кого вы это делаете.',
  'Добавьте исходные материалы, примеры и ограничения по формату.',
  'Ответьте на уточняющие вопросы и получите первый вариант.',
  'Расскажите, что стоит изменить: роль учтёт обратную связь и контекст диалога.',
]

export const ROLE_CATALOG: Role[] = CATALOG.map(role => ({
  ...role,
  about: role.id === 'prompt-engineer' ? [
    'Роль для тех, кто работает с нейросетями каждый день и устал от нестабильных ответов. Промпт Инженер разбирает вашу задачу, задаёт уточняющие вопросы и собирает промпт со структурой: роль, контекст, формат ответа, ограничения и примеры.',
    'Умеет чинить чужие промпты: находит, из-за чего модель уходит в сторону, и показывает до и после с объяснением, что изменилось и почему. Для повторяющихся задач собирает шаблоны с переменными, которые можно раздать команде.',
  ] : [
    role.description + '.',
    'Опишите желаемый результат, аудиторию и ограничения. Роль поможет разобрать задачу, подготовить первый вариант и доработать его по вашей обратной связи.',
  ],
  steps: role.id === 'prompt-engineer' ? [
    'Опишите задачу и вставьте текущий промпт, если он есть — даже плохой ускорит работу.',
    'Ответьте на 2–3 уточняющих вопроса: для какой модели, какой формат ответа нужен.',
    'Получите промпт с пояснением каждого блока — что за что отвечает.',
    'Прогоните на реальном примере и вернитесь с результатом: роль доведёт до стабильного.',
  ] : [...DEFAULT_STEPS],
}))
