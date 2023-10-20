const express = require("express");
const BookModel = require("../model/BookModel");
const bookRouter = express.Router();

bookRouter.get("/search", async (req, res) => {
  const { title, author, page } = req.query;

  const currentPage = +page || 1;
  const booksPerPage = 6;

  try {
    let query = {};

    if (title) {
      query.title = { $regex: new RegExp(title, "i") };
    }
    if (author) {
      query.author = { $regex: new RegExp(author, "i") };
    }

    const total = await BookModel.countDocuments(query);

    const books = await BookModel.find(query)
      .skip((currentPage - 1) * booksPerPage)
      .limit(booksPerPage);

    res.status(200).send({
      msg: "Found books results",
      books: books,
      totalBooks: total,
      page: currentPage,
      totalPages: Math.ceil(total / booksPerPage),
    });
  } catch (error) {
    res
      .status(500)
      .send({ msg: "Unable to search for books", error: error.message });
  }
});

//by query params
bookRouter.get("/book/:id", async (req, res) => {
  const bookId = req.params.id;
  try {
    const book = await BookModel.find({ _id: bookId });
    res.status(200).send({ msg: "book by id", book: book });
  } catch (error) {
    res.status(400).send({ msg: "oops cannot get the book" });
  }
});

//create
bookRouter.post("/add", async (req, res) => {
  const payload = req.body;

  if (!isValidISBN(payload.isbn)) {
    return res.status(400).send({ msg: "Invalid ISBN!!" });
  }

  try {
    const book = await BookModel.create({
      ...payload,
      creator: req.userId,
    });
    await book.populate("creator");
    return res.status(201).send({ msg: "new book has been added", book });
  } catch (error) {
    res.send({ msg: "unable to add new book", error: error.message });
  }
});

//update by put
bookRouter.put("/update/:id", async (req, res) => {
  const payload = req.body;

  if (payload.isbn && !isValidISBN(payload.isbn)) {
    return res.status(400).send({ msg: "Invalid ISBN." });
  }

  try {
    const book = await BookModel.findById(req.params.id);

    if (!book) {
      return res.status(404).send({ msg: "Book not found." });
    }

    if (book.creator.toString() !== req.userId) {
      return res
        .status(403)
        .send({ msg: "You are not authorized to update this book." });
    }

    const updatedBook = await BookModel.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
      }
    );

    res.send({ msg: "Book has been updated", updatedBook });
  } catch (error) {
    res
      .status(500)
      .send({ msg: "Unable to update book", error: error.message });
  }
});

//delete
bookRouter.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const book = await BookModel.findOne({ _id: id });
  try {
    if (req.body.userId === book.userId) {
      await BookModel.findByIdAndDelete({ _id: id });
      res.send({ msg: "book has been deleted" });
    } else {
      res.send({ msg: "You cannot delete this book.Try again later!" });
    }
  } catch (error) {
    res.send({ msg: "book cannot be deleted" });
  }
});

function isValidISBN(str) {
  let regex = new RegExp(
    /^(?=(?:[^0-9]*[0-9]){10}(?:(?:[^0-9]*[0-9]){3})?$)[\d-]+$/
  );

  if (str === null) {
    return false;
  }

  if (regex.test(str) === true) {
    return true;
  } else {
    return false;
  }
}

module.exports = bookRouter;
