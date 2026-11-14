# Wrenchly design system

Token values live in `tokens.json`. Each component has a `README.md` and a `preview.html` under `components/`. The previews use CSS variables named after the tokens (`--bg`, `--brand`, `--font-display`, ...), so they render only once those variables are defined.

Wrenchly — Duolingo-подобный веб-курс про **твою** машину. Аудитория: владельцы машин в США 25–45, не механики, боятся переплатить в сервисе. Ощущение: гараж знакомого механика, а не игрушка и не дилерский сайт. Мир продукта: сервисная книжка, щуп масла, антифриз, бирки на запчастях, VIN на стекле.

## Голос и текст

- Весь UI на английском (рынок США). Говорим на «you», коротко, как механик-друг: «Your pads are 3 mm. Time to plan a swap.»
- Sentence case для кнопок и заголовков; UPPERCASE только для стиля `label` (эйбрау, теги, текст кнопок).
- Называем вещи как владелец: «brake pads», а не «friction material». Термин даём один раз в скобках.
- Цифры конкретные и в `data` (моно): `$180–$320`, `3 mm`, `0W-20`. Любая цена с подписью `caption`: «Estimate, varies by region.»
- Безопасность — без страха и без шуток: «Use jack stands. Never work under a car on a jack alone.»
- Эмодзи нет. Восклицательный знак — только на экране завершения урока.
- Примеры: кнопки «Start with my car», «Try demo», «Check answer», «Continue», «Unlock Pro»; ошибка VIN: «We couldn't read that VIN. Pick year, make and model instead.»

## Цвет

- Земля `bg`, карточки `surface`, колодцы и залоченное `surface-sunken`. Текст `ink`, вторичный `ink-muted`.
- `brand` (антифриз-teal) — одно главное действие на экране, текущий узел карты, прогресс, правильный ответ. Текст на нём `on-brand`.
- `amber` (щуп масла) — только XP, streak, тег DEMO, предупреждения. Заливкой с `on-amber`; как текст — `amber-ink`.
- `brake` — только безопасность, неверный ответ, отзывные кампании (recalls). Всегда с иконкой или словом, не одним цветом. Фон — `brake-soft`.
- `plate` / `on-plate` — Premium: бейдж Pro, выделенный тариф, рамка 3D-лаборатории.
- Правильный (`brand`) и неверный (`brake`) различаются не только оттенком: teal ушёл от оси красный–зелёный, плюс иконка ✓/✕ и слово «Correct» / «Not quite».
- Фокус: `focus`, 2px solid, offset 2px, на всём интерактивном.
- Не использовать: градиенты, сине-фиолетовые фоны, зелёный «как у Duolingo».

## Типографика

- `display` / `h1`–`h3` — Archivo, жирный, индустриальный (как шильдики и техпаспорта). `display` — максимум один на экран.
- Текст — Instrument Sans: `body-lg` в карточках урока и чате, `body` в UI, `label` — uppercase-эйбрау и кнопки, `caption` — дисклеймеры.
- `data` и `stat` — JetBrains Mono: VIN, характеристики, цены, моменты затяжки, XP, счёт квиза. `font-variant-numeric: tabular-nums`.
- Ширина текста урока ≤ 65 знаков. Заголовкам — `text-wrap: balance`.
- Шрифты с Google Fonts: `Archivo:wght@700;800`, `Instrument+Sans:wght@400;600`, `JetBrains+Mono:wght@500;700`.

## Отступы, форма, глубина

- Сетка 4px: `space-1`…`space-8`. Боковой отступ страницы ≥ `space-4`. Паддинг карточки `space-4` на телефоне, `space-5` на десктопе.
- Радиусы: `radius-sm` теги и инпуты, `radius-md` кнопки и варианты квиза, `radius-lg` карточки, `radius-pill` узлы карты, чипы XP/streak, прогресс-бары.
- Глубина «нажимная», как у физической кнопки: `press-brand` под главными кнопками, `press-neutral` под вторичными и вариантами квиза. На `:active` — сдвиг вниз на 4px и тень `none`. `raise` — только для всплывающих панелей (paywall, инфо о детали в 3D).
- Границы `line` декоративные; у контролов — `line-strong`.

## Движение

- 120–180 ms, `ease-out`. Нажатие кнопки, выбор варианта, заполнение прогресса.
- Один «праздничный» момент: экран завершения урока — счётчик XP досчитывает, пламя streak вспыхивает `amber`.
- Уважать `prefers-reduced-motion`: без счётчиков и сдвигов, только смена цвета.

## Иконки

- UI-иконки: Lucide, stroke 2px, 20/24px, цвет — `currentColor` от текста.
- Детали машины: иллюстрации PartArt — плоский SVG 96×96, контур 3px `ink`, заливки только из токенов. Металл — `plate`, трущиеся поверхности — `surface-sunken`, рабочий элемент — `brand`, масло и ток — `amber`, детали с риском — `brake`. Вставлять inline, не через `<img>`.
- Своего логотипа пока нет: имя «Wrenchly» набираем в `h3`/`display`, Archivo 800.

## Экраны

| Экран | Ключевые компоненты | Правило |
|---|---|---|
| `/` лендинг | `display`, Button ×2 | «Start with my car» — brand, «Try demo» — secondary. Hero по контенту, не 100vh. |
| `/onboarding` | VIN-инпут (`data`), Button | Неверный VIN → форма year/make/model, текст ошибки по-человечески. |
| `/app` карта | StreakBar, CarCard, CourseNode | Узлы в колонку зигзагом, шаг `space-7`. «Coming soon» — открывает реальную страницу. |
| `/lesson/[key]` | LessonCard ×4, SafetyNote, QuizOption | Прогресс сверху, одна карточка на экран, кнопка внизу на всю ширину на телефоне. |
| `/pricing` | PlanCard ×2 | Годовой план на `plate`, «Save 50%». Цена `stat`. Тег «Stripe test mode». |
| `/chat` | пузыри `surface` / `brand-soft` | Ответ со ссылками на уроки; фото ≤ 5 MB, jpeg/png/webp. |
| `/lab` | сцена на `plate`, панель с `raise` | Клик по детали → панель с мини-уроком. |

- Демо-режим всегда помечен тегом `DEMO` на `amber`, кнопка «Simulate next day» — secondary.
- Мобильная ширина 375px — основной макет; десктоп — центральная колонка до 640px (урок) / 960px (лендинг).
