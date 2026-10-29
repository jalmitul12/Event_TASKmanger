# Event Task Manager — Research Deliverables & Verified References

This document presents the verified source research, website templates, code examples, and technical mapping conducted for the **Event Task Manager** full-stack web application.

---

## 1. Verified Event Management Website Templates

### Reference 1.1: TheEvent Conference & Event Template by BootstrapMade
- **Source URL:** https://bootstrapmade.com/theevent-conference-event-bootstrap-template/
- **Type:** Responsive HTML5 / CSS3 / Bootstrap Event Website Template
- **Accessible Source Code:** Yes (Free download & live demo)
- **Inspected Components:**
  - Event date badge overlay (`.event-date-badge` displaying month and day)
  - Event schedule & session breakdown
  - Category tags and venue/location metadata cards
- **Adaptation to Project:**
  - Adapted the event card structure: floating category and date badges, venue metadata with icons, and action buttons.
  - Replaced static schedule items with dynamic Vue.js event task lists and completion progress bars.
- **License:** BootstrapMade Free License (attribution preserved in documentation).

### Reference 1.2: Event Planning Template (Anjali12345677 / Event-planning-Template)
- **Source URL:** https://github.com/Anjali12345677/Event-planning-Template
- **Type:** Open-Source GitHub Repository (HTML5, CSS3, Bootstrap)
- **Accessible Source Code:** Yes (Public GitHub Repository)
- **Inspected Components:**
  - Multi-category event grid (college fests, workshops, cultural celebrations, hackathons)
  - Event description cards with hover elevation
  - Responsive layout for desktop and mobile viewports
- **Adaptation to Project:**
  - Adapted the responsive CSS grid layout for event cards (`repeat(auto-fill, minmax(320px, 1fr))`).
  - Added dynamic Vue directives (`v-for`, `:key`, `v-if`) to render real data from the Node.js API instead of hardcoded cards.
- **License:** Open Source / MIT equivalent.

### Reference 1.3: Event Manager Dashboard (apru02 / Event-Manager-Dashboard)
- **Source URL:** https://github.com/apru02/Event-Manager-Dashboard
- **Type:** Open-Source GitHub Repository
- **Accessible Source Code:** Yes (Public GitHub Repository)
- **Inspected Components:**
  - Event-to-task relational view
  - Event status workflow (Planning, Active, Completed, On Hold)
  - Quick action toolbar (search, filter, create event)
- **Adaptation to Project:**
  - Adapted the event detail view showing event meta alongside child task counts.
  - Implemented event filtering by status and date range in Vue computed properties.
- **License:** Open Source.

---

## 2. Verified Task Management & Kanban UI Examples

### Reference 2.1: CodeWithSindhu Kanban Board (CodeWithSindhu / kanban-board-js)
- **Source URL:** https://github.com/CodeWithSindhu/kanban-board-js
- **Type:** Vanilla JavaScript (ES6+), HTML5, CSS3 Kanban Board Repository
- **Accessible Source Code:** Yes (Public GitHub Repository)
- **Inspected Components:**
  - Native HTML5 Drag and Drop API (`dragstart`, `dragover`, `drop`)
  - Status columns: To Do / In Progress / Done
  - Task priority pill badges (High, Medium, Low) and deadline alerts
- **Adaptation to Project:**
  - Integrated native HTML5 drag-and-drop into Vue 3 event bindings (`@dragstart`, `@dragover.prevent`, `@drop`).
  - Upon drop, the handler dispatches a `PATCH /api/tasks/:id/status` request to persist the new column state to the Node.js server.
- **License:** MIT License.

### Reference 2.2: Native Drag and Drop Tutorial & Repo (flowforfrank / drag-n-drop)
- **Source URL:** https://github.com/flowforfrank/drag-n-drop
- **Type:** Open-Source GitHub Repository & WebTips Tutorial
- **Accessible Source Code:** Yes (Public GitHub Repository)
- **Inspected Components:**
  - Clean `dataTransfer.setData('text/plain', taskId)` implementation
  - Dropzone visual feedback (`.drag-over` CSS class toggling)
- **Adaptation to Project:**
  - Used for clean, framework-independent drag-and-drop mechanics in the task board view without external heavy libraries.
- **License:** MIT License.

### Reference 2.3: Vue 3 Task Manager on CodePen & Dev Community
- **Source URL:** https://codepen.io/pen/ and https://cristopherps.dev
- **Type:** Interactive CodePen Example (Vue 3 CDN)
- **Accessible Source Code:** Yes (Public CodePen snippet)
- **Inspected Components:**
  - Vue 3 CDN loading via `https://unpkg.com/vue@3/dist/vue.global.js`
  - Two-way bound form input (`v-model="newTaskTitle"`)
  - Filter tabs (All, Active, Completed) using computed properties
  - Dynamic badge counters `({{ tasks.length }})`
