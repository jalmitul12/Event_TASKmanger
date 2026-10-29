# Event Task Manager (EventFlow)

A full-stack, responsive **Event Task Manager web application** built using **HTML5, CSS3, JavaScript (ES6+), Vue.js 3 through CDN, and Plain Node.js**.

Designed specifically for college practical examinations, demonstrations, and viva voce defense.

---

## 1. Key Highlights & Requirements Fulfillment

- **Zero Third-Party Backend Frameworks:** Implemented solely using Node.js built-in modules (`http`, `fs`, `path`, `url`). **No Express.js**.
- **No Complex Build Pipeline:** Runs directly in standard browsers using Vue 3 global build loaded from CDN (`https://unpkg.com/vue@3/dist/vue.global.js`). **No Vite, No Vue CLI, No Webpack**.
- **JSON File Persistence:** Stores records persistently in `data/data.json` with relational referential integrity (cascading cleanup of child tasks).
- **Comprehensive Vue.js 3 Directives:** Thorough, meaningful usage of `v-model`, `v-if`, `v-else-if`, `v-else`, `v-for`, `v-bind` (`:`), `v-on` (`@`), `v-show`, along with reactive `computed` properties.
- **Polished Professional Design:** Custom responsive CSS using Flexbox & Grid, CSS variables, hover elevation, and status-coded badges (inspired by real event dashboards).
- **Dual Task Views:** Toggle seamlessly between **Tabular List View** and **Interactive Kanban Board** (with native HTML5 drag-and-drop).
- **Referenced & Verified:** Verified against open-source repositories and template designs, fully cited in `REFERENCES.md`.

---

## 2. Mandatory Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Structure** | HTML5 | Semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<table>`, `<footer>`) |
| **Styling** | CSS3 | Responsive Flexbox & Grid, CSS variables, animations, custom typography |
| **Client Framework** | Vue.js 3 CDN | Global build (`Vue.createApp()`), reactive state, computed properties, lifecycle hooks |
| **Client-Server Comm** | Fetch API | Native asynchronous promises (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) |
| **Backend Runtime** | Plain Node.js | Built-in `http.createServer()`, URL routing, manual request body chunk streaming |
| **Data Persistence** | Node.js `fs` | Atomic read/write operations to local `data/data.json` file |

---

## 3. Directory Structure

```text
event-task-manager/
├── public/
│   ├── index.html        # Main single-page application template
│   ├── css/
│   │   └── style.css     # Custom responsive design & theme variables
│   └── js/
│       └── app.js        # Vue.js 3 CDN application logic & methods
├── data/
│   └── data.json         # Persistent JSON database (events & tasks)
├── server.js             # Native Node.js HTTP server & REST API
├── REFERENCES.md         # Source research deliverables & verified references
└── README.md             # Project documentation & viva explanation
```

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js (version 14.x or higher) installed on your system.

### Quick Start
1. Open a terminal in the project directory:
   ```bash
   cd event_taskmanager
   ```

2. Start the native Node.js HTTP server (either command works):
   ```bash
   npm start
   # or directly:
   node server.js
   ```

3. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

4. Run the automated test suite at any time:
   ```bash
   npm test
   # or directly:
   node test-direct.js
   ```

*(Note: There are **zero external npm packages** installed, because the backend relies exclusively on Node.js built-in modules `http`, `fs`, `path`, and `url`, and the frontend loads Vue 3 directly via CDN!)*

---

## 5. REST API Endpoints Reference

All endpoints return standardized JSON payloads:
- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": "..." }`

### Events Endpoints

| Method | Endpoint | Description | Request Body Payload | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/events` | Retrieve all events | None | `200` |
| `GET` | `/api/events/:id` | Retrieve single event with its child tasks | None | `200`, `404` |
| `POST` | `/api/events` | Create a new event | `{ name, category, startDate, endDate, venue, description, status }` | `201`, `400` |
| `PUT` | `/api/events/:id` | Update event details | `{ name, category, startDate, endDate, venue, description, status }` | `200`, `400`, `404` |
| `DELETE` | `/api/events/:id` | Delete event + cascade delete associated tasks | None | `200`, `404` |

### Tasks Endpoints

| Method | Endpoint | Description | Request Body Payload | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/tasks` | Retrieve all tasks | None | `200` |
| `GET` | `/api/tasks/:id` | Retrieve single task | None | `200`, `404` |
| `POST` | `/api/tasks` | Create a new task (validates eventId exists) | `{ title, eventId, priority, status, dueDate, assignedTo, description }` | `201`, `400` |
| `PUT` | `/api/tasks/:id` | Update task details | `{ title, eventId, priority, status, dueDate, assignedTo, description }` | `200`, `400`, `404` |
| `PATCH` | `/api/tasks/:id/status` | Quick update task status (Pending, In Progress, Completed) | `{ status }` | `200`, `400`, `404` |
| `DELETE` | `/api/tasks/:id` | Delete task | None | `200`, `404` |

