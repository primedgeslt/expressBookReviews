const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check whether the username exists
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  // Check whether both username and password match
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Task 7: Only registered users can log in
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (!isValid(username)) {
    return res.status(401).json({
      message: "Username does not exist"
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Incorrect password"
    });
  }

  const accessToken = jwt.sign(
    { username: username },
    "access"
  );

  // Save the user's credentials for the session
  req.session.authorization = {
    accessToken: accessToken,
    username: username
  };

  return res.status(200).json({
    message: "User successfully logged in",
    accessToken: accessToken
  });
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!req.session.authorization) {
    return res.status(401).json({
      message: "User is not logged in"
    });
  }

  if (!review) {
    return res.status(400).json({
      message: "Review is required"
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  const username = req.session.authorization.username;

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Adds a new review or modifies the user's existing review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added or modified successfully",
    reviews: books[isbn].reviews
  });
});

// Task 9: Delete the logged-in user's review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!req.session.authorization) {
    return res.status(401).json({
      message: "User is not logged in"
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  const username = req.session.authorization.username;

  if (
    !books[isbn].reviews ||
    !Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)
  ) {
    return res.status(404).json({
      message: "Review not found for this user"
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully"
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;