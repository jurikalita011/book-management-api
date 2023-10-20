const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connection = require("./db");
const userRouter = require("./routes/UserRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const bookRouter = require("./routes/BookRoute");
const app = express();

app.use(express.json());
app.use(cors());

app.use("/users", userRouter);
app.use(authMiddleware);
app.use("/", bookRouter);

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("connected");
  } catch (error) {
    console.log(error.message);
  }
  console.log("running at 7000");
});
