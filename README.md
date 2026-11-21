# AI Task Manager

Матрица Эйзенхауэра с ИИ-разбором задач. Next.js 15 (App Router, TS) · Tailwind · Turso (libSQL) · Gemini.

## Запуск

```bash
npm install
cp .env.example .env.local   # заполните переменные
npm run dev
```

| Переменная | Описание |
|---|---|
| `GEMINI_API_KEY` | ключ Gemini, используется **только на сервере** (Route Handlers) |
| `GEMINI_MODEL` | модель Gemini (по умолчанию `gemini-3.7-flash`) — меняется без правки кода |
| `TURSO_DATABASE_URL` | `libsql://<db>-<org>.turso.io`; если пусто — локальный файл `local.db` |
| `TURSO_AUTH_TOKEN` | токен Turso (`turso db tokens create <db>`) |

Таблицы `atm_tasks` и `atm_subtasks` (префикс `atm_`, чтобы не пересекаться с другими проектами в той же базе) создаются автоматически при первом запросе.

## Деплой на Vercel

1. Загрузите папку проекта в GitHub (файл `.env.local` в `.gitignore` и не попадёт в репозиторий).
2. На vercel.com: **Add New → Project**, выберите репозиторий. Framework — Next.js определится сам.
3. В **Settings → Environment Variables** добавьте `GEMINI_API_KEY`, `GEMINI_MODEL`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`.
4. Нажмите **Deploy**.

Без `TURSO_DATABASE_URL` на Vercel приложение работать не будет: локальный файл там недоступен для записи.
ИИ-роуты имеют лимит 60 секунд (`maxDuration`), потому что Gemini иногда отвечает медленно.

## API

- `GET /api/tasks` — задачи с подзадачами
- `POST /api/parse` `{text}` — Gemini извлекает задачи и сохраняет их
- `PATCH|DELETE /api/tasks/:id` — чекбокс, смена квадранта, удаление
- `POST /api/tasks/:id/decompose` — 3–5 шагов с оценкой времени
- `PATCH /api/subtasks/:id` — чекбокс шага

Голосовой ввод — Web Speech API (`ru-RU`), работает в Chrome/Edge/Safari.