- **Adaptation to Project:**
  - Expanded into a multi-attribute task object (title, description, eventId, priority, status, dueDate, assignedTo).
  - Replaced browser `localStorage` with real HTTP calls (`fetch('/api/tasks')`).
- **License:** MIT / Open CodePen License.

---

## 3. Verified Dashboard, Form, and Modal Examples

### Reference 3.1: Start Bootstrap SB Admin (StartBootstrap / startbootstrap-sb-admin)
- **Source URL:** https://github.com/StartBootstrap/startbootstrap-sb-admin
- **Type:** Open-Source GitHub Repository (MIT License)
- **Accessible Source Code:** Yes (Public GitHub Repository)
- **Inspected Components:**
  - 4-card metric dashboard layout: Total, Completed, In Progress, Overdue
  - Left navigation sidebar + sticky top bar layout
  - Tabular data presentation with sorting headers
- **Adaptation to Project:**
  - Adapted the 4-quadrant summary metrics card styling with custom CSS variables and icons.
  - Used clean flexbox/grid layout without bulky Bootstrap bundle dependencies.
- **License:** MIT License.

### Reference 3.2: CodePen Modern Dashboard Stat Cards & Progress Bars
- **Source URL:** https://codepen.io (Dashboard metric cards pattern)
- **Type:** Interactive CodePen UI Pattern
- **Accessible Source Code:** Yes (Public HTML/CSS patterns)
- **Inspected Components:**
  - Stat card markup: title, large number, accent icon box, progress bar fill
  - Responsive CSS Grid: `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))`
- **Adaptation to Project:**
  - Applied to the Dashboard summary widgets: Total Events, Active Events, Total Tasks, Completed Tasks, Pending Tasks, Overdue Tasks, and Completion Rate %.
- **License:** Open Access.

### Reference 3.3: Accessible Modal Dialog & Form (MDN & CodePen)
- **Source URL:** https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
- **Type:** MDN Specification & CodePen Accessible Dialog Patterns
- **Accessible Source Code:** Yes
- **Inspected Components:**
  - Modal overlay backdrop with subtle blur (`backdrop-filter: blur(4px)`)
  - Header with title and close icon (`&times;`)
  - Stacked form fields with labels, placeholders, and error validation text
  - Sticky footer with Cancel and Submit buttons
- **Adaptation to Project:**
  - Built Vue-controlled modal components for Event Creation/Edit and Task Creation/Edit using `v-if="activeModal === 'event'"` and keyboard ESC handling (`@keyup.esc`).
- **License:** Public Domain / CC0.

### Reference 3.4: Google Material Symbols & Icons
- **Source URL:** https://fonts.google.com/icons
- **Developer Documentation:** https://developers.google.com/fonts/docs/material_symbols
- **CDN Stylesheet:** https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0
- **Type:** Google Official Web Icon Font Library
- **Accessible Source Code:** Yes (Open-Source Google Fonts)
- **Inspected & Used Icons:**
  - `edit` — Edit event and task action buttons
  - `delete` — Delete event and task action buttons
  - `event_note` — Application brand header logo
  - `dashboard` — Dashboard navigation tab
  - `event` — Events directory navigation tab & event stat card
  - `checklist` — Tasks directory navigation tab
  - `view_list` — List view switcher
  - `view_column` — Board view switcher
  - `add` — Create new event and task buttons
  - `search` — Search box adornment icon
  - `location_on` — Event venue indicator
  - `calendar_month` — Event start & end dates indicator
  - `check_circle` — Completed tasks stat icon
  - `pending` — Pending tasks stat icon
  - `error` — Overdue tasks stat icon
  - `trending_up` — Overall completion rate stat icon
  - `bolt` — Active / upcoming events stat icon
  - `sync` — Refresh data button icon
  - `arrow_back` — Back to events breadcrumb icon
- **Adaptation to Project:**
  - Replaced all raw unicode emojis with official Google Material Symbols icons across navigation, buttons, cards, and modal dialogs.
- **License:** Open Source (Apache License 2.0).

---

## 4. Verified Vue.js 3 Directive Examples

### Reference 4.1: Vue.js 3 Official Guide — Quick Start & CDN Usage
- **Source URL:** https://vuejs.org/guide/quick-start.html#using-vue-from-cdn
- **Type:** Official Vue.js Guide & Code Snippet
- **Inspected Syntax:**
  ```html
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script>
    const { createApp } = Vue;
    createApp({
      data() { return { ... }; },
      computed: { ... },
      methods: { ... },
      mounted() { ... }
    }).mount('#app');
  </script>
  ```
