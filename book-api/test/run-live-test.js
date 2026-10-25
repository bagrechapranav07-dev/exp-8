const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri('book_api_db');
  console.log('Started in-memory MongoDB at', uri);

  const server = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, MONGO_URI: uri, PORT: '3003' },
    stdio: 'inherit'
  });

  await sleep(1500);

  const base = 'http://localhost:3003';
  const log = (label, res, body) => {
    console.log(`\n--- ${label} ---`);
    console.log('HTTP Status:', res.status);
    console.log(JSON.stringify(body, null, 2));
  };

  // 1. POST /books - valid book
  let res = await fetch(`${base}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Introduction to Algorithms', author: 'Cormen', category: 'Computer Science', publicationYear: 2009, availableCopies: 4 })
  });
  let body = await res.json();
  log('POST /books (valid book 1)', res, body);
  const book1Id = body._id;

  // 2. POST /books - second valid book, different category/author
  res = await fetch(`${base}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'A Brief History of Time', author: 'Rao', category: 'Science', publicationYear: 1988, availableCopies: 2 })
  });
  body = await res.json();
  log('POST /books (valid book 2)', res, body);

  // 3. POST /books - third book, same author 'Rao', category Science
  res = await fetch(`${base}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Cosmos', author: 'Rao', category: 'Science', publicationYear: 1980, availableCopies: 1 })
  });
  body = await res.json();
  log('POST /books (valid book 3)', res, body);

  // 4. GET /books - all
  res = await fetch(`${base}/books`);
  body = await res.json();
  log('GET /books (all)', res, body);

  // 5. GET /books?category=Science
  res = await fetch(`${base}/books?category=Science`);
  body = await res.json();
  log('GET /books?category=Science', res, body);

  // 6. GET /books?author=Rao
  res = await fetch(`${base}/books?author=Rao`);
  body = await res.json();
  log('GET /books?author=Rao', res, body);

  // 7. GET /books/:id - specific book
  res = await fetch(`${base}/books/${book1Id}`);
  body = await res.json();
  log('GET /books/:id (specific book)', res, body);

  // 8. GET /books/:id - unknown id -> 404
  res = await fetch(`${base}/books/656f1f77bcf86cd799439099`);
  body = await res.json();
  log('GET /books/:id (unknown id, expect 404)', res, body);

  // 9. POST /books - missing title -> 400
  res = await fetch(`${base}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '', author: 'Someone', category: 'Fiction', publicationYear: 2020, availableCopies: 1 })
  });
  body = await res.json();
  log('POST /books (empty title, expect 400)', res, body);

  // 10. POST /books - invalid publicationYear -> 400
  res = await fetch(`${base}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Future Book', author: 'Someone', category: 'Fiction', publicationYear: 3050, availableCopies: 1 })
  });
  body = await res.json();
  log('POST /books (invalid publicationYear, expect 400)', res, body);

  // 11. POST /books - negative availableCopies -> 400
  res = await fetch(`${base}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Negative Copies Book', author: 'Someone', category: 'Fiction', publicationYear: 2015, availableCopies: -3 })
  });
  body = await res.json();
  log('POST /books (negative availableCopies, expect 400)', res, body);

  server.kill();
  await mongod.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
