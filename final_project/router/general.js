
const express = require('express');
const axios = require('axios');

let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();

// Axios data source: separate local endpoint
const BOOKS_API = 'http://localhost:5000/api/books';

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  users.push({ username, password });
  return res.status(200).json({ message: 'User successfully registered' });
});

// Retrieve all books using Axios
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_API);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Retrieve book by ISBN using Axios
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_API);
    const book = response.data[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve book' });
  }
});

// Retrieve books by author using Axios
public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_API);
    const author = decodeURIComponent(req.params.author).toLowerCase();

    const matchingBooks = Object.values(response.data).filter(
      book => book.author.toLowerCase() === author
    );

    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: 'No books found for this author' });
    }

    return res.status(200).json(matchingBooks);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Retrieve books by title using Axios
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_API);
    const title = decodeURIComponent(req.params.title).toLowerCase();

    const matchingBooks = Object.values(response.data).filter(
      book => book.title.toLowerCase() === title
    );

    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: 'No books found with this title' });
    }

    return res.status(200).json(matchingBooks);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Retrieve reviews
public_users.get('/review/:isbn', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_API);
    const book = response.data[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book.reviews || {});
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve reviews' });
  }
});

module.exports.general = public_users;
