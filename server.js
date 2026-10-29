// Reference: https://github.com/bradtraversy/vanilla-node-rest-api
// Reference: https://nodejs.org/api/http.html
// Reference: https://nodejs.org/api/fs.html
// Reference: https://nodejs.org/api/path.html

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'data.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for serving static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Helper to safely send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Helper to parse request body chunks
// Reference: https://github.com/bradtraversy/vanilla-node-rest-api/blob/main/utils.js
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body.trim()) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', err => {
      reject(err);
    });
  });
}

// Read database file
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = { events: [], tasks: [] };
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data file:', err);
    return { events: [], tasks: [] };
  }
}

// Write database file
function writeData(data) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing data file:', err);
    return false;
  }
}

// Generate simple unique ID
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// Serve static frontend files
function serveStaticFile(req, res, pathname) {
  let relativePath = pathname === '/' ? 'index.html' : pathname;
  // Prevent directory traversal attacks
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

// Main HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // CORS preflight handling
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API Route Handling
  if (pathname.startsWith('/api/')) {
    try {
      const db = readData();

      // ==========================================
      // EVENTS API
      // ==========================================

      // GET /api/events - Retrieve all events
      if (pathname === '/api/events' && method === 'GET') {
        return sendJSON(res, 200, { success: true, data: db.events });
      }

      // POST /api/events - Create new event
      if (pathname === '/api/events' && method === 'POST') {
        const body = await getRequestBody(req);

        // Validation
        if (!body.name || !body.name.trim()) {
          return sendJSON(res, 400, { success: false, error: 'Event name is required' });
        }
        if (!body.startDate || !body.endDate) {
          return sendJSON(res, 400, { success: false, error: 'Start date and end date are required' });
        }
        if (new Date(body.startDate) > new Date(body.endDate)) {
          return sendJSON(res, 400, { success: false, error: 'End date cannot be earlier than start date' });
        }

        const validStatuses = ['Planning', 'Active', 'Completed', 'On Hold'];
        const status = validStatuses.includes(body.status) ? body.status : 'Planning';

        const newEvent = {
          id: generateId('evt'),
          name: body.name.trim(),
          description: (body.description || '').trim(),
          category: (body.category || 'General').trim(),
          startDate: body.startDate,
          endDate: body.endDate,
          venue: (body.venue || 'TBD').trim(),
          status: status,
          createdAt: new Date().toISOString()
        };

        db.events.push(newEvent);
        writeData(db);
        return sendJSON(res, 201, { success: true, data: newEvent });
      }

      // Match /api/events/:id
      const eventIdMatch = pathname.match(/^\/api\/events\/([a-zA-Z0-9_\-]+)$/);
      if (eventIdMatch) {
        const eventId = eventIdMatch[1];
        const eventIndex = db.events.findIndex(e => e.id === eventId);

        // GET /api/events/:id - Retrieve single event
        if (method === 'GET') {
          if (eventIndex === -1) {
            return sendJSON(res, 404, { success: false, error: `Event with ID "${eventId}" not found` });
          }
          const eventTasks = db.tasks.filter(t => t.eventId === eventId);
          return sendJSON(res, 200, { success: true, data: { ...db.events[eventIndex], tasks: eventTasks } });
        }

        // PUT /api/events/:id - Update event
        if (method === 'PUT') {
          if (eventIndex === -1) {
            return sendJSON(res, 404, { success: false, error: `Event with ID "${eventId}" not found` });
          }
          const body = await getRequestBody(req);

          if (!body.name || !body.name.trim()) {
            return sendJSON(res, 400, { success: false, error: 'Event name is required' });
          }
          if (!body.startDate || !body.endDate) {
            return sendJSON(res, 400, { success: false, error: 'Start date and end date are required' });
          }
          if (new Date(body.startDate) > new Date(body.endDate)) {
            return sendJSON(res, 400, { success: false, error: 'End date cannot be earlier than start date' });
          }

          const validStatuses = ['Planning', 'Active', 'Completed', 'On Hold'];
          const status = validStatuses.includes(body.status) ? body.status : db.events[eventIndex].status;

          db.events[eventIndex] = {
            ...db.events[eventIndex],
            name: body.name.trim(),
            description: (body.description !== undefined ? body.description : db.events[eventIndex].description).trim(),
            category: (body.category || db.events[eventIndex].category).trim(),
            startDate: body.startDate,
            endDate: body.endDate,
            venue: (body.venue || db.events[eventIndex].venue).trim(),
            status: status
          };

          writeData(db);
          return sendJSON(res, 200, { success: true, data: db.events[eventIndex] });
        }

        // DELETE /api/events/:id - Delete event and cascade delete its tasks
        if (method === 'DELETE') {
          if (eventIndex === -1) {
            return sendJSON(res, 404, { success: false, error: `Event with ID "${eventId}" not found` });
          }

          const deletedEvent = db.events.splice(eventIndex, 1)[0];
          // Relational cleanup: Remove all tasks associated with this event
          const tasksBefore = db.tasks.length;
          db.tasks = db.tasks.filter(t => t.eventId !== eventId);
          const tasksRemoved = tasksBefore - db.tasks.length;

          writeData(db);
          return sendJSON(res, 200, {
            success: true,
            data: deletedEvent,
            message: `Event deleted along with ${tasksRemoved} associated task(s)`
          });
        }
      }

      // ==========================================
      // TASKS API
      // ==========================================

      // GET /api/tasks - Retrieve all tasks
      if (pathname === '/api/tasks' && method === 'GET') {
        return sendJSON(res, 200, { success: true, data: db.tasks });
      }

      // POST /api/tasks - Create new task
      if (pathname === '/api/tasks' && method === 'POST') {
        const body = await getRequestBody(req);

        // Validation
        if (!body.title || !body.title.trim()) {
          return sendJSON(res, 400, { success: false, error: 'Task title is required' });
        }
        if (!body.eventId) {
          return sendJSON(res, 400, { success: false, error: 'Associated event ID is required' });
        }
        // Verify event exists to maintain referential integrity
        const eventExists = db.events.some(e => e.id === body.eventId);
        if (!eventExists) {
          return sendJSON(res, 400, { success: false, error: `Associated event with ID "${body.eventId}" does not exist` });
        }

        const validPriorities = ['Low', 'Medium', 'High'];
        const priority = validPriorities.includes(body.priority) ? body.priority : 'Medium';

        const validStatuses = ['Pending', 'In Progress', 'Completed'];
        const status = validStatuses.includes(body.status) ? body.status : 'Pending';

        const now = new Date().toISOString();
        const newTask = {
          id: generateId('tsk'),
          title: body.title.trim(),
          description: (body.description || '').trim(),
          eventId: body.eventId,
          priority: priority,
          status: status,
          dueDate: body.dueDate || '',
          assignedTo: (body.assignedTo || '').trim(),
          createdAt: now,
          updatedAt: now
        };

        db.tasks.push(newTask);
        writeData(db);
        return sendJSON(res, 201, { success: true, data: newTask });
      }

      // Match /api/tasks/:id/status
      const taskStatusMatch = pathname.match(/^\/api\/tasks\/([a-zA-Z0-9_\-]+)\/status$/);
      if (taskStatusMatch) {
        const taskId = taskStatusMatch[1];
        const taskIndex = db.tasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1) {
          return sendJSON(res, 404, { success: false, error: `Task with ID "${taskId}" not found` });
        }

        if (method === 'PATCH') {
          const body = await getRequestBody(req);
          const validStatuses = ['Pending', 'In Progress', 'Completed'];
          if (!body.status || !validStatuses.includes(body.status)) {
            return sendJSON(res, 400, {
              success: false,
              error: 'Valid status is required ("Pending", "In Progress", or "Completed")'
            });
          }

          db.tasks[taskIndex].status = body.status;
          db.tasks[taskIndex].updatedAt = new Date().toISOString();

          writeData(db);
          return sendJSON(res, 200, { success: true, data: db.tasks[taskIndex] });
        }
      }

      // Match /api/tasks/:id
      const taskIdMatch = pathname.match(/^\/api\/tasks\/([a-zA-Z0-9_\-]+)$/);
      if (taskIdMatch) {
        const taskId = taskIdMatch[1];
        const taskIndex = db.tasks.findIndex(t => t.id === taskId);

        // GET /api/tasks/:id - Retrieve single task
        if (method === 'GET') {
          if (taskIndex === -1) {
            return sendJSON(res, 404, { success: false, error: `Task with ID "${taskId}" not found` });
          }
          return sendJSON(res, 200, { success: true, data: db.tasks[taskIndex] });
        }

        // PUT /api/tasks/:id - Update task
        if (method === 'PUT') {
          if (taskIndex === -1) {
            return sendJSON(res, 404, { success: false, error: `Task with ID "${taskId}" not found` });
          }
          const body = await getRequestBody(req);

          if (!body.title || !body.title.trim()) {
            return sendJSON(res, 400, { success: false, error: 'Task title is required' });
          }
          if (body.eventId) {
            const eventExists = db.events.some(e => e.id === body.eventId);
            if (!eventExists) {
              return sendJSON(res, 400, { success: false, error: `Associated event with ID "${body.eventId}" does not exist` });
            }
          }

          const validPriorities = ['Low', 'Medium', 'High'];
          const priority = validPriorities.includes(body.priority) ? body.priority : db.tasks[taskIndex].priority;

          const validStatuses = ['Pending', 'In Progress', 'Completed'];
          const status = validStatuses.includes(body.status) ? body.status : db.tasks[taskIndex].status;

          db.tasks[taskIndex] = {
            ...db.tasks[taskIndex],
            title: body.title.trim(),
            description: (body.description !== undefined ? body.description : db.tasks[taskIndex].description).trim(),
            eventId: body.eventId || db.tasks[taskIndex].eventId,
            priority: priority,
            status: status,
            dueDate: body.dueDate !== undefined ? body.dueDate : db.tasks[taskIndex].dueDate,
            assignedTo: (body.assignedTo !== undefined ? body.assignedTo : db.tasks[taskIndex].assignedTo).trim(),
            updatedAt: new Date().toISOString()
          };

          writeData(db);
          return sendJSON(res, 200, { success: true, data: db.tasks[taskIndex] });
        }

        // DELETE /api/tasks/:id - Delete task
        if (method === 'DELETE') {
          if (taskIndex === -1) {
            return sendJSON(res, 404, { success: false, error: `Task with ID "${taskId}" not found` });
          }
          const deletedTask = db.tasks.splice(taskIndex, 1)[0];
          writeData(db);
          return sendJSON(res, 200, { success: true, data: deletedTask, message: 'Task deleted successfully' });
        }
      }

      // If no API route matched
      return sendJSON(res, 404, { success: false, error: `API route ${method} ${pathname} not found` });

    } catch (err) {
      console.error('API Error:', err);
      return sendJSON(res, 500, { success: false, error: 'Internal Server Error: ' + err.message });
    }
  }

  // Static File Serving
  if (method === 'GET' || method === 'HEAD') {
    serveStaticFile(req, res, pathname);
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  Event Task Manager server running at:`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Persistent database file: ${DATA_FILE}`);
  console.log(`====================================================`);
});

module.exports = server;
