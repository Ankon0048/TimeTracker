# TimeTracker — Next.js + Redux Frontend

Next.js (App Router) + Redux Toolkit frontend for the TimeTracker API, built alongside
`../time-tracker-backend` (ASP.NET Core) and the original `../time-tracker` (Vite/React) app.

## Stack

- Next.js 16 (App Router, TypeScript, Turbopack)
- Redux Toolkit + React-Redux (`src/features/*/*Slice.ts`)
- Axios API client (`src/lib/apiClient.ts`, `src/lib/api/*.ts`)
- TipTap rich text editor for project/task descriptions
- Tailwind CSS v4 design tokens (`src/app/globals.css`) underlying the shared `.btn`/`.card`/`.input` component classes
- `@dnd-kit/core` for the Kanban drag-and-drop board

## Prerequisites

- Node.js 20+
- The TimeTracker backend running locally (see below) with a reachable PostgreSQL database

## Running the backend

```bash
cd ../time-tracker-backend/timeTracker
dotnet run
```

By default this serves the API at `http://localhost:8000` (see `Properties/launchSettings.json`)
and expects PostgreSQL on `localhost:5432` (see `appsettings.json` → `ConnectionStrings:DefaultConnection`).
Swagger UI is available at `http://localhost:8000/swagger`.

**CORS:** the backend's allowed-origins list (`Program.cs`) includes both `http://localhost:5173`
(the original Vite app) and `http://localhost:3000` (this app's dev server). If you run either
app on a different port, add that origin to `Program.cs` too.

## Running this app

```bash
cp .env.example .env.local   # adjust NEXT_PUBLIC_API_URL if your backend runs elsewhere
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/projects`.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Base URL the Axios client (`src/lib/apiClient.ts`) sends requests to. |

## Routes

| Route | Purpose |
| --- | --- |
| `/projects` | Project list |
| `/projects/new` | Create project |
| `/projects/[id]` | Task board (Kanban, grouped by state) for a project |
| `/projects/[id]/edit` | Edit project |
| `/projects/[id]/tasks/new` | Create task (optional `?parentId=` for subtasks) |
| `/projects/[id]/tasks/[taskId]/edit` | Edit task |

## Production build

```bash
npm run build
npm run start
```

## Manual QA checklist

See the "Smoke test & manual QA pass" task in `../Nextjs_Redux_Migration_Plan.xlsx` for the
end-to-end checklist to run against a live backend (project/task CRUD, drag-and-drop, timer).
