# 09. Предметные иллюстрации — стиль DnD и генерация

Самостоятельный гайд · 29.09.2026. Эталон — утверждённый «Веер файлов», подключённый в [FileDropOverlay](../../src/components/chat-composer/file-drop.tsx). Использовать совместно с [гайдом иконок](08-tool-icon-generation.md).

## Эталон и его смысл

![Утверждённый веер: документ, фото, видео](references/illustrations/file-drop-fan.png)

Файл: [PNG-референс](references/illustrations/file-drop-fan.png), оригинал [public/illustrations/file-drop-fan.png](../../public/illustrations/file-drop-fan.png). Формат RGBA, 1254×1254. В центре — белый документ с загнутым уголком и тремя фиолетовыми строками; за ним фиолетовый подлист. Слева — квадратная магентовая иконка Фото, справа — квадратная оранжевая иконка Видео. Сюжет объясняет добавление разных файлов.

В истории выбора 28.09 пользователь отдельно потребовал заменить аудио на видео и сохранить квадратные иконки инструментов 1:1. Поэтому синий блок с нотой не относится к финальному DnD-эталону. Старый мудборд с шестью направлениями — история поиска, а не набор утверждённых иллюстраций.

## Общая художественная система

| Слой | Как выглядит |
| --- | --- |
| Основной предмет | Простая узнаваемая форма, светлая жемчужная поверхность, мягкие фаски |
| Акцентные предметы | Цветные инструменты из действующего набора, сатиновая эмаль |
| Рельеф | Неглубокие мягкие объёмы и аккуратные контактные тени между слоями |
| Свет | Мягкий верхний левый свет; направления бликов согласованы с иконками |
| Палитра | Нейтральный белый + фиолетовый, 1–2 цвета связанных инструментов |
| Композиция | Компактная группа, один главный предмет, 2–3 подчинённых слоя |
| Фон | Прозрачный; иллюстрация работает на обеих темах без белой подложки |
| Настроение | Спокойное и предметное; помогает понять состояние интерфейса |

Материал не должен превращаться в грубый пластилин, резиновую игрушку, фотосток, стеклянный куб или хром. Нужны мягкие отражения, а не интенсивное свечение вокруг всей композиции. На изображении нет UI, текстовых инструкций, логотипов генератора и водяных знаков. Подпись и ограничения файлов всегда рендерятся HTML рядом с иллюстрацией.

## Правила композиции

1. Сначала сформулировать состояние интерфейса: что произошло и какое действие ожидается. Один сценарий — одна метафора.
2. Главный предмет должен объяснять сценарий без подписи. DnD — несколько типов файлов, объединённых в компактный веер.
3. Разнести силуэты, чтобы документ, фото и видео читались при ширине всей композиции 192 px. Не прятать оба боковых символа за документом.
4. Наклоны предметов — небольшие и уравновешенные. Иконки инструментов сохраняют квадратную форму до поворота. Не использовать растяжение и перспективную деформацию готовых плиток.
5. Оставить прозрачный воздух по краям; край объекта не должен касаться границы crop, используемого в UI.
6. Новая иллюстрация не обязана повторять веер. Повторять нужно материал, палитру и простоту; метафора определяется новым состоянием.

Для будущих состояний допустимые **предложения, а не утверждённые ассеты**: пустой проект — папка с одним листом; готовый экспорт — документ с простым знаком готовности; отсутствие результатов поиска — предметная лупа с листом. Не использовать случайные звёздочки, сферы и конфетти как замену смыслу.

## Что передать генератору

Обязательные референсы:

1. [file-drop-fan.png](references/illustrations/file-drop-fan.png) — материал, композиционная плотность и характер иллюстрации.
2. [photo.png](references/icons/photo.png) — точная иконка Фото.
3. [video.png](references/icons/video.png) — точная иконка Видео.
4. [text-primary.png](references/icons/text-primary.png) — фиолетовая палитра и материал, без переноса буквы T на документ.

