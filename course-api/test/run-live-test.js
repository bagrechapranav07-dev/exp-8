const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri('course_api_db');
  console.log('Started in-memory MongoDB at', uri);

  const server = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, MONGO_URI: uri, PORT: '3002' },
    stdio: 'inherit'
  });

  await sleep(1500);

  const base = 'http://localhost:3002';
  const log = (label, res, body) => {
    console.log(`\n--- ${label} ---`);
    console.log('HTTP Status:', res.status);
    console.log(JSON.stringify(body, null, 2));
  };

  // 1. POST /courses - create
  let res = await fetch(`${base}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseCode: 'CS301', courseName: 'Web Programming Laboratory', department: 'Computer Engineering', credits: 2, semester: 5 })
  });
  let body = await res.json();
  log('POST /courses (create)', res, body);
  const createdId = body._id;

  // 2. GET /courses - all
  res = await fetch(`${base}/courses`);
  body = await res.json();
  log('GET /courses (all)', res, body);

  // 3. GET /courses/:id - one
  res = await fetch(`${base}/courses/${createdId}`);
  body = await res.json();
  log('GET /courses/:id (one)', res, body);

  // 4. PUT /courses/:id - update
  res = await fetch(`${base}/courses/${createdId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credits: 3 })
  });
  body = await res.json();
  log('PUT /courses/:id (update credits to 3)', res, body);

  // 5. GET /courses/:id - verify persisted update
  res = await fetch(`${base}/courses/${createdId}`);
  body = await res.json();
  log('GET /courses/:id (verify update persisted)', res, body);

  // 6. DELETE /courses/:id
  res = await fetch(`${base}/courses/${createdId}`, { method: 'DELETE' });
  body = await res.json();
  log('DELETE /courses/:id', res, body);

  // 7. GET /courses/:id after delete -> 404
  res = await fetch(`${base}/courses/${createdId}`);
  body = await res.json();
  log('GET /courses/:id (after delete, expect 404)', res, body);

  // 8. GET /courses/:id with invalid id -> 400
  res = await fetch(`${base}/courses/invalid-id-123`);
  body = await res.json();
  log('GET /courses/:id (invalid id, expect 400)', res, body);

  // 9. POST /courses - missing required field -> 400 (validation)
  res = await fetch(`${base}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseName: 'Missing Code' })
  });
  body = await res.json();
  log('POST /courses (missing courseCode, expect 400)', res, body);

  server.kill();
  await mongod.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
