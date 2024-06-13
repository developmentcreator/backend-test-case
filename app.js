// app.js

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Sample data
let books = [
  { id: 1, title: "Book 1", quantity: 5 },
  { id: 2, title: "Book 2", quantity: 3 },
];

let members = [
  { id: 1, name: "Member 1", borrowedBooks: [], penaltyEndDate: null },
  { id: 2, name: "Member 2", borrowedBooks: [], penaltyEndDate: null },
];

const MAX_BORROWED_BOOKS = 2;
const PENALTY_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
const BORROW_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Helper function to get current date
const currentDate = () => new Date().getTime();

// Middleware to check if member exists
const checkMemberExists = (req, res, next) => {
  const memberId = parseInt(req.params.memberId);
  const member = members.find((m) => m.id === memberId);
  if (!member) {
    return res.status(404).send("Member not found");
  }
  req.member = member;
  next();
};

// Middleware to check if book exists
const checkBookExists = (req, res, next) => {
  const bookId = parseInt(req.params.bookId);
  const book = books.find((b) => b.id === bookId);
  if (!book) {
    return res.status(404).send("Book not found");
  }
  req.book = book;
  next();
};

// Route to borrow a book
app.post("/borrow/:memberId/:bookId", checkMemberExists, checkBookExists, (req, res) => {
  const { member, book } = req;

  if (member.borrowedBooks.length >= MAX_BORROWED_BOOKS) {
    return res.status(400).send("Cannot borrow more than 2 books");
  }

  if (book.quantity <= 0) {
    return res.status(400).send("Book is not available");
  }

  if (member.penaltyEndDate && currentDate() < new Date(member.penaltyEndDate).getTime()) {
    return res.status(400).send("Member is under penalty");
  }

  member.borrowedBooks.push({ bookId: book.id, borrowedDate: currentDate() });
  book.quantity -= 1;
  res.send("Book borrowed successfully");
});

// Route to return a book
app.post("/return/:memberId/:bookId", checkMemberExists, checkBookExists, (req, res) => {
  const { member, book } = req;
  const borrowedBookIndex = member.borrowedBooks.findIndex((b) => b.bookId === book.id);

  if (borrowedBookIndex === -1) {
    return res.status(400).send("Book not borrowed by this member");
  }

  const borrowedBook = member.borrowedBooks[borrowedBookIndex];
  const borrowDate = new Date(borrowedBook.borrowedDate).getTime();
  const returnDate = currentDate();

  member.borrowedBooks.splice(borrowedBookIndex, 1);
  book.quantity += 1;

  if (returnDate - borrowDate > BORROW_DURATION) {
    member.penaltyEndDate = new Date(returnDate + PENALTY_DURATION);
    return res.send("Book returned late. Member is penalized for 3 days");
  }

  res.send("Book returned successfully");
});

// Route to list all books
app.get("/books", (req, res) => {
  const availableBooks = books.map((book) => ({
    ...book,
    availableQuantity: book.quantity,
  }));
  res.json(availableBooks);
});

// Route to list all members
app.get("/members", (req, res) => {
  const memberList = members.map((member) => ({
    ...member,
    borrowedBooksCount: member.borrowedBooks.length,
  }));
  res.json(memberList);
});

// Start the server
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