В брифе указать, какие изображения задают стиль, какие объекты необходимо сохранить, а какие являются только цветовым ориентиром. Нельзя рассчитывать, что модель угадает «как в DnD» без изображения.

## Универсальный промпт новой иллюстрации

Ниже — новый рабочий шаблон handoff, не дословная запись исторической генерации.

```text
Create ONE standalone product-state illustration for AI Hub.

PURPOSE
UI state: [STATE].
User action or result: [ONE SENTENCE].
Main visual metaphor: [ONE PRIMARY OBJECT / ACTION].

REFERENCES
Image 1: approved AI Hub file-fan illustration. Match its satin enamel,
pearl-white surfaces, soft shallow bevels, restrained relief, upper-left
studio lighting, compact composition and clean transparent background.
Images 2–N: existing AI Hub tool icons. Preserve their identities and colors.
Specify which icon is used and which is only a material/color reference.

COMPOSITION
One clear dominant object, with at most 2–3 supporting layers.
Readable at 192 px total display width. Balanced silhouette and overlap.
Use neutral pearl white and brand violet, plus only colors of relevant tools.
No scene background, no floor plane, no surrounding cast shadow.
Subtle contact shading between overlapping objects is allowed.
Keep all objects fully inside the safe artwork area.

INVARIANTS FOR EXISTING TOOL ICONS
Square 1:1 tiles before rotation, original symbols and rounded corners.
Uniform scaling and in-plane rotation only. No stretching, skew,
perspective distortion, icon recoloring or glyph redesign.

DELIVERY
One standalone high-resolution RGBA PNG, genuine transparent background.
Square master canvas. Main composition wider than tall and centered,
with clear transparent margins for the intended UI crop.
No captions, letters, watermark, UI mockup or checkerboard background.

AVOID
Clay toy, glossy plastic blob, chrome, thick glass, neon halo, particles,
random spheres, excessive depth, many tiny details, dramatic perspective,
decorative objects that do not explain the UI state.
```

Для встроенного генератора отдельно включать `transparent_background: true`. Если новая сцена требует другого соотношения сторон, зафиксировать его в брифе и обновить wrapper в UI; не втискивать любой рисунок в существующий crop.

## Промпт воспроизведения DnD-веера

```text
Create a focused revision of the approved AI Hub file-fan illustration.
Use image 1 as the composition and central document reference.
Use image 2 as the exact magenta Photo tool tile.
Use image 3 as the exact orange Video tool tile.
Use image 4 only as the violet material/color reference.

Center a pearl-white document with a softly folded top-right corner and
three simple violet raised horizontal lines. Add a small violet undersheet.
Place the magenta Photo tile behind the document on the left and the orange
Video tile behind it on the right, opening as a compact balanced fan.

The Photo and Video tiles MUST remain squares with aspect ratio 1:1 before
their in-plane rotation. Preserve their original symbols, symbol scale,
rounded corners, hue, gradient, shallow bevel and lower inner gleam.
Only uniform scaling, in-plane rotation and partial overlap are allowed.
Do not turn tool tiles into tall document cards.

Absolutely no Audio icon, no blue tile and no musical note.
Do not put the letter T from image 4 onto the document.
Keep the soft satin enamel and pearl-white material, shallow relief and
upper-left studio lighting. Transparent alpha, no floor or outer shadow.
One standalone illustration, no board, no text, no UI, no watermark.
```

**Предел точности:** генеративная модель может заново нарисовать символ даже при словах «exact». Если нужна буквальная идентичность существующих иконок, собрать финальную композицию из исходных PNG как неизменяемых слоёв в графическом редакторе: равномерный scale, rotation и overlap. Сгенерировать отдельно документ/подлист или всю композицию как ориентир; не называть реконструкцию пиксельно идентичной. Текущий внедрённый веер — утверждённое целое растровое изображение, не отдельные DOM-слои.

## Экспорт и размеры текущего DnD

