const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    description: { type: String },
    publishedDate: { type: Date },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  { versionKey: false }
);

const BookModel = mongoose.model("book", bookSchema);

module.exports = BookModel;
