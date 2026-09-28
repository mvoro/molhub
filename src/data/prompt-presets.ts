/* Ready-made ideas shown under the composer when the image or video tool is picked
   (the Gemini / ChatGPT «create image» gallery). Picking one fills the prompt; `ratio`,
   when set, is a value from the composer's ratio setting for that chat type. */

export type PromptPreset = {
  id: string
  title: string
  prompt: string
  /* Path under /public. */
  image: string
  /* An id from PRESET_CATEGORIES of the same type (never "all"). */
  category: string
  ratio?: string
  /* A video template's short clip under /public: its cards play it on their own (AutoClip), the
     poster being `image`. */
  video?: string
  /* What the idea does, in a line: shown in its place when the prompt is English and goes to the
     model unseen (the video effects). */
  description?: string
}

export type PresetType = "image" | "video"

export const PRESET_CATEGORIES: Record<PresetType, { id: string; label: string }[]> = {
  image: [
    { id: "all", label: "Все" },
    { id: "drawing", label: "Рисунок" },
    { id: "toys", label: "3D и игрушки" },
    { id: "photo", label: "Фотоэффекты" },
    { id: "fantasy", label: "Фантазии" },
    { id: "useful", label: "Полезное" },
  ],
  video: [
    { id: "all", label: "Все" },
    { id: "camera", label: "Камера" },
    { id: "transform", label: "Превращения" },
    { id: "fantasy", label: "Фэнтези" },
    { id: "action", label: "Экшн" },
    { id: "trends", label: "Тренды" },
  ],
}

