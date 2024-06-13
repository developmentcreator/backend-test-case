const mongoose = require("mongoose");

const mongoURI = "mongodb://localhost:27017/bookBorrowingApp";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const bookSchema = new mongoose.Schema({
  code: String,
  title: String,
  author: String,
  stock: Number,
});

const memberSchema = new mongoose.Schema({
  code: String,
  name: String,
  borrowedBooks: [],
  penaltyEndDate: Date,
});

const Book = mongoose.model("Book", bookSchema);
const Member = mongoose.model("Member", memberSchema);

const books = [
  { code: "JK-45", title: "Harry Potter", author: "J.K Rowling", stock: 1 },
  { code: "SHR-1", title: "A Study in Scarlet", author: "Arthur Conan Doyle", stock: 1 },
  { code: "TW-11", title: "Twilight", author: "Stephenie Meyer", stock: 1 },
  { code: "HOB-83", title: "The Hobbit, or There and Back Again", author: "J.R.R. Tolkien", stock: 1 },
  { code: "NRN-7", title: "The Lion, the Witch and the Wardrobe", author: "C.S. Lewis", stock: 1 },
];

const members = [
  { code: "M001", name: "Angga" },
  { code: "M002", name: "Ferry" },
  { code: "M003", name: "Putri" },
];

const seedDB = async () => {
  try {
    await Book.deleteMany({});
    await Member.deleteMany({});
    await Book.insertMany(books);
    await Member.insertMany(members);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
