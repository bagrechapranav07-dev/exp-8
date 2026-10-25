require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Book = require('./models/Book');

const app = express();
const PORT = 3003;

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

function sendError(res, status, message) {
  return res.status(status).json({ success: false, error: message });
}

// GET /books - all books, with optional ?category= and ?author= filters
app.get('/books', async (req, res) => {
  try {
    const { category, author } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (author) filter.author = author;

    const books = await Book.find(filter);
    res.status(200).json(books);
  } catch (err) {
    sendError(res, 500, 'Failed to fetch books');
  }
});

// GET /books/:id - retrieve a specific book
app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return sendError(res, 404, 'Book not found');
    }
    res.status(200).json(book);
  } catch (err) {
    sendError(res, 400, 'Invalid book id');
  }
});

// POST /books - add a new book with validation
app.post('/books', async (req, res) => {
  try {
    const { title, author, category, publicationYear, availableCopies } = req.body;
    const currentYear = new Date().getFullYear();

    if (!title || !title.trim()) {
      return sendError(res, 400, 'title must not be empty');
    }
    if (!author || !author.trim()) {
      return sendError(res, 400, 'author must not be empty');
    }
    if (!Number.isInteger(publicationYear) || publicationYear < 1500 || publicationYear > currentYear) {
      return sendError(res, 400, `publicationYear must be a valid year between 1500 and ${currentYear}`);
    }
    if (typeof availableCopies !== 'number' || availableCopies < 0) {
      return sendError(res, 400, 'availableCopies must be a non-negative number');
    }

    const book = await Book.create({ title, author, category, publicationYear, availableCopies });
    res.status(201).json(book);
  } catch (err) {
    sendError(res, 500, 'Unexpected server error');
  }
});

app.listen(PORT, () => {
  console.log(`Book API running on http://localhost:${PORT}`);
});
