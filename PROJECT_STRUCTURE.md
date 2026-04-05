# Структура проекта `analize-busines_bot`

Веб-приложение на **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS** + **shadcn/ui** (Radix). Панель **геоаналитики**: выбор карты (Яндекс / 2GIS), поиск города и районы (**Nominatim + Overpass**); после выбора города — блок **анализа конкурентов** (форма + результаты + **история**), `POST /api/analysis/run` с bbox из OSM (только при провайдере **2GIS**).

---

## Дерево каталогов (логическое)

```
analize-busines_bot/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # <GeoApp />
│   ├── globals.css
│   ├── fonts/
│   └── api/
│       ├── analysis/
│       │   ├── run/route.ts      # POST — сеточный анализ + сохранение в SQLite
│       │   ├── history/route.ts  # GET — список истории
│       │   ├── [id]/route.ts     # GET — восстановить результат по requestId
│       │   └── test-search/route.ts
│       └── geo/
│           ├── cities/route.ts
│           └── districts/route.ts
├── components/
│   ├── app-header.tsx
│   └── ui/
├── data/                         # каталог для SQLite (файлы *.db в .gitignore)
├── features/
│   ├── analysis/
│   │   ├── analysis-form.tsx
│   │   ├── analysis-history.tsx  # список сохранённых прогонов
│   │   ├── analysis-results.tsx
│   │   ├── analysis-summary-cards.tsx
│   │   ├── top-zones.tsx
│   │   ├── cells-table.tsx
│   │   └── analysis-type-guards.ts
│   └── geo/
│       ├── geo-app.tsx
│       ├── provider-selection.tsx
│       └── city-districts-panel.tsx
├── lib/
│   ├── utils.ts
│   ├── analysis/
│   │   ├── dedupe.ts             # первое вхождение id между ячейками
│   │   ├── history-store.ts      # SQLite (server-only), WAL
│   │   ├── limits.ts, errors.ts, bbox.ts, grid.ts
│   │   ├── scoring.ts            # score, рекомендации, rankTopOpportunityZones
│   │   └── analyze-city.ts
│   ├── geo/
│   └── providers/2gis/
├── types/
│   ├── index.ts
│   ├── geo.ts, provider.ts, analysis.ts
├── package.json
├── PROJECT_STRUCTURE.md
└── README.md
```

---

## Поток данных

1. Провайдер → город (Nominatim) → районы (Overpass) — как раньше.
2. **`POST /api/analysis/run`** — сетка, по ячейкам 2GIS, **дедуп** по id между ячейками, **score** и **рекомендации**, `topZones` с `summaryText`. Успешный ответ **сохраняется** в SQLite (`lib/analysis/history-store.ts`).
3. **`GET /api/analysis/history`** — список; **`GET /api/analysis/[id]`** — полный JSON (id = `requestId`).

Внешние сервисы: Nominatim, Overpass, 2GIS (см. README).

---

## Ключевые файлы по ролям

| Область | Файлы |
|--------|--------|
| Сборка экрана | `app/page.tsx` → `features/geo/geo-app.tsx` |
| История в UI | `features/analysis/analysis-history.tsx` |
| Персистенция анализов | `lib/analysis/history-store.ts`, `app/api/analysis/history`, `[id]` |
| Дедуп и метрики | `lib/analysis/dedupe.ts`, `analyze-city.ts` |
| Скоринг / топ | `lib/analysis/scoring.ts` |

---

## Зависимости (смысл)

- **next**, **react**, **zod**, **lucide-react**, **tailwind** / **radix** — как ранее.
- **better-sqlite3** — локальная история анализов (Node runtime у API routes).
- **server-only** — запрет импорта history-store с клиента.

---

## Команды

```bash
npm install
npm run dev
npm run build && npm start
```

---

*При смене хостинга на serverless без ФС — заменить `history-store` на внешнюю БД; контракт API можно сохранить.*
