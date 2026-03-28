# Geo Analysis Dashboard

MVP-интерфейс панели геоаналитики на **Next.js 14+**, **TypeScript**, **Tailwind CSS**, **shadcn/ui** (примитивы Radix + стили), **react-hook-form**, **Zod**. Данные и карта — заглушки, без API и без провайдера карты.

## Требования

- Node.js 18+
- npm

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Сборка и прод:

```bash
npm run build
npm start
```

## Переменные окружения

Скопируйте пример и при необходимости измените значения:

```bash
cp .env.example .env.local
```

## Структура

| Путь | Назначение |
|------|------------|
| `app/` | Маршруты и layout Next.js |
| `components/` | Общие UI и оболочка (header, empty state, shadcn-примитивы) |
| `features/analysis/` | Боковая панель параметров и история запросов |
| `features/map/` | Заглушка карты |
| `features/results/` | Панель результатов |
| `store/` | Зарезервировано под будущее состояние (сейчас не используется) |
| `types/` | Общие типы домена |
| `lib/` | Утилиты и mock-данные |

Дальше: форма параметров, вызовы backend и подключение map provider можно вынести в `features/*/api` или `lib/api` без перелома текущей вёрстки.