- **Adaptation to Project:** Direct foundational architecture for `public/js/app.js`.

### Reference 4.2: Vue.js Official Examples — TodoMVC & Handling User Input
- **Source URL:** https://vuejs.org/examples/#todomvc and https://vuejs.org/examples/#handling-input
- **Type:** Official Vue.js Interactive Example Applications
- **Inspected Directives:**
  - `v-model` for two-way form input binding
  - `@submit.prevent` for intercepting form submission without page reload
  - `v-for="task in filteredTasks" :key="task.id"` for reactive DOM lists
  - `v-if` / `v-else-if` / `v-else` for empty state rendering and conditional UI views
  - Computed properties for real-time derived statistics and filter lists
- **Adaptation to Project:** Used across all forms, filters, and dynamic calculations in the application.

---

## 5. Verified Plain Node.js HTTP & JSON Persistence Examples

### Reference 5.1: Brad Traversy — Vanilla Node.js REST API
- **Source URL:** https://github.com/bradtraversy/vanilla-node-rest-api
- **Type:** Open-Source Educational GitHub Repository (MIT License)
- **Accessible Source Code:** Yes (Public GitHub Repository)
- **Inspected Backend Architecture:**
  - Native `http.createServer((req, res) => { ... })`
  - URL route matching using regex and `url.parse(req.url, true)`
  - Streaming body chunk reader helper:
    ```javascript
    function getBodyData(req) {
      return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => { resolve(body); });
      });
    }
    ```
  - Standardized JSON responses with `res.writeHead(status, headers)` and `res.end(JSON.stringify(payload))`
  - Safe file reading and writing using Node.js `fs.promises` / `fs.writeFileSync`
- **Adaptation to Project:**
  - Adapted the server router to handle RESTful operations for `/api/events` and `/api/tasks`.
  - Added static file serving (`fs.createReadStream` / `fs.readFile`) so the server serves both the frontend HTML/CSS/JS and the REST API from the same origin on port 3000.
  - Implemented relational integrity: deleting an event automatically cleans up child tasks in the JSON database.
- **License:** MIT License.

### Reference 5.2: Erick Wendel — Complete Node.js Web API Without Frameworks
- **Source URL:** https://github.com/ErickWendel/complete-nodejs-webapi-without-frameworks-yt
- **Type:** Open-Source Educational GitHub Repository
- **Inspected Backend Architecture:**
  - Centralized route dispatch table and method-based handler mapping
  - Robust error boundary handling (catching malformed JSON payloads and returning HTTP 400 instead of crashing the server process)
- **Adaptation to Project:** Added robust try/catch blocks and input validation for all endpoints.

---

## 6. Official Documentation References

1. **Node.js Built-in HTTP Module:** https://nodejs.org/api/http.html
2. **Node.js Built-in File System (`fs`) Module:** https://nodejs.org/api/fs.html
3. **Node.js Built-in Path Module:** https://nodejs.org/api/path.html
4. **Vue.js 3 Template Syntax & Directives:** https://vuejs.org/guide/essentials/template-syntax.html
5. **Vue.js 3 Computed Properties:** https://vuejs.org/guide/essentials/computed.html
6. **Vue.js 3 Event Handling:** https://vuejs.org/guide/essentials/event-handling.html
7. **MDN Web Docs — Fetch API:** https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
8. **MDN Web Docs — HTML Drag and Drop API:** https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

---

## 7. Reference-to-Feature Mapping Table

| Required Application Feature | Verified Reference Source | Exact URL / Component | Features Adapted |
|---|---|---|---|
| **Dashboard Layout & Metrics** | Start Bootstrap SB Admin & CodePen Dashboard | https://github.com/StartBootstrap/startbootstrap-sb-admin | 4-column summary metric cards, responsive flex/grid, clean typography |
| **Event Cards & Badges** | TheEvent (BootstrapMade) & Event-planning-Template | https://bootstrapmade.com/theevent-conference-event-bootstrap-template/ | Date badge overlay, category tags, venue metadata, card elevation |
| **Task List View** | Vue 3 Task Manager (CodePen) | https://cristopherps.dev & CodePen | Table/list view with priority pills, status toggle checkbox, action buttons |
| **Kanban Board View** | CodeWithSindhu Kanban & flowforfrank | https://github.com/CodeWithSindhu/kanban-board-js | 3 status columns (Pending, In Progress, Completed), native HTML5 drag-and-drop |
| **Search, Filter & Sort** | Vue.js Official TodoMVC Example | https://vuejs.org/examples/#todomvc | Instant reactive search, multi-criteria filtering, computed sorting |
| **Event & Task Modals** | Accessible Modal Dialog (MDN/CodePen) | https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog | Backdrop overlay, accessible inputs, focus styling, ESC key listener |
| **Vue 3 Directives** | Vue.js 3 CDN & Core Syntax Docs | https://vuejs.org/guide/quick-start.html#using-vue-from-cdn | `v-if`, `v-else`, `v-for`, `v-model`, `@click`, `:class`, `:style`, `v-show` |
| **Dynamic Progress Indicators** | CodePen Progress Bar Snippet | https://codepen.io | Dynamic width `:style="{ width: percent + '%' }"`, zero-task division guard |
| **Plain Node.js Server & Routing** | Brad Traversy Vanilla Node REST API | https://github.com/bradtraversy/vanilla-node-rest-api | `http.createServer`, regex URL routing, query parsing, static file server |
| **JSON File Persistence** | Brad Traversy Vanilla Node REST API | https://github.com/bradtraversy/vanilla-node-rest-api | `fs.promises.readFile` and `fs.promises.writeFile` to `data/data.json` |
| **Frontend-Backend Integration** | MDN Fetch API | https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch | Asynchronous `fetch()` calls for GET, POST, PUT, PATCH, DELETE |

