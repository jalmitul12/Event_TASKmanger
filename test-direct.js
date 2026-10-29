// Direct In-Process Test Suite (No network sockets required)
const http = require('http');
const { Readable, Writable } = require('stream');
const path = require('path');
const fs = require('fs');

// Create mock request
function createMockRequest({ method, url, body = null, headers = {} }) {
  const req = new Readable({
    read() {
      if (body) {
        this.push(typeof body === 'string' ? body : JSON.stringify(body));
      }
      this.push(null); // End of stream
    }
  });
  req.method = method;
  req.url = url;
  req.headers = Object.assign({
    'host': 'localhost:3000',
    'content-type': 'application/json'
  }, headers);
  return req;
}

// Create mock response
function createMockResponse() {
  const chunks = [];
  const res = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    }
  });

  res.statusCode = 200;
  res.headers = {};

  res.writeHead = function(statusCode, headers = {}) {
    res.statusCode = statusCode;
    Object.assign(res.headers, headers);
    return res;
  };

  res.wait = function() {
    return new Promise((resolve) => {
      res.on('finish', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        let json = null;
        try {
          json = JSON.parse(raw);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          raw,
          data: json
        });
      });
    });
  };

  return res;
}

async function run() {
  console.log('🧪 Running Direct In-Process Tests for server.js...');

  // Require server without listening on port
  // Inspect server listeners
  const server = require('./server.js');
  // In server.js, the server instance is exported or we can intercept the request handler
  const requestListener = server.listeners('request')[0];

  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  ✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failed++;
    }
  }

  async function dispatch(reqOpts) {
    const req = createMockRequest(reqOpts);
    const res = createMockResponse();
    requestListener(req, res);
    return await res.wait();
  }

  // Test 1: GET /api/events
  const res1 = await dispatch({ method: 'GET', url: '/api/events' });
  assert(res1.statusCode === 200 && res1.data.success && Array.isArray(res1.data.data), 'GET /api/events returns event array');

  // Test 2: GET /api/tasks
  const res2 = await dispatch({ method: 'GET', url: '/api/tasks' });
  assert(res2.statusCode === 200 && res2.data.success && Array.isArray(res2.data.data), 'GET /api/tasks returns task array');

  // Test 3: POST /api/events with date validation failure
  const res3 = await dispatch({
    method: 'POST',
    url: '/api/events',
    body: {
      name: 'Invalid Fest',
      startDate: '2026-11-20',
      endDate: '2026-11-15'
    }
  });
  assert(res3.statusCode === 400 && !res3.data.success, 'POST /api/events rejects endDate < startDate');

  // Test 4: POST /api/events valid creation
  const res4 = await dispatch({
    method: 'POST',
    url: '/api/events',
    body: {
      name: 'Robotics Championship 2026',
      description: 'Battlebots and maze solving',
      category: 'Tech Fest',
      startDate: '2026-11-20',
      endDate: '2026-11-22',
      venue: 'Indoor Sports Complex',
      status: 'Active'
    }
  });
  assert(res4.statusCode === 201 && res4.data.success && res4.data.data.id, 'POST /api/events successfully creates event');
  const eventId = res4.data.data.id;

  // Test 5: GET /api/events/:id
  const res5 = await dispatch({ method: 'GET', url: `/api/events/${eventId}` });
  assert(res5.statusCode === 200 && res5.data.data.name === 'Robotics Championship 2026', 'GET /api/events/:id retrieves event');

  // Test 6: POST /api/tasks rejects non-existent eventId
  const res6 = await dispatch({
    method: 'POST',
    url: '/api/tasks',
    body: {
      title: 'Invalid Task',
      eventId: 'evt_non_existent_12345'
    }
  });
  assert(res6.statusCode === 400 && !res6.data.success, 'POST /api/tasks rejects invalid eventId (referential integrity)');

  // Test 7: POST /api/tasks valid creation
  const res7 = await dispatch({
    method: 'POST',
    url: '/api/tasks',
    body: {
      title: 'Safety Inspection for Arena',
      eventId: eventId,
      priority: 'High',
      status: 'Pending',
      dueDate: '2026-11-19',
      assignedTo: 'Karan Dave'
    }
  });
  assert(res7.statusCode === 201 && res7.data.success && res7.data.data.id, 'POST /api/tasks successfully creates linked task');
  const taskId = res7.data.data.id;

  // Test 8: PATCH /api/tasks/:id/status
  const res8 = await dispatch({
    method: 'PATCH',
    url: `/api/tasks/${taskId}/status`,
    body: { status: 'In Progress' }
  });
  assert(res8.statusCode === 200 && res8.data.data.status === 'In Progress', 'PATCH /api/tasks/:id/status updates status');

  // Test 9: PUT /api/tasks/:id
  const res9 = await dispatch({
    method: 'PUT',
    url: `/api/tasks/${taskId}`,
    body: {
      title: 'Safety Inspection for Arena (Completed)',
      eventId: eventId,
      priority: 'High',
      status: 'Completed',
      dueDate: '2026-11-19',
      assignedTo: 'Karan Dave'
    }
  });
  assert(res9.statusCode === 200 && res9.data.data.status === 'Completed', 'PUT /api/tasks/:id updates task details');

  // Test 10: DELETE /api/events/:id and cascade task deletion
  const res10 = await dispatch({
    method: 'DELETE',
    url: `/api/events/${eventId}`
  });
  assert(res10.statusCode === 200 && res10.data.success, 'DELETE /api/events/:id deletes event');

  // Verify task cascade cleanup
  const res11 = await dispatch({
    method: 'GET',
    url: `/api/tasks/${taskId}`
  });
  assert(res11.statusCode === 404, 'Cascade verified: Child task deleted when parent event is deleted');

  // Test 12: Static files
  const res12 = await dispatch({ method: 'GET', url: '/' });
  assert(res12.statusCode === 200 && res12.raw.includes('EventFlow Manager'), 'Static file / serves index.html');

  console.log(`\n====================================================`);
  console.log(`  Summary: ${passed} passed, ${failed} failed`);
  console.log(`====================================================`);

  process.exit(failed === 0 ? 0 : 1);
}

run();
