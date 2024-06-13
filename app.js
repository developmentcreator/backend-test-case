const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// MongoDB connection
const mongoURI = "mongodb://localhost:27017/bookBorrowingApp";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// MongoDB models
const Book = mongoose.model(
  "Book",
  new mongoose.Schema({
    code: String,
    title: String,
    author: String,
    stock: Number,
  })
);

const Member = mongoose.model(
  "Member",
  new mongoose.Schema({
    code: String,
    name: String,
    borrowedBooks: [
      {
        bookCode: String,
        borrowedDate: Date,
      },
    ],
    penaltyEndDate: Date,
  })
);

const MAX_BORROWED_BOOKS = 2;
const PENALTY_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
const BORROW_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Helper function to get current date
const currentDate = () => new Date().getTime();

// Routes

// Borrow a book
app.post("/borrow/:memberCode/:bookCode", async (req, res) => {
  const member = await Member.findOne({ code: req.params.memberCode });
  const book = await Book.findOne({ code: req.params.bookCode });

  if (!member || !book) return res.status(404).send("Member or Book not found");

  if (member.borrowedBooks.length >= MAX_BORROWED_BOOKS) {
    return res.status(400).send("Cannot borrow more than 2 books");
  }

  if (book.stock <= 0) {
    return res.status(400).send("Book is not available");
  }

  if (member.penaltyEndDate && currentDate() < new Date(member.penaltyEndDate).getTime()) {
    return res.status(400).send("Member is under penalty");
  }

  member.borrowedBooks.push({ bookCode: book.code, borrowedDate: new Date() });
  book.stock -= 1;

  await member.save();
  await book.save();

  res.send("Book borrowed successfully");
});

// Return a book
app.post("/return/:memberCode/:bookCode", async (req, res) => {
  const member = await Member.findOne({ code: req.params.memberCode });
  const book = await Book.findOne({ code: req.params.bookCode });

  if (!member || !book) return res.status(404).send("Member or Book not found");

  const borrowedBookIndex = member.borrowedBooks.findIndex((b) => b.bookCode === book.code);

  if (borrowedBookIndex === -1) {
    return res.status(400).send("Book not borrowed by this member");
  }

  const borrowedBook = member.borrowedBooks[borrowedBookIndex];
  const borrowDate = new Date(borrowedBook.borrowedDate).getTime();
  const returnDate = currentDate();

  member.borrowedBooks.splice(borrowedBookIndex, 1);
  book.stock += 1;

  if (returnDate - borrowDate > BORROW_DURATION) {
    member.penaltyEndDate = new Date(returnDate + PENALTY_DURATION);
    await member.save();
    await book.save();
    return res.send("Book returned late. Member is penalized for 3 days");
  }

  await member.save();
  await book.save();

  res.send("Book returned successfully");
});

// List all books
app.get("/books", async (req, res) => {
  const books = await Book.find({});
  res.json(books);
});

// List all members
app.get("/members", async (req, res) => {
  const members = await Member.find({});
  res.json(members);
});

// Start the server
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