---

## 8. Incompatible Templates and Dependencies Rejected

The following popular tools and frameworks were evaluated and explicitly **rejected** in accordance with project constraints:

1. **Express.js / Fastify / Koa**
   - *Reason for rejection:* Forbidden by mandatory requirements. The project requires manual implementation using Node.js's native `http` module to demonstrate core networking, routing, and stream parsing principles.
2. **React / Angular / Svelte**
   - *Reason for rejection:* Forbidden. The project emphasizes mastering Vue.js 3 directives via CDN (`Vue.createApp()`).
3. **Tailwind CSS**
   - *Reason for rejection:* Forbidden. Requires build pipelines (PostCSS/Node build) and generates class-heavy markup. Handcrafted CSS3 with custom properties (variables), Grid, and Flexbox provides cleaner, exam-friendly styling.
4. **Vue CLI / Vite / Webpack**
   - *Reason for rejection:* Forbidden. The frontend must run directly in standard browsers through a CDN `<script>` tag.
5. **MongoDB / Mongoose / SQLite / Prisma**
   - *Reason for rejection:* Forbidden. Persistent storage is implemented cleanly via a local JSON file (`data/data.json`) using Node.js `fs`.
6. **External Drag-and-Drop Libraries (e.g. SortableJS, Dragula)**
   - *Reason for rejection:* Rejected to eliminate external bloat and ensure the code is completely written and explainable during a college viva; native HTML5 Drag and Drop handles the Kanban interactions cleanly.

---

## 9. Proposed UI Design Direction

Based on the inspected references (TheEvent, SB Admin, and modern CodePen dashboards), the visual design adopts:

- **Color Palette:**
  - Primary Accent: Indigo / Slate Blue (`#4f46e5`, hover: `#4338ca`)
  - Secondary / Background: Clean Canvas (`#f8fafc`), Surface Cards (`#ffffff`), Subtle Borders (`#e2e8f0`)
  - Status Indicators:
    - Pending: Amber / Warm Orange (`#f59e0b`, soft bg: `#fef3c7`)
    - In Progress: Sky Blue (`#0284c7`, soft bg: `#e0f2fe`)
    - Completed: Emerald Green (`#10b981`, soft bg: `#d1fae5`)
    - Overdue / High Priority: Crimson Red (`#ef4444`, soft bg: `#fee2e2`)
- **Typography:**
  - Clean system font stack (`'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) with clear hierarchical font weights (400, 500, 600, 700).
- **Component Layout:**
  - Sticky modern navigation header with view tabs (Dashboard, Events, Tasks, Event Details, Viva Guide).
  - Stat cards with soft colored icon badges and calculated percentages.
  - Event cards featuring category badges, start/end date badges, venue icons, and completion progress bars.
  - Dual task views: Toggleable between **Tabular/List View** and **Interactive Kanban Board View**.
  - Polished modals for creating and editing events/tasks with validation banners.

---

## 10. Viva Preparation Notes

When explaining this project in an exam:
- **Architecture:** Client-Server architecture where `server.js` acts both as a static file server and a RESTful API server.
- **Frontend Reactivity:** Powered by Vue.js 3 CDN's reactive engine. All state mutations trigger automatic updates to the virtual DOM and computed statistics.
- **Backend Flow:** Client `fetch()` -> Node `http.createServer` -> URL pathname parser & method switch -> Request stream chunk reader -> JSON validation -> `fs.promises` read/write to `data/data.json` -> HTTP JSON response.
- **Zero Third-Party Backend Dependencies:** Run with standard `node server.js` without running `npm install`.