export const PROMPT_PRESETS: Record<PresetType, PromptPreset[]> = {
  image: [
    /* Стили (27.09): 30 обложек 4:5 по промтам из design/prompts/photo-styles.md, исходники в
       design/generated/photo-styles. Идут вперемешку, как у ChatGPT: соседние карточки разные по
       цвету и категории. Промт говорит о прикреплённом фото; «Авто» берёт его пропорции, у готовых
       форматов (стикеры, карта, обложка, сетки) своя. */
    {
      id: "action-figure",
      title: "Фигурка в блистере",
      prompt:
        "Сделай из человека с фото коллекционную фигурку в блистере: картонная подложка с именем сверху, рядом в отдельных ячейках 3–4 аксессуара по его увлечениям. Глянцевый пластик, студийный свет.",
      image: "/presets/styles/action-figure.jpg",
      category: "toys",
      ratio: "3:4",
    },
    {
      id: "anime",
      title: "Аниме",
      prompt:
        "Перерисуй фото как кадр из рисованного аниме-фильма: чистый контур, мягкая заливка, акварельный фон, тёплый закатный свет. Сохрани черты лица, причёску и одежду.",
      image: "/presets/styles/anime.jpg",
      category: "drawing",
      ratio: "Авто",
    },
    {
      id: "underwater",
      title: "Под водой",
      prompt:
        "Перенеси человека с фото под воду: блики солнца на лице, пузырьки, парящие волосы, бирюзовая вода уходит в синеву. Сохрани лицо.",
      image: "/presets/styles/underwater.jpg",
      category: "photo",
      ratio: "Авто",
    },
    {
      id: "chibi-stickers",
      title: "Стикеры чиби",
      prompt:
        "Сделай по фото набор из 6 стикеров в стиле чиби: большая голова, маленькое тело, разные эмоции, белая вырубная обводка, пастельный фон.",
      image: "/presets/styles/chibi-stickers.jpg",
      category: "drawing",
      ratio: "1:1",
    },
    {
      id: "film-35mm",
      title: "Плёнка 35 мм",
      prompt:
        "Сделай фото похожим на кадр с 35-мм плёнки: тёплые цвета, зерно, мягкие ореолы вокруг светлых мест, лёгкая засветка по краю. Людей и сюжет не меняй.",
      image: "/presets/styles/film-35mm.jpg",
      category: "photo",
      ratio: "Авто",
    },
    {
      id: "3d-avatar",
      title: "3D-аватар",
      prompt:
        "Преврати человека с фото в милого 3D-персонажа как из анимационного фильма: мягкие формы, матовые материалы, большие глаза, пастельный фон. Сохрани причёску, аксессуары и узнаваемые черты.",
      image: "/presets/styles/3d-avatar.jpg",
      category: "toys",
      ratio: "Авто",
    },
    {
      id: "restore",
      title: "Реставрация фото",
      prompt:
        "Отреставрируй старое фото: убери царапины, пятна и заломы, верни резкость лицам и аккуратно раскрась в натуральные цвета. Людей не меняй.",
      image: "/presets/styles/restore.jpg",
      category: "useful",
      ratio: "Авто",
    },
    {
      id: "comic",
      title: "Комикс",
      prompt:
        "Сделай из фото панель поп-арт комикса: жирный чёрный контур, яркие плоские цвета, растровые точки и пузырь с короткой репликой. Лицо должно остаться узнаваемым.",
      image: "/presets/styles/comic.jpg",
      category: "drawing",
      ratio: "Авто",
    },
    {
      id: "royal-portrait",
      title: "Королевский портрет",
      prompt:
        "Напиши по фото парадный королевский портрет маслом: корона, мантия с горностаем, бархатная драпировка, тёмный фон, мазки и кракелюр, золотая рама. Сохрани лицо.",
      image: "/presets/styles/royal-portrait.jpg",
      category: "fantasy",
      ratio: "3:4",
    },
    {
      id: "hug-younger-self",
      title: "Встреча с собой",
      prompt:
        "На первом фото я в детстве, на втором сейчас. Сделай снимок, где взрослый я обнимаю себя маленького: мягкая вспышка, светлая штора на фоне, тёплые тона, как на полароиде. Сохрани оба лица.",
      image: "/presets/styles/hug-younger-self.jpg",
      category: "fantasy",
      ratio: "3:4",
    },
    {
      id: "disco",
      title: "Стиль диско",
      prompt:
        "Сделай главного героя фото скульптурой из зеркальной мозаики, как диско-шар: блики, световые зайчики вокруг, чёрный глянцевый фон, луч прожектора.",
      image: "/presets/styles/disco.jpg",
      category: "toys",
      ratio: "Авто",
    },
    {
      id: "pixel-game",
      title: "Пиксель-арт",
      prompt:
        "Перерисуй фото как сцену из ретро-игры в 16-битном пиксель-арте: чёткие квадратные пиксели, ограниченная палитра, игровой фон. Сохрани причёску и цвета одежды.",
      image: "/presets/styles/pixel-game.jpg",
      category: "drawing",
      ratio: "Авто",
    },
    {
      id: "headshot",
      title: "Деловой портрет",
      prompt:
        "Сделай по фото деловой портрет для резюме: пиджак, светло-серый фон, мягкий дневной свет, уверенный дружелюбный взгляд. Лицо не меняй, кожу оставь натуральной.",
      image: "/presets/styles/headshot.jpg",
      category: "useful",
      ratio: "3:4",
    },
    {
      id: "magazine-cover",
      title: "Обложка журнала",
      prompt:
        "Сделай из фото обложку глянцевого журнала: студийный свет, насыщенный однотонный фон, крупный логотип «ОБРАЗ» сверху и пара коротких анонсов сбоку.",
      image: "/presets/styles/magazine-cover.jpg",
      category: "fantasy",
      ratio: "3:4",
    },
    {
      id: "crochet",
      title: "Вязаная игрушка",
      prompt:
        "Преврати героя фото, человека или питомца, в вязаную игрушку-амигуруми: видимые петли и пряжа, вышитые глазки, мягкий дневной свет. Сохрани цвета и узнаваемые детали.",
      image: "/presets/styles/crochet.jpg",
      category: "toys",
      ratio: "Авто",
    },
    {
      id: "flash-2000s",
      title: "Вспышка нулевых",
      prompt:
        "Сделай фото похожим на ночной снимок мыльницей нулевых со вспышкой: резкий свет в лицо, тёмный фон, лёгкая смазанность и цифровой шум.",
      image: "/presets/styles/flash-2000s.jpg",
      category: "photo",
      ratio: "Авто",
    },
    {
      id: "tarot",
      title: "Карта Таро",
      prompt:
        "Нарисуй по фото карту Таро в стиле модерн: винтажная палитра, тонкий контур, фактура бумаги, декоративная рамка и название аркана сверху. Аркан подбери по образу человека.",
      image: "/presets/styles/tarot.jpg",
      category: "drawing",
      ratio: "2:3",
    },
    {
      id: "mini-me",
      title: "Мини-я",
      prompt:
        "Добавь вокруг человека с фото несколько его крошечных копий ростом с ладонь: каждая чем-то занята и взаимодействует с предметами в кадре. Реалистичный масштаб и свет.",
      image: "/presets/styles/mini-me.jpg",
      category: "fantasy",
      ratio: "Авто",
    },
    {
      id: "marble-statue",
      title: "Мраморная статуя",
      prompt:
        "Преврати человека с фото в мраморную статую в античном музейном зале: белый мрамор с прожилками, резные складки одежды, постамент, тёплый свет сверху. Сохрани позу, одежду и черты лица.",
      image: "/presets/styles/marble-statue.jpg",
      category: "toys",
      ratio: "Авто",
    },
    {
      id: "caricature",
      title: "Карикатура",
      prompt:
        "Нарисуй по фото дружескую карикатуру: большая голова, маленькое тело, преувеличенные, но добрые черты, яркие цвета. Добавь деталь-хобби из фото.",
      image: "/presets/styles/caricature.jpg",
      category: "drawing",
      ratio: "Авто",
    },
    {
      id: "movie-still",
      title: "Кинокадр",
      prompt:
        "Сделай из фото кадр из фильма: анаморфный объектив с бликом, бирюзовые тени и тёплые источники света, малая глубина резкости, лёгкое плёночное зерно.",
      image: "/presets/styles/movie-still.jpg",
      category: "photo",
      ratio: "Авто",
    },
    {
      id: "soviet-card",
      title: "Советская открытка",
      prompt:
        "Нарисуй по фото советскую поздравительную открытку 70-х: пастельная гуашь, орнамент, ретро-надпись «С праздником!», состаренная бумага. Лицо должно остаться узнаваемым.",
      image: "/presets/styles/soviet-card.jpg",
      category: "fantasy",
      ratio: "3:4",
    },
    {
      id: "claymation",
      title: "Пластилин",
      prompt:
        "Перелепи фото в пластилиновую сцену как из покадровой анимации: фигурки со следами пальцев, самодельные декорации, мягкий тёплый свет. Сохрани позы, одежду и цвета.",
      image: "/presets/styles/claymation.jpg",
      category: "toys",
      ratio: "Авто",
    },
    {
      id: "hairstyles",
      title: "Причёски",
      prompt:
        "Покажи человека с фото с четырьмя разными причёсками сеткой 2×2. Лицо и одежда те же, под каждым кадром название причёски.",
      image: "/presets/styles/hairstyles.jpg",
      category: "useful",
      ratio: "1:1",
    },
    {
      id: "newspaper",
      title: "Первая полоса",
      prompt:
        "Сделай первую полосу старой газеты с этим фото: пожелтевшая бумага, растровая печать, громкий заголовок про невероятное событие с героем снимка, колонки мелкого текста.",
      image: "/presets/styles/newspaper.jpg",
      category: "fantasy",
      ratio: "3:4",
    },
    {
      id: "studio-portrait",
      title: "Студийный портрет",
      prompt:
        "Сделай из фото студийный портрет: однотонный тёплый фон, мягкий рисующий свет, объектив 85 мм, натуральная кожа без пластиковой ретуши. Лицо не меняй.",
      image: "/presets/styles/studio-portrait.jpg",
      category: "photo",
      ratio: "Авто",
    },
    {
      id: "doodles",
      title: "Каракули",
      prompt:
        "Разрисуй фото весёлыми каракулями белым и неоновым маркером: короны, сердечки, звёздочки, стрелки, смешные усы. Само фото не меняй.",
      image: "/presets/styles/doodles.jpg",
      category: "drawing",
      ratio: "Авто",
    },
    {
      id: "photo-booth",
      title: "Фотобудка",
      prompt:
        "Сделай по фото ленту из фотобудки: четыре чёрно-белых кадра подряд с разными эмоциями, зерно, неровная экспозиция.",
      image: "/presets/styles/photo-booth.jpg",
      category: "photo",
      ratio: "3:4",
    },
    {
      id: "color-type",
      title: "Цветотип",
      prompt:
        "Определи цветотип по фото: покажи меня сеткой 2×3 на фоне тканей тёплых и холодных оттенков, отметь, какие мне идут, и назови сезон.",
      image: "/presets/styles/color-type.jpg",
      category: "useful",
      ratio: "3:4",
    },
    {
      id: "scrapbook",
      title: "Скрапбук",
      prompt:
        "Собери из фото страницу ретро-скрапбука: снимки-полароиды, сухие цветы, билеты, марки, малярный скотч и подпись от руки на крафтовой бумаге.",
      image: "/presets/styles/scrapbook.jpg",
      category: "photo",
      ratio: "3:4",
    },

    /* Полезное: задачи для бизнеса (обложки прежней выдачи). */
    {
      id: "product-infographic",
      title: "Инфографика товара",
      prompt:
        "Инфографика для маркетплейса: баночка крема разобрана на парящие слои на фоне неба, к каждому слою подпись с ингредиентом. Чистый рекламный стиль.",
      image: "/presets/product-infographic.jpg",
      category: "useful",
      ratio: "3:4",
    },
    {
      id: "ad-poster",
      title: "Рекламный постер",
      prompt:
        "Рекламный постер энергетика: парень в фиолетовом худи протягивает банку в камеру, вокруг летят брызги, сверху крупный заголовок и подпись «новый вкус».",
      image: "/presets/ad-poster.jpg",
      category: "useful",
      ratio: "2:3",
    },
    {
      id: "event-poster",
      title: "Афиша набора",
      prompt:
        "Афиша набора на стажировку в авиакомпанию: синий чемодан в стикерах на фоне облаков, заголовок «Твой билет в первый класс», даты, условия и QR-код для заявки.",
      image: "/presets/event-poster.jpg",
      category: "useful",
      ratio: "3:4",
    },
    {
      id: "product-shot",
      title: "Предметная съёмка",
      prompt:
        "Сними мой товар с фото как предметку для каталога: однотонный мятный фон, мягкий рассеянный свет, лёгкая тень и пара керамических форм рядом.",
      image: "/presets/product-shot.jpg",
      category: "useful",
      ratio: "4:3",
    },
  ],

  video: [
    /* Эффекты (27.09): старт-кадр 9:16 и ролик на 5 с по промтам из design/prompts/video-effects.md,
       исходники в design/generated/video-effects. Промт уходит в модель под капотом: пользователь
       видит в композере картинку шаблона и дописывает своё. Постер = первый кадр ролика, чтобы при
       наведении кадр не прыгал. */
    {
      id: "earth-zoom-out",
      title: "Вид с орбиты",
      prompt:
        "The camera starts right above the person as they look up, then pulls straight up and away in one continuous, accelerating move: the street, the rooftops, the whole city or landscape, the clouds, and finally the entire planet Earth seen from orbit, with sunrise glowing along the horizon. No cuts. The person stays at the exact center of the frame until they shrink to a single point. Photorealistic satellite-level detail at every altitude. Keep the person's face and outfit exactly as in the image. No text, no logos.",
      image: "/presets/video-template/image/earth-zoom-out.jpg",
      video: "/presets/video-template/video/earth-zoom-out.mp4",
      description: "Камера улетает от человека вверх, пока не станет видна вся Земля из космоса.",
      category: "camera",
      ratio: "9:16",
    },
    {
      id: "eyes-in",
      title: "Сквозь зрачок",
      prompt:
        "The camera slowly pushes in on the person's face, then accelerates into one eye. The iris fills the frame, its fibers become glowing canyons, and the camera flies through the pupil into a vast cosmic nebula full of stars and drifting light. One continuous move, no cuts, macro detail, the iris color matches the image. Cinematic lighting, subtle lens breathing. Keep the face identical to the image in the first second. No text, no logos.",
      image: "/presets/video-template/image/eyes-in.jpg",
      video: "/presets/video-template/video/eyes-in.mp4",
      description: "Камера ныряет в глаз и вылетает через зрачок в космос.",
      category: "camera",
      ratio: "9:16",
    },
    {
      id: "bullet-time",
      title: "Время замерло",
      prompt:
        "Time freezes. The person is suspended mid-motion, hair and clothes locked in the air, and droplets, dust and tiny sparks hang motionless around them. The camera makes a smooth 180-degree orbit around the frozen person at chest height, background parallax revealing the scene from the other side. In the last second time resumes in slow motion. Cinematic bullet-time, crisp detail, golden rim light. Keep the face identical to the image. No text, no logos.",
      image: "/presets/video-template/image/bullet-time.jpg",
      video: "/presets/video-template/video/bullet-time.mp4",
      description: "Время останавливается, камера облетает застывшего человека на 180°.",
      category: "camera",
      ratio: "9:16",
    },
    {
      id: "fpv-flight",
      title: "Пролёт дроном",
      prompt:
        "FPV drone shot. The camera shoots backward and up away from the person, revealing the whole location from above, then banks hard, dives back down at high speed, skims low over the ground and swoops around the person in a tight arc, ending in a stable close-up as they turn to the camera. One continuous shot, slight fisheye, motion blur at the edges, dynamic horizon tilt. Keep the person's face and outfit identical to the image. No text, no logos.",
      image: "/presets/video-template/image/fpv-flight.jpg",
      video: "/presets/video-template/video/fpv-flight.mp4",
      description: "FPV-дрон улетает от человека, показывает место сверху и пикирует обратно к лицу.",
      category: "camera",
      ratio: "9:16",
    },
    {
      id: "liquid-chrome",
      title: "Жидкий металл",
      prompt:
        "The person holds still and looks into the camera as liquid chrome pours from the top of their head and flows down over the face, hair and clothes, turning them into a flawless mirror-polished metal sculpture. Studio lights glide across the reflective surface. At the end the chrome figure blinks and slightly tilts its head. Slow push-in, high-end commercial look, physically accurate reflections. Keep the facial features exactly as in the image. No text, no logos.",
      image: "/presets/video-template/image/liquid-chrome.jpg",
      video: "/presets/video-template/video/liquid-chrome.mp4",
      description: "Жидкий хром стекает по человеку и превращает его в зеркальную скульптуру.",
      category: "transform",
      ratio: "9:16",
    },
    {
      id: "melting",
      title: "Тает",
      prompt:
        "The person smiles, then starts melting from the top down like soft ice cream: hair, face and clothes turn into thick glossy liquid in the same colors as the image, dripping, sliding down and pooling on the floor. Surreal but physically believable viscosity, oddly satisfying slow flow. Static camera, then a gentle tilt down to follow the puddle. Clean soft light. Keep the face identical to the image before it melts. No text, no logos.",
      image: "/presets/video-template/image/melting.jpg",
      video: "/presets/video-template/video/melting.mp4",
      description: "Человек тает сверху вниз, как мороженое, и растекается цветной лужей.",
      category: "transform",
      ratio: "9:16",
    },
    {
      id: "disintegration",
      title: "Рассыпаться",
      prompt:
        "The person stands still and looks at the camera, then their body starts disintegrating into fine dark ash and glowing embers, beginning at one shoulder and spreading across the whole figure. A gentle wind carries the particles sideways, swirling through the light until nothing is left. Slow, dramatic, detailed particle simulation. Static camera with a slow push-in. Keep the face identical to the image at the start. No text, no logos.",
      image: "/presets/video-template/image/disintegration.jpg",
      video: "/presets/video-template/video/disintegration.mp4",
      description: "Человек рассыпается в пепел и тлеющие искры, ветер уносит их.",
      category: "transform",
      ratio: "9:16",
    },
    {
      id: "inflate",
      title: "Надувной",
      prompt:
        "The person inflates like a glossy latex balloon: the body rounds out, the clothes stretch into shiny balloon surfaces in the same colors, proportions become cartoonish while the face stays recognizable. Then they lift off the ground and float up into the sky, gently bobbing and turning. Playful, bouncy timing, the camera tilts up to follow. Keep the face recognizable as in the image. No text, no logos.",
      image: "/presets/video-template/image/inflate.jpg",
      video: "/presets/video-template/video/inflate.mp4",
      description: "Человек надувается, как латексный шарик, и улетает в небо.",
      category: "transform",
      ratio: "9:16",
    },
    {
      id: "anime-film",
      title: "Аниме-фильм",
      prompt:
        "The shot starts as the real photo, then a wave of transformation sweeps across the frame from left to right, turning everything into a hand-painted 2D anime film: watercolor backgrounds, soft cel shading, painted clouds, clean line art on the person. After the transition the animated person turns their head, the wind moves their hair and the grass, clouds drift. Nostalgic warm palette, gentle camera drift. Keep the person's features, hairstyle and outfit. No text, no logos.",
      image: "/presets/video-template/image/anime-film.jpg",
      video: "/presets/video-template/video/anime-film.mp4",
      description: "Волна перерисовывает фото в рисованное аниме, и кадр оживает.",
      category: "transform",
      ratio: "9:16",
    },
    {
      id: "superhero",
      title: "Супергерой",
      prompt:
        "The person clenches a fist, and a sleek high-tech armored suit assembles over their body piece by piece: metal plates slide and click into place from the chest outward, glowing seams light up, a cape unfurls in the wind. The face stays uncovered. Rain splashes off the armor, lightning flashes behind. Low-angle slow push-in, epic cinematic lighting, original suit design. Keep the face identical to the image. No text, no logos.",
      image: "/presets/video-template/image/superhero.jpg",
      video: "/presets/video-template/video/superhero.mp4",
      description: "На человеке по частям собирается бронекостюм, за спиной разворачивается плащ.",
      category: "transform",
      ratio: "9:16",
    },
    {
      id: "outfit-switch",
      title: "Смена образа",
      prompt:
        "The person does a quick spin, and with every turn the outfit changes seamlessly: a black tailored suit, then streetwear with a puffer jacket, then a vintage 70s look, ending in an elegant evening outfit. Each switch happens mid-spin under a light motion blur, fabric moves naturally. Static camera, lookbook lighting, upbeat rhythm. Keep the face, hair and body identical to the image. No text, no logos.",
      image: "/presets/video-template/image/outfit-switch.jpg",
      video: "/presets/video-template/video/outfit-switch.mp4",
      description: "С каждым поворотом на человеке новый образ.",
      category: "transform",
      ratio: "9:16",
    },
    {
      id: "living-painting",
      title: "Картина оживает",
      prompt:
        "The image slowly turns into a classical oil painting: brush strokes, varnish and fine craquelure appear, and the camera pulls back to reveal it hanging in an ornate gilded frame on a dark museum wall. Then the painted portrait comes alive: the person blinks, glances at the camera, smiles slightly and leans forward as if about to step out of the frame, the painted hair and fabric move with brush texture. Warm museum light. Keep the facial features from the image. No text, no logos.",
      image: "/presets/video-template/image/living-painting.jpg",
      video: "/presets/video-template/video/living-painting.mp4",
      description: "Фото становится картиной маслом в музейной раме, и портрет оживает.",
      category: "transform",
      ratio: "9:16",
    },
    {
      id: "fairytale-castle",
      title: "Сказочный замок",
      prompt:
        "The world around the person turns into a fairytale: a castle with tall towers and glowing windows rises on the horizon, the sky becomes a deep blue twilight with pink clouds, fireflies and glowing petals float through the air, a stream sparkles nearby. The person turns and walks toward the castle. Slow crane shot rising behind them, soft magical light, storybook atmosphere. Keep the person identical to the image. No text, no logos.",
      image: "/presets/video-template/image/fairytale-castle.jpg",
      video: "/presets/video-template/video/fairytale-castle.mp4",
      description: "Мир вокруг становится сказкой: вырастает замок, летят светлячки.",
      category: "fantasy",
      ratio: "9:16",
    },
    {
      id: "angel-wings",
      title: "Крылья",
      prompt:
        "Huge white feathered wings slowly unfold from behind the person's shoulders, feathers catching the golden backlight, loose feathers drifting in the air. The person opens their eyes and looks into the camera as the wings spread fully and make one powerful flap that bends the grass around. Slow motion, low-angle slow push-in, warm lens flare, ethereal mood. Keep the face identical to the image. No text, no logos.",
      image: "/presets/video-template/image/angel-wings.jpg",
      video: "/presets/video-template/video/angel-wings.mp4",
      description: "За спиной раскрываются огромные белые крылья.",
      category: "fantasy",
      ratio: "9:16",
    },
    {
      id: "zero-gravity",
      title: "Невесомость",
      prompt:
        "The person slowly lifts off the ground and floats up as the surroundings dissolve into deep space full of stars and a glowing galaxy. They drift weightlessly and turn slowly, hair and clothes floating as if underwater, eyes closed in calm bliss. The camera floats gently along with them. Dreamy, quiet, cool light with a warm rim. Keep the face identical to the image. No text, no logos.",
      image: "/presets/video-template/image/zero-gravity.jpg",
      video: "/presets/video-template/video/zero-gravity.mp4",
      description: "Человек отрывается от земли и плывёт в открытом космосе.",
      category: "fantasy",
      ratio: "9:16",
    },
    {
      id: "blue-depth",
      title: "Глубина",
      prompt:
        "Water floods the frame and the person is suddenly deep in a blue ocean. Hair and clothes float slowly, small bubbles rise, a school of silver fish swirls around them, sun rays shimmer down from the surface and caustic light patterns ripple across the skin. The person stays calm, looks into the camera and blinks slowly. Slow drifting camera, serene mood. Keep the face identical to the image. No text, no logos.",
      image: "/presets/video-template/image/blue-depth.jpg",
      video: "/presets/video-template/video/blue-depth.mp4",
      description: "Кадр заливает вода: вокруг кружит стая рыб, сверху падают лучи.",
      category: "fantasy",
      ratio: "9:16",
    },
    {
      id: "cloud-surf",
      title: "По облакам",
      prompt:
        "The ground under the person turns into soft cotton-candy clouds, and they start gliding across a sea of pink clouds as if surfing, arms open, clothes and hair fluttering in the wind. The sky is a pastel sunset of pink, peach and lilac. The camera tracks alongside in a smooth arc. Light, joyful, dreamy. Keep the person identical to the image. No text, no logos.",
      image: "/presets/video-template/image/cloud-surf.jpg",
      video: "/presets/video-template/video/cloud-surf.mp4",
      description: "Человек скользит по розовым облакам, как по волнам.",
      category: "fantasy",
      ratio: "9:16",
    },
    {
      id: "power-up",
      title: "Сила пробудилась",
      prompt:
        "The person lowers their head, then looks up as their eyes ignite with bright light. An energy aura bursts around the body, the ground cracks, stones and dust rise and levitate around them, the air ripples with heat haze, clothes and hair flow upward. Slow low-angle push-in, flickering light, an epic anime-style power-up rendered photorealistically. Keep the face identical to the image. No text, no logos.",
      image: "/presets/video-template/image/power-up.jpg",
      video: "/presets/video-template/video/power-up.mp4",
      description: "Загораются глаза, вокруг вспыхивает аура, камни взлетают в воздух.",
      category: "fantasy",
      ratio: "9:16",
    },
    {
      id: "knight",
      title: "Рыцарь",
      prompt:
        "Polished steel plate armor forms over the person's body piece by piece, a long cloak falls from the shoulders and a sword appears in their hand. The surroundings turn into a wide field of red poppies under a dramatic stormy sky, wind sweeps across the flowers. The person raises the sword and looks into the camera with determination. Slow low-angle arc, epic medieval film look. Keep the face identical to the image. No text, no logos.",
      image: "/presets/video-template/image/knight.jpg",
      video: "/presets/video-template/video/knight.mp4",
      description: "На человеке собираются латы, в руке появляется меч, вокруг маковое поле.",
      category: "action",
      ratio: "9:16",
    },
    {
      id: "street-giant",
      title: "Великан",
      prompt:
        "The person grows into a giant, taller than the surrounding buildings. They carefully step over the streets while tiny cars and pedestrians move below, glance down and wave at the camera. Shot from street level with a slow tilt up, realistic scale, atmospheric haze between the buildings, daylight. Keep the face and outfit identical to the image. No text, no logos.",
      image: "/presets/video-template/image/street-giant.jpg",
      video: "/presets/video-template/video/street-giant.mp4",
      description: "Человек вырастает выше домов и шагает через улицы.",
      category: "action",
      ratio: "9:16",
    },
    {
      id: "drift",
      title: "Дрифт",
      prompt:
        "The scene becomes a neon-lit city at night: the person is behind the wheel of a sports car drifting around a corner, the car slides sideways, tires smoke, sparks fly, city lights streak past the windows. They grip the wheel calmly and give the camera a confident smile. The camera starts inside the car, then swings outside in a fast orbit around the drift. High energy, motion blur, neon reflections. Keep the face identical to the image. No text, no logos.",
      image: "/presets/video-template/image/drift.jpg",
      video: "/presets/video-template/video/drift.mp4",
      description: "Человек за рулём спорткара уходит в дрифт в неоновом городе.",
      category: "action",
      ratio: "9:16",
    },
    {
      id: "explosion-walk",
      title: "Взрыв за спиной",
      prompt:
        "The person walks confidently toward the camera without looking back as a huge fiery explosion erupts far behind them. The shockwave throws dust past them, their hair and clothes flap in the blast wind, orange firelight hits their face. They don't flinch and keep walking. Slow motion, low-angle tracking shot moving backward, classic action-movie moment. Keep the face identical to the image. No text, no logos.",
      image: "/presets/video-template/image/explosion-walk.jpg",
      video: "/presets/video-template/video/explosion-walk.mp4",
      description: "Человек идёт на камеру, за спиной взрыв, но он не оборачивается.",
      category: "action",
      ratio: "9:16",
    },
    {
      id: "red-carpet",
      title: "Красная дорожка",
      prompt:
        "The person steps onto a red carpet at a night premiere, and their outfit turns into an elegant evening look. Dozens of photographers behind the barrier shout and fire their flashes, bursts of white light hit from every side. The person stops, turns over their shoulder, smiles and poses. Slow motion, the camera dollies alongside, warm glamorous light, flash bokeh. Keep the face identical to the image. No text, no logos.",
      image: "/presets/video-template/image/red-carpet.jpg",
      video: "/presets/video-template/video/red-carpet.mp4",
      description: "Человек выходит на красную дорожку, со всех сторон бьют вспышки фотографов.",
      category: "action",
      ratio: "9:16",
    },
    {
      id: "money-rain",
      title: "Денежный дождь",
      prompt:
        "It starts raining banknotes: hundreds of bills fall from above in slow motion, fluttering and spinning around the person and piling up at their feet. The person looks up, laughs and throws a handful into the air. Warm spotlight catches the flying bills, slow push-in, celebratory music-video energy. Generic fictional banknotes with no readable text. Keep the face identical to the image. No text, no logos.",
      image: "/presets/video-template/image/money-rain.jpg",
      video: "/presets/video-template/video/money-rain.mp4",
      description: "Сверху сыплются купюры, человек смеётся и подбрасывает их.",
      category: "trends",
      ratio: "9:16",
    },
    {
      id: "dance-loop",
      title: "Танец",
      prompt:
        "The person dances a catchy short viral dance on the spot: rhythmic steps, hip sways, arm waves and a confident head nod, perfectly on beat. Energetic but simple choreography, natural body mechanics, clothes move with the motion, the background stays as in the image. Static full-body camera, bright even light. The last frame returns to the starting pose so the clip loops seamlessly. Keep the face and outfit identical to the image. No text, no logos.",
      image: "/presets/video-template/image/dance-loop.jpg",
      video: "/presets/video-template/video/dance-loop.mp4",
      description: "Человек танцует короткий вирусный танец, клип зациклен.",
      category: "trends",
      ratio: "9:16",
    },
    {
      id: "mini-me",
      title: "Мини-я",
      prompt:
        "The person shrinks to a tiny figurine-sized version of themselves, and a giant human hand gently scoops them up. The tiny person stands on the palm, looks around in amazement and waves at the camera, a cookie crumb beside them for scale. Macro lens, shallow depth of field, cozy warm light, realistic scale and skin detail. Keep the face and outfit identical to the image. No text, no logos.",
      image: "/presets/video-template/image/mini-me.jpg",
      video: "/presets/video-template/video/mini-me.mp4",
      description: "Человек уменьшается до размера фигурки, и его берёт на ладонь огромная рука.",
      category: "trends",
      ratio: "9:16",
    },
    {
      id: "meet-yourself",
      title: "Встреча с собой",
      prompt:
        "The surroundings fade into pure black with a single dramatic beam of light from above. Opposite the person, a small child version of the same person, about six years old with the same facial features and hair, steps into the light. They look at each other in silence; the adult slowly kneels to the child's level and a faint smile appears on both faces. Slow push-in, soft haze in the beam, emotional and epic. Keep the adult's face identical to the image. No text, no logos.",
      image: "/presets/video-template/image/meet-yourself.jpg",
      video: "/presets/video-template/video/meet-yourself.mp4",
      description: "Взрослый встречает себя маленького в луче света.",
      category: "trends",
      ratio: "9:16",
    },
    {
      id: "old-photo-alive",
      title: "Оживить старое фото",
      prompt:
        "The old photo gently comes to life. The people in it breathe, blink naturally, smile a little wider and turn their heads slightly toward each other; a light breeze moves their hair, clothes and the leaves behind them. Keep the original colors or black-and-white tones, film grain, scratches and vintage look; the camera does not move. Subtle, respectful, natural motion only. Keep every face exactly as in the photo. No text, no logos.",
      image: "/presets/video-template/image/old-photo-alive.jpg",
      video: "/presets/video-template/video/old-photo-alive.mp4",
      description: "Люди на старом снимке моргают, дышат и улыбаются, а зерно и царапины остаются.",
      category: "trends",
      ratio: "9:16",
    },
    {
      id: "clones",
      title: "Клоны",
      prompt:
        "The person crosses their arms and smirks, then identical copies step out from behind them one after another, left and right, until the space is filled with dozens of clones, all in the same pose, turning their heads to the camera at the same moment. Slow pull-back revealing the crowd, cold light, slightly surreal comedic tone. Every clone has the same face and outfit as in the image. No text, no logos.",
      image: "/presets/video-template/image/clones.jpg",
      video: "/presets/video-template/video/clones.mp4",
      description: "Из-за спины выходят десятки копий человека и одновременно поворачиваются к камере.",
      category: "trends",
      ratio: "9:16",
    },
    /* Templates cut from real footage. */
    {
      id: "hall-dance",
      title: "Танец в зале",
      prompt:
        "Парень в светлом спортивном костюме танцует хип-хоп посреди нарядного зала с люстрами и фиолетовой подсветкой, гости смотрят со стороны. Камера на уровне пояса, плавный наезд.",
      image: "/uploads/dance.jpg",
      video: "/uploads/dance.mp4",
      category: "trends",
      ratio: "9:16",
    },
    {
      id: "mountain-walk",
      title: "Прогулка в горах",
      prompt:
        "Девушка в светлом костюме стоит на крыше внедорожника на фоне зелёных гор, ветер развевает волосы, она поворачивается к камере. Лёгкий облёт камеры по дуге.",
      image: "/uploads/walk.jpg",
      video: "/uploads/walk.mp4",
      category: "trends",
      ratio: "9:16",
    },
    {
      id: "evening-party",
      title: "Вечерний праздник",
      prompt:
        "Девушка с бутылкой шампанского выходит к скамейке в вечернем парке, вокруг гирлянды и огни, она улыбается и поднимает бутылку. Тёплый свет, съёмка с рук.",
      image: "/uploads/birthday.jpg",
      video: "/uploads/birthday.mp4",
      category: "trends",
      ratio: "9:16",
    },
  ],
}