---

## 6. Vue.js 3 Directives Guide (Exam Ready)

This application demonstrates the following core Vue directives:

1. **`v-model` (Two-way Data Binding):**
   - Synchronizes form controls directly with reactive JavaScript state.
   - Used in `eventForm` (event name, category, dates, venue, status) and `taskForm` (title, event dropdown, priority, status, due date, assignee).
   - Used in live search input fields (`eventSearchQuery`, `taskSearchQuery`) and filter select dropdowns.

2. **`v-if`, `v-else-if`, `v-else` (Conditional Rendering):**
   - Conditionally mounts and unmounts elements based on boolean expressions.
   - Used for tab-based view switching (`activeView === 'dashboard'`, `'events'`, `'tasks'`, `'event-details'`, `'viva'`).
   - Used for modal dialogs (`activeModal === 'event-form'`), empty state placeholders when no records match filters, and field validation error messages.

3. **`v-for` (List Rendering with `:key`):**
   - Iterates through arrays to render dynamic UI collections.
   - Loops over `filteredEvents` for event cards, `filteredTasks` for task lists, `upcomingDeadlines` on the dashboard, and option tags for select inputs.
   - Always paired with a stable `:key="item.id"` for optimal virtual DOM diffing.

4. **`v-bind` or `:` (Dynamic Attribute & Class Binding):**
   - Dynamically binds HTML attributes and inline styles to reactive expressions.
   - Dynamic progress bar widths: `:style="{ width: calculateEventProgress(event) + '%' }"`.
   - Dynamic badges and pills: `:class="['priority-pill', 'priority-' + task.priority.toLowerCase()]"`.
   - Nav tab highlighting: `:class="['nav-tab-btn', { active: activeView === 'events' }]"`

5. **`v-on` or `@` (Event Listening & Method Dispatch):**
   - Binds browser and form events to Vue methods.
   - `@click` for navigation, opening modals, viewing event details, deleting records.
   - `@submit.prevent` for intercepting form submissions without triggering page reload.
   - `@change` on task checkboxes for instant status toggling.
   - `@dragstart`, `@dragover`, `@drop` for native HTML5 Kanban drag and drop.

6. **`computed` Properties (Cached Reactive Computations):**
   - Automatically re-evaluates only when reactive dependencies change.
   - Derived statistics: `totalEvents`, `totalTasks`, `completedTasksCount`, `pendingTasksCount`, `inProgressTasksCount`, `overdueTasksCount`, `overallCompletionRate`.
   - Filtered arrays: `filteredEvents`, `filteredTasks`, `kanbanTasks` (grouped columns), `upcomingDeadlines`.

---

## 7. Practical Exam / Viva Voce Explanation

### Q1: How does the application work without Express.js?
**Answer:** Node.js contains a built-in module called `http`. By invoking `http.createServer((req, res) => { ... })`, we receive low-level request and response objects. We manually parse incoming URL paths using `url.parse(req.url, true)`, inspect `req.method` (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), collect incoming data stream chunks with `req.on('data')` and `req.on('end')`, validate payloads, and send responses using `res.writeHead()` and `res.end(JSON.stringify(data))`.

### Q2: How does data persistence work?
**Answer:** The server reads and writes to a local JSON file (`data/data.json`) using Node.js's native `fs` (File System) module. When an event or task is created, updated, or deleted, the in-memory JavaScript object is serialized with `JSON.stringify(db, null, 2)` and written to the file via `fs.writeFileSync`. This ensures all changes survive server restarts.

### Q3: How is referential integrity maintained between Events and Tasks?
**Answer:** 
1. When creating or editing a task, the backend checks whether `body.eventId` exists in `db.events`. If not, it rejects the request with HTTP 400 Bad Request.
2. When an event is deleted via `DELETE /api/events/:id`, the backend automatically removes all associated tasks from `db.tasks` using `db.tasks.filter(t => t.eventId !== eventId)`. This prevents orphaned tasks from remaining in the database.

### Q4: How is division by zero handled in progress calculation?
**Answer:** In both the Vue computed properties and methods, the calculation checks `if (total === 0) return 0;`. If an event has no tasks assigned to it yet, it gracefully displays `0%` progress rather than `NaN%`.

### Q5: How does the Kanban drag-and-drop interact with the backend?
**Answer:** The application uses standard HTML5 Drag and Drop events (`@dragstart`, `@dragover`, `@drop`). When a task card is dropped onto the "In Progress" column, the `@drop` handler grabs the task ID from `dataTransfer` and immediately sends a lightweight `PATCH /api/tasks/:id/status` request with `{ status: "In Progress" }` to update and persist the change in `data/data.json`.
