const express = require('express');
const { users } = require("./auth_users");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
// let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (users[username]) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  users[username] = password;

  return res.status(201).json({
    message: "User successfully registered"
  });
});

public_users.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000");
    res.send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving books",
      error: error.message
    });
  }
});

public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(
      `http://localhost:5000/isbn/${encodeURIComponent(isbn)}`
    );

    res.send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving book details",
      error: error.message
    });
  }
});
  
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;

  try {
    // Use the book-service URL configured for your lab.
    // It must be a separate data endpoint, not this same /author route.
    const response = await axios.get(process.env.BOOKS_API_URL);

    const matchingBooks = Object.values(response.data).filter(
      (book) => book.author === author
    );

    res.send(JSON.stringify(matchingBooks, null, 4));
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving books by author",
      error: error.message
    });
  }
});

public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const response = await axios.get(
      `http://localhost:5000/title/${encodeURIComponent(title)}`
    );

    res.send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving book details by title",
      error: error.message
    });
  }
});

public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  res.send(JSON.stringify(books[isbn].reviews, null, 4));
});

module.exports.general = public_users;