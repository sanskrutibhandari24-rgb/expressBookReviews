
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const books = require('./router/booksdb.js');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Customer session
app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true
  })
);

// Authentication middleware
app.use('/customer/auth/*', function auth(req, res, next) {
  if (!req.session.authorization) {
    return res.status(403).json({ message: 'User not logged in' });
  }

  const token = req.session.authorization.accessToken;

  jwt.verify(token, 'access', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Authentication failed' });
    }

    req.user = user;
    next();
  });
});

const PORT = 5000;

// Separate data endpoint used by Axios in general.js
app.get('/api/books', (req, res) => {
  res.status(200).json(books);
});

// Customer routes
app.use('/customer', customer_routes);

// Public routes
app.use('/', genl_routes);

app.listen(PORT, () => console.log('Server is running'));