| Параметр | Значение в baseline |
| --- | --- |
| Исходник | 1254×1254 RGBA PNG |
| Видимая композиция при alpha ≥128 | bbox `[76,283,1198,968)`, около 1122×685 px |
| Wrapper mobile | `w-48`, то есть 192 px; `aspect-[8/5]`, высота 120 px |
| Wrapper desktop ≥768 | `w-56`, то есть 224 px; высота 140 px |
| Рендер | `absolute inset-0 size-full object-cover`, исходное соотношение сторон сохраняется |
| Overlay | `fixed inset-0`, z-index 70; padding 12 px / 16 px desktop |
| Поверхность | `bg-background/92`, рамка `border-2 border-dashed border-primary/40`, `bg-primary/5`, radius 28 px |
| Отступ до текста | 16 px; между заголовком и лимитом 6 px |
| Текст | «Перетащите файлы сюда»; actual limit приходит через prop |
| Motion | Вход 150 ms, выход 100 ms; opacity и scale .98→1; reduced motion убирает scale |

В PNG есть очень слабые alpha-пиксели за пределами основной композиции, поэтому полный bbox ненулевого alpha не равен видимому силуэту. Измерять геометрию по значимой непрозрачности и дополнительно смотреть на белом/тёмном фоне. Не заменять фон картинки цветом темы.

`object-cover` здесь срезает прозрачные вертикальные поля square master, а не растягивает рисунок. Для нового asset нужно проверить, что центральный crop 8:5 не обрезает значимые детали. Не копировать crop без проверки.

Текущая интеграция:

```tsx
<div aria-hidden="true" className="relative aspect-[8/5] w-48 shrink-0 md:w-56">
  <img
    src={withBasePath("/illustrations/file-drop-fan.png")}
    alt=""
    width={1254}
    height={1254}
    draggable={false}
    decoding="async"
    className="absolute inset-0 size-full object-cover"
  />
</div>
```

Рисунок декоративный: смысл озвучивает `role="status"` активного overlay. Overlay не перехватывает pointer events; drag/drop обрабатывается hook. Не превращать иллюстрацию в кнопку. На телефоне остаётся доступна обычная загрузка через системный picker; drag-and-drop не должен быть единственным способом прикрепить файл.

## Рабочий процесс и передача результата

1. Заполнить бриф состояния и выбрать референсы.
2. Сгенерировать небольшой набор композиций в одном материале; выбрать по ясности на реальном размере.
3. Исправлять по одному дефекту, фиксируя остальные свойства.
4. Для встроенных существующих иконок проверить 1:1 и идентичность; при необходимости собрать их из исходных слоёв.
5. Сохранить raw master, final PNG, prompt и reference list. Экспорт не должен уничтожать исходник.
6. Подключить через `withBasePath`; проверить размер, обе темы и мобильную компоновку.
7. Сохранить screenshot использования и обновить manifest.

Имена: `public/illustrations/<state>-<subject>.png`, например существующий `file-drop-fan.png`. Итерации — вне production-папки, с суффиксами `v1/v2`; в приложении только выбранный файл. Если нужна оптимизация, сравнить качество, alpha и светлые грани до замены; потеря тени между слоями ради меньшего веса недопустима.

## Чек-лист качества

- [ ] Состояние считывается без подписи; в композиции один главный предмет.
- [ ] Материал и свет совпадают с иконками инструментов.
- [ ] В финальном DnD присутствуют Фото и Видео; аудио/ноты нет.
- [ ] Плитки квадратные до поворота; символы не заменены и не деформированы.
- [ ] На 192 px различимы все значимые предметы, нет визуальной каши.
- [ ] Alpha настоящий; нет фоновой шахматки, белого прямоугольника или каймы.
- [ ] На dark белый документ не пересвечен, на light край не пропадает.
- [ ] Crop 8:5 оставляет все значимые детали; рисунок не тянется по осям.
- [ ] Подписи, лимиты и действия остаются доступными HTML-элементами.
- [ ] Приложены отдельный PNG, редактируемые слои при композитинге, prompt и preview применения.
