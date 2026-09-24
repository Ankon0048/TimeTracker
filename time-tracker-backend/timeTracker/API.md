# TimeTracker API Documentation

Base URL: `http://localhost:<port>/api`

---

## Rich Text Description Format

The `description` field in both **Projects** and **Tasks** accepts and stores **HTML rich text**.
Use a rich text editor on the frontend (e.g. Quill, TipTap, ProseMirror) that produces HTML output.

**Supported formatting:**
- `<strong>` / `<b>` — Bold
- `<em>` / `<i>` — Italic
- `<u>` — Underline
- `<s>` / `<del>` — Strikethrough
- `<ul>`, `<ol>`, `<li>` — Unordered and ordered lists
- `<h1>` – `<h6>` — Headings
- `<blockquote>` — Blockquotes
- `<a href="...">` — Hyperlinks
- `<code>`, `<pre>` — Inline code / code blocks
- `<br>`, `<p>` — Paragraphs and line breaks

**Example HTML rich text value:**
```
<p><strong>Setup Phase</strong></p><ul><li>Install dependencies</li><li>Configure environment</li></ul><p>See <a href="https://example.com">docs</a> for details.</p>
```

The database column type is `text` (PostgreSQL), which supports arbitrary-length HTML strings.
Store and return raw HTML — do **not** strip tags server-side.

---

## Project Management

### Create Project
- **Endpoint:** `POST /Project`
- **Description:** Creates a project and auto-inserts the start datetime to the current datetime now.
- **Request Body:**
```json
{
  "name": "Project Alpha",
  "description": "<p><strong>First project</strong></p><ul><li>Phase 1</li><li>Phase 2</li></ul>",
  "end": "2026-12-31T23:59:59Z"
}
```
- **Response (200 OK):**
```json
{
  "id": 1,
  "name": "Project Alpha",
  "description": "<p><strong>First project</strong></p><ul><li>Phase 1</li><li>Phase 2</li></ul>",
  "start": "2026-06-26T12:00:00Z",
  "end": "2026-12-31T23:59:59Z"
}
```

> `description` is stored and returned as raw HTML. Use `innerHTML` or a rich text viewer on the frontend to render it.

### Read Projects
- **Endpoint:** `GET /Project`
- **Description:** Returns all the projects.
- **Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Project Alpha",
    "description": "<p><strong>First project</strong></p><ul><li>Phase 1</li><li>Phase 2</li></ul>",
    "start": "2026-06-26T12:00:00Z",
    "end": "2026-12-31T23:59:59Z"
  }
]
```

### Update Project
- **Endpoint:** `PUT /Project/{id}`
- **Request Body:** Same as Create (description as HTML rich text string)
- **Response:** Returns updated project object

### Delete Project
- **Endpoint:** `DELETE /Project/{id}`
- **Response (204 No Content)**

---

## Task Management

### Create Task
- **Endpoint:** `POST /Task`
- **Description:** Creates a task. If `parentID` is null, uses State 'Pending'. If `parentID` is given, uses parent's State. If `projectID` is passed, adds to the mapper table.
- **Request Body:**
```json
{
  "parentID": null,
  "name": "Initial Task",
  "description": "<p><strong>Setup task</strong></p><ol><li>Install tools</li><li>Run migrations</li></ol>",
  "start": "2026-06-26T12:00:00Z",
  "end": null,
  "timeTaken": "02:30:00",
  "projectID": 1
}
```
- **Response (200 OK):**
```json
{
  "id": 1,
  "parentID": null,
  "name": "Initial Task",
  "description": "<p><strong>Setup task</strong></p><ol><li>Install tools</li><li>Run migrations</li></ol>",
  "start": "2026-06-26T12:00:00Z",
  "end": null,
  "timeTaken": "02:30:00",
  "stateID": 1
}
```

> `description` accepts and returns raw HTML. Render it via `innerHTML` or a dedicated rich text viewer on the frontend.

### Read Tasks
- **Endpoint:** `GET /Task`
- **Description:** Returns all tasks.

### Update Task
- **Endpoint:** `PATCH /Task/{id}`
- **Description:** Partially updates a task. All fields are optional. Pass `description` as an HTML rich text string.
- **Request Body (example):**
```json
{
  "description": "<p>Updated with <strong>bold</strong> and <em>italic</em>.</p>"
}
```

### Delete Task
- **Endpoint:** `DELETE /Task/{id}`
- **Response (204 No Content)**

### Read Parent Tasks
- **Endpoint:** `GET /Task/parent/{projectId}`
- **Description:** Returns all tasks for a project which have null in `parentID`.

### Read Nested Tasks
- **Endpoint:** `GET /Task/nested/{parentTaskId}`
- **Description:** Returns all tasks whose `parentID` is equal to the given `parentTaskId`.

---

## State Management

### Create State
- **Endpoint:** `POST /State`
- **Request Body:**
```json
{
  "name": "In Progress"
}
```
- **Response (200 OK):**
```json
{
  "id": 2,
  "name": "In Progress"
}
```

### Read States
- **Endpoint:** `GET /State`

### Update State
- **Endpoint:** `PUT /State/{id}`

### Delete State
- **Endpoint:** `DELETE /State/{id}`
