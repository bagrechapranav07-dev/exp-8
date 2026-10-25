# WPL Experiment 8 — Designing and Implementing RESTful APIs using Node.js and Express

Three Node.js/Express REST API projects built for this lab:

- **student-api** — Task 1: in-memory CRUD-style endpoints for student records (`GET /students`, `GET /students/:id`, `POST /students`).
- **course-api** — Task 2: MongoDB/Mongoose-backed full CRUD for courses (`POST/GET /courses`, `GET/PUT/DELETE /courses/:id`).
- **book-api** — Task 3: MongoDB/Mongoose book catalogue with query-parameter filtering (`?category=`, `?author=`) and input validation.

## Running each project

```bash
cd student-api && npm install && npm start   # http://localhost:3001
cd course-api  && npm install && npm start   # http://localhost:3002, needs MONGO_URI in .env
cd book-api    && npm install && npm start   # http://localhost:3003, needs MONGO_URI in .env
```

`course-api` and `book-api` read their MongoDB connection string from a `.env` file (`MONGO_URI=...`), which is git-ignored. Each also has a `test/run-live-test.js` script that spins up a real in-memory MongoDB (`mongodb-memory-server`) and exercises every endpoint end-to-end.
